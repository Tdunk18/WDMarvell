<?php

namespace System\Device\Model;

use Remote\Device\DeviceControl;
use System\Device\StringTableReader;
use System\Device\Exception as DeviceException;

require_once(UTIL_ROOT . '/includes/httpclient.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

class Device {

	protected $language = '';

    public function getRegistration() {
        if (!file_exists('/etc/.device_registered')) {
            return(array('registered' => 'false'));
        }
        return(array('registered' => 'true'));
    }

    public function register() {
    	//This is a one time resource creation and we want to preserve
        //registration time stamp
        if (is_file("/etc/.device_registered")) {
            return true;
        }

        //set the device registration as registered
        $output = $retVal = NULL;

        exec_runtime("sudo /bin/touch /etc/.device_registered", $output, $retVal);
        if ($retVal !== 0) {
            throw new DeviceException('"/etc/.device_registered" file creation failed. Returned with "' . $retVal . '"', 500);
        }
        return true;
    }

    public function getDescription() {
        // for testing, return success
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return( array('machine_name' => "MyDeviceName", 'machine_desc' => "Orion device description"));
        }

        //JS moved public function to DeviceControl as code in DeviceControl needs to call it and there would be
        //a circular dependency between DeviceDescription and DeviceControl
        //return DeviceControl::getInstance()->getDeviceDescription();
        ////
        //MC putting the public function back in-line at this location also since we should eliminate coupling between
        //independently deployable components rather than attempting to reduce any duplication of calls
        //to low-level scripts.
        $machine_desc = $retVal = null;
        $machine_name = trim(file_get_contents("/etc/hostname")); // file_get_contents is multitudes faster than exec()
	
       	exec_runtime("sudo /usr/local/sbin/getDeviceDescription.sh", $machine_desc, $retVal);
        if ($retVal !== 0) {
            throw new DeviceException('"getDeviceDescription" execution failed. Returned with "' . $retVal . '"', 500);
        }
        return( array('machine_name' => $machine_name, 'machine_desc' => $machine_desc[0]));
    }

    public function modifyDescription($changes) {
        //Require entire representation and not just a delta to ensure a consistant representation
        $output = $retVal = null;
        set_time_limit(0);
        // Update name with orion.
        DeviceControl::getInstance()->updateDeviceName($changes["machine_name"]);
        set_time_limit(ini_get('max_execution_time'));
        // updateDeviceName has to be called before shell command now: shell script
        //    sends a SIGTERM to apache, preventing PHP from continuing.

        exec_runtime(sprintf('sudo nohup /usr/local/sbin/modDeviceName.sh %s %s 1>/dev/null &', escapeshellarg($changes["machine_name"]), escapeshellarg($changes["machine_desc"])), 
        	$output, $retVal, false);

        if ($retVal !== 0 && $retVal !== 141) { // will sometimes at 141 (128+13), 13 is the sigpipe signal which we can get when restarting the network
            throw new DeviceException('"modDeviceName.sh" call for "Device Description"  failed. Returned with "' . $retVal . '"', 500);
        }
        return true;
    }

    /* To register a new device with WDC Support*/
    public function newRegistration($changes){
    	$data=array();
    	if  ($_SERVER['APPLICATION_ENV'] === 'testing') {
    		$baseUrl = getDeviceTestRegistrationUrl();
    		$data['sn'] = getDeviceTestSerial();
    	}
    	else {
    		$baseUrl = getDeviceRegistrationUrl();
    	}
    	$data['cc'] = $changes['country'];
    	$data['os'] = ucfirst(\Core\SystemInfo::getOSName());
    	$data['lang'] = $changes["lang"];
    	$data['mac'] = $this->getMacAddress();
    	$data['fn'] = ucfirst($changes["first"]);
    	$data['ln'] = ucfirst($changes["last"]);
    	$data['e'] = $changes["email"];
    	$serial = $this->getSerial();

    	//For testing purpose we need to enter serial number matching Oracle DB
    	if($_SERVER["APPLICATION_ENV"] != 'testing'){
    		$data['sn'] = substr($serial, -12);
    	}
    	$deviceType = getDeviceTypeName();
    	//TODO: remove this emulation of "already registered" responce for Avatar
    	if ( !empty($deviceType) && (strcasecmp($deviceType, "avatar") === 0)) {
    		$response= array(
    				'status_code' => 200,
    				'response_text' => '<?xml version="1.0" encoding="utf-8"?>
											<string xmlns="http://websupport.wdc.com/app/registration">registered</string>');

    	}else{
    		$data['optin'] = ($changes["option"] == 'yes') ? 1 : 0;
    		$data['upd'] = '';
    		$httpClient = new \HttpClient();
    		$response = $httpClient->post(array('requestUrl' => $baseUrl,
    				'data' => $data));
    	}
		if($response['status_code'] == 200) {
    		$xmlReturn = simplexml_load_string( $response['response_text'] );
		}
    	return $xmlReturn;
    }

    private function getSerial(){
    	$retVal=$success=null;
    	$serialNumber= apc_fetch('serial_number', $success);
    	if(!$success){
    		exec_runtime("sudo /usr/local/sbin/getSerialNumber.sh", $serialNumber, $retVal);
    		if ($retVal !== 0) {
    			throw new \Core\Rest\Exception('DEVICE_SERIAL_NUMBER_NOT_FOUND', 400, null, "device_registration");
    		}
    		apc_store('serial_number', $serialNumber);
    	}
    	return $serialNumber[0];
    }

    private function getMacAddress(){
    	$retVal=$success=null;
    	$macAddress = apc_fetch('mac_address', $success);
    	if (!$success) {
    		exec_runtime("sudo /usr/local/sbin/getMacAddress.sh", $macAddress, $retVal);
    		if($retVal !== 0) {
    			throw new \Core\Rest\Exception('DEVICE_MAC_ADDRESS_NOT_FOUND', 400, null, "device_registration");
    		}
    		apc_store('mac_address',$macAddress);
    	}
    	return $macAddress[0];
    }

    public function getConfig() {
    	$output = $retVal = null;

    	// create file if none exists
    	if (!is_file("/etc/language.conf")) {
    		exec_runtime("sudo bash -c '(echo \"language DEFAULT\">/etc/language.conf)'", $output, $retVal, false);
    	}

    	// Return NULL on error
    	$reader = new StringTableReader("fr", "alertmessages.txt");

    	$this->language = '';
    	exec_runtime('sudo sed -e \'/^language /s/language //\' /etc/language.conf', $output, $retVal, false);
    	if ($retVal !== 0) {
    		throw new DeviceException('Retrieveing data from /etc/language.conf failed. Returned with "' . $retVal . '"', 500);
    	}
    	$this->language = $output[0];

    	if ($this->language != "DEFAULT") {
    		if (!$reader->isLocaleSupported("$output[0]")) {
    			$this->language = "en_US";
    		}
    	}
    	return($this->language);
    }

    public function configLanguage($language){
    	$output=$retVal=null;
		$langArgEsc = "echo language " . escapeshellarg($language) . " >/etc/language.conf";
    	exec_runtime("sudo bash -c '($langArgEsc)'", $output, $retVal, false);
    	if ($retVal !== 0) {
    		throw new DeviceException('/etc/language.conf modification failed. Returned with "' . $retVal . '"', 500);
    	}
    	//on Lightinig we also need to call the script that notifies the firmware about language update.
    	//this script accepts the paramater in 3-letter format, for example eng (lower case)
    	//get the mapping of 5 character language abbreviations to 3 character
    	//in some cases there are more than one 3-letter abbreviations that correspond to 5 letter one
    	//therefore we receive the mappingin the form of an array and check to see if one of the abbreviations will work
    	//with the script (for example DUT or NLD for Dutch)
		$tranlastedLanguage = languageMap($language);
    	if (is_file("/usr/local/sbin/languageChange.sh") && is_array($tranlastedLanguage)) {
			$successfulOutcome = false;
    		foreach($tranlastedLanguage as $tranlastedLanguageV){
    			$output=$retVal=null;
				exec_runtime("/usr/local/sbin/languageChange.sh ".strtolower($tranlastedLanguageV), $output, $retVal);
				if($retVal === 0 && $output[0]=="") {
					$successfulOutcome = true;
				}
			}

	    	if (!$successfulOutcome) {
	    		throw new DeviceException('/usr/local/sbin/languageChange.sh modification failed.', 500);
	    	}
    	}
    	return true;
    }

    public function getPrivacyOption(){
    	$output=$retval=null;
    	exec_runtime("sudo /usr/local/sbin/privacyOptions.sh", $output, $retval);
    	if($retval != 0){
    		throw new DeviceException(sprintf('Retrieveing data from /usr/local/sbin/privacyOptions.sh failed. Returned with "%d"', $retval), 500);
    	}
    	else{
    		$result = explode('=',$output[0]);
    		$option=array($result[0] => $result[1]);
    		return $option;
    	}
    }

    public function setPrivacyOption($choice){
    	$output=$retval=null;
    	if($choice){
    		exec_runtime("sudo /usr/local/sbin/privacyOptions.sh create", $output, $retval);
    	}
    	else{
    		exec_runtime("sudo /usr/local/sbin/privacyOptions.sh delete", $output, $retval);
    	}

    	if($retval != 0){
    		throw new DeviceException(sprintf('Configuring privacy settings failed. Returned with "%d"', $retval), 500);
    	}
    }
}
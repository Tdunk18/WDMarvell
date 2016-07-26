<?php
namespace Remote\Device;


/**
 * \file DeviceControl.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012,2014 Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(UTIL_ROOT . '/includes/httpclient.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

use Util\WebServerUtils;
use Remote\DeviceUser\Db\DeviceUsersDB;
use Remote\DeviceUser\DeviceUserManager;
use Remote\Model\X509Certificate;
use Version\FirmwareVersion\FirmwareVersion;

/**
 * DeviceControl Class
 *
 * Singleton Class which provides a Controller for the NAS device
 *
 * 5/19/11 Modifed prcedural Device API to be a Singleton class that controls the NAS Device
 *
 *
 * @author sapsford_j
 *
 */

class DeviceControl {

	private static $instance;
	private static $trustedCertUpdateCommand = "/usr/local/sbin/ssl_cert_job.sh start";

	//make constructor private, so class cannont be instantiated by outside code
	private function __construct()  {

	}

	/**
	 * get the singleton instance
	 */
	public static function getInstance() {
		if (!isset(self::$instance)) {
			self::$instance = new DeviceControl();
		}
		return self::$instance;
	}

	/**
	 * Update the device name
	 *
	 * @param $name new device Name
	 */


	public function updateDeviceName($name) {
		$deviceConfig = getGlobalConfig('device');
		$deviceQueryParams = array();
		$deviceQueryParams['name'] = $name;
		$deviceQueryParams['deviceId'] = getDeviceId();
		if(empty($deviceQueryParams['deviceId'])) {
			return false;
		}
		$deviceQueryParams['auth'] = \getDeviceAuthCode();
		$updateServerUrl = getServerBaseUrl().$deviceConfig['UPDATE_DEVICE_RESTURL'];

		$updateServerUrl = urlReplaceQueryParams($updateServerUrl, $deviceQueryParams);
		if (validUrl($updateServerUrl) == false) {
			//log error
			return false;
		}
		$hc = new \HttpClient();
		$response = $hc->get($updateServerUrl);
		if ($response['status_code'] != 200 ) {
			return false;
		}

		return true;
	}

	/**
	 * Create device ID and device auth code locally. This is used for devices that do not have remote access capability but
	 * which still need to allow local LAN access from mobile and desktop apps.
	 *
	 * Device ID is the MD5 hash of the serial number, this should guarantee uniqueness
	 * Device Auth Code is q 256 secur random number (same as if device is registered remotely).
	 *
	 * @param string $deviceName name of device (should be same as in /etc/hostname)
	 * @return boolean true for success
	 */

	protected function registerDeviceLocal($deviceName) {
		//get just the numeric part of the serial number of device
		preg_match_all('!\d+!',SerialNumber::getInstance()->getSerialNumber(), $matches);
        $deviceId = implode("",$matches[0]);

		$deviceAuth = bin2hex(openssl_random_pseudo_bytes(16));

		if (setDeviceRegistrationConfig($deviceId, $deviceAuth, "")) {

			//if device is re-registered, then all device-users tied to the old device Id have ot be deleted.
			$deviceUserDb = new DeviceUsersDB();
			$deviceUserDb->deleteAllDeviceUser();

			return true;
		}
		return false;
	}

	/**
	 * Update device registration if it is already registered. This is for MyCloud OS 2.0 where the
	 * Trusted certificate update job will register the device and generate the SSL certificate.
	 * This funciton uploads the data required by the server to enable remote access for the device.
	 *
	 * @param unknown $deviceName
	 * @param unknown $email
	 * @return boolean|Ambigous <boolean, \Remote\DeviceUser\an, multitype:NULL >
	 */

	public function updateRemoteRegistration($deviceName, $email) {

		$deviceConfig = getGlobalConfig('device');
		$dynamicConfig = getUpnpStatus('config');

		//get serial number of device
		$serialNum = SerialNumber::getInstance()->getSerialNumber();

		$deviceQueryParams = array();

		$trustedCert = \isTrustedCertEnabled();

		if ($trustedCert) {
			$internalIp = \getInternalIp();
			if ($internalIp == 0) {
				$internalIp = $_SERVER['SERVER_ADDR'];
			}
			$deviceQueryParams['device_id'] = \getDeviceId();
			$deviceQueryParams['device_auth'] = \getDeviceAuthCode();
			$deviceQueryParams['device_name'] = $deviceName;
			$deviceQueryParams['local_ip'] = $internalIp;
			$deviceQueryParams['internal_port'] = $dynamicConfig['INTERNAL_PORT'];
			$deviceQueryParams['internal_ssl_port'] = $dynamicConfig['DEVICE_SSL_PORT'];
			$firmwareVersionInstance = FirmwareVersion::getInstance();
			$firmwareVersion = $firmwareVersionInstance->getCurrentVersion();
			if(!empty($firmwareVersion)){
				$deviceQueryParams['fw_version'] = urlencode($firmwareVersion);
			}
		}
		else {
			$deviceQueryParams['deviceName'] = $deviceName;
			$deviceQueryParams['devicePort'] = $dynamicConfig['INTERNAL_PORT'];
			$deviceQueryParams['device_ssl_port'] = $dynamicConfig['DEVICE_SSL_PORT'];
			$deviceQueryParams['type'] = getDeviceType();
		}
		if (!empty($email)) {
				$deviceQueryParams['email'] = $email;
		}
		$deviceQueryParams['serial_no'] = $serialNum;

		$updateUriKey = 'UPDATE_DEVICE_RESTURL';
		if (isset($deviceQueryParams['email'])) {
			$updateUriKey = 'UPDATE_DEVICE_NOEMAIL_RESTURL';
		}

		if ($trustedCert) {
			$updateUriKey .= '_V2';
		}

		$serverUrl = getServerBaseUrl(). $deviceConfig[$updateUriKey];

		$hc = new \HttpClient();
		if ($trustedCert) {
			$response =  $hc->put($serverUrl, $deviceQueryParams);
		}
		else {
			$serverUrl = urlReplaceQueryParams($serverUrl, $deviceQueryParams);
			if (!validUrl($serverUrl)) {
				//log error
				return false;
			}
			$response = $hc->get($serverUrl);
		}

		if($response['status_code'] != 200 ) {
			return false;
		}

		if ($trustedCert) {
			$device = json_decode($response['response_text'], true);
			$deviceDomain = $device['dns_name'];

			$deviceId = \getDeviceId();    //we are updating an existing device reg., so device ID and auth code do not change
			$deviceAuth = \getDeviceAuthCode();
			$serverBaseUrl = \getServerBaseUrl();
			if (!setDeviceRegistrationConfig($deviceId, $deviceAuth, $serverBaseUrl, $deviceDomain)) {
				throw new \Remote\RemoteException("preRegisterDeviceRemote: failed to update dynamicconfig.ini, registration failed" . $serverUrl);
			}
			$firmwareVersionInstance->setCurrentVersionAsLatestSent();
		}

		//If an email is provided, that email should receive remote access
		if(isset($email)) {
			$deviceUserManager = DeviceUserManager::getManager();
			$status = $deviceUserManager->addEmailAccessToUser(getSessionUserId(), $email);
		} else {
			$status = true;
		}
		return $status;

	}

	/**
	 * Register the device for the first time. The device ID and Auth code are obtained from the Central Server
	 * and stored in dynamicconfig.ini. The SSL certificate .csr and private key are then gebnerated and the .csr file is
	 * uploaded to the Central Server for signing. FO rMyCloud OO/S 2.0, SSL certificates will be signed using a trusted CA
	 * and this will usulaly take place asynchrnously.
	 *
	 * @param unknown $deviceName
	 * @return boolean
	 */

	protected function registerDeviceRemote($deviceName) {

		$deviceConfig = getGlobalConfig('device');
		$dynamicConfig = getUpnpStatus('config');

		//get serial number of device
		$serialNum = SerialNumber::getInstance()->getSerialNumber();

		$deviceQueryParams = array();
		$deviceQueryParams['deviceName'] = $deviceName;
		$deviceQueryParams['devicePort'] = $dynamicConfig['INTERNAL_PORT'];
		$deviceQueryParams['device_ssl_port'] = $dynamicConfig['DEVICE_SSL_PORT'];

		$deviceQueryParams['serial_no'] = $serialNum;
		$deviceQueryParams['type'] = getDeviceType();

		$serverUrl = getServerBaseUrl().$deviceConfig['ADD_DEVICE_NOEMAIL_RESTURL'];
		if ($serverUrl == null ) {
			//log error
			return false;
		}
		$serverUrl = urlReplaceQueryParams($serverUrl, $deviceQueryParams);
		if (validUrl($serverUrl) == false) {
			//log error
			return false;
		}
		$hc = new \HttpClient();
		$response = $hc->get($serverUrl);
		if($response['status_code'] != 200 ) {
			return false;
		}
		$device = json_decode($response['response_text']);
		$deviceId = $device->{'device'}->{'device_id'};
		$deviceAuth = $device->{'device'}->{'device_auth'};
		$serverBaseUrl = $device->{'device'}->{'server_url'};
		$serverDomain = $device->{'device'}->{'server_domain'};
		if (setDeviceRegistrationConfig($deviceId, $deviceAuth, $serverBaseUrl)) {

			//if device is re-registered, then all device-users tied to the old device Id have ot be deleted.

			$deviceUserDb = DeviceUsersDB::getInstance();
			$deviceUserDb->deleteAllDeviceUser();
			//get SSL cert from server
			$deviceUserManager = DeviceUserManager::getManager();
			$this->generateDeviceSSLCertificate($serverDomain, $deviceId, $deviceAuth);

			return true;
		}
		return false;
	}


	/**
	 * Pre-register a device. This function uses the new version
	 * of the Central Server device API to get a device ID and
	 * device auth code without enabling remote access or
	 * uploading any details of IP addresses and ports. This is
	 * needed for Trusted Certificate generation without Remote
	 * Access being enabled.
	 *
	 * This function does *not* generate a new SSL Certificate
	 * as this needs to be done externally.
	 *
	 */

	public function preRegisterDeviceRemote($deviceName) {
		$deviceConfig = getGlobalConfig('device');
		$dynamicConfig = getUpnpStatus('config');

		//get serial number of device
		$serialNum = SerialNumber::getInstance()->getSerialNumber();

		$deviceQueryParams = array();
		$deviceQueryParams['device_name'] = $deviceName;
		$deviceQueryParams['serial_no'] = $serialNum;
		$deviceQueryParams['type'] = getDeviceType();

		$serverUrl = \getServerBaseUrl();
		if (empty($serverUrl) ) {
			throw new \Remote\RemoteException("preRegisterDeviceRemote: failed to get Server Base Url, check SERVER_BASE_URL setting in globalconfig.ini");
		}
		$addDeviceUrl = $deviceConfig['ADD_DEVICE_NOEMAIL_RESTURL_V2'];
		if (empty($addDeviceUrl)) {
			throw new \Remote\RemoteException("preRegisterDeviceRemote: failed to get URL for adding a device, check ADD_DEVICE_NOEMAIL_RESTURL_V2 setting in globalconfig.ini");
		}

		$serverUrl = $serverUrl . $addDeviceUrl;
		if (validUrl($serverUrl) == false) {
			throw new \Remote\RemoteException("preRegisterDeviceRemote: invalid URL for adding a device: " . $serverUrl);
		}
		$hc = new \HttpClient();
		$response = $hc->postV2($serverUrl, $deviceQueryParams);
		if( $response['status_code'] != 200 && $response['status_code'] != 201 ) {
			throw new \Remote\RemoteException("preRegisterDeviceRemote: error response received from server" . $serverUrl);
		}
		$device = json_decode($response['response_text'], true);
		$deviceId = $device['id'];
		$deviceAuth = $device['auth'];
		$deviceDomain = $device['dns_name'];

		$serverBaseUrl = \getServerBaseUrl();
		if (!setDeviceRegistrationConfig($deviceId, $deviceAuth, $serverBaseUrl, $deviceDomain)) {
			throw new \Remote\RemoteException("preRegisterDeviceRemote: failed to update dynamicconfig.ini, registration failed" . $serverUrl);
		}

		//if device is re-registered, then all device-users tied to the old device Id have to be deleted.

		$deviceUserDb = DeviceUsersDB::getInstance();
		$deviceUserDb->deleteAllDeviceUser();

		return true;
	}


	public function deviceIsRegisteredRemote() {
		$deviceID = \getDeviceID();
		$deviceAuthCode = \getDeviceAuthCode();
		if ( !empty($deviceID) && !empty($deviceAuthCode)  ) {
			return true;
		}
		return false;
	}

	/**
	 * Posts to a central service to create a new device and stores the resulting deviceId and deviceAuthentication in the local config file.
	 * This will not be of much value unless
	 * @param String $urlPath passed in by the service, but is not currently used
	 * @param Array $queryParams Must contain 'devicename'. An optional queryParam is 'email'
	 * @return boolean Inidicates whether the function was successful.
	 */

	public function registerDeviceWithName($deviceName, $email = null) {

		$globalConfig = getGlobalConfig('global');

		if(isset($globalConfig['ENABLEREMOTEACCESS']) && $globalConfig['ENABLEREMOTEACCESS']==1){
			//If device is already registered, then we need to update the registration.
			if ($this->deviceIsRegisteredRemote()) {
				$status = $this->updateRemoteRegistration($deviceName, $email);
			}
			else {
				//register device for the first time
				$status = $this->registerDeviceRemote($deviceName);
			}
		}else{
			$status = $this->registerDeviceLocal($deviceName);
		}
		return $status;
	}


	/**
	 * Registers the device - this function gets the device name from the O/S and then calls
	 * registerDeviceWithName to perform the registration
	 */

	public function registerDevice() {
		$deviceDescription = \getDeviceName();
		if ($deviceDescription == null) {
			return false;
		}
		return $this->registerDeviceWithName($deviceDescription['machine_name']);
	}

	/**
	 * Creates link to correct apache configuration if self-signed cert with bundle is installed
	 */

	public function updateApacheConf($isTrusted) {
		if ($isTrusted) {
			//trusted cert config path from sites-available
			$confPath = getSitesAvailablePath() . DS . getRestApiConfTrusted();
		}
		else {
			// self-signed config from sites-available
			$confPath = getSitesAvailablePath() . DS . getRestApiConfUntrusted();
		}
		$output = $retval = null;
		//set sites-enabled conf link to point to the correct configuration
		$deviceType = getDeviceTypeName();
		$targetPath =  getSitesEnabledPath() . DS . getRestApiConfEnabled();
		if ($deviceType == "sequioa") {
			if (is_link($targetPath) && readlink($targetPath)  == $confPath ) {
				return true; //link is intact and points to correct conf file, no need to change it
			}
			exec_runtime("sudo ln -sf $confPath  $targetPath", $output, $retval);
			if ($retval != 0) {
				return false;
			}
		}
		else {
			//On Alpha NAS, need to copy the correct config to the target path
			//read current conf and replace if it is not the correct one
			$trustedConf = false;
			if (file_exists($targetPath)) {
				$conf = file_get_contents($targetPath);
				if (strpos($conf, "SSLCertificateChainFile") !== false) {
					$trustedConf = true;
				}
				if ($trustedConf != $isTrusted) {
					//we don't have the right conf file, so replace it
					exec_runtime("sudo cp $confPath  $targetPath", $output, $retval);
				}
				else {
					return true; // nothing to do
				}
			}
			else {
				//conf file is missing
				exec_runtime("sudo cp $confPath  $targetPath", $output, $retval);
			}
			if ($retval != 0) {
				return false;
			}
		}
		// if here, conf file has changed, so reload web server configuration
		WebServerUtils::getInstance()->reloadServerConfig();
		return true;
	}

	/**
	 *
	 * This function downloads the SSL certificate for the device from the Central Server and
	 * saves it as the server.crt file in the location defined by CERT_PATH in globalconfig.ini
	 *
	 * @param unknown $serverDomain the domain name of the device
	 * @param unknown $deviceId the device ID
	 * @param unknown $deviceAuthCode the device Authentication code
	 * @return boolean
	 */
	public function generateDeviceSSLCertificate($serverDomain, $deviceId,
												 $deviceAuthCode, $downloadOnly=false,
												 $getTrustedCert= false) {
        // for testing, return true
        if  ('testing' == $_SERVER['APPLICATION_ENV']) {
            return true;
        }
        $isTrustedCert = false;  //set to true if a trusted certificate was downloaded
   		$sslcert = new SslCertificate();
		$signed_cert = $sslcert->getSignedCert($serverDomain,$deviceId,
											   $deviceAuthCode, $downloadOnly,
											   $getTrustedCert, $isTrustedCert);
		$status = true;

		if( !empty($signed_cert) ) {
			// Create cert file.
			$sslConfig = getGlobalConfig('openssl');
			$crtFileName = $sslConfig['CERT_PATH'].'server.crt';
			$fp = fopen($crtFileName, 'w');
			if ($fp) {
				fwrite($fp, $signed_cert);
				fclose($fp);
				if ( \getDeviceTypeName() == "sequioa") {
					//need to do this on sequoia if this code is run from a CLI script as root
					chgrp($crtFileName, "www-data");
					chown($crtFileName, "www-data");
				}
				//make backup copy on Alpha NAS
				$configBackupPath = getConfigBackupPath();
				if (file_exists($configBackupPath)) {
					copy($crtFileName, $configBackupPath . DS . 'server.crt');
				}

				//ensure the correct Apache SSL config is in place for trusted or self-signed cert.
				$status = $this->updateApacheConf($isTrustedCert);
			} else {
				$status = false;
			}
		} else {
			$status = false;
		}
		return $status;
	}


/**
 *
 * This function gets services and scripts to operate them from globalconfig.ini
 * and organizes them in a form of an array. It also runs "STATUS" script from each of them to
 * learn if they are running or not and adds this information to the array
 *
 * @param bool $skipStatusCheck - default false. If set to true, then RUNNING element would be null/absent.
 * @return array. Format Example:
	[MEDIACRAWLER] => Array
        (
            [SCRIPTS] => Array
                (
                    [STATUS] => /usr/mediacrawler/mediacrawlerd status ''
                    [ENABLE] => /usr/mediacrawler/mediacrawlerd enable ''
                    [DISABLE] => /usr/mediacrawler/mediacrawlerd disable ''
                    [STARTUP] => /usr/mediacrawler/mediacrawlerd startup ''
                    [SHUTDOWN] => /usr/mediacrawler/mediacrawlerd shutdown ''
                )

            [SVC_NAME] => wdmcserver
            [RUNNING] => true
        )
   RUNNING true/false mean that the service is running/not running. null means that no output was received from the script.
   if RUNNING element is absent it identifies unknown status. It depends on if $skipStatusCheck is set to true.
 */
public function getServicesScriptsAndState($skipStatusCheck = false) {
	//load script paths into array
	$servicesConfig = getGlobalConfig("services");

	if (empty($servicesConfig)) {
		//log error
		return false;
	}
	$scriptList = $servicesConfig["SERVICESCRIPTS"];
	if (empty($scriptList)) {
		//log error
		return false;
	}
	$scriptPathTokens = explode(",",$scriptList);
	if (empty($scriptPathTokens)) {
		//log error
		return false;
	}
	$scriptsCleanArray = array();
	$mapOfScripts = array(	'STATUS',
							'ENABLE',
							'DISABLE',
							'STARTUP',
							'SHUTDOWN');

	foreach($scriptPathTokens as $scriptPathToken) {
		if(strpos($scriptPathToken,"SCRIPT") !== false ) {
			$serviceName = (substr($scriptPathToken, 0, strlen($scriptPathToken)-6));
		}else{
			$serviceName = $scriptPathToken;
		}
		foreach($mapOfScripts as $mapOfScriptsV){
			if(isset($servicesConfig[$scriptPathToken. "_".$mapOfScriptsV])){
				$scriptsCleanArray[$serviceName]['SCRIPTS'][$mapOfScriptsV] = $servicesConfig[$scriptPathToken. "_".$mapOfScriptsV];
			}
		}
		if(isset($servicesConfig[$serviceName. "_SVC_NAME"])){
			$scriptsCleanArray[$serviceName]['SVC_NAME'] = $servicesConfig[$serviceName. "_SVC_NAME"];
		}
		//get current status of service
		$scriptPath = $servicesConfig[$scriptPathToken. "_STATUS"];
		// Check status only if asked...
		if(!$skipStatusCheck) {
			unset($output);
			if (\Core\SystemInfo::getOSName() === 'windows') {
				$srvName = $servicesConfig[$serviceName . "_SVC_NAME"];
				$scriptPath = \str_ireplace("SVC_NAME", $srvName, $scriptPath);
				$outputstr = $retVal = null;
				$output = exec_runtime($scriptPath, $outputstr, $retVal);
				if (empty($output)) {
					$scriptsCleanArray[$serviceName]['RUNNING'] = null;
				} else {
					$status = stripos($output, "$srvName.exe") === false ? false : true;
					if ($status === false) {
						$scriptsCleanArray[$serviceName]['RUNNING'] = false;
					} else if ($status !== false) {
						$scriptsCleanArray[$serviceName]['RUNNING'] = true;
					}
				}
			} else {
				$output = $retVal = null;
				exec_runtime("sudo " . $scriptPath, $output, $retVal);
				if (empty($output)) {
					$scriptsCleanArray[$serviceName]['RUNNING'] = null;
				} else {
					$outputStr = trim(strtolower(implode(' ', $output)));
					if (strpos($outputStr, "not running") !== false) {
						$scriptsCleanArray[$serviceName]['RUNNING'] = false;
					} else if (strpos($outputStr, "running") !== false) {
						$scriptsCleanArray[$serviceName]['RUNNING'] = true;
					}
				}
			}
		}
	}
	return $scriptsCleanArray;
}


public function updateRemoteServices() {
    // for testing, return true
    if  ('testing' == $_SERVER['APPLICATION_ENV']) {
        return true;
    }

    $remoteAccess = getRemoteAccess();

	//get number of remote users
	$deviceUserCount = DeviceUsersDB::getInstance()->getNumberOfDeviceUsers();

	//get the array of services, their scripts and statuses
	$servicesArray = $this->getServicesScriptsAndState();
	if(is_array($servicesArray)){
		foreach($servicesArray as $scriptName => $scriptValues) {
			$scriptValues['RUNNING'];
			if(!isset($scriptValues['RUNNING']) || $scriptValues['RUNNING']===null){
				//log error
				continue;
			}

			if (strcasecmp($remoteAccess,"FALSE") == 0) {
				if ($scriptValues['RUNNING']) {
					//if running, disable service
					$output=$retVal=null;
					exec_runtime("sudo " . $scriptValues["SCRIPTS"]["DISABLE"], $output, $retVal);
				}
			} else {
				//remote access is enabled
				if ($scriptName=="COMMMANAGER") {
					//only start comm mgr is there are device users
					if ( !$scriptValues['RUNNING'] && $deviceUserCount > 0 ) {
						$output=$retVal=null;
						exec_runtime("sudo " . $scriptValues["SCRIPTS"]["ENABLE"], $output, $retVal, false);
					} else if ( $scriptValues['RUNNING'] && ($deviceUserCount == 0) ) {
						//there are no device users, but remote access is enabled so
						//disable comm_mgr if it is running
						$output=$retVal=null;
						exec_runtime("sudo " . $scriptValues["SCRIPTS"]["DISABLE"], $output, $retVal);
					}
				} else if (!$scriptValues['RUNNING']) {
					//start all other services if remote access is enabled and not running
					$output=$retVal=null;
					exec_runtime("sudo " . $scriptValues["SCRIPTS"]["ENABLE"], $output, $retVal);
				}
			}
		}
	}
	return true;
}

	/**
	 *  The method does not check the status of the services but attempts to start the applicable Services in background.
	 *  Can be used for performance reasons when the intent is to trigger service starts but not wait on their response.
	 *
	 * The services are & should be self-managed to run single instance even an attempt is made to start a new one.
	 *
	 * @return bool
	 */
	public function startRemoteServices() {
		// for testing, return true
		if  ('testing' == $_SERVER['APPLICATION_ENV']) {
			return true;
		}

		$remoteAccess = getRemoteAccess();

		//get number of remote users
		$deviceUserCount = DeviceUsersDB::getInstance()->getNumberOfDeviceUsers();

		//get the array of services, their scripts and statuses
		$servicesArray = $this->getServicesScriptsAndState(true);
		if(is_array($servicesArray)){
			foreach($servicesArray as $scriptName => $scriptValues) {
				if (strcasecmp($remoteAccess,"FALSE") != 0) {
					//remote access is enabled
					if ($scriptName=="COMMMANAGER") {
						//only start comm mgr is there are device users
						if ($deviceUserCount > 0) {
							$output = $retVal = null;
							exec_runtime("sudo " . $scriptValues["SCRIPTS"]["ENABLE"], $output, $retVal, false);
						}
					}else {
						$output=$retVal=null;
						exec_runtime("sudo " . $scriptValues["SCRIPTS"]["ENABLE"], $output, $retVal, false);
					}
				}
			}
		}
		return true;
	}

/**
 * Call to count number of device users.
 * @return int the number of device users.
 */
public function getDeviceCount() {
	return DeviceUsersDB::getInstance()->getNumberOfDeviceUsers();
}


/**
  * Checks if device is registered and attempts to register it if it's not registered
  * @return bool true if device is successfully registered
  */
public function assureDeviceRegistration() {
        $globalConfig = getGlobalConfig('global');
        $remoteAccess = strtolower(getRemoteAccess());

         if ($remoteAccess !== 'true'){
             return false;
         } elseif ($this->deviceIsRegisteredRemote()){
         	if (\isTrustedCertEnabled()) {
	         	//if there are no device users yet, device is pre-registered
	         	//so we need to update central server with serial no etc.
	         	if (DeviceUsersDB::getInstance()->getNumberOfDeviceUsers() == 0) {
	         		$deviceName = \getDeviceName()['machine_name'];
	         		if (!$this->updateRemoteRegistration($deviceName, null)) {
	         			return false;
	         		}
	         	}
         	}
            return true;
         } else if (\isTrustedCertEnabled()) {
            //device should have been registered by Trusted Cert update job, As it was not,
            //we need to pre-register device, update the device registration and run the Trusted Cert job
            //once to  get the Trusted certificate.
			$deviceName = \getDeviceName()['machine_name'];
			if ($this->preRegisterDeviceRemote($deviceName)) {
				if ($this->updateRemoteRegistration($deviceName, null)) {
					//run the ssl cert job in the background - we have to resort to doing this as PHP doesn't do threads and it can take
					//up to 6 mins to get the trusted cert from the server, which is way too long to make the user wait if
					//they are adding a cloud user from the Weh UI.
					exec_runtime("nohup sudo sh -c \"" . self::$trustedCertUpdateCommand . "\" > /dev/null 2>&1 &"  , $output, $retVal, false);
					if ($retVal == 0) {
						return true;
					}
				}
			}
         }
         //Trusted Certs are not enabled, register device for old style 4 level domain
         else if ($this->registerDevice()){
    	     return true;
         }
        return false;
    }

}

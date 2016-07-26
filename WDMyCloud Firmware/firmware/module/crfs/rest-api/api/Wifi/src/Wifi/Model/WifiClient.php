<?php

namespace Wifi\Model;

/**
 *
 * file wifi/wifiClient.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 * @author laha_b
 *
 */

/**Model Class **/
class WifiClient {

	/*Purpose: To obtain list of access points NAS can connect to and also the list of points it has connected previously*/
	Public function wifiClientApScan($mac){
		$apLists = array();

		if(!empty($mac)){
			$output = $apContent = array();
			$retVal = null;
			exec_runtime("sudo /usr/local/sbin/wifi_client_ap_scan.sh --mac $mac", $output, $retVal);
			if(!$retVal){
				if(!empty($output)){
					foreach($output as $point){
						$apDetails = explode('" ', $point);
						foreach ($apDetails as $apDetail){
							$content = explode("=", $apDetail);{
								$apContent[$content[0]] = trim($content[1], '"');
							}
						}
						array_push($apLists, $apContent);
					}
				}
			}
			else{
				throw new \Wifi\Exception('wifi_client_ap_scan.sh Execution Failed. Returned with "' . $retVal . '"', 500);
			}
			return $apLists;
		}
		$output = array();
		$retVal = null;
		exec_runtime("sudo /usr/local/sbin/wifi_client_ap_scan.sh", $output, $retVal);
		if(!$retVal){
			if(!empty($output)){
				foreach($output as $point){
					$apDetails = explode('" ', $point);
					foreach ($apDetails as $apDetail){
						$content = explode("=", $apDetail);{
							$apContent[$content[0]] = trim($content[1], '"');
						}
					}
					array_push($apLists, $apContent);
				}
			}
		}
		else{
			throw new \Wifi\Exception('wifi_client_ap_scan.sh Execution Failed. Returned with "' . $retVal . '"', 500);
		}

		if(empty($apLists)){
			$output = $saveApContent = array();
			$retVal = null;
			exec_runtime("sudo /usr/local/sbin/wifi_client_ap_scan.sh --remembered", $output, $retVal);
			if(!$retVal){
				if(!empty($output)){
					foreach($output as $savePoint){
						$saveApDetails = explode('" ', $savePoint);
						foreach ($saveApDetails as $saveApDetail){
							$saveContent = explode("=", $saveApDetail);{
								$saveApContent[$saveContent[0]] = trim($saveContent[1], '"');
							}
						}
						array_push($apLists, $saveApContent);
					}
				}
			}
			else{
				throw new \Wifi\Exception('wifi_client_ap_scan.sh --remembered Execution Failed. Returned with "' . $retVal . '"', 500);
			}
		}
		return $apLists;
	}

	/*To obtain details of access point NAS is connected to currently*/
	Public function wifiClientApCurrent(){
		$output= array();
		$retVal = null;
		exec_runtime("sudo /usr/local/sbin/wifi_client_ap_scan.sh --current", $output, $retVal);
		$saveApContent = array();
		if(!$retVal){
			if(!empty($output)){
				foreach($output as $savePoint){
					$saveApDetails = explode('" ', $savePoint);
					foreach ($saveApDetails as $saveApDetail){
						$saveContent = explode("=", $saveApDetail);{
							$saveApContent[$saveContent[0]] = trim($saveContent[1], '"');
						}
					}
				}
			}
			else{
				$output = $retVal = null;
				exec_runtime("sudo /usr/local/sbin/wifi_client_ap_connection_status.sh", $output, $retVal);
				if(!$retVal){
					if(!empty($output)){
						$responceArray = explode(' ', $output[0]);
						$saveApContent['connected'] = "false";
						$saveApContent['code'] = trim($responceArray[0]);
						$saveApContent['message'] = trim($responceArray[1], '"');
					}
				}
			}
		}
		else{
			throw new \Wifi\Exception('wifi_client_ap_scan.sh Execution Failed. Returned with "' . $retVal . '"', 500);
		}
		return $saveApContent;
	}

	/*To connect to an available access point*/
	public function wifiClientApConnect($changes){
		$parameters = '';

		if(isset($changes['wps_pin'])){
			$parameters .= $changes['wps_pin'];
			foreach ($changes as $key=>$val){
				if($key == 'mac' || $key == 'trusted'){
					$parameters .= " --$key" . ' ' ."$val". '  ';
				}
			}
			$output = $retVal = null;
			// Parameters sanitized by calling routine, so no need to escape here.
			exec_runtime("sudo nohup /usr/local/sbin/wifi_client_ap_connect.sh --pinconnect $parameters 1>/dev/null &",  $output, $retVal, false);
			return array('status'=>'success');
		}

		if(isset($changes['ssid'])){
			$parameters = $changes['ssid'] . ' ';
		}

		if(isset($changes['mac'])) {
			$parameters = '"' .$changes['mac'] .'"' . ' ';
		}

		foreach($changes as $key=>$val){
			if($key != 'mac' && $key != 'ssid'){
				$parameters .= "--$key" . ' ' ."'$val'". '  ';
			}
		}
		$output = $retVal = null;
		// Parameters sanitized by calling routine, so no need to escape here.
		exec_runtime("sudo nohup /usr/local/sbin/wifi_client_ap_connect.sh --connect $parameters 1>/dev/null &",  $output, $retVal, false);

		return array('status'=>'success');
	}

	/*To update details of access point NAS has remembered*/
	Public function wifiClientApUpdate($changes, $version, $legacyVersions=false){
		$parameters = '';
		foreach($changes as $key=>$val){
			$parameters .= "--$key" . ' ' ."'$val'". '  ';
		}
		$output = $retVal = null;
		if($legacyVersions){
		  // Parameters sanitized by calling routine, so no need to escape here.
		  exec_runtime("sudo nohup /usr/local/sbin/wifi_client_ap_update.sh $parameters 1>/dev/null &",  $output, $retVal, false);
		}
		else{
		    // Parameters sanitized by calling routine, so no need to escape here.
		    exec_runtime("sudo nohup /usr/local/sbin/wifi_client_ap_update_V2.sh $parameters 1>/dev/null &",  $output, $retVal, false);
		}

		return array('status'=>'success');
	}

	/*To disconnect from an access point*/
	public function wifiClientApDisconnect($mac, $version, $legacyVersions=false){
		$output = $retVal = null;
		if($legacyVersions){
		  // Parameters sanitized by calling routine, so no need to escape here.
		  exec_runtime("sudo nohup /usr/local/sbin/wifi_client_ap_connect.sh --disconnect " .'"'."$mac".'"'." 1>/dev/null &",  $output, $retVal, false);
		}
		else{
		    // Parameters sanitized by calling routine, so no need to escape here.
		    exec_runtime("sudo nohup /usr/local/sbin/wifi_client_ap_disconnect.sh --mac " .'"'."$mac".'"'." 1>/dev/null &",  $output, $retVal, false);
		}

		return array('status'=>'success');
	}

	/*To verify status of uplink*/
	public function getWifiClientConfig(){
	    $output = $retVal = null;
	    exec_runtime("sudo /usr/local/sbin/wifi_client_ap_configuration_get.sh",  $output, $retVal);

	    if(!$retVal){
	        $result = explode("=", $output[0]);
	    }
	    return array(trim($result[0]) => trim($result[1]));
	}

	/*To update status of uplink*/
	public function setWifiClientConfig($status){
	    $output = $retVal = null;
	    exec_runtime("sudo /usr/local/sbin/wifi_client_ap_configuration_set.sh --enabled $status",  $output, $retVal);
	    return array('status' => 'Success');
	}
}
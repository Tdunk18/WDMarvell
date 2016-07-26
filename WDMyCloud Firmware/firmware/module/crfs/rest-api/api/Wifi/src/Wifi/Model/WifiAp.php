<?php

namespace Wifi\Model;

/**
 * file wifi/wifiAp.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 * @author laha_b
 */

/*Moddel class for Wi-Fi AP*/
class WifiAp {

	/*Purpose: To get the configuration details of wifi ap mode */
	public function getWifiApConfig(){
		$retVal = null;
		exec_runtime("sudo /usr/local/sbin/wifi_ap_get_config.sh", $output, $retVal);

		if(!$retVal){
			if(isset($output)){
			    $json=$output[0];
			    $result=json_decode($json,true);
			    return $result;
			}
			else{
				throw new \Wifi\Exception('wifi_ap_get_config.sh empty output. Returned with "' . $retVal . '"', 500);
			}
		}
		else{
			throw new \Wifi\Exception('wifi_ap_get_config.sh Execution Failed. Returned with "' . $retVal . '"', 500);
		}
	}

	/*Purpose: To set configurations of Wi-Fi AP*/
	public function setWifiApConfig($changes){
        $parameters = '';
		foreach($changes as $band=>$values){
        	$parameters .= "--ism_band".' "'."$band".'" ';
			foreach($values as $key=>$var){
		        	$parameters .= "--$key".' "'."$var".'" ';
			}
		}
		$retVal = $output = null;
		exec_runtime("sudo nohup /usr/local/sbin/wifi_ap_set_config.sh $parameters 1>/dev/null &",  $output, $retVal, false);

		return array('status'=>'success');
	}

	/*Purpose: To obtain list of Wi-FI AP clients*/
	public function getWifiApClients($mac) {
		$retVal = null;
		$output = array();
		if(strlen($mac) > 0){
			exec_runtime("sudo /usr/local/sbin/get_wifi_ap_clients.sh --mac ".'"'."$mac".'"', $output, $retVal);
		}
		else{
			exec_runtime("sudo /usr/local/sbin/get_wifi_ap_clients.sh", $output, $retVal);
		}

		$clientLists = $clientList = array();
		if(!$retVal){
			if(isset($output)){
				foreach($output as $clients){
					$client = explode(" ", $clients);
					foreach($client as $clientDetails){
						$clientDetail = explode(':"', $clientDetails);
						$clientList[$clientDetail[0]] = trim($clientDetail[1], '"');
					}
					array_push($clientLists, $clientList);
				}
				return $clientLists;
			}
			else{
				throw new \Wifi\Exception('get_wifi_ap_clients.sh Execution Failed. Returned with "' . $retVal . '"', 500);
			}
		}
		else{
			throw new \Wifi\Exception('get_wifi_ap_clients.sh Execution Failed. Returned with "' . $retVal . '"', 500);
		}
	}

	/*Purpose: To delete a connected client from the list of Wi-FI AP clients*/
	public function deleteWifiApClient($macAddress){
		$retVal = $output = null;
		exec_runtime("sudo /usr/local/sbin/set_wifi_ap_client_disconnect.sh " . '"' ."$macAddress". '"', $output, $retVal, false);

		if(!$retVal){
			return array('status'=>'success');
		}
		else{
			throw new \Wifi\Exception('set_wifi_ap_client_disconnect.sh Execution Failed. Returned with "' . $retVal . '"', 500);
		}
	}

	/*To retrieve wait time of down link*/
	public function getWifiIdleTime(){
	    $output = $retVal = null;
	    exec_runtime("sudo /usr/local/sbin/wifi_ap_idletime_get.sh",  $output, $retVal);

	    if(!$retVal){
	        $result = explode("=", $output[0]);
	    }
	    return array('idle_time'=>$result[1]);
	}

	/*To update wait time of down link*/
	public function setWifiIdleTime($time){
	    $output = $retVal = null;
	    exec_runtime("sudo /usr/local/sbin/wifi_ap_idletime_set.sh --idle $time",  $output, $retVal);
	    return array('status' => 'Success');
	}
}
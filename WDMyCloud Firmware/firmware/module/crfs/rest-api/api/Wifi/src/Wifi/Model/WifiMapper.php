<?php

namespace Wifi\Model;

/**
 * file wifi/wifiMapper.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 * @author laha_b
 */

class WifiMapper {

	public static $securedEncryption = array("WPAPSK/AES", "WPAPSK/TKIP", "WPAPSK/TKIPAES", "WPA2PSK/AES", "WPA2PSK/TKIP", "WPA2PSK/TKIPAES",
	                                   "WPAPSK1WPAPSK2/AES", "WPAPSK1WPAPSK2/TKIP", "WPAPSK1WPAPSK2/TKIPAES");

	public static $allEncryption = 	array("WPAPSK/AES", "WPAPSK/TKIP", "WPAPSK/TKIPAES", "WPA2PSK/AES", "WPA2PSK/TKIP", "WPA2PSK/TKIPAES",
	                                   "WPAPSK1WPAPSK2/AES", "WPAPSK1WPAPSK2/TKIP", "WPAPSK1WPAPSK2/TKIPAES", "WEP", "NONE");

	public function verifySsid($ssid){

		if(empty($ssid) || (filter_var($ssid, \FILTER_VALIDATE_REGEXP, array("options"=>array("regexp"=>"/(^\\x20|\\x20$|\\x00$)/")))) || (strlen($ssid) > 32)){
			throw new \Wifi\Exception('wifi invalid ssid error.', 400);
		}
		else{
			$ssid = str_replace("\\", "\\\\", $ssid);
			$ssid = str_replace('"', '\"', $ssid);
			$ssid = str_replace('`', '\\`', $ssid);
			$ssid = str_replace('$', '\\$', $ssid);
			return $ssid;
		}
	}

	public function verifySecurityMode($securityMode){

		if(in_array(strtoupper($securityMode), self::$allEncryption)){
			return $securityMode;
		}
		else{
			throw new \Wifi\Exception('wifi invalid security mode error. ', 400);
		}

	}

	public function verifySecurityKey($securityKey, $securityMode){
		if(isset($securityMode)){
			if(strcmp($securityMode, 'WEP') == 0){
				if(strlen($securityKey) == 5 || strlen($securityKey) == 13 || (ctype_xdigit($securityKey) && (strlen($securityKey) == 10 || strlen($securityKey) == 26))){
					$passphrase = $securityKey;
				}
				else{
					throw new \Wifi\Exception('wifi invalid security key error. ', 400);
				}
			}
			else{
				if(in_array($securityMode, self::$securedEncryption)){
					if(strlen($securityKey) > 7 && strlen($securityKey) < 64){
						$passphrase = $securityKey;
					}
					else{
						throw new \Wifi\Exception('wifi invalid security key error. ', 400);
					}
				}
			}

			if(strcmp($securityMode, 'NONE') == 0){
				$securityKey = '';
				$passphrase = $securityKey;
			}

			return str_replace(["\\", '"', "`", "$"], ["\\\\", '\"', "\\`", "\\$"], $passphrase);
		}
		else{
			throw new \Wifi\Exception('wifi invalid security key and security mode mismatch. ', 400);
		}
	}

	public function verifyMacAddress($macAddress){
		if(isset($macAddress) && (filter_var($macAddress, \FILTER_VALIDATE_REGEXP, array("options"=>array("regexp"=>"/^[0-9a-fA-F]{2}(?=([:;.]?))(?:\\1[0-9a-fA-F]{2}){5}$/"))))){
			return $macAddress;
		}
		throw new \Wifi\Exception('Mac Address validation failed."', 400);
	}
}
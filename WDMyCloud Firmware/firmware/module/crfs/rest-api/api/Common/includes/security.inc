<?php
/**
 * \file common\security.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/util.inc');
require_once(COMMON_ROOT . '/includes/securitydb.inc');

use Auth\User\UserSecurity;
use Auth\User\UserManager;
use Common\Model\ConfigCache;

abstract class PropertyBean {

	public function __call($name, $value) {
		if (in_array($name, $this->getMethods())) {
			if(!isset($value[0])) $value[0] = null;
			if (!$this->_handleSetter($name, $value[0])) {
				return $this->_handleGetter($name);
			}
		}
	}

	abstract protected function getMethods();

	protected function _handleSetter($name, $value) {
		//if (preg_match_all('/(.*) {(.*)}(.*)/s', $sql, $matches, PREG_SET_ORDER)) {
		//$prependSql = $matches[0][1];

		if(preg_match_all( '/^set(.*)/', $name, $matches, PREG_SET_ORDER) || preg_match_all( '/^is(.*)/', $name, $matches, PREG_SET_ORDER)) {
			$attrName = $matches[0][1];
			$this->{$attrName} = $value;
			return true;
		}
		return false;
	}

	protected function _handleGetter($name) {
		if(preg_match_all( '/^get(.*)/', $name, $matches, PREG_SET_ORDER)) {
			$attrName = $matches[0][1];
			return $this->{$attrName};
		}
		return false;
	}
}


//-----------------------------------------------------------------------------
// Authenticating/Deauthenticating of current session
//-----------------------------------------------------------------------------

/**
 * Clears all session parameters that relate to authentication.
 * @return none
 */
function deauthenticate() {
	//session_destroy();
	//clear and expire the session cookie - deletes the cookie on Firefox
	//setcookie(session_name(), session_id(), 1, '/');
}


//-----------------------------------------------------------------------------
// Getting Session Info
//-----------------------------------------------------------------------------

/**
 * Returns the current Username for this session. This used to return the User ID, which is no longer used.
 * @deprecated use \Auth\UserSecurity::getInstance()->getSessionUsername() instead
 * @return string Username
 */
function getSessionUserId() {
	return UserSecurity::getInstance()->getSessionUsername();
}

//-----------------------------------------------------------------------------
//Account Detail Functions
//-----------------------------------------------------------------------------

/**
 * Returns true if user is admin otherwise false.  Result is based on a DB query.
 * @param string $username Username for which the admin status is being requested.
 * @return boolean
 */

function isAdmin($userName) {
    if(isset($userName) && !empty($userName)){
        return UserSecurity::getInstance()->isAdmin($userName);
    }
    else
        return false;
}

/**
 * Returns true if the specified user has a LocalUsername in the database.
 * @param string username
 * @return boolean true if local user
 */
function isLocalUser($username) {
	return UserManager::getInstance()->isValid($username);
}

/**
 * Returns true if the specified user does not have a LocalUsername in the database.
 * @param string $username
 * @return boolean true if guest user
 */
function isGuestUser($username) {
	return !isLocalUser($username);
}

/**
 * Returns true if a password required for this local user.
 * @param integer $username4
 * @return boolean
 */
function isPasswordRequiredForLocalUser($username) {

	$user = UserManager::getInstance()->getUser($username);

	if (!isset($user)) {
	    //log the error
	    $logObj->LogData('OUTPUT', NULL, __FUNCTION__, 'invalid username or password');
		return true; //if unkown user, we don't want to allow access
	}
	return $user->getIsPassword();
}



/**
 * Returns true if request based authentication.
 */
function isRequestBasedAuthentication($queryParams) {
	// Check for old API for compatability
	if(isset($queryParams['owner']) && isset($queryParams['pw'])) {
			return true;
	}

	// Check for user name and password.
	if(isset($queryParams['auth_username']) && isset($queryParams['auth_password'])) {
			return true;
	}

	// Check for device_user_id and device_user_auth_code.
	if(isset($queryParams['device_user_id']) && isset($queryParams['device_user_auth_code'])) {
			return true;
	}

	// Check for device_user_id and device_user_auth_code.
	if(isset($queryParams['device_user_id']) && isset($queryParams['request_auth_code'])) {
			return true;
	}

	return false;
}

function getLocalIpAndMaskFromIfConfig() {
	$localIp = array();

	exec_runtime('netstat -i', $netstat_out, $status, false);
	if(count($netstat_out) == 0) {
		exec_runtime('sudo netstat -i', $netstat_out, $status, false);
	}
	foreach($netstat_out as $key => $entry) {
		if (strncmp( $entry, 'Kernel', 6) == 0) {
			unset($netstat_out[$key]);
			break;
		}
	}
	foreach($netstat_out as $key => $entry) {
		if (strncmp( $entry, 'Iface', 5) == 0) {
			unset($netstat_out[$key]);
			break;
		}
	}
	foreach($netstat_out as $key => $entry) {
		if (strncmp( $entry, 'lo', 2) == 0) {
			unset($netstat_out[$key]);
			break;
		}
	}
	foreach($netstat_out as $key => $entry) {
		if (strncmp( $entry, 'tun', 3) == 0) {
			unset($netstat_out[$key]);
			break;
		}
	}

	foreach($netstat_out as $key => $entry) {
		if (strncmp( $entry, 'wifi0', 5) == 0) {
			unset($netstat_out[$key]);
			break;
		}
	}

	foreach($netstat_out as $key => $entry) {
		if (strncmp( $entry, 'docke', 5) == 0) {
			unset($netstat_out[$key]);
			break;
		}
	}

	$intrefaces = array();

	foreach($netstat_out as $key => $entry) {
		list( $Iface, $MTU, $Met, $RXOK, $RXERR, $RXDRP, $RXOVR, $TXOK, $TXERR, $TXDRP, $TXOVR, $Flg) = sscanf( $entry, '%s %s %s %s %s %s %s %s %s %s %s %s');
		$intrefaces[] = $Iface;
	}

	if (empty($intrefaces)){
		return $localIp;
	}

	exec_runtime('/sbin/ifconfig' , $ifconfigout);
	if(count($ifconfigout) == 0) {
		exec_runtime('sudo /sbin/ifconfig ', $ifconfigout);
	}

	$localIpMaskArray = array();

	foreach($ifconfigout as $key => $entry) {
		foreach($intrefaces as $index => $interfaceName) {

			$eth0 = strstr($entry, $interfaceName );
			if(!empty($eth0)) {

				$ifaceEntry = explode(' ', trim($ifconfigout[++$key]));

				$localIp = array();

				foreach($ifaceEntry as $k => $value) {
					if(empty($value) || $value === 'inet')
						continue;
					$ip = strstr($value, 'addr:' );
					if($ip != false) {
						$ipAddress = substr($value, 5); // Skipping 'addr:'
						$localIp['ip'] = $ipAddress;
						continue;
					}
					$mask = strstr($value, 'Mask:' );
					if($mask != false) {
						$mask = substr($value, 5); // Skipping 'addr:'
						$localIp['mask'] = $mask ;

						continue;
					}
				}
				if(!empty($localIp)) {
					$localIp['ifacename'] = $interfaceName;
					$localIpMaskArray[] = $localIp;
				}
			}
		}

	}

	return $localIpMaskArray;
}

/*
 * This is Windows implementation to return local IP & Mask
 *
 */
function getLocalIpAndMaskFromIPConfig() {
    $localIpMaskArray = array();
    $localIp = array();
    //$localIp = array(0 => array('ip' => gethostbyname(trim(`hostname`))));

    exec('ipconfig', $ipConfigOut);
    foreach($ipConfigOut as $line) {
        if(\preg_match('/\bIPv4 Address\b/i', trim($line)) ) {
            list($t, $ip) = \explode(':', $line);
            $localIp['ip'] = trim($ip);
        } else if(\preg_match('/\Subnet Mask\b/i', trim($line))) {
            list($t, $mask) = \explode(':', $line);
            $localIp['mask'] = trim($mask);
        }
    }
    $localIpMaskArray[] = $localIp;

    return $localIpMaskArray;
}

/*
 * Returns true if request is from local IP
 */
function isLanRequest() {
	$lanRequest = RequestScope::getInstance()->getLanRequest();
	if(!empty($lanRequest)) {
		return $lanRequest;
	}

	$remoteAddr = $_SERVER['REMOTE_ADDR'];
	\Core\Logger::getInstance()->info('remote addr: ' . $remoteAddr);
	$skipLanCheck = getSkipLanSecurityCheck();

	if(strcasecmp($skipLanCheck,"TRUE") == 0) {
		return true;
	}

	$cache = ConfigCache::getConfigCache('LAN_ADDR');
	if ($cache == NULL) {
		//Since network information is not stored in a file, the cache will not watch any file for changes, but it will use timeout of 60 seconds.
		$cache = ConfigCache::initializeConfigCache('LAN_ADDR', null, 60);
	}
	$cachedLanResult = $cache->getValue($remoteAddr);
	//If we found a cached result (from APC), then store it for this request and return immediately
	if($cachedLanResult != NULL) {
		RequestScope::getInstance()->setLanRequest($cachedLanResult);
		return $cachedLanResult;
	}

	//The result defaults to false unless we find a matching condition which indicates the address is on the LAN
	$lanRequest = false;

	/**
	 * JS - ITR 80825 - this is dangerous and allows traffic from outside the local sub-net to be treated as local,
	 * including WAN requests sent over openVPn from the Relay server
	 *
	 * Modification: only restrict 10.* addresses to local subnet otherwise we break WAN Desktop access for
	 * Lightning
	 *
	 */

	if($remoteAddr === '127.0.0.1' || $remoteAddr === 'localhost') {
		$lanRequest = true;
	} else if( strpos($remoteAddr, '192.168') === 0) {
		$lanRequest = true;
	//Additional scenario: class B private address header: 101011000001
	} else if ( (ip2long($remoteAddr) >> 20 & 4095) === 2753) {
        $lanRequest = true;
	} else {

		/**
		 * JS - ITR 80825 - If here, only allow local access from the same subnet as the NAS
		 * For 10.* networks with more than one sub-net this might be an issue and the best
		 * way to support this is to allow the user to add individual IPs and IP-ranges to a white-list.
		 */

		switch (\Core\SystemInfo::getOSName()) {
			case 'linux':
				$localIpAndMaskList = getLocalIpAndMaskFromIfConfig();
				break;
			case 'windows':
				$localIpAndMaskList = getLocalIpAndMaskFromIPConfig();
				break;
			default:
				throw new Exception('Failed to recognize "' . \Core\SystemInfo::getOSName() . '" as an OS Type');
		}

		foreach($localIpAndMaskList as $key => $localIpAndMask) {
			if(isset($localIpAndMask['ip'])) {

				if(!isset($localIpAndMask['mask']))	{
					$localIpAndMask['mask'] = null;
				}
				$subNetMask = trim($localIpAndMask['mask']);
				if(strcasecmp($skipLanCheck,"TRUE") == 0) {
					$subNetMask = "255.0.0.0";
				}
				$localIp = ip2long(trim($localIpAndMask['ip']));
				$remoteIp = ip2long($remoteAddr);
				$mask = ip2long($subNetMask);
				if((($localIp ^ $remoteIp) & $mask) == 0) {
					$lanRequest = true;
					break;
				}
			}
		}
	}
	//Store the result in both the the request and in the APC Cache
	RequestScope::getInstance()->setLanRequest($lanRequest);
	$cache->putValue($remoteAddr, $lanRequest);
	return $lanRequest;
}


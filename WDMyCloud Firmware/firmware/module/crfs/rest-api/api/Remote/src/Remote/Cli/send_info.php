#!/usr/bin/php
<?php
define('ADMIN_API_ROOT', realpath('/var/www/rest-api/'));

require_once(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');

use \Remote\Device\DeviceControl;
use Version\FirmwareVersion\FirmwareVersion;
use Remote\DeviceUser\Db\DeviceUsersDB;
use Auth\User\UserManager;
use Remote\DeviceUser\DeviceUserManager;
use Auth\User\UserSecurity;

$globalConfig = getGlobalConfig('global');

$deviceUsersUpdatedFile = '/CacheVolume/device_users_updated';

if(isset($globalConfig['ENABLEREMOTEACCESS']) && $globalConfig['ENABLEREMOTEACCESS']!=1){
	exit;
}

if (strtolower(getRemoteAccess()) !== 'true'){
	exit;
}

$deviceUsersUpdated = file_exists($deviceUsersUpdatedFile);
$firmwareVersionUpToDate = FirmwareVersion::getInstance()->isSentVersionUpToDate();

if($deviceUsersUpdated && $firmwareVersionUpToDate){
	exit;
}

$deviceControl = DeviceControl::getInstance();
if(!$deviceControl->deviceIsRegisteredRemote()) {
	exit;
}

//if there are no device users, we can not send out information on behalf of the customer
//and no device users to update, also no need to check in the future because all device users created on the new firmware will have user_type
$deviceUsersDb = DeviceUsersDB::getInstance();
if ($deviceUsersDb->getNumberOfDeviceUsers() == 0) {
	if(!$deviceUsersUpdated){
		touch($deviceUsersUpdatedFile);
	}
	exit;
}

if(!$firmwareVersionUpToDate){
	$status = $deviceControl->updateRemoteRegistration(\getDeviceName()['machine_name'], null);
	if(!$status){
		echo  "Problem encountered when trying to send a device registration PUT request with firmware version update";
		exit(1);
	}	
}

if(!$deviceUsersUpdated){
	$userManager = UserManager::getInstance();
	$users = $userManager->getUser($username);
	if (!empty($users) && !is_array($users)) {
		$users = [$users];
	}
	$userSecurity = UserSecurity::getInstance();
	$deviceUserManager = DeviceUserManager::getManager();
	foreach ($users as $user) {
		$username = $user->getUsername();
		$parametersToUpdate['user_type'] = $userSecurity->userTypeRemote($username);
		$status = $deviceUserManager->updateUserParameters($username, $parametersToUpdate);
		if(!$status){
			echo  "Problem encountered when trying to send device_user type information to Central Server";
			exit(1);
		}
	}
	
	touch($deviceUsersUpdatedFile);
}

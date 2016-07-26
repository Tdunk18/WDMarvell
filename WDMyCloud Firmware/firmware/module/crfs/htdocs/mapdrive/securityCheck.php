<?php
/**
 * \file mapdrive/securityCheck.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

require_once('secureCommon.inc');

use Auth\User\UserManager;
use Remote\DeviceUser\Db\DeviceUsersDB;


$deviceUserId = getParameter($_REQUEST, 'deviceUserId', PDO::PARAM_STR, NULL, false);
$authCode     = getParameter($_REQUEST, 'deviceUserAuthCode', PDO::PARAM_STR, NULL, false);

$deviceUserDao = DeviceUsersDB::getInstance();

$_SESSION['mapkey']="__".strval(rand())."__";
$_SESSION[$_SESSION['mapkey']] = array('deviceUserId' => $deviceUserId, 'deviceUserAuthCode' => $authCode);

$userManagerDao = UserManager::getInstance();
$user           = NULL;
$deviceUser     = NULL;

if ($deviceUserDao->isValid($deviceUserId, $authCode)) {
   $deviceUser = $deviceUserDao->getDeviceUser($deviceUserId);

   $user       = $userManagerDao->getUser($deviceUser->getParentUsername());

   $_SESSION['username'] = $user->getUsername();
   $_SESSION['fullname'] = $user->getFullname();
}

if (!$deviceUserDao->isValid($deviceUserId, $authCode) || !isLocalUser($deviceUser->getParentUsername()) ) {
	header('Location: /mapdrive/accessDenied.php'); // Access Denied
} else if (!isPasswordRequiredForLocalUser($user->getUsername())) {
   	header('Location: /mapdrive/mapDrive.php?mapkey='.$_SESSION['mapkey']); // Redirect map drive
} else {
    header('Location: /mapdrive/localAuth.php');
}

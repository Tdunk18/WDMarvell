#!/usr/bin/php

<?php
/**
 * \send_invite_email.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */
define('ADMIN_API_ROOT', realpath('/var/www/rest-api'));
define("RETURN_CODE_SUCCESS", 0);
define("RETURN_CODE_FAILURE_INCORRECT_NUMBER_OF_ARGUMENTS", 1);
define("RETURN_CODE_FAILURE_INVALID_REQUEST", 2);
define("RETURN_CODE_FAILURE_EXCEPTION", 3);
define("RETURN_CODE_FAILURE_REQUEST_FAILED", 4);

require(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
require_once(ADMIN_API_ROOT . '/api/Common/includes/security.inc');

use Remote\DeviceUser\Db\DeviceUsersDB;
use Remote\DeviceUser\DeviceUserManager;


if ($argc < 2) {
    $returnCode = RETURN_CODE_FAILURE_INCORRECT_NUMBER_OF_ARGUMENTS;
    echo("\nUsage: send_invite_email.php <username> <email>\n");
    exit($returnCode);
}

$username   = strtolower($argv[1]);
$email      = strtolower($argv[2]);
$returnCode = sendEmail($username, $email);

echo($returnCode);

ob_flush();

/**
 * This function will resend the invitation email for the existing device users and
 * create a new device user and send the invitation email for the new device users.
 */
function sendEmail($username, $email) {
    try {
        $deviceUsers       = DeviceUsersDB::getInstance()->getDeviceUsersForUsernameWithEmail($username, $email);
        $deviceUserManager = DeviceUserManager::getManager();
        $deviceUserId      = empty($deviceUsers) ? '' : $deviceUsers[0]->getDeviceUserId();

        if (empty($deviceUserId)) {
            $result = $deviceUserManager->addEmailDeviceUser($username, $email);

            if (isset($result['device_user_id']) && isset($result['device_user_auth'])) {
                return RETURN_CODE_SUCCESS;
            } else {
                return RETURN_CODE_FAILURE_REQUEST_FAILED;
            }
        } else {
            if ($deviceUserManager->resendEmail($deviceUserId)) {
                return RETURN_CODE_SUCCESS;
            } else {
                return RETURN_CODE_FAILURE_REQUEST_FAILED;
            }
        }
    } catch (Exception $e) {
        return RETURN_CODE_FAILURE_EXCEPTION;
    }
}
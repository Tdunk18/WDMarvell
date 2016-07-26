<?php
/**
 * \file include/jobs/jobscommon.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
namespace Jobs\Common;

use Auth\User\UserManager;
define('FILE_JOB', 1);
define('DIR_JOB',  2);

require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(SHARES_ROOT . '/includes/db/shareaccessdb.inc');
require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');


class JobCommon {
	// UserManager instance
	private static $userManager;

	function __construct(){
	    if (!isset(self::$userManager)) {
			self::$userManager = UserManager::getInstance();
		}
	}

    /*
	 * Access Permission methods
	 * */

	/*
	 * Check for user access permission
     * $userId  integer : Call by Reference value
	 * */
	public function checkUserAccessPermission($job_username) {
        $ret_value = false;
        $sessionUserId = getSessionUserId();
        $userInfo = self::$userManager->getUser($sessionUserId);
        if(is_object($userInfo)) {
            if (isAdmin($sessionUserId) || $sessionUserId == $job_username) {
                $ret_value = true;
            } 
        }
        return $ret_value;
	}
}
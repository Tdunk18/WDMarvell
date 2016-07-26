<?php
/*
   This script is a bridge from the AutoMounter Perl code to the Orion PHP code.
   Copyright (c) [2011-2013] Western Digital Technologies, Inc. All rights reserved.
*/
define('ADMIN_API_ROOT', realpath('/var/www/rest-api/'));

require(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
require_once(COMMON_ROOT . '/includes/security.inc');

require_once(COMMON_ROOT . '/includes/globalconfig.inc');

// Constants

define("RETURN_CODE_SUCCESS", 0);
define("RETURN_CODE_FAILURE_INCORRECT_NUMBER_OF_ARGUMENTS", 1);
define("RETURN_CODE_FAILURE_INVALID_REQUEST", 2);
define("RETURN_CODE_FAILURE_EXCEPTION", 3);
define("RETURN_CODE_FAILURE_REQUEST_FAILED", 4);
define("RETURN_CODE_FAILURE_READSMBCONF", 5);
define("RETURN_CODE_FAILURE_CREATESHARE", 6);
define("RETURN_CODE_FAILURE_UPDATESHARE", 7);
define("RETURN_CODE_FAILURE_DELETESHARE", 8);
define("RETURN_CODE_FAILURE_SHARENOTFOUND", 9);
define("RETURN_CODE_FAILURE_NOSHAREACCESS", 10);
define("RETURN_CODE_FAILURE_SHAREEXISTS", 11);
define("RETURN_CODE_FAILURE_SHAREDOESNOTEXIST", 12);

define("SMB_CONF_COPY_PATH","/tmp/smb_copy.conf");

// Required Files

use Core\Logger;

class SharesCrud {

	use Shares\Model\Share\SharesDaoTrait;
	use Shares\Model\Share\AccessDaoTrait;

/*
    If the request argument wasn't specified, fail the request.
*/

	function sharesCrud($request, $shareName, $smbConfPath, $mediaServing = false, $newShareName = false) {
	
		$returnCode = RETURN_CODE_SUCCESS;
			
	    $_SERVER['REMOTE_ADDR'] = 'Internal';
	    putenv("INTERNAL_REQUEST=true");
	    
	    //if share name was modified new name will be in smb.conf
	    $realName = $newShareName ? : $shareName;
	    
	    //get the share object and access list object for this share
	    
		 $share = $this->_getShareByName($realName);
		 if (empty($share)) {
		    return(RETURN_CODE_FAILURE_SHARENOTFOUND);
	   	 }
		 $shareAccess = $this->_getShareAccess($realName);
		 if (empty($shareAccess)) {
		 	return(RETURN_CODE_FAILURE_NOSHAREACCESS);
		 }
	    
	    /*
		 *  Create a share - the share has already been added to smb.conf by the vendor's code before they called this function 
	     */
	    $returnCode = 0;
	
	    if ($request == 'create') {
			$existingShare = $this->_getShareByName($shareName);
			if (!empty($existingShare)) {
					$returnCode = RETURN_CODE_FAILURE_SHAREEXISTS;
			}
	    }
	
	    /*
	     * Update a share 
	     */
	    
	    else if ($request == 'update') {
			$existingShare = $this->_getShareByName($shareName);
			if (empty($existingShare)) {
				$returnCode = RETURN_CODE_FAILURE_SHAREDOESNOTEXIST;
			}
		}
	
	    /*
	     * Delete a share 
	     */
	
	    elseif ($request == 'delete') {
		    	$existingShare = $this->_getShareByName($shareName);
				if (empty($existingShare)) {
						$returnCode = RETURN_CODE_FAILURE_SHAREDOESNOTEXIST;
				} 
	    }
	    else {
	        $returnCode = RETURN_CODE_FAILURE_INVALID_REQUEST;
	    }

	    //touch smb conf file. This will cause the Shares cache to refresh itself. Trying to invalidate the cache directly here
	    //will not work because apc_cache uses process-local memory and the CLI process is seperate from the PHP Apache or CGI process
	    $smbConfPath = \getSmbFilePath();
	    exec("sudo touch ". $smbConfPath, $output, $retVal);
	     
	    return($returnCode);
	}

}



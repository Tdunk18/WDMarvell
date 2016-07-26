<?php
namespace Shares\Controller;

require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');

use Core\Logger;
use Auth\User\UserSecurity;
use Filesystem\Model\Link;
use \Shares\Model\Share\AccessLevel;
use Shares\Model\Share\SharesDao;

require_once(COMMON_ROOT . '/includes/globalconfig.inc');
use Core\Config;

/**
 * \file Shares/Controller/SharesManagerController.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class SharesManagerController
 * \brief Create, retrieve, update, or delete a share.
 *
 * Share name can contain alphanumeric characters, - and _ and can be between 1 and 32 characters in length.
 *
 * - This component uses Core\RestComponent.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see Album, Users
 */
class SharesManagerController /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SharesTraitController;

    const COMPONENT_NAME = 'shares';

    protected $mediaOptions = array('any','none','true','false');

    /**
     * \par Description:
     * Delete the specified share.
     *
     * \par Security:
     * - Only a Cloud Holder/Admin user with write permission can delete a share.
     *
     * \par HTTP Method: DELETE
     * http://localhost/api/@REST_API_VERSION/rest/shares/{share_name}
     *
     * \param share_name  String - required
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57 - USER_NOT_AUTHORIZED - User not authorized.
     * - 157 - DELETE_PUBLIC_FORBIDDEN - Deleting the Public share forbidden.
     * - 99 - SHARE_FUNCTION_FAILED - Internal server error.
     *
     * \par XML Response Example:
     * \verbatim
<shares>
    <status>success</status>
</shares>
      \endverbatim
     */
    public function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $shareName = $this->_findShareName($urlPath, $queryParams, true);

        if (strcasecmp($shareName, \Shares\Model\Share\Share::PUBLIC_SHARE_NAME) == 0) {
            throw new \Core\Rest\Exception('DELETE_PUBLIC_FORBIDDEN', 403, null, self::COMPONENT_NAME);
        }

        $sharesDao = new \Shares\Model\Share\SharesDao();

        if (!$sharesDao->shareExists($shareName)) {
        	throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }
        $share = $sharesDao->get($shareName);

        if (!$sharesDao->isShareAccessible($shareName, false, true)) {
            throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
        }

        try {
            $sharesDao->delete($shareName);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('SHARE_FUNCTION_FAILED', 500, $e, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, 'shares', ['status' => 'success'], $outputFormat);
    }

    /**
     * \par Description:
     * Retrieve information about the specified share, or all shares if share_name parameter is not supplied
     * Calling the API with version 1.0 will return the sizes in MB (base 10), otherwise the sizes are in bytes.
     * Calling the API with older version than 2.6, will not return the list of shares which are not available via Samba. Also, these parameters will not be available:
     * samba_available, share_access_locked, target_path, owner. Please note the owner's username will be blank for shares without a target_path.
     * The 'usb_handle' parameter has been renamed to 'handle' to represent USB, SD card and potential new external storage types in future. For backward compatibility,
     * If shares API is executed with version 2.6 or older, the parameter name is  'usb_handle'. Else, for API versions higher than 2.6, the parameter name is 'handle'.
     *
     * \par Security:
     * - User must be authenticated. Only the shares which a user has access to are returned unless an Admin using show_all.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/shares/{share_name}
     *
     * \param share_name 					String - optional
     * \param show_all   					boolean - optional (default true)
     * \param include_mtime   				boolean - optional (default false)
     * \param include_dir_count 			boolean - optional (default false)
     * \param include_hidden   				boolean - optional (default false)
     * \param include_wd_sync_folder		boolean - optional (default false)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     * - show_all - if this is true and the user is an admin, then all shares are returned if even user does not have access to it. Defaults to true
     * - include_mtime - if this is true then we return the mtime of the share contents (for example "/shares/Public/") - when the first level of the share content was last modified (does not get affected by changes to the folders of a share and their children)
     * - include_dir_count - include the count of directories contained withn the share. Do not include hidden directories unless "include_hidden" parameter is also passed. Only include the directories, not files and not the children of directories.
     * - include_hidden - only used in addition to include_dir_count, false by default. If include_dir_count and include_hidden is to true then dir_count will include hidden directories
     * - include_wd_sync_folder - if this is true then the output includes an additional element called: wd_sync_folder which is set to true if the share is being used  for Synching by WD Synch, else false
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57 - USER_NOT_AUTHORIZED - User not authorized.
     * - 99 - SHARE_FUNCTION_FAILED - Internal server error.
     *
     * \par XML Response Example:
     *If API version is 2.6 or older, output will be -
     * \verbatim
     *	 <shares>
     *		<share>
     *			<share_name>Public</share_name>
     * 			<description>Public Share</description>
     * 			<size>12454</size>
     * 			<remote_access>false</remote_access>
     * 			<public_access>true</public_access>
     *          <media_serving>any</media_serving>
     *          <volume_id>1</volume_id>
     *          <dynamic_volume>true</dynamic_volume>
     *          <samba_available>true</samba_available>
     *          <share_access_locked>false</share_access_locked>
     *          <target_path></target_path>
     *          <owner>
     *              <username></username>
     *          </owner>
     *          <!-- Only shown if dynamic_volume is true -->
     *          <capacity>15984</capacity>
     *          <read_only />
     *          <usb_handle>6</usb_handle>
     *          <file_system_type>vfat</file_system_type>
     *          <!-- End dynamic_volume specific parameters -->
     *          <share_access>
     *              <username>admin</username>
     *              <user_id>admin</user_id>
     *              <access>RW</access>
     *          </share_access>
     *      </share>
     *  </shares>
     *\endverbatim
     *
     *If API version is greater than 2.6, then output will be -
     * \verbatim
     *	 <shares>
     *		<share>
     *			<share_name>Public</share_name>
     * 			<description>Public Share</description>
     * 			<size>12454</size>
     * 			<remote_access>false</remote_access>
     * 			<public_access>true</public_access>
     *          <media_serving>any</media_serving>
     *          <volume_id>1</volume_id>
     *          <dynamic_volume>true</dynamic_volume>
     *          <samba_available>true</samba_available>
     *          <share_access_locked>false</share_access_locked>
     *          <target_path></target_path>
     *          <owner>
     *              <username></username>
     *          </owner>
     *          <!-- Only shown if dynamic_volume is true -->
     *          <capacity>15984</capacity>
     *          <read_only />
     *          <handle>6</handle>
     *          <file_system_type>vfat</file_system_type>
     *          <!-- End dynamic_volume specific parameters -->
     *          <share_access>
     *              <username>admin</username>
     *              <user_id>admin</user_id>
     *              <access>RW</access>
     *          </share_access>
     *      </share>
     *  </shares>
     *\endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml', $version=null) {
		$includeMtime = isset($queryParams['include_mtime']) ? \Core\Config::stringToBoolean(trim($queryParams['include_mtime'])) : false;
        $includeWdSyncFolder = isset($queryParams['include_wd_sync_folder']) ? \Core\Config::stringToBoolean(trim($queryParams['include_wd_sync_folder'])) : false;
        $includeDirCount = isset($queryParams['include_dir_count']) ? \Core\Config::stringToBoolean(trim($queryParams['include_dir_count'])) : false;
        $includeHidden = isset($queryParams['include_hidden']) ? \Core\Config::stringToBoolean(trim($queryParams['include_hidden'])) : false;

        $shareName = $this->_findShareName($urlPath, $queryParams);

        $sharesDao = new \Shares\Model\Share\SharesDao();

        $shareDetails = null;


        try {
        	if (isset($shareName)) {
        		$share = $sharesDao->get($shareName);
        		if (!empty($share)) {
		            $shareDetails = array($share);
        		}
        	}
        	else {
        		//this may take a long time depending on numbe rof shares
        		set_time_limit(0);
        		$shareDetails = $sharesDao->getAll();
        		set_time_limit(ini_get('max_execution_time'));
        	}
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('SHARE_FUNCTION_FAILED', 500, $e, self::COMPONENT_NAME);
        }

        require_once(COMMON_ROOT . '/includes/outputwriter.inc');
        if (empty($shareDetails)) {
            if (isset($shareName)) {
                throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, null, self::COMPONENT_NAME);
            } else {
                $this->generateSuccessOutput(200, 'shares', ['share' => ''], $outputFormat);
                return;
            }
        }

        $found = false;
        if (!empty($shareDetails)) {
            $showAll = isset($queryParams["show_all"]) ? \Core\Config::stringToBoolean($queryParams["show_all"]) : true;

            $sizeDivision = 1;
            Logger::getInstance()->info("version passed in = $version");
            if (1 == $version) {
                // we want to return the size in MB using base 10
                $sizeDivision = 1000 * 1000;
            }

            foreach ($shareDetails as $share) {
                if (strlen($share->getName()) == 0) {
                    continue;
                }

                //For backward compatibility old Apps Or the Apps requesting for REST API version older than 2.6
                //should not get the list of shares which are not available via. Samba
                if ($version < 2.6 && !$share->getSambaAvailable()) {
                    continue;
                }

                // Check if share is the "Recycle Bin", inwhich case ignore it.
                if ($share->getRecycleBin()) {
                    continue;
                }

                if (!$sharesDao->isShareAccessible($share->getName(), false, $showAll)) {
                    if (isset($shareName)) {
                        //single share requested, but user is anuthorized to access it
                        throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
                    } else {
                        //all shares requested, filter out the shares that the user does not have access to
                        continue;
                    }
                }

                $ownerUsername = '';
                if ($share->getTargetPath()) {
                    $linkInfo = Link::getMapFromLink($share->getName(), TRUE, TRUE);
                    if (!empty($linkInfo)) {
                        $ownerUsername = $linkInfo[0]['owner'];
                    }
                }

                if (!$found) {
                    $found = true;
                    $output = new \OutputWriter(strtoupper($outputFormat));
                    $output->pushElement("shares");
                    $output->pushArray('share');
                }

                $share_name = $share->getName();
                $output->pushArrayElement('share');
                $output->element('share_name', $share_name);
                $output->element('description', $share->getDescription());
                if ($includeWdSyncFolder) {
                    $syncFolderPath = implode(DS, [getSharePath($share_name), $share_name, 'WD Sync']);
                    if (is_dir($syncFolderPath)) {
                        $output->element('wd_sync_folder', 'true');
                    } else {
                        $output->element('wd_sync_folder', 'false');
                    }
                }

                $output->element('size', ceil($share->getSize()/$sizeDivision));

                //convert legacy DB values for boolean values to string equivalents
                $output->element('remote_access',  $share->getRemoteAccess() ? 'true' : 'false');
                $output->element('public_access',  $share->getPublicAccess() ? 'true' : 'false');
                $output->element('media_serving', $share->getMediaServing() ? 'any' : 'none');
                $output->element('volume_id', $share->getVolumeId());
                $output->element('dynamic_volume', $share->getDynamicVolume() ? 'true' : 'false');
                if($version >= 2.6){
                    $output->element('samba_available',  $share->getSambaAvailable() ? 'true' : 'false');
                    $output->element('share_access_locked',  $share->getShareAccessLocked() ? 'true' : 'false');
                    $output->element('target_path',  $share->getTargetPath() ? $share->getTargetPath() : '');

                    $output->pushElement('owner');
                    $output->element('username', $ownerUsername);
                    $output->popElement();
                }
                if ($share->getDynamicVolume()) {
                    $output->element('capacity', ceil($share->getCapacity()/$sizeDivision));
                    $output->element('read_only', $share->getReadOnly());
                    if($version >= 2.7){
                        $output->element('handle', $share->getHandle());
                    }
                    else{
                        $output->element('usb_handle', $share->getHandle());
                    }
                    $output->element('file_system_type', $share->getFileSystemType());
                }
                if($includeMtime) {
                    $fstat = lstat(\getSharePath() . '/' . $share_name .'/');
                    $output->element('mtime', $fstat['mtime']);
                }
                if($includeDirCount){
                    $fullname = \getSharePath() . '/' . $share_name  ;
                    //parameter GLOB_ONLYDIR only accounts for directories
                    //two different cases for counting directories: when hidden files are not included we do not include hidden directories
                    //when hidden files are requested we count both visible and hidden subdirectories
                    //when requesting hidden files we subtract 2 to account for "." and ".."
                    $dirCount = count(glob($fullname."/*", GLOB_ONLYDIR));
                    if ($includeHidden) {
                        $hiddenCount = count(glob($fullname."/{.}*", GLOB_BRACE | GLOB_ONLYDIR));
                        if ($hiddenCount > 1) {
                            $hiddenCount -= 2;
                        }
                        $dirCount += $hiddenCount;
                    }
                    $output->element('dir_count', $dirCount);
                }
                $shareAccessList = $share->getAccessList();
                if (!empty($shareAccessList)) {
                    $output->pushArray('share_access');
                    foreach ($shareAccessList as $access) {
                        if ($access->getAccess() == AccessLevel::NOT_AUTHORIZED) {
                            continue;
                        }

                        $output->pushArrayElement('share_access');
                        $output->element('username', $access->getUsername());
                        $output->element('user_id', $access->getUsername());
                        $output->element('access', $access->getAccess());
                        $output->popArrayElement();
                    }
                    $output->popArray();
                }

                $output->popArrayElement();
            }
            if ($found) {
                $output->popArray();
                $output->popElement();
                $output->close();
            }
        }
        if (!$found) {
            $this->generateSuccessOutput(200, 'shares', ['share' => []], $outputFormat, true);
            return;
        }
    }

    /**
     * \par Description:
     * Create a new share.
     *
     * \par Security:
     * - Only a Cloud Holder/Admin user with write permission can create a share.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/shares/{share_name}
     *
     * \param share_name            String -  required
     * \param description           String -  optional
     * \param media_serving         String -  optional
     * \param public_access         String -  optional
     * \param volume_id             String -  optional
	 * \param remote_access			Boolean - optional (default value true)
     * \param samba_available       String -  optional (default value true)
     * \param share_access_locked   Boolean - optional (default value false)
     * \param grant_share_access    Boolean - optional (default value false)
     * \param target_path           String -  optional
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     * - media_serving - can only be one of: any, none.
     * - media_serving - defaults to 'any'
     * - public_access - defaults to 'false' if not set. When samba_available set to false, public_access should also be set to false.
     * - volume_id  - defaults to the first volume.
	 * - remote_access - if not set, defaults to true. If set to false, remote access is disabled for that share.
     * - samba_available - if set to true, the Share would be made available/visible via Samba. If set to false, the public_access should also be set to false. The parameter is not modifiable once set on a Share.
     * - target_path - an absolute path to a folder in a Share that the user has RW access to. when set, creates the Share that has path specified as its root.
     * The target path cannot refer to a root of a share (e.g. /Public) and cannot refer to a soft link. It could only refer to a folder at any level below a Share as {/share_name}/{folder1}{folder2}.
	 * When target_path set, samba_available should be set to false and grant_share_access to true.
     * - share_access_locked - when set to true, share access cannot be set or modified on this Share once created. This parameter is also not modifiable once set on a Share.
	 * When share_access_locked set to true, the grant_share_access should be set to true.
     * - grant_share_access - when set to true, automatically grants RW share access to the new Share for the User who is creating the new Share. It should be set to true, when share_access_locked set to true.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - User not authorized.
     * - 100 - OPERATION_FORBIDDEN - Operation is forbidden.
     * - 41  - PARAMETER_MISSING - Incorrect or missing parameter.
     * - 33  - INVALID_PARAMETER - Invalid parameter.
     * - 107 - SHARE_ALREADY_EXISTS - Share already exists.
     * - 99  - SHARE_FUNCTION_FAILED - Internal server error.
	 * - 2400 - INVALID_SAMBA_AVAILABLE_AND_PUBLIC_ACCESS_VALUES - Invalid Samba_available and public_access values
	 * - 2401 - INVALID_SHARE_ACCESS_LOCKED_AND_GRANT_SHARE_ACCESS_VALUES - Invalid share_access_locked and grant_share_access values
	 * - 2402 - INVALID_SAMBA_AVAILABLE_AND_TARGET_PATH_VALUES- Invalid Samba_available and target_path values
     * - 2405 - INVALID_GRANT_SHARE_ACCESS_AND_TARGET_PATH_VALUES - Invalid grant_share_access and target_path values
     *
     * \par XML Response Example:
     * \verbatim
    <shares>
        <status>success</status>
    </shares>
      \endverbatim
     */
    public function post($urlPath, $queryParams = null, $outputFormat = 'xml') {
    	set_time_limit(0);
        $sessionUsername = UserSecurity::getInstance()->getSessionUsername();

        $shareName = $this->_findShareName($urlPath, $queryParams, true);

        if (strcasecmp($shareName, \Shares\Model\Share\Share::PUBLIC_SHARE_NAME) == 0) {
            throw new \Core\Rest\Exception('OPERATION_FORBIDDEN', 403, null, self::COMPONENT_NAME);
        }

        $sharesDao = new \Shares\Model\Share\SharesDao();

        if ($sharesDao->shareExists($shareName)) {
        	throw new \Core\Rest\Exception('SHARE_ALREADY_EXISTS', 403, null, self::COMPONENT_NAME);
        }

        $filteredParams = $this->_filterParams($queryParams, 'post');

        try {
			// Grant access to the user who created the share (to share access list)
			if($filteredParams['grant_share_access']){
				$options['username'] = $sessionUsername;
			}
            $options['share_name'] = $shareName;
            $options['rel_path'] = $shareName; // FYI: Removed /shares/ prefix due to conflicts with MetaDB prefixing volume path. see also _updateShare()
            //copy only the options values we need to prevent code injection
            $options['remote_access'] = $filteredParams['remote_access'];
            $options['media_serving'] = $filteredParams['media_serving'];
            $options['public_access'] = $filteredParams['public_access'];
            $options['volume_id'] = $filteredParams['volume_id'];
            $options['description'] = $filteredParams['description'];
            $options['samba_available'] = $filteredParams['samba_available'];
            $options['share_access_locked'] = $filteredParams['share_access_locked'];
            $options['target_path'] = $filteredParams['target_path'];
            $share = (new \Shares\Model\Share\Share())->fromArray($options);
            $sharesDao->add($share);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('SHARE_FUNCTION_FAILED', 500, $e, self::COMPONENT_NAME);
        }
        set_time_limit(ini_get('max_execution_time'));
        $this->generateSuccessOutput(201, 'shares', ['status' => 'success'], $outputFormat);
    }

    /**
     * \par Description:
     * Update an existing share.
     *
     * \par Security:
     * - Only a Cloud Holder/Admin with write permission can update a share.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/shares/{share_name}
     *
     * \param share_name      String - required
     * \param new_share_name  String - required
     * \param description     String - optional
     * \param media_serving   String - optional
     * \param public_access   Boolean - optional
     * \param remote_access	  Boolean - optional
     *
     * \par Parameter Details:
     * - media_serving - can only be one of: any, none (default is 'any')
     * - remote_access - can be 'true' or 'false', if 'false', remote access is disabled for that share
     * - public_access - The flag cannot be set to true on Share that is not available via Samba (where the Share's samba_available attribute is false).
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     *
     *
     * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - User not authorized.
     * - 100 - OPERATION_FORBIDDEN - Operation is forbidden.
     * - 41  - PARAMETER_MISSING - Missing parameter.
     * - 33  - INVALID_PARAMETER - Invalid parameter.
     * - 128  - RENAME_PUBLIC_FORBIDDEN - Renaming the Public share is forbidden.
     * - 107 - SHARE_ALREADY_EXISTS - Share already exists.
     * - 99  - SHARE_FUNCTION_FAILED - Internal server error.
	 * - 2403 - PUBLIC_ACCESS_FORBIDDEN - Enabling public_access is not allowed.
	 *
     * \par XML Response Example:
     * \verbatim
<shares>
    <status>success</status>
</shares>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
    	set_time_limit(0);

        $shareName = $this->_findShareName($urlPath, $queryParams, true);
        $queryParams['share_name'] = $shareName;//prevents accidental rename in case user put share name in the path and query params.

        $sharesDao = new \Shares\Model\Share\SharesDao();

        if (!$sharesDao->shareExists($shareName)) {
            throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }

        if (!$sharesDao->isShareAccessible($shareName, false, true)) {
            throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
        }

        $existingShare  = $sharesDao->get($shareName);

        $filteredParams = $this->_filterParams($queryParams, 'put');

		// Check if public_access is being enabled on Samba unavailable (samba_available=false) Share
		if(!$existingShare->getSambaAvailable()){
			if(isset($filteredParams['public_access']) && $filteredParams['public_access'] == 'true' ||
				$filteredParams['public_access'] == true){
				throw new \Core\Rest\Exception('PUBLIC_ACCESS_FORBIDDEN', 403, null, self::COMPONENT_NAME);
			}
		}

        if (strcasecmp($shareName, \Shares\Model\Share\Share::PUBLIC_SHARE_NAME) === 0 && !empty($filteredParams['new_share_name'])  ) {
            throw new \Core\Rest\Exception('RENAME_PUBLIC_FORBIDDEN', 403, null, self::COMPONENT_NAME);
        }

        if (isset($filteredParams['new_share_name'])
                && strcmp($shareName, $filteredParams['new_share_name']) !== 0 ) {
            if ($sharesDao->shareExists($filteredParams['new_share_name'])) {
                throw new \Core\Rest\Exception('SHARE_ALREADY_EXISTS', 403, null, self::COMPONENT_NAME);
            }
            //set share's name to new share name (old share name will be passed to update funciton in SharesDao).
            $filteredParams['share_name'] = $filteredParams['new_share_name'];
            unset($filteredParams['new_share_name']);
        }

		// Warn Cloud Share params that are not applicable for PUT - the one not allowed to be modified post creation
		if (isset($queryParams['target_path']) || isset($queryParams['samba_available']) ||
			isset($queryParams['share_access_locked']) || isset($queryParams['grant_share_access'])) {
			throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
		}

        try {
			//update existing share with changed settings from filtered params
        	$existingShare->fromArray($filteredParams);
            $sharesDao->update($shareName, $existingShare);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('SHARE_FUNCTION_FAILED', 500, $e, self::COMPONENT_NAME);
        }
        set_time_limit(ini_get('max_execution_time'));
        $this->generateSuccessOutput(200, 'shares', ['status' => 'success'], $outputFormat);
    }

    /**
     * Processes and filters input parameters.
     *
     * @param array $queryParams
     * @param string $method
     * @return array
     * @throws \Core\Rest\Exception
     */
    protected function _filterParams($queryParams, $method) {
        require_once(FILESYSTEM_ROOT . '/includes/db/volumesdb.inc');
        $method = strtolower($method);

        $filters = [
            'description' => ['filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    if (!empty($string)) {
	                	if ( (strlen($string) > 256) ||
	                             preg_match('/^[^\w]/', $string)) {
	                        throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
	                    }
	                    //sanitize
	                    $string =  filter_var($string, FILTER_SANITIZE_STRING);
	                }
                    return $string;
            }],
            'media_serving' => ['filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    if ($string && !in_array($string, $this->mediaOptions)) {
                        throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
            }],
            /* Callback calls Core\Config::stringToBoolean: converts "true"/"false" and 1/0 to their boolean representation. */
            'public_access' => \FILTER_VALIDATE_BOOLEAN,
            /* Remote Access is once again required as an option for Shares in MyCloud O/S 2.0.*/
            'remote_access' => \FILTER_VALIDATE_BOOLEAN,
            'volume_id'     => ['filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    if (! (new \VolumesDB())->getVolume($string) ) {
                        throw new \Core\Rest\Exception('VOLUME_NOT_FOUND', 404, null, self::COMPONENT_NAME);
                    }
                    return $string;
            }],
            /* New Sharing attributes in MyCloud O/S 2.0.*/
            'samba_available' => \FILTER_VALIDATE_BOOLEAN,
            'share_access_locked' => \FILTER_VALIDATE_BOOLEAN,
            'grant_share_access' => \FILTER_VALIDATE_BOOLEAN,
            'target_path'=> ['filter' => \FILTER_CALLBACK,
                'options' => function ($string){
                    if(!is_null($string) || !empty($string)){
                        if(!isPathLegal($string)){
                            throw new \Core\Rest\Exception('TARGET_PATH_NOT_VALID', 400, NULL, static::COMPONENT_NAME);
                        }
                    }
                    return $string;
            }],
        ];

        /*
         * Use this to add in any additional request parameters.
         */
        switch ($method) {
            case 'put':
                $filters['new_share_name'] = ['filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    if (!SharesDao::isShareNameValid($string)) {
                        throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }];
                break;
            /* Intentional no default */
        }

        $filteredParams = filter_var_array($queryParams, $filters, false);

        /*
         * Use this to include any validation.
         */
        switch ($method) {
            case 'post': /* Description is required for create */
                // Default values
                // This one is tricky: 'false' is a valid value, but default should be 'true'
                //   No value passed will come in as NULL
                $filteredParams['remote_access'] = is_null($filteredParams['remote_access']) ? true : $filteredParams['remote_access'];
                $filteredParams['public_access'] = is_null($filteredParams['public_access']) ? false : $filteredParams['public_access'];

                $filteredParams['media_serving'] = is_null($filteredParams['media_serving']) ? 'any' :$filteredParams['media_serving'];
                $filteredParams['volume_id'] = $filteredParams['volume_id'] ? : (new \VolumesDB())->getVolume()[0]['volume_id'];

                $filteredParams['target_path'] = is_null($filteredParams['target_path']) || $filteredParams['target_path'] == "" ? null : $filteredParams['target_path'];
                $filteredParams['samba_available'] = is_null($filteredParams['samba_available']) ? true : $filteredParams['samba_available'];
                $filteredParams['share_access_locked'] = is_null($filteredParams['share_access_locked']) ? false : $filteredParams['share_access_locked'];
                $filteredParams['grant_share_access'] = is_null($filteredParams['grant_share_access']) ? false : $filteredParams['grant_share_access'];

				// Workflow validation checks
				// 1. Error out if public_access=yes & samba_available=false - samba available should be true when public =yes
				if($filteredParams['samba_available'] == false && $filteredParams['public_access'] == true){
					throw new \Core\Rest\Exception('INVALID_SAMBA_AVAILABLE_AND_PUBLIC_ACCESS_VALUES', 400, null, self::COMPONENT_NAME);
				}
				// 2. share_access_locked = true & grant_share_access = false - grant self share access else get locked out
				if($filteredParams['share_access_locked'] == true && $filteredParams['grant_share_access'] == false){
					throw new \Core\Rest\Exception('INVALID_SHARE_ACCESS_LOCKED_AND_GRANT_SHARE_ACCESS_VALUES', 400, null, self::COMPONENT_NAME);
				}
				// 3. If target_path given, then it could be a Collaborative Share so samba_available should be false.
				if(isset($filteredParams['target_path']) && $filteredParams['samba_available'] == true){
					throw new \Core\Rest\Exception('INVALID_SAMBA_AVAILABLE_AND_TARGET_PATH_VALUES', 400, null, self::COMPONENT_NAME);
				}
                // 4. If target_path given, then it could be a Collaborative Share so grant_share_access should be false.
                if(isset($filteredParams['target_path']) && $filteredParams['grant_share_access'] == false) {
                    throw new \Core\Rest\Exception('INVALID_GRANT_SHARE_ACCESS_AND_TARGET_PATH_VALUES', 400, null, self::COMPONENT_NAME);
                }

				// Additional target path checks & define targetAbsolutePath if valid and defined
				// We will turn it into a symLink after share creation happens
				if($filteredParams['target_path']){
					if(!isPathLegal($filteredParams['target_path'])){
						throw new \Core\Rest\Exception('TARGET_PATH_NOT_VALID', 400, NULL, static::COMPONENT_NAME);
					}

					$targetPath = $filteredParams['target_path'];

					// Get Share name from path /{share_name}/{folder_path}/ OR {share_name}/{folder_path}/
					$targetPathArray = explode(DS, trim($targetPath));
					// Remove all DS from array
					foreach(array_keys($targetPathArray, "") as $key){
						unset($targetPathArray[$key]);
					}
					// Rearrange the indexes
					$targetPathArray = array_values($targetPathArray);

					// Check if target path is not referring to a Share itself
					if(count($targetPathArray) < 2){
						throw new \Core\Rest\Exception('TARGET_PATH_NOT_VALID', 400, NULL, static::COMPONENT_NAME);
					}

					$sharesDao = new \Shares\Model\Share\SharesDao();
					// The first element should be a Share - and should exist?
					$targetShare = $sharesDao->get($targetPathArray[0]);
					if (empty($targetShare)) {
						throw new \Core\Rest\Exception('TARGET_SHARE_NOT_FOUND', 404, null, self::COMPONENT_NAME);
					}

					// Is Target Share Accessible?
					if(!$sharesDao->isShareAccessible($targetPathArray[0], TRUE)){
						throw new \Core\Rest\Exception('TARGET_SHARE_INACCESSIBLE', 401, null, self::COMPONENT_NAME);
					}

					// The target share should not itself be or have a target path.
					if($targetShare->getTargetPath()){
						throw new \Core\Rest\Exception('TARGET_PATH_NOT_VALID', 400, NULL, static::COMPONENT_NAME);
					}

					$targetAbsolutePath = $targetShare->getAbsolutePath();
					// The target Share ($targetAbsolutePath) itself cannot be a symLink and the full path itself cannot be a link or a file.
					array_shift($targetPathArray); // shift share name
					$targetFullPath = $targetAbsolutePath . DS. implode(DS, $targetPathArray);
					if(is_link($targetAbsolutePath) || is_link($targetFullPath) || is_file($targetFullPath) || isFileLfs($targetFullPath)){
						throw new \Core\Rest\Exception('TARGET_PATH_NOT_VALID', 400, NULL, static::COMPONENT_NAME);
					}
				}//if($filteredParams['target_path'])

				break;
            /* Intentional no default */
        }

        return $filteredParams;
    }

}

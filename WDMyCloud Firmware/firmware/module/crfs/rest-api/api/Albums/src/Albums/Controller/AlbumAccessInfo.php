<?php

namespace Albums\Controller;

/**
 * \file albums/albumaccessinfo.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/db/albumsdb.inc');
require_once(ALBUMS_ROOT . '/includes/db/albumaccessdb.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

use Auth\User\UserManager;
use Remote\DeviceUser\DeviceUser;
use Remote\DeviceUser\Db\DeviceUsersDB;

/**
 * \class AlbumAccessInfo
 * \brief Retrieve album access info.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \attention This component is supported starting in Orion version 1.3 (Bali).
 *
 * \see Album, AlbumAccess
 */
class AlbumAccessInfo /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'album_access_info';

    /**
     * \par Description:
     * Get users who have access to specified album.
     *
     * \par Security:
     * - Only the album owner or admin user can retrieve an album access info.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/album_access_info/{album_id}
     *
     * \param album_id Integer - required
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The album_id parameter specifies which album info to get.
     *
     * \retval album_access_info Array - album access info
     *
     * \par HTTP Response Codes:
     * - 200 - On success for retriving album access info
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 122 - ALBUM_ID_MISSING - Album id is missing
     * - 113 - ALBUM_ACCESS_NOT_FOUND -Album access not found
     * - 257 -ALBUM_ACCESS_FAILED - Failed album access
     *
     * \par XML Response Example:
     * \verbatim
      <album_access_info>
      <user>
      <username>pat</username>
      <username>admin</username>
      <email>apitest401@wdc.com</email>
      <device_user_id>41258</device_user_id>
      </user>
      <user>
      <username>joe</username>
      <email>apitest502@wdc.com</email>
      <device_user_id>44237</device_user_id>
      </user>
      </album_access_info>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumId = isset($urlPath[0]) ? trim($urlPath[0]) :
                isset($queryParams['album_id']) ? trim($queryParams['album_id']) : null;
        $username = isset($queryParams['username']) ? trim($queryParams['username']) : null;

        if (empty($albumId)) {
            $this->generateErrorOutput(403, 'album_access_info', 'ALBUM_ID_MISSING', $outputFormat);
        }

        $userSecurity = \Auth\User\UserSecurity::getInstance();
        if (empty($username) || !$userSecurity->isAdmin($userSecurity->getSessionUsername())) {
            $username = $userSecurity->getSessionUsername();
        }
        
        $userManager = \Auth\User\UserManager::getInstance();
        
        if($userManager instanceof \Auth\User\UserManager){
        	$user = $userManager->getUser($username ?: $userSecurity->getSessionUsername());
    	
	        try {
	
	            $AlbumsDB = new \AlbumsDB();
	            $AlbumAccessDb = new \AlbumAccessDb();
	            $DeviceUsersDb = new DeviceUsersDB();
	            $albums = $AlbumsDB->getOwnerAlbums($username, $albumId);
	            if (empty($albums)) {
	                $this->generateErrorOutput(404, 'album_access_info', 'ALBUM_ACCESS_NOT_FOUND', $outputFormat);
	                return;
	            }
	            $usernames = array();
	            foreach ($albums as $album) {
	                $albumId = $album['album_id'];
	                $accesses = $AlbumAccessDb->getAlbumAccess($albumId);
	                foreach ($accesses as $access) {
	                    $usernames[] = $access['username'];
	                }
	            }
	            $guestUsernames = array();
	            $users = array();
	            foreach ($usernames as $username) {
	                $accessUsername = $userManager->getUsername($username);
	                //Exclude duplicate entries
	                if (!empty($accessUsername)) {
	                    if (in_array($accessUsername, $guestUsernames))
	                        continue;
	                    $guestUsernames[] = $accessUsername;
	                    $users[] = $user;
	                }
	            }
	            $infos = array();
	            foreach ($users as $user) {
	                $deviceUsers = $DeviceUsersDb->getDeviceUsersForUser($user->getUsername());
	                if (!empty($deviceUsers)) {
	                	foreach($deviceUsers as $deviceUser) {
		                     $infos[] = array(
		                        'username' => $user->getUsername(),
		                        'email' => $deviceUser->getEmail(),
		                        'device_user_id' => $deviceUser->getDeviceUserId(),
		                    );
	                	}
	                } else {
	                    $infos[] = array(
	                        'username' => $user->getUsername(),
	                        'email' => '',
	                        'device_user_id' => '',
	                    );
	                }
	            }
	            $this->generateCollectionOutput(200, 'album_access_info', 'user', $infos, $outputFormat);
	        } catch (\Exception $e) {
	            $this->generateErrorOutput(500, 'album_access_info', 'ALBUM_ACCESS_FAILED', $outputFormat);
	        }
        }
    }

}

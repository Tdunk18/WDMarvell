<?php

namespace Albums\Controller;

/**
 * \file albums/albumaccess.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/album.inc');
require_once(ALBUMS_ROOT . '/includes/db/albumsdb.inc');
require_once(ALBUMS_ROOT . '/includes/db/albumaccessdb.inc');
require_once(FILESYSTEM_ROOT . '/includes/contents.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/**
 * \class AlbumAccess
 * \brief Create, retrieve, update, or delete album access.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \attention This component is supported starting in Orion v1.3 (Bali).
 *
 * \see Album, AlbumAccessInfo
 */
use Auth\User\UserManager;
use Remote\DeviceUser\DeviceUser;
use Remote\DeviceUser\Db\DeviceUsersDB;

class AlbumAccess {

    use \Core\RestComponent;

    static $albumsDB;
    static $albumAccessDB;
    static $deviceUsersDB;
    static $userManager;

    public function __construct() {
        if (!isset(self::$albumsDB)) {
            self::$albumsDB = new \AlbumsDB();
        }
        if (!isset(self::$albumAccessDB)) {
            self::$albumAccessDB = new \AlbumAccessDB();
        }
        if (!isset(self::$deviceUsersDB)) {
            self::$deviceUsersDB = new DeviceUsersDB();
        }
        if (!isset(self::$userManager)) {
            self::$userManager = UserManager::getInstance();
        }
    }

    /**
     * \par Description:
     * Delete an existing album access.
     *
     * \par Security:
     * - Only the album owner or admin user can delete album access.
     *
     * \par HTTP Method: DELETE
     * http://localhost/api/1.0/rest/album_access?album_id={albumId}
     *
     * \param album_id Integer - required
     * \param user_id  Integer - optional
     * \param format   String  - optional
     *
     * \par Parameter Details:
     * - The album_id parameter specifies which album access to delete.
     *
     * \par HTTP Response Codes:
     * - 200 - On success for deleting album access
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 122 - ALBUM_ID_MISSING - Album id is missing
     * - 67 - ALBUM_NOT_FOUND -Album not found
     * - 113 - ALBUM_ACCESS_NOT_FOUND -Album access not found
     * - 257 -ALBUM_ACCESS_FAILED - Failed album access
     *
     * \par XML Response Example:
     * \verbatim
      <album_access>
      <status>success</status>
      </album_access>
      \endverbatim
     */
    function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumId = isset($queryParams['album_id']) ? trim($queryParams['album_id']) : null;
        $username = isset($queryParams['username']) ? trim($queryParams['username']) : null;

        if (empty($albumId)) {
            $this->generateErrorOutput(400, 'album_access', 'ALBUM_ID_MISSING', $outputFormat);
            return;
        }
        $album = self::$albumsDB->getAlbum($albumId);
        if (empty($album)) {
            $this->generateErrorOutput(404, 'album_access', 'ALBUM_NOT_FOUND', $outputFormat);
            return;
        }
        $albumAccess = self::$albumAccessDB->getAlbumAccess($albumId, $username);
        if (empty($albumAccess)) {
            $this->generateErrorOutput(404, 'album_access', 'ALBUM_ACCESS_NOT_FOUND', $outputFormat);
            return;
        }
        try {
            $this->generateSuccessOutput(200, 'album_access', array('status' => 'success'), $outputFormat);
        } catch (\Exception $e) {
            $this->generateErrorOutput(500, 'album_access', 'ALBUM_ACCESS_FAILED', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Get album access of specified albumId.
     *
     * \par Security:
     * - Only the album owner or admin user can retrieve album access.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/album_access?album_id={albumId}
     *
     * \param album_id   Integer - required
     * \param user_id    Integer - optional
     * \param format     String  - optional
     *
     * \par Parameter Details:
     * - The user_id is used by the admin to get the album access of a specific user.
     *
     * \retval album_access Array - album access info
     *
     * \par HTTP Response Codes:
     * - 200 - On success for retrieving album access
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 122 - ALBUM_ID_MISSING - Album id is missing
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 67 - ALBUM_NOT_FOUND -Album not found
     * - 113 - ALBUM_ACCESS_NOT_FOUND -Album access not found
     * - 257 -ALBUM_ACCESS_FAILED - Failed album access
     *
     *
     * \par XML Response Example:
     * \verbatim
      <album_access_list>
      <album_access>
      <album_id>7</album_id>
      <user_id>3</userid>
      <username>john</username>
      <access>RW</access>
      <ctime>1310496860</ctime>
      </album_access>
      <album_access>
      <album_id>7</album_id>
      <user_id>4</userid>
      <username>guest</username>
      <access>1310502664</access>
      </album_access>
      </album_access_list>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $userSecurity = \Auth\User\UserSecurity::getInstance();

        $albumId = isset($queryParams['album_id']) ? trim($queryParams['album_id']) : null;
        $userId = isset($queryParams['username']) ? trim($queryParams['username']) : null;
        $sessionUsername = $userSecurity->getSessionUsername();

        // Check for required parameters
        if (empty($albumId)) {
            $this->generateErrorOutput(400, 'album_access', 'ALBUM_ID_MISSING', $outputFormat);
            return;
        }
        //Check if user is authorized
        if (!$userSecurity->isAdmin($sessionUsername) && !isAlbumOwner($albumId, $sessionUsername) && !isAlbumAccessible($albumId)) {
            $this->generateErrorOutput(401, 'album', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }
        //Check if non-admins are authorized
        if (!$userSecurity->isAdmin($sessionUsername)) {
            if ((!empty($userId) && $userId != $sessionUsername)) {
                $this->generateErrorOutput(401, 'album', 'USER_NOT_AUTHORIZED', $outputFormat);
                return;
            }
            $userId = $sessionUsername;
        }
        try {
            //Check if album exists
            $album = self::$albumsDB->getAlbum($albumId);
            \Core\Logger::getInstance()->info($album);
            if (empty($album)) {
                $this->generateErrorOutput(404, 'album_access', 'ALBUM_NOT_FOUND', $outputFormat);
                return;
            }

            $albumAccess = self::$albumAccessDB->getAlbumAccess($albumId, $userId);
            \Core\Logger::getInstance()->info($albumAccess);

            if (empty($albumAccess)) {
                //Check if user is owner because by default owner has RW access
                if (!isAdmin($sessionUsername) && !isAlbumOwner($albumId, $sessionUsername)) {
                    $albumAccess[] = array('album_id' => $albumId, 'user_id' => $userId, 'access' => 'RW', 'created_date' => $album[0]['created_date']);
                    $this->generateCollectionOutput(200, 'album_access_list', 'album_access', $albumAccess, $outputFormat);
                    return;
                } else {
                    $this->generateErrorOutput(404, 'album_access', 'ALBUM_ACCESS_NOT_FOUND', $outputFormat);
                    return;
                }
            }
            $this->generateCollectionOutput(200, 'album_access_list', 'album_access', $albumAccess, $outputFormat);
        } catch (\Exception $e) {
            $this->generateErrorOutput(500, 'album_access', 'ALBUM_ACCESS_FAILED', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Create a new album access of specified albumId for userId.
     *
     * \par Security:
     * - Only the album owner or admin user can create album access.
     *
     * \par HTTP Method: POST
     * http://localhost/api/1.0/rest/album_access
     *
     * \param album_id   Integer - required
     * \param user_id    String  - optional
     * \param access     String  - required
     * \param overwrite  Boolean - optional
     * \param send_email Boolean - optional
     * \param media_type String  - optional
     * \param message    String  - optional
     * \param format     String  - optional
     *
     * \par Parameter Details:
     * - The user_id is used by the admin to modify another user's album access.
     * - Valid values for access are "RO" for read-only or "RW" for read-write.
     * - Set overwrite=true, to add album access and overwrite if it already exists.
     * - Set send_email=true, to send an access email to user with subject and message.
     *
     * \retval status  String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success for creating album access
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 41 - PARAMETER_MISSING - Parameter is missing
     * - 122 - ALBUM_ID_MISSING - Album id is missing
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 67 - ALBUM_NOT_FOUND -Album not found
     * - 113 - ALBUM_ACCESS_NOT_FOUND -Album access not found
     * - 257 -ALBUM_ACCESS_FAILED - Failed album access
     *
     *
     * \par XML Response Example:
     * \verbatim
      <album_access>
      <status>success</status>
      </album_access>
      \endverbatim
     */
    public function post($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $albumId = isset($queryParams['album_id']) ? trim($queryParams['album_id']) : null;
        $username = isset($queryParams['username']) ? trim($queryParams['username']) : null;
        $access = isset($queryParams['access']) ? strtoupper(trim($queryParams['access'])) : null;
        $overwrite = isset($queryParams['overwrite']) ? trim($queryParams['overwrite']) : null;
        $sendEmail = isset($queryParams['send_email']) ? trim($queryParams['send_email']) : null;

        if (empty($albumId) || empty($username) || empty($access)) {
            $this->generateErrorOutput(400, 'album_access', 'PARAMETER_MISSING', $outputFormat);
            return;
        }
        // CHECK IF ALBUM NOT FOUND
        $album = self::$albumsDB->getAlbum($albumId);

        if (empty($album)) {
            $this->generateErrorOutput(404, 'album_access', 'ALBUM_NOT_FOUND', $outputFormat);
            return;
        }
        // CHECK IF USER NOT FOUND
        if (!self::$userManager->getUser($username)) {
            $this->generateErrorOutput(404, 'album_access', 'USER_NOT_FOUND', $outputFormat);
            return;
        }
        // CHECK IF ALBUM ACCESS ALREADY EXISTS AND OVERWRITE IS OFF
        $albumAccess = self::$albumAccessDB->getAlbumAccess($albumId, $username);
        if (!empty($albumAccess) && $overwrite !== 'true') {
            $this->generateErrorOutput(403, 'album_access', 'ALBUM_ACCESS_EXISTS', $outputFormat);
            return;
        }
        // CHECK IF EMAIL IS TO BE SENT
        if ($sendEmail == 'true') {
            // GET EMAIL OF DEVICE USER
            $deviceUsers = self::$deviceUsersDB->getDeviceUsersForUser($username);
            if (empty($deviceUsers)) {
            	//no device users to send e-mail to
            	$this->generateErrorOutput(404, 'album_access', 'DEVICE_USER_NOT_FOUND', $outputFormat);
            	return;
            }
        }
        $this->generateSuccessOutput(200, 'album_access', array('status' => 'success'), $outputFormat);
    }

    /**
     * \par Description:
     * Update an existing album access.
     *
     * \par Security:
     * - Only the album owner or admin user can update album access.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/1.0/rest/album_access
     *
     * \param album_id   Integer - required
     * \param user_id    String  - optional
     * \param access     String  - required
     * \param format     String  - optional
     *
     * \par Parameter Details:
     * - The album_id parameter is the id of a specified album.
     * - The user_id is used by the admin to modify another user's album access.
     * - Valid values for access are "RO" for read-only or "RW" for read-write.
     * - The send_email parameter is used to send user an email.
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <album>
      <status>success</status>
      </album>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumId = isset($queryParams['album_id']) ? trim($queryParams['album_id']) : null;
        $username = isset($queryParams['username']) ? trim($queryParams['username']) : null;
        $access = isset($queryParams['access']) ? trim($queryParams['access']) : null;

        if (empty($albumId) || empty($username) || empty($access)) {
            $this->generateErrorOutput(400, 'album_access', 'PARAMETER_MISSING', $outputFormat);
            return;
        }
        // CHECK IF ALBUM NOT FOUND
        $album = self::$albumsDB->getAlbum($albumId);
        if (empty($album)) {
            $this->generateErrorOutput(404, 'album_access', 'ALBUM_NOT_FOUND', $outputFormat);
            return;
        }
        // CHECK IF USER NOT FOUND
        $userManager = \Auth\User\UserManager::getInstance();
        if (!$userManager->getUser($username)) {
            $this->generateErrorOutput(404, 'album_access', 'USER_NOT_FOUND', $outputFormat);
            return;
        }
        // CHECK IF ALBUM ACCESS NOT FOUND
        $albumAccess = self::$albumAccessDB->getAlbumAccess($albumId, $username);
        if (empty($albumAccess)) {
            $this->generateErrorOutput(404, 'album_access', 'ALBUM_ACCESS_NOT_FOUND', $outputFormat);
            return;
        }
        // UPDATE ALBUM ACCESS
        $this->generateSuccessOutput(200, 'album_access', array('status' => 'success'), $outputFormat);
    }

}

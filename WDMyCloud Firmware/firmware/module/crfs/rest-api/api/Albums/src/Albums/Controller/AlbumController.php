<?php

namespace Albums\Controller;

/**
 * \file albums/album.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/album.inc');
require_once(ALBUMS_ROOT . '/includes/db/albumaccessdb.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

use Auth\User\UserSecurity;
use Albums\Model\Db;
use Albums\Model;

/**
 * \class AlbumController
 * \brief Create, retrieve, update, or delete a user album.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \attention This component is supported starting in Orion version 1.3 (Bali).
 *
 * \see AlbumAccess, AlbumInfo, AlbumItem
 */
class AlbumController /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'albums';

    protected $mediaOptions = array('other', 'photos', 'videos', 'music');

    /**
     * \par Description:
     * Delete an existing album.
     *
     * \par Security:
     * - Only the album owner or admin user can delete an album.
     *
     * \par HTTP Method: DELETE
     * http://localhost/api/1.0/rest/albums/{abum_id}
     *
     * \param album_id Integer - required
     * \param format   String  - optional (default is xml)

     *
     * \par Parameter Details:
     * - album_id must be Only the album owner or admin user can delete an album.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success for deleting an album
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 67 - ALBUM_NOT_FOUND -Album not found
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 3 - ALBUM_DELETE_FAILED- Failed to delete album
     *
     * \par XML Response Example:
     * \verbatim
      <album>
      <status>success</status>
      </album>
      \endverbatim
     */
    function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumId = isset($urlPath[0]) ? trim($urlPath[0]) : null;
        $userSecurity = UserSecurity::getInstance();

        $album = Db\AlbumMapper::loadById($albumId);
        if (!$album instanceof \Albums\Model\Album) {
            throw new \Core\Rest\Exception('ALBUM_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }

        /* If they aren't admin, and not the album owner, they aren't authorized to delete it. */
        if (!$userSecurity->isAdmin($userSecurity->getSessionUsername())
                && strcasecmp($album->getOwner(), $userSecurity->getSessionUsername()) !== 0) {
            throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
        }

        try {
            \Db\Access::beginTransaction();
            // If we ever get FKs, delete access records first.
            Db\Album\AccessMapper::delete($album->getId());
            Db\AlbumMapper::delete($album);
            \Db\Access::commit();
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('ALBUM_DELETE_FAILED', 500, $e, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, 'album', array('status' => 'success',
            'album_id' => $albumId), $outputFormat);
    }

    /**
     * \par Description:
     * Get a specified album or all albums of which user has access.
     *
     * \par Security:
     * - Only the album owner or admin user can retrieve an album.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/albums/{abum_id}
     *
     * \param album_id   Integer - optional
     * \param username   String  - optional
     * \param media_type String  - optional
     * \param format     String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - If album_id is specified, then only that album accessible by user will be returned.
     * - If no album_id is specified, then all albums accessible by user will be returned.
     * - The username is used by the admin to select albums accessible by a specific user.
     * - If media_type is specified, then only albums of that media type will be returned.
     * - Valid media types are videos, music, photos, or other.
     * - The default is all albums of which user has access.
     *
     * \retval album Array - album info
     *
     * \par HTTP Response Codes:
     * - 200 - On success for retriving all albums of which user has access.
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 90 - USER_NOT_FOUND - User not found
     * - 57 - USER_NOT_AUTHORIZED - User not authorized 
     * - 67 - ALBUM_NOT_FOUND - Album not found
     * - 1 - ALBUM_GET_FAILED - Failed to get album
     *
     * \par XML Response Example:
     * \verbatim
      <albums>
      <album>
      <album_id>1</album_id>
      <owner>Guest</owner>
      <name>A Rush of Blood to the Head</name>
      <description>Coldplay: A Rush of Blood</description>
      <slide_show_duration>1</slide_show_duration>
      <slide_show_transition>normal</slide_show_transition>
      <media_type>music</media_type>
      <ctime>1309492800</ctime>
      <expiration_days>27</expiration_days>
      <expiration_time>1309492800</expiration_time>
      </album>
      <album>
      <album_id>2</album_id>
      <owner>Guest</owner>
      <name>Art Photos</name>
      <description>A selection of  photos from Flickr</description>
      <slide_show_duration>1</slide_show_duration>
      <slide_show_transition>random</slide_show_transition>
      <media_type>photos</media_type>
      <ctime>1309492800</ctime>
      <expiration_days>22</expiration_days>
      <expiration_time>1325307600</expiration_time>
      </album>
      </albums>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $params = filter_var_array($queryParams, array(
            'username' => \FILTER_SANITIZE_STRING,
            'media_type' => array('filter' => \FILTER_CALLBACK,
                'options' => array($this, '_validateMediaType')),
            'show_all' => \FILTER_VALIDATE_BOOLEAN,
                ));
        $params['album_id'] = isset($urlPath[0]) ? trim($urlPath[0]) : null;

        /**
         * If username is supplied:
         *  - User must exist
         *  - If username isn't current logged in user then current logged in user must be admin.
         */
        $userSecurity = UserSecurity::getInstance();
        if ($params['username']) {
            if (!$userSecurity->isValid($params['username'])) {
                throw new \Core\Rest\Exception('USER_NOT_FOUND', 404, null, self::COMPONENT_NAME);
            }

            if ($params['username'] != $userSecurity->getSessionUsername()
                    && !$userSecurity->isAdmin($userSecurity->getSessionUsername())) {
                throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
            }
            /* conformity */
            $params['owner'] = $params['username'];
            unset($params['username']);
        } else {
            /** if they are not admin, or show_all is false, limit queries to the current logged in user. */
            if (($params['show_all'] && !$userSecurity->isAdmin($userSecurity->getSessionUsername()))
                    || (!$userSecurity->isAdmin($userSecurity->getSessionUsername()) && $params['show_all'] === false)) {
                $params['owner'] = $userSecurity->getSessionUsername();
            }
        }

        try {
            $albums = $params['album_id'] ? \Albums\Model\AlbumMapper::loadById($params['album_id'], $params) :
                    Db\AlbumMapper::getAlbums($params);

            if (empty($albums)) {
                throw new \Core\Rest\Exception('ALBUM_NOT_FOUND', 404, null, self::COMPONENT_NAME);
            }

            $albums = $albums instanceof \Albums\Model\Album ? array($albums) : $albums; //  TODO: backwards compatibility - Single item to Array conversion.
            // Removed "USER_NOT_AUTHORIZED" error for now.
            // Do we really want to tell them the albums does exist, but they aren't authorized to access it?
            // Using 404 is better security, but necessary?

            $return = array(); // TODO: Backward compatibility - Albums to array conversion for generateCollectionOutput()
            foreach ($albums as $album) {
                $tmp = $album->toArray();
                $tmp['ctime'] = $tmp['created_date']; // Backwards compatibility
                $return[] = $tmp;
            }
        } catch (\Exception $e) { // We don't want to intercept Rest Exceptions.
            throw $e;
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('ALBUM_GET_FAILED', 500, $e, self::COMPONENT_NAME);
        }

        $this->generateCollectionOutput(200, 'albums', 'album', $return, $outputFormat);
    }

    /**
     * \par Description:
     * Create a new album.
     *
     * \par Security:
     * - Any authenticated user can create an album.
     *
     * \par HTTP Method: POST
     * http://localhost/api/1.0/rest/albums
     *
     * \param name                  String  - required
     * \param owner                 String  - optional
     * \param description           String  - optional
     * \param slide_show_duration   Integer - optional
     * \param slide_show_transition String  - optional
     * \param media_type            String  - optional
     * \param expiration_time       Integer - optional
     * \param expiration_days       Integer - optional
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The owner_id is used by the admin to create another user's album
     * - The expiration_days parameter over-rides expiration time.
     * - When expiration_days=0, the values of both expiration_days and expiration_time will be cleared.
     *
     * \retval status   String  - success
     * \retval album_id Integer - new album id
     *
     * \par HTTP Response Codes:
     * - 200 - On success for creating a new album
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 124 - ALBUM_ALREADY_EXISTS - Album already exists
     * - 2 - ALBUM_CREATE_FAILED - Failed to create album
     *
     * \par XML Response Example:
     * \verbatim
      <album>
      <status>success</status>
      <album_id>101</album_id>
      </album>
      \endverbatim
     */
    function post($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $params = $this->_filterParams($queryParams, 'post');

        if (Db\AlbumMapper::loadByName($params['name'], $params['owner'], $params['media_type'])) {
            throw new \Core\Rest\Exception('ALBUM_ALREADY_EXISTS', 403, null, self::COMPONENT_NAME);
        }

        try {
            $album = (new Model\Album())->fromArray($params);
            /* @var $album Model\Album */

            \Db\Access::beginTransaction();
            Db\AlbumMapper::add($album);
            Db\Album\AccessMapper::add((new Model\Album\Access())->fromArray(array(
                        'album_id' => $album->getId(),
                        'username' => $album->getOwner() ? : UserSecurity::getInstance()->getSessionUsername(),
                        'access_level' => Db\Album\AccessMapper::READ_WRITE,
                        'created_date' => new \DateTime(),
                    )));
            \Db\Access::commit();
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('ALBUM_CREATE_FAILED', 500, $e, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(201, 'album', array('status' => 'success',
            'album_id' => $album->getId()), $outputFormat);
    }

    /**
     * \par Description:
     * Update an existing album.
     *
     * \par Security:
     * - Only the album owner or admin user can update an album.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/1.0/rest/albums/{abum_id}
     *
     * \param album_id              Integer - required
     * \param owner_id              Integer - optional
     * \param name                  String  - optional
     * \param description           String  - optional
     * \param slide_show_duration   Integer - optional
     * \param slide_show_transition String  - optional
     * \param media_type            String  - optional
     * \param expiration_time       Integer - optional
     * \param expiration_days       Integer - optional
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - Only the album owner or admin user can update an album.
     * - The owner_id is used by the admin to modify another user's album
     * - The expiration_days parameter over-rides expiration time.
     * - When expiration_days=0, the values of both expiration_days and expiration_time will be cleared.
     *
     * \retval status   String  - success
     * \retval album_id Integer - updated album id
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
     * - 41 - PARAMETER_MISSING - Parameter is missing
     * - 67 - ALBUM_NOT_FOUND - Album not found
     * - 57 - USER_NOT_AUTHORIZED - User not authorized 
     * - 2 - ALBUM_UPDATE_FAILED - Failed to create albu
     * - 259 - ALBUM_NAME_MISSING - Album name is missing
     * - 33- INVALID_PARAMETER - Invalid parameter
     *
     * \par XML Response Example:
     * \verbatim
      <album>
      <status>success</status>
      <album_id>101</album_id>
      </album>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $params = $this->_filterParams($queryParams, 'put');
        $params['album_id'] = isset($urlPath[0]) ? trim($urlPath[0]) : null;

        if (empty($params['album_id'])) {
            throw new \Core\Rest\Exception('PARAMETER_MISSING', 400, null, self::COMPONENT_NAME);
        }

        //Check if album exists
        $album = (new Model\AlbumMapper())->loadById($params['album_id']);
        
        if (!$album instanceof \Albums\Model\Album) {
        	throw new \Core\Rest\Exception('ALBUM_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }
        
        //Check if user is authorized
        $userSecurity = UserSecurity::getInstance();
        if (!$userSecurity->isAdmin($userSecurity->getSessionUsername()) && (strcasecmp($userSecurity->getSessionUsername(), $album->getOwner()) != 0)) {
            throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
        }

        try {
            // The ->get*() methods are a simple way to default to original data if new a value wasn't sent
            // TODO: this actually won't allow the ability to set anything to empty / NULL .... Might need to fix that.
            $album->setName($params['name'] ? : $album->getName())
                    ->setDescription($params['description'] ? : $album->getDescription())
                    ->setBackgroundColor($params['background_color'] ? : $album->getBackgroundColor())
                    ->setBackgroundImage($params['background_image'] ? : $album->getBackgroundImage())
                    ->setPreviewImage($params['preview_image'] ? : $album->getPreviewImage())
                    ->setSlideShowDuration($params['slide_show_duration'] ? : $album->getSlideShowDuration())
                    ->setSlideShowTransition($params['slide_show_transition'] ? : $album->getSlideShowTransition())
                    ->setMediaType($params['media_type'] ? : $album->getMediaType())
                    ->setExpiredDate($params['expired_date'] ? : $album->getExpiredDate());
            Db\AlbumMapper::update($album);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('ALBUM_UPDATE_FAILED', 500, $e, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, 'album', array('status' => 'success',
            'album_id' => $album->getId()), $outputFormat);
    }

    protected function _filterParams($queryParams, $method) {

        $filters = array(
            'name' => \FILTER_SANITIZE_STRING,
            'owner' => \FILTER_SANITIZE_STRING,
            'description' => \FILTER_SANITIZE_STRING,
            'background_color' => \FILTER_SANITIZE_STRING,
            'background_image' => \FILTER_SANITIZE_URL,
            'share_expired_date' => \FILTER_SANITIZE_STRING,
            'preview_image' => \FILTER_SANITIZE_STRING,
            'slide_show_duration' => \FILTER_SANITIZE_NUMBER_INT,
            'slide_show_transition' => \FILTER_SANITIZE_STRING,
            'media_type' => array('filter' => \FILTER_CALLBACK,
                'options' => array($this, '_validateMediaType')),
            'expiration_time' => array('filter' => \FILTER_CALLBACK,
                'options' => function( $val ) {
                    $firstChar = substr($val, 0, 1);
                    if (in_array($firstChar, ['-', '+'])) {
                        $unitTime = is_numeric($val) ? date('r', time() + $val) : $val;
                    } else {
                        $unitTime = is_numeric($val) ? date('r', $val) : $val;
                    }

                    return $unitTime ? new \DateTime($unitTime) : null;
                }),
            'expiration_days' => array('filter' => \FILTER_CALLBACK,
                'options' => function( $val ) {
                    return ($val > 0) ? new \DateTime(date('r', time() + ($val * 86400 /* One day */))) : null;
                }),
        );

        /**
         * Use this block to add/modify any method specific parameters.
         */
        switch ($method) {
            default:
            // Intentionally blank
        }

        $filteredParams = filter_var_array($queryParams, $filters);

        // Data conversions -- for any requests.
        $filteredParams['expired_date'] = $filteredParams['expiration_time'] ? : $filteredParams['expiration_days'];

        /**
         * Use this block for any post-filtering validation.
         */
        switch ($method) {
            case 'post':
                if (empty($filteredParams['name'])) {
                    throw new \Core\Rest\Exception('ALBUM_NAME_MISSING', 400, null, self::COMPONENT_NAME);
                }

                /* Default values */
                $filteredParams['description'] = $filteredParams['description'] ? : 'This is a ' . $filteredParams['name'];
                $filteredParams['slide_show_duration'] = $filteredParams['slide_show_duration'] ? : '1';
                $filteredParams['slide_show_transition'] = $filteredParams['slide_show_transition'] ? : 'normal';
                $filteredParams['media_type'] = $filteredParams['media_type'] ? : 'other';
                $filteredParams['owner'] = $filteredParams['owner'] ? : UserSecurity::getInstance()->getSessionUsername();
                $filteredParams['created_date'] = new \DateTime();
                break;
            case 'put':
                break;
            default:
            // Intentionally blank
        }

        return $filteredParams;
    }

    protected function _validateMediaType($string) {
        $string = strtolower($string);
        if (!in_array($string, $this->mediaOptions)) {
            throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
        }
        return $string;
    }

}

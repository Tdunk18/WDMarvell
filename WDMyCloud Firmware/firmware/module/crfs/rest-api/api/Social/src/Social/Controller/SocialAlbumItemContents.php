<?php

namespace Social\Controller;

/**
 * \file social/SocialAlbumItemContents.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(ALBUMS_ROOT . '/includes/db/albumitemsdb.inc');
require_once(SOCIAL_ROOT . '/includes/socialnetworks.inc');
require_once(SOCIAL_ROOT . '/includes/socialnetworksdb.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/**
 * \class SocialAlbumItemContents
 * \brief Upload a picture to the specified social network.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see SocialAlbum, SocialFileContents, SocialNetwork
 */
class SocialAlbumItemContents /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Upload a album item to the specified social network.
     *
     * \par Security:
     * - Verifies authorized user and valid social network.
     *
     * \par HTTP Method: POST
     * http://localhost/api/1.0/rest/social_album_item_contents/{album_item_id}?network=facebook
     *
     * \param album_item_id   Integer - required
     * \param social_network  String  - required [facebook, twitter, youtube]
     * \param message         String  - optional
     * \param format          String  - optional
     *
     * \par Parameter Details:
     *
     * - The path parameter specifies which picture to upload.
     * - The social_network parameter specifies where to upload picture.
     *
     * \retval status String - success status
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
      <social_album_item_contents>
      <status>success</status>
      <social_album_item_contents>
      \endverbatim
     */
    public function post($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $albumItemId = isset($urlPath[0]) ? trim($urlPath[0]) : null;
        $network = isset($queryParams['social_network']) ? trim($queryParams['social_network']) : null;
        $message = isset($queryParams['message']) ? trim($queryParams['message']) : null;

        if (!isset($albumItemId)) {
            $this->generateErrorOutput(400, 'social_album_item_contents', 'ALBUM_ITEM_ID_MISSING', $outputFormat);
            return;
        }

        $AlbumItemsDB = new AlbumItemsDB();

        if (!$AlbumItemsDB->isAlbumItemValid($albumItemId)) {
            $this->generateErrorOutput(404, 'social_album_item_contents', 'ALBUM_ITEM_NOT_FOUND', $outputFormat);
            return;
        }

        /*
          if (!$AlbumItemsDB->isAlbumItemAccessible($albumItemId) && !isAdmin($userId)) {
          $this->generateErrorOutput(401,'social_album_item_contents','USER_NOT_AUTHORIZED', $outputFormat);
          return;
          }
         */

        $results = $AlbumItemsDB->getAlbumItem($albumItemId);

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'results', print_r($results,true));

        $results = $results[0];
        $path = isset($results['path']) ? $results['path'] : '';
        $file = getSharePath() . DS . $path;

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'file', $file);

        if (!file_exists($file) || is_dir($file)) {
            $this->generateErrorOutput(403, 'social_album_item_contents', 'FILE_NOT_FOUND', $outputFormat);
            return;
        }

        if (empty($network)) {
            $this->generateErrorOutput(400, 'social_album_item_contents', 'SOCIAL_NETWORK_MISSING', $outputFormat);
            return;
        }

        try {
            $SocialNetworksDB = new SocialNetworksDB();
            $userId = getSessionUserId();
            $results = $SocialNetworksDB->select($network, $userId);
            if (!$results) {
                $this->generateErrorOutput(404, 'social_album_item_contents', 'SOCIAL_NETWORK_NOT_FOUND', $outputFormat);
                return;
            }

            $accessToken = isset($results['access_token']) ? $results['access_token'] : null;
            $expires = isset($results['expires']) ? $results['expires'] : null;

            if ($expires < time()) {
                $this->generateErrorOutput(403, 'social_album_item_contents', 'SOCIAL_NETWORK_EXPIRED', $outputFormat);
                return;
            }

            $SocialNetworks = new SocialNetworks();
            $status = $SocialNetworks->upload($network, $accessToken, $file, $message);
            if (!$status) {
                $this->generateErrorOutput(500, 'social_album_item_contents', 'SOCIAL_ALBUM_ITEM_FAILED', $outputFormat);
                return;
            }
            $results = array('status' => 'success');
            $this->generateItemOutput(201, 'social_album_item_contents', $results, $outputFormat);
        } catch (\Exception $e) {
            $this->generateErrorOutput(500, 'social_album_item_contents', 'SOCIAL_ALBUM_ITEM_FAILED', $outputFormat);
            return;
        }
    }

}
<?php

namespace Social\Controller;

/**
 * \file social/socialfilecontents.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(SOCIAL_ROOT . '/includes/socialnetworks.inc');
require_once(SOCIAL_ROOT . '/includes/socialnetworksdb.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/**
 * \class SocialFileContents
 * \brief Upload a picture to the specified social network.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see SocialAlbum, SocialAlbumItem, SocialNetwork
 */
class SocialFileContents /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Upload a picture to the specified social network.
     *
     * \par Security:
     * - Verifies authorized user and valid social network.
     *
     * \par HTTP Method: POST
     * http://localhost/api/1.0/rest/social_file_contents/{path}?network=facebook
     *
     * \param path            String  - required [path to image file]
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
      <social_file_contents>
      <status>success</status>
      <social_file_contents>
      \endverbatim
     */
    public function post($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $shareName = array_shift($urlPath);
        $sharePath = getSharePath($shareName);
        $newPath = implode(DS, $urlPath);
        $newFile = array_pop($urlPath);
        $newDir = implode(DS, $urlPath);
        $path = implode(DS, [$sharePath, $shareName, $newPath]);
        $network = isset($queryParams['social_network']) ? $queryParams['social_network'] : null;
        $message = isset($queryParams['message']) ? $queryParams['message'] : null;

        if (empty($shareName)) {
            $this->generateErrorOutput(400, 'social_file_contents', 'SHARE_NAME_MISSING', $outputFormat);
            return;
        }

        if (!file_exists($path) || is_dir($path)) {
            $this->generateErrorOutput(403, 'social_file_contents', 'FILE_NOT_FOUND', $outputFormat);
            return;
        }

        if (empty($newDir) && strpos($newFile, '.') === false) {
            $this->generateErrorOutput(404, 'social_file_contents', 'DIR_NOT_EXIST', $outputFormat);
            return;
        }

        if (empty($network)) {
            $this->generateErrorOutput(400, 'social_file_contents', 'SOCIAL_NETWORK_MISSING', $outputFormat);
            return;
        }

        try {
            $SocialNetworksDB = new SocialNetworksDB();
            $userId = getSessionUserId();
            $results = $SocialNetworksDB->select($network, $userId);
            if (!$results) {
                $this->generateErrorOutput(404, 'social_file_contents', 'SOCIAL_NETWORK_NOT_FOUND', $outputFormat);
                return;
            }

            $accessToken = isset($results[0]['access_token']) ? $results[0]['access_token'] : null;
            $expires = isset($results[0]['expires']) ? $results[0]['expires'] : null;

            if ($expires < time()) {
                $this->generateErrorOutput(403, 'social_file_contents', 'SOCIAL_NETWORK_EXPIRED', $outputFormat);
                return;
            }

            $SocialNetworks = new SocialNetworks();
            $status = $SocialNetworks->upload($network, $accessToken, $path, $message);
            if (!$status) {
                $this->generateErrorOutput(500, 'social_file_contents', 'SOCIAL_FILE_CONTENTS_FAILED', $outputFormat);
                return;
            }
            $results = array('status' => 'success');
            $this->generateItemOutput(201, 'social_file_contents', $results, $outputFormat);
        } catch (\Exception $e) {
            $this->generateErrorOutput(500, 'social_file_contents', 'SOCIAL_FILE_CONTENTS_FAILED', $outputFormat);
            return;
        }
    }

}
<?php

namespace Social\Controller;

/**
 * \file social/socialnetwork.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(SOCIAL_ROOT . '/includes/socialnetworks.inc');
require_once(SOCIAL_ROOT . '/includes/socialnetworksdb.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/**
 * \class SocialNetwork
 * \brief Manage user settings for the various social networks.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see SocialAlbum, SocialAlbumItem, SocialFileContents
 */
class SocialNetwork /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Delete the user settings of the specified social network.
     *
     * \par Security:
     * - Verifies authorized user and valid social network.
     *
     * \par HTTP Method: DELETE
     * http://localhost/api/1.0/rest/social_network/{network}
     *
     * \param network         String  - required [facebook, twitter, youtube]
     * \param format          String  - optional
     *
     * \par Parameter Details:
     *
     * - The network parameter specifies which user settings to delete.
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
      <social_network>
      <status>success</status>
      </social_network>

      \endverbatim
     */
    public function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $network = isset($urlPath[0]) ? trim($urlPath[0]) : null;
        $userId = isset($queryParams['user_id']) ? trim($queryParams['user_id']) : null;
        $sessionUserId = getSessionUserId();

        if (empty($network)) {
            $this->generateErrorOutput(400, 'social_network', 'SOCIAL_NETWORK_MISSING', $outputFormat);
            return;
        }

        if (!empty($userId) && $userId != $sessionUserId && !isAdmin($sessionUserId)) {
            $this->generateErrorOutput(401, 'social_network', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }

        if (empty($userId)) {
            $userId = $sessionUserId;
        }

        try {
            $SocialNetworksDB = new SocialNetworksDB();
            $status = $SocialNetworksDB->delete($network, $userId);
            if (!$status) {
                $this->generateErrorOutput(500, 'social_network', 'SOCIAL_NETWORK_FAILED', $outputFormat);
                return;
            }
            $results = array('status' => 'success');
            $this->generateItemOutput(200, 'social_network', $results, $outputFormat);
        } catch (\Exception $e) {
            $this->generateErrorOutput(500, 'social_network', 'SOCIAL_NETWORK_FAILED', $outputFormat);
            return;
        }
    }

    /**
     * \par Description:
     * Get the user settings of the specified social network.
     *
     * \par Security:
     * - Verifies authorized user and valid social network.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/social_network/{network}
     *
     * \param network         String  - required [facebook, twitter, youtube]
     * \param format          String  - optional
     *
     * \par Parameter Details:
     *
     * - The network parameter specifies which user settings to get.
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
      <social_network>
      <user_id>1234</user_id>
      <network>facebook</network>
      <expires>1319266800</expires>
      </social_network>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $network = isset($urlPath[0]) ? trim($urlPath[0]) : null;
        $userId = isset($queryParams['user_id']) ? trim($queryParams['user_id']) : null;
        $sessionUserId = getSessionUserId();

        if (!empty($userId) && $userId != $sessionUserId && !isAdmin($sessionUserId)) {
            $this->generateErrorOutput(401, 'social_network', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }

        if (empty($userId) && !isAdmin($sessionUserId)) {
            $userId = $sessionUserId;
        }

        try {
            $SocialNetworksDB = new SocialNetworksDB();
            $results = $SocialNetworksDB->select($network, $userId);

            if (!$results) {
                $SocialNetworks = new SocialNetworks();
                $authUrl = $SocialNetworks->getSocialAuthUrl($network, $userId);
                $results['network'] = $network;
                $results['user_id'] = $userId;
                $results['auth_url'] = $authUrl;
                $results['valid'] = 'false';

                $this->generateItemOutput(200, 'social_network', $results, $outputFormat);
                //$this->generateErrorOutput(404, 'social_network', 'SOCIAL_NETWORK_NOT_FOUND', $outputFormat);
                return;
            }

            $this->generateCollectionOutput(200, 'social_network', 'item', $results, $outputFormat);
            return;
        } catch (\Exception $e) {
            $this->generateErrorOutput(500, 'social_network', 'SOCIAL_NETWORK_FAILED', $outputFormat);
            return;
        }
    }

    /**
     * \par Description:
     * Save the auth code of the specified social network.
     *
     * \par Security:
     * - Verifies authorized user and valid social network.
     *
     * \par HTTP Method: POST
     * http://localhost/api/1.0/rest/social_network/{network}
     *
     * \param network         String  - required [facebook, twitter, youtube]
     * \param format          String  - optional
     *
     * \par Parameter Details:
     *
     * - The network parameter specifies which user settings to save.
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
      <social_network>
      <status>success</status>
      </social_network>
      \endverbatim
     */
    public function post($urlPath, $queryParams = null, $outputFormat = 'xml') {

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'urlPath', print_r($urlPath,true));
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'queryParams', print_r($queryParams,true));
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'outputFormat', $outputFormat);
        //exit;

        $network = isset($urlPath[0]) ? trim($urlPath[0]) : null;
        $userId = isset($queryParams['user_id']) ? trim($queryParams['user_id']) : null;
        $authType = isset($queryParams['auth_type']) ? trim($queryParams['auth_type']) : null;
        $authCode = isset($queryParams['auth_code']) ? trim($queryParams['auth_code']) : null;
        $overwrite = isset($queryParams['overwrite']) ? trim($queryParams['overwrite']) : null;
        $sessionUserId = getSessionUserId();

        if (empty($network)) {
            $this->generateErrorOutput(400, 'social_network', 'SOCIAL_NETWORK_MISSING', $outputFormat);
            return;
        }

        if (!empty($userId) && $userId != $sessionUserId && !isAdmin($sessionUserId)) {
            $this->generateErrorOutput(401, 'social_network', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }

        if (empty($userId) && !isAdmin($sessionUserId)) {
            $userId = $sessionUserId;
        }

        try {

            $SocialNetworksDB = new SocialNetworksDB();
            $results = $SocialNetworksDB->select($network, $userId);
            if ($results) {
                if ($overwrite != 'true') {
                    $this->generateErrorOutput(403, 'social_network', 'SOCIAL_NETWORK_EXISTS', $outputFormat);
                    return;
                } else {
                    $status = $SocialNetworksDB->delete($network, $userId);
                    if (!$status) {
                        $this->generateErrorOutput(500, 'social_network', 'SOCIAL_NETWORK_FAILED', $outputFormat);
                        return;
                    }
                }
            }

            if (empty($authCode)) {
                $SocialNetworks = new SocialNetworks();
                $authUrl = $SocialNetworks->getSocialAuthUrl($network, $userId);
                $authCode = $SocialNetworks->getSocialAuthCode($authUrl);
                if (empty($authCode)) {
                    $this->generateErrorOutput(500, 'social_network', 'SOCIAL_NETWORK_FAILED', $outputFormat);
                    return;
                }
            }

            $status = $SocialNetworksDB->insert($network, $userId, $authType, $authCode);

            if (!$status) {
                $this->generateErrorOutput(500, 'social_network', 'SOCIAL_NETWORK_FAILED', $outputFormat);
                return;
            }
            $results = array('status' => 'success');
            $this->generateItemOutput(201, 'social_network', $results, $outputFormat);
        } catch (\Exception $e) {
            $this->generateErrorOutput(500, 'social_network', 'SOCIAL_NETWORK_FAILED', $outputFormat);
            return;
        }
    }

    /**
     * \par Description:
     * Save the access_code and expires of the specified social network.
     *
     * \par Security:
     * - Verifies authorized user and valid social network.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/1.0/rest/social_network/{network}
     *
     * \param network         String  - required [facebook, twitter, youtube]
     * \param format          String  - optional
     *
     * \par Parameter Details:
     *
     * - The network parameter specifies which user settings to save.
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
      <social_network>
      <status>success</status>
      </social_network>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $network = isset($urlPath[0]) ? trim($urlPath[0]) : null;
        $userId = isset($queryParams['user_id']) ? trim($queryParams['user_id']) : null;
        $authType = isset($queryParams['auth_type']) ? trim($queryParams['auth_type']) : null;
        $accessToken = isset($queryParams['access_token']) ? trim($queryParams['access_token']) : null;
        $expires = isset($queryParams['expires']) ? trim($queryParams['expires']) : null;
        $sessionUserId = getSessionUserId();

        if (empty($network)) {
            $this->generateErrorOutput(400, 'social_network', 'SOCIAL_NETWORK_MISSING', $outputFormat);
            return;
        }

        if (!empty($userId) && $userId != $sessionUserId && !isAdmin($sessionUserId)) {
            $this->generateErrorOutput(401, 'social_network', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }

        if (empty($userId) && !isAdmin($sessionUserId)) {
            $userId = $sessionUserId;
        }

        try {
            $SocialNetworksDB = new SocialNetworksDB();

            if (empty($accessToken)) {
                $results = $SocialNetworksDB->select($network, $userId);

                if (!$results) {
                    $this->generateErrorOutput(404, 'social_network', 'SOCIAL_NETWORK_NOT_FOUND', $outputFormat);
                    return;
                }

                $authCode = isset($results[0]['auth_code']) ? $results[0]['auth_code'] : null;

                if (empty($authCode)) {
                    $this->generateErrorOutput(400, 'social_network', 'SOCIAL_AUTHCODE_MISSING', $outputFormat);
                    return;
                }

                $SocialNetworks = new SocialNetworks();
                $accessUrl = $SocialNetworks->getSocialAccesUrl($network, $userId, $authCode);
                $access = $SocialNetworks->getSocialAccess($accessUrl);
                if (empty($access)) {
                    $this->generateErrorOutput(500, 'social_network', 'SOCIAL_NETWORK_FAILED', $outputFormat);
                    return;
                }
                $accessToken = isset($access['access_token']) ? $access['access_token'] : null;
                $expires = isset($access['expires']) ? $access['expires'] : null;
            }

            $status = $SocialNetworksDB->update($network, $userId, $authType, $accessToken, $expires);
            if (!$status) {
                $this->generateErrorOutput(500, 'social_network', 'SOCIAL_NETWORK_FAILED', $outputFormat);
                return;
            }
            $results = array('status' => 'success');
            $this->generateItemOutput(201, 'social_network', $results, $outputFormat);
        } catch (\Exception $e) {
            $this->generateErrorOutput(500, 'social_network', 'SOCIAL_NETWORK_FAILED', $outputFormat);
            return;
        }
    }

}
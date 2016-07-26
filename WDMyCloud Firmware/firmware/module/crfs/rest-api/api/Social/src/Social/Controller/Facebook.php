<?php

namespace Social\Controller;

/*
 * \file social/facebook.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(SOCIAL_ROOT . '/includes/facebookapi.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

/*
 * \class Facebook
 * \brief Interface with the Facebook API.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see Twitter, Youtube
 */

class Facebook /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /*
     * \par Description:
     * Upload specified photo to Facebook.
     *
     * \par Security:
     * - Verifies authorized share access and valid file path.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/facebook/{path}
     *
     * \param path            String  - required
     * \param format          String  - optional
     *
     * \par Parameter Details:
     *
     * - If a path is specified, then the returned content will be restricted to only
     *   include files and directories that are contained within the specified path.
     *   Such a path will use the same syntax as other paths and thus include a share
     *   name optionally followed by subdirectories (e.g. Public/subdir1/subdir2).
     *   If no path is specified then, no additional filtering will be placed on the
     *   returned content (security filtering is always included).
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
      <facebook>
      <status>success</status>
      </facebook>
      \endverbatim
     */

    public function post($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $shareName = array_shift($urlPath);
        $filePath  = implode(DS, $urlPath);
        $fullPath  = implode(DS, [getSharePath($shareName), $shareName, $filePath]);

        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'sharePath', $sharePath);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'shareName', $shareName);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'filePath', $filePath);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'fullPath', $fullPath);

        if (empty($shareName)) {
            $this->generateErrorOutput(400, 'facebook', 'MISSING_SHARE_NAME', $outputFormat);
            return;
        }

        if (empty($filePath)) {
            $this->generateErrorOutput(400, 'facebook', 'MISSING_FILE_PATH', $outputFormat);
            return;
        }
        $sharesDao = new \Shares\Model\Share\SharesDao();
        
        if (!empty($shareName) && !$sharesDao->isShareAccessible($shareName, false)) {
            $this->generateErrorOutput(401, 'facebook', 'USER_NOT_AUTHORIZED', $outputFormat);
            return;
        }

        if (!file_exists($fullPath)) {
            $this->generateErrorOutput(404, 'facebook', 'FILE_NOT_FOUND', $outputFormat);
            return;
        }

        try {
            $Facebook_API = new FacebookAPI();
            $status = $Facebook_API->upload($fullPath);
            if (!$status) {
                $this->generateErrorOutput(500, 'facebook', 'FACEBOOK_UPLOAD_FAILED', $outputFormat);
                return;
            }
            $results = array('status' => 'success');
            $this->generateItemOutput(201, 'facebook', $results, $outputFormat);
        } catch (\Exception $e) {
            $this->generateErrorOutput(500, 'facebook', 'FACEBOOK_FAILED', $outputFormat);
            return;
        }
    }

}
<?php

namespace Shares\Controller;

/**
 * \file filesystem/sharenames.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');

/**
 * \class ShareNames
 * \brief Get list of share names.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see Shares, ShareAccess
 */
class ShareNames /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     *  Get list of share names.
     *
     * This API is slated to be removed in future releases.
     *
     * \par Security:
     * - No Authenticated required on LAN, and all shares returned on LAN for any user.
     *   On WAN user must be a Cloud Holder/Admin and only the share names for which they have RO share access will be returned.
     *   The 'usb_handle' parameter has been renamed to 'handle' to represent USB, SD card and potential new external storage types in future. For backward compatibility,
     *   If share_names API is executed with version 2.6 or older, the parameter name is  'usb_handle'. Else, for API versions higher than 2.6, the parameter name is 'handle'.
     *
     * \par HTTP Method: GET
     * http://localhost/api/1.0/rest/share_names
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
     * \par XML Response Example:
     * If API version is 2.6 or older
     * \verbatim
     *   <share_names>
     *      <share>
     *         <share_name>Public</share_name>
     *         <usb_handle/>
     *      <share>
     *      <share>
     *          <share_name>MyUSB</share_name>
     *          <usb_handle>123456789</usb_handle>
     *      </share>
     *   </shares_names>
     *
     * If API version is greater than 2.6
     * \verbatim
     *   <share_names>
     *      <share>
     *         <share_name>Public</share_name>
     *         <handle/>
     *      <share>
     *      <share>
     *          <share_name>MyUSB</share_name>
     *          <handle>123456789</handle>
     *      </share>
     *   </shares_names>
     * \endverbatim
     */
    public function get($urlPath, $queryParams = null, $output_format = 'xml', $version=null) {

        $includeWdSyncFolder = isset($queryParams['include_wd_sync_folder']) ? trim($queryParams['include_wd_sync_folder']) : false;
        $includeWdSyncFolder = in_array($includeWdSyncFolder, ['true', '1', 1]);

        $sharesDao = new \Shares\Model\Share\SharesDao();
		$shares = $sharesDao->getAll();
        $isLanRequest = isLanRequest();

        // Generate response
        setHttpStatusCode(200);
        $output = new \OutputWriter(strtoupper($output_format));
        $output->pushElement('share_names');
        $output->pushArray('share');

        foreach ($shares as $share) {
            if (strlen($share->getName()) == 0) {
                continue;
            }

			//For backward compatibility old Apps Or the Apps requesting for REST API version older than 2.6
			//should not get the list of shares which are not available via. Samba
			if ($version < 2.6 && !$share->getSambaAvailable()) {
				continue;
			}

            // Check if share is the "Recycle Bin", inwhich case ignore it.
            if($share->getRecycleBin()){
                continue;
            }

            $shareName = $share->getName();

            if (!$isLanRequest && !$sharesDao->isShareAccessible($shareName, FALSE)) {
                continue;
            }

            $output->pushArrayElement();
            $output->element('share_name', $shareName );
            if($version > 2.6){
                $output->element('handle', $share->getHandle());
            }else{
                $output->element('usb_handle', $share->getHandle());
            }

            if ($includeWdSyncFolder) {
                $syncFolderPath = implode(DS, [getSharePath($shareName), $shareName, 'WD Sync']);
                if (is_dir($syncFolderPath)) {
                    $output->element('wd_sync_folder', 'true');
                } else {
                    $output->element('wd_sync_folder', 'false');
                }
            }
            $output->popArrayElement();
        }

        $output->popArray();
        $output->popElement();
        $output->close();
    }

}
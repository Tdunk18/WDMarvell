<?php

/**
 * \file SafePoint/Controller/ShareGetInfo.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class ShareGetInfo
 * \brief Get NAS share information.
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class ShareGetInfo /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'share_getinfo';

    /**
     * \par Description:
     * Get NAS share information.
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/share_getinfo
     *
     * \param option   String - optional
     * \param name     String - required
     * \param ip_addr  String - required
     * \param user     String - optional
     * \param pswd     String - optional
     *
     * \par Parameter Details:
     *  - option can only be 'abort'
     *  - name is the share name
     *  - ip_addr is the IP Address of NAS destination device or USB for the usb device.
     *  - user empty for public or device username (e.g. Windows user)
     *  - pswd empty for public or device password (e.g. Windows password)
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     * .
     * \par Legacy Zermatt Error Names:
     * FAILED
     * INVALID
     * UNAUTHORIZED
     * NOTFOUND
     *
     * \par XML Response Example:
     * \verbatim
<share_getinfo>
    <nas_share>
        <public>{true/false}</public>
        <type>{smb/nfs/afs}</type>
    </nas_share>
</share_getinfo>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        throw new \Core\Rest\Exception('NOTSUPPORTED', 405, null, self::COMPONENT_NAME);
    }

}

<?php

/**
 * \file SafePoint/Controller/NasGetInfo.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class NasGetInfo
 * \brief Get NAS device information.
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class NasGetInfo /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'nas_getinfo';

    /**
     * \par Description:
     * Get NAS device information.
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/nas_getinfo
     *
     * \param ip_addr  String - required
     * \param option   String - optional
     * \param user     String - optional
     * \param pswd     String - optional
     *
     * \par Parameter Details:
     *  - option can only be 'abort'
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
     *  - FAILED
     *  - INVALID
     *  - UNAUTHORIZED
     *  - NOTFOUND
     *
     * \par XML Response Example:
     * \verbatim
<nas_getinfo>
    <nas_device>
        <name>{friendly name of NAS device}</name>
        <type>Windows/Linux/Apple</type>
        <TBD>
    </nas_device>
</nas_getinfo>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        throw new \Core\Rest\Exception('NOTSUPPORTED', 405, null, self::COMPONENT_NAME);
    }

}

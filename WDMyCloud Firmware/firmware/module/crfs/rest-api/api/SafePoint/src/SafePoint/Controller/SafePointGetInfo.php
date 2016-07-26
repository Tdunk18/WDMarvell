<?php

/**
 * \file SafePoint/Controller/SafePointGetInfo.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class SafePointGetInfo
 * \brief Get information about a safe-point.
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class SafePointGetInfo /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_getinfo';

    /**
     * \par Description:
     * Get information about a safe-point.
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/safepoint_getinfo
     *
     * \param option   String - optional
     * \param handle   String - required
     * \param share    String - optional
     * \param ip_addr  String - optional
     * \param user     String - optional
     * \param pswd     String - optional
     *
     * \par Parameter Details:
     *  - option can only be abort.
     *  - handle is the handle of safe-point.
     *  - ip_addr is the IP Address of NAS destination device or USB for the usb device.
     *  - share required if ip_addr is supplied.
     *  - user empty for public or device username (e.g. Windows user).
     *  - pswd empty for public or device password (e.g. Windows password).
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     *
     * \par Legacy Zermatt Error Names:
     *  - FAILED
     *  - INVALID
     *  - UNAUTHORIZED
     *  - NOTFOUND
     *
     * \par XML Response Example:
     * \verbatim
<safepoint_discover>
    <safepoints>
        <safepoint>
            <handle>{handle to the safe-point}</handle>
            <name>{name of the safe-point}</name>
            <description>{description of the safe-point}</description>
            <state>{ok/invalid/notcreated}</state>
            <compatibility>{none/owned/compatible}</compatibility>
            <n_files>{number of files in safe-point}</n_files>
            <total_size>{total size of safe-point in MB}</total_size>
            <device_name>{source device of safe-point}</device_name>
            <ip_addr>{source ip of safe-point}</ip_addr>
            <action>{none/create/destroy/update/restore}</action>
            <action_state>{ok/failed/aborted/inprogress}</action_state>
            <ts_start>{timestamp action started}</ts¬_start>
            <ts_end>{timestamp action ended}</ts_end>
            <priority>{priority of the action}</priority>
        </safepoint>
    </safepoints>
</safepoint_discover>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        throw new \Core\Rest\Exception('NOTSUPPORTED', 405, null, self::COMPONENT_NAME);
    }

}

<?php

namespace SafePoint\Controller;

// Copyright (c) [2011] Western Digital Technologies, Inc. All rights reserved.

/**
 * \file SafePoint/Controller/SafePointActivate.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class SafePointActivate
 * \brief Activate a safe-point on a target share.
 *
 */
class SafePointActivate {

	use \Core\RestComponent;
	use SafePointTraitController;

	const COMPONENT_NAME = 'safepoint_activate';

	/**
	 * \par Description:
	 * Activate a safe-point on a target share. Once a safe-point is activated it can be managed by NSPT.
	 * This operation is very useful when user needs to access safe-points that are not currently managed by NSPT on local NAS.
	 * A safe-point can be activated only if it is owned or compatible with the local NAS.
	 * Once activated the safe-point can be enumerated using �Get List of Managed Safe-points� operation.
	 * NSPT can initiate or schedule actions (create/update/restore/destroy) only on activated safe-points.
	 * So safe-points discovered on target shares must be activated before invoking any further operations on them.
	 *
	 * \par Security:
     * - Admin LAN request only.
	 *
	 * \par HTTP Method: POST
	 * http://localhost/api/@REST_API_VERSION/rest/safepoint_activate
	 *
	 * \param ip_addr  String - required
	 * \param option   String - optional
	 * \param user     String - optional
	 * \param pswd     String - optional
	 * \param handle   String - optional
	 * \param share    String - optional
	 *
	 * \par Parameter Details:
	 *  - option can only be 'abort'
     *  - ip_addr is the IP Address of NAS destination device or USB for the usb device.
	 *  - user empty for public or device username (e.g. Windows user)
	 *  - pswd empty for public or device password (e.g. Windows password)
	 *  - share - share name
	 *  - handle - handle of safe-point
	 *
	 * \retval status String - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On success
	 * - 400 - Bad request
	 * - 500 - Internal server error
	 * .
	 * \par Status Codes:
	 *  - OK
	 *  - INVALID
	 *  - FAILED
	 *  - UNAUTHORIZED
	 *  - NOTFOUND
	 *  - BUSY
	 *
	 * \par XML Response Example:
	 * \verbatim
<safepoint_activate>
    <status_code>{status code}</status_code>
    <status_name>OK</status_name>
</safepoint_activate>
	 \endverbatim
	 */
	public function post($urlPath, $queryParams=null, $outputFormat='xml'){
        throw new \Core\Rest\Exception('NOTSUPPORTED', 405, null, self::COMPONENT_NAME);
	}

}
<?php

namespace System\Device\Controller;

use \System\Device\Model;
use System\Device\Exception as DeviceException;

/**
 * \file device/PrivacyOptionsController.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp.
 * All rights reserved.
 */

/**
 * \class PrivacyOptionsController
 * \brief Retrieve and update user's choice on sharing private contents(i.e: serial number of the device) with WDC support.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - Admin authentication required.
 */
class PrivacyOptionsController /* extends AbstractActionController */ {

	use\Core\RestComponent;
	const COMPONENT_NAME = "privacy_options";

	/**
	 * \par Description:
	 * If user has accepted the option to share device's privacy details(such as: Device's Serial Number) with WDC support then boolean value true will be returned.
	 *
	 * \par Security:
	 * - Admin authentication required
	 *
	 * \par HTTP Method: GET
	 * http://localhost/api/@REST_API_VERSION/rest/privacy_options
	 *
	 * \param format String - optional (default is xml)
	 *
	 * \par Parameter Details:
	 *
	 * \retval send_serial_number - boolean(true|false)
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful retrieval of eula acceptance
	 * - 401 - User is not authorized
	 * - 500 - Internal server error
	 *
	 * \par XML Response Example:
	 * \verbatim
	 * <privacy_oprions>
	 * <send_serial_numbers>True</send_serial_numbers>
	 * </privacy_options>
	 * \endverbatim
	 */
	function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
		$optionObj = new Model\Device();
		try {
			$option = $optionObj->getPrivacyOption();
		} catch (DeviceException $e) {
			throw new \Core\Rest\Exception('PRIVACY_OPTIONS_INTERNAL_SERVER_ERROR', 500, null, self::COMPONENT_NAME);
		}

		$this->generateSuccessOutput(200, self::COMPONENT_NAME, $option, $outputFormat);
	}

	/**
	 * \par Description:
	 * Used to configure user's privacy option.
	 *
	 * \par Security:
	 * - Admin authentication required.
	 *
	 * \par HTTP Method: PUT
	 * - http://localhost/api/@REST_API_VERSION/rest/privacy_options
	 *
	 * \param send_serial_number Boolean - required(Any value other than True will be considered as 'False')
	 * \param format String - optional
	 *
	 * \par Parameter Details:
	 * - send_serial_number - Indicates user has agrred to share serial number or not.
	 *
	 * \retval status String - Success
	 *
	 * \par HTTP Response Codes:
	 * - 201 - On successful updation of eula acceptance
	 * - 401 - User is not authorized
	 * - 500 - Internal server error
	 *
	 * \par XML Response Example:
	 * \verbatim
	 * <privacy_options>
	 * <status>Success<Status>
	 * </privacy_options>
	 * \endverbatim
	 */
	function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
		$optionObj = new Model\Device();

		if(isset($queryParams['send_serial_number'])){
			$choice = (filter_var($queryParams['send_serial_number'], \FILTER_VALIDATE_BOOLEAN) == 1) ? true : false;
		}
		try {
			$optionObj->setPrivacyOption($choice);
		} catch (DeviceException $e) {
			throw new \Core\Rest\Exception('PRIVACY_OPTIONS_INTERNAL_SERVER_ERROR', 500, null, self::COMPONENT_NAME);
		}

		$this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status' => 'Success'), $outputFormat);
	}
}
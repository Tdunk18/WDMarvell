<?php

namespace System\Network\Controller;

/**
 * \file Network\Controller\NetworkTestController.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
*/

/**
 * \class NetworkTestController
 * \brief Used for testing network bandwidth.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 *
 */
class NetworkTestController /*extends AbstractRestController */ {

	use \Core\RestComponent;

    const COMPONENT_NAME = 'network_test';

	/**
	 * \par Description:
	 * Used for testing network bandwidth.
	 *
	 * \par Security:
	 * - Requires Admin User authentication and request is from LAN only.
	 *
	 * \par HTTP Method: GET
	 * http://localhost/api/@REST_API_VERSION/rest/network_test
	 *
	 * \param format   String  - optional (default is xml)
	 *
	 * \par Parameter Details:
	 * bytes: {int}
	 *
	 * \retval network_test - Network test
	 * - string:  {string}
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On success
	 * - 500 - Internal server error
	 *
	 * \par XML Response Example:
	 * \verbatim
<network_test>
   <string>ndU10s#9sx</string>
</network_test>
	 \endverbatim
	 */
	function get($urlPath, $queryParams=null, $outputFormat='xml'){

        $length = filter_var_array($queryParams, array('bytes' => 'FILTER_VALIDATE_INT'))['bytes'] ?: 10;

		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';

        $output = new \OutputWriter(strtoupper($outputFormat));
		$output->pushElement(self::COMPONENT_NAME);
		$output->pushElement("string");

        set_time_limit(0);
        echo "<![CDATA["; // So we don't have to escape special characters in XML data.
		for ($i = 0; $i < $length; $i++) {
			echo $characters[mt_rand(0, strlen($characters) - 1)];
		}
        echo "]]>";

        $output->popElement();
        $output->popElement();
        $output->close();
	}
}
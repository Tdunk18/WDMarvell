<?php

/**
 * \file firmware/UpdateConfiguration.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace System\Firmware\Controller;

use System\Firmware\Model;

/**
 * \class UpdateConfiguration
 * \brief Retrieve and update firmware update configuration
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class UpdateConfiguration /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'firmware_update_configuration';

    /**
     * \par Description:
     * Return firmware update configuration.
     *
     * \par Security:
     * - Requires Admin User authentication 
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/firmware_update_configuration
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval firmware_update_configuration - Firmware update configuration
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the firmware update configuration
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 176 - FIRMWARE_UPDATE_CONFIGURATION_INTERNAL_SERVER - Firmware update bad request
     *
     * \par XML Response Example:
     * \verbatim
      <firmware_update_configuration>
      <auto_install>false</auto_install>
      <auto_install_day>0</auto_install_day>
      <auto_install_hour>3</auto_install_hour>
      </firmware_update_configuration>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml', $version = null) {
        $fwUpdateConfigObj = new Model\UpdateConfiguration();
        $result = $fwUpdateConfigObj->getConfig();

        if ($result !== NULL) {
            $this->generateSuccessOutput(200, 'firmware_update_configuration', $result, $outputFormat);
        } else {
            //Failed to collect info
            throw new \Core\Rest\Exception('FIRMWARE_UPDATE_CONFIGURATION_INTERNAL_SERVER', 500, null, self::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Modify firmware update configuration.
     *
     * \par Security:
     * - Requires Admin User authentication
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/firmware_update_configuration
     *
     * \param auto_install          String  - required
     * \param auto_install_day      String  - required
     * \param auto_install_hour     String  - required
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * -auto_install:  true/false
     * -auto_install_day:  {0-everyday 1-7 representing Monday-Sunday }
     * -auto_install_hour:  {0-23 hour of day }
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful updation of the firmware update configuration
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 93 - INVALID_PARAMETER_VALUE - Parameter value are invalid
     * - 175 - FIRMWARE_UPDATE_CONFIGURATION_BAD_REQUEST - Firmware update bad request
     * - 176 - FIRMWARE_UPDATE_CONFIGURATION_INTERNAL_SERVER - Firmware update internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <firmware_update_configuration>
      <status>success</status>
      </firmware_update_configuration>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml', $version = null) {
        if (!isset($queryParams["auto_install"]) ||
            !isset($queryParams["auto_install_day"]) ||
            !isset($queryParams["auto_install_hour"])) {

            throw new \Core\Rest\Exception('INVALID_PARAMETER_VALUE', 400, null, self::COMPONENT_NAME);
        }

        if ($version  == 1) {
        	//for version 1.0 REST-API, convert enable/disable to true/false
      		if ( (strcmp($queryParams["auto_install"],'enable')) == 0) {
      			$queryParams["auto_install"] = 'true';
      		}
      		else if ((strcmp($queryParams["auto_install"],'disable') == 0 ) ) {
      			$queryParams["auto_install"] = 'false';
      		}
        }

      	$autoInstall = $queryParams["auto_install"];
        if ( (strcmp($autoInstall,'true') != 0 ) &&
        	 (strcmp($autoInstall,'false') != 0 ) ) {
        	throw new \Core\Rest\Exception('INVALID_PARAMETER_VALUE', 400, null, self::COMPONENT_NAME);
        }

        $filterParams = filter_var_array($queryParams, array(
            'auto_install' => \FILTER_VALIDATE_BOOLEAN,
            'auto_install_day' => array('filter' => \FILTER_VALIDATE_INT,
                "options"=>array
                ("min_range"=>0,
                    "max_range"=>7
                )
            ),
            'auto_install_hour' => array('filter' => \FILTER_VALIDATE_INT,
                "options"=>array
                ("min_range"=>0,
                    "max_range"=>23
                )
            )
        ));
        if (empty($filterParams['auto_install_day']) && $filterParams['auto_install_day'] !== 0) {
            throw new \Core\Rest\Exception('INVALID_PARAMETER_VALUE', 400, null, self::COMPONENT_NAME);
        }
        if (empty($filterParams['auto_install_hour']) && $filterParams['auto_install_hour'] !== 0) {
            throw new \Core\Rest\Exception('INVALID_PARAMETER_VALUE', 400, null, self::COMPONENT_NAME);
        }

    	$fwUpdateConfigObj = new Model\UpdateConfiguration();
    	try {
            $fwUpdateConfigObj->modifyConfig($filterParams);
        } catch (\System\Firmware\Exception $e) {
            throw new \Core\Rest\Exception('FIRMWARE_UPDATE_CONFIGURATION_INTERNAL_SERVER', 500, $e, self::COMPONENT_NAME);
        }
        $this->generateSuccessOutput(200, 'firmware_update_configuration', array('status' => 'success'), $outputFormat);
    }

}

/*
 * Local variables:
 *  indent-tabs-mode: nil
 *  c-basic-offset: 4
 *  c-indent-level: 4
 *  tab-width: 4
 * End:
 */
<?php

namespace System\Device\Controller;

use System\Device\Model;
use System\Device\Exception as DeviceException;

/**
 * \file device/DeviceRegistrationController.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class DeviceRegistrationController
 * \brief Retrieve and set device registration
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need not be authenticated to use this component.
 *
 */

class DeviceRegistrationController /* extends AbstractActionController */ {
	const COMPONENT_NAME = 'device_registration';

    use \Core\RestComponent;


    /**
     * \par Description:
     * Get device registration status.
     *
     * \par Security:
     * - Require admin authentication and request is from LAN.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/device_registration
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval device_registration - Device registration
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of registration status
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     *
     * \par XML Response Example:
     * \verbatim
      <device_registration>
      <registered>false</registered>
      </device_registration>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
    	$deviceReg = new Model\Device();
        $result = $deviceReg->getRegistration();
		if ($result) {
            $this->generateSuccessOutput(200, self::COMPONENT_NAME, $result, $outputFormat);
        } else {
        	throw new \Core\Rest\Exception('DEVICE_NOT_REGISTERED', 404, null, self::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Used for Setting device registration
     *
     * \par Security:
     * - Require admin authentication and request is from LAN.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/device_registration
     *
     * \param registered            Boolean  - required
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - registered: {true} - only true is honored others are considered bad request
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:registered
     * - 200 - On successful registration
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <device_registration>
      <status>success</status>
      </device_registration>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
    	$deviceReg = new Model\Device();

        if(!filter_var($queryParams["registered"], FILTER_VALIDATE_BOOLEAN)){
        	throw new \Core\Rest\Exception('DEVICE_REGISTRATION_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }

        try {
			$deviceReg->register();
        } catch (DeviceException $e) {
			throw new \Core\Rest\Exception('DEVICE_REGISTRATION_INTERNAL_ERROR', 500, null, self::COMPONENT_NAME);
		}

		$this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status' => 'Success'), $outputFormat);
    }

    /**
     * \par Description:
     * Used for new device registration with WDC support.
     *
     * \par Security:
     * - Require admin authentication and request is from LAN.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/device_registration
     *
     * \param country               String  - required
     * \param lang					String  - required
     * \param first					String  - required
     * \param last					String  - required
     * \param email					String  - required
     * \param option				String  - required
     *
     * \par Parameter Details:
     * - country - ISO country code from OS
     * - lang 	 - 3 letter language code
     * 				CHS	Chinese, Simplified
     * 				CHT	Chinese, Traditional
     * 				CZE or CES 	Czech
     * 				DUT or NLD	Dutch
     * 				ENG	English
     * 				FRA	French
     * 				DEU	German
     * 				HUN	Hungarian
     * 				ITA	Italian
     * 				JPN	Japanese
     * 				KOR	Korean
     * 				NOR	Norwegian
     * 				PLK or POL	Polish
     * 				PBR Portuguese Brazil
     * 				RUS	Russian
     * 				ESN	Spanish, International
     * 				SWE	Swedish
     * 				TUR or TRK	Turkish
     *  - first  - first name
     *  - last   - last name
     *  - email  - email address
     *  - option - yes/no
     *
     * \retval status String  - success
     * 				  String  - nosuccess
     * 				  String  - pending
     * 				  String  - registered
     *
     * \par HTTP Response Codes:
     * - 200 - On success/pending/nosuccess/registered
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     *\par Error Codes:
     * - 262 - 'DEVICE_ALREADY_REGISTERED' - 'Device already registered'
     * - 263 - 'DEVICE_REGISTRATION_PENDING' - 'Device registration Pending'
     * - 264 - 'DEVICE_REGISTRATION_NO_SUCCESS' - 'Device registration no success'
     *
     * \par XML Response Example:
     * \verbatim
     <device_registration>
     <status>success</status>
     </device_registration>
     \endverbatim
     */
    function post($urlPath,$queryParams = null, $outputFormat = 'xml') {
    	if(!isset($queryParams['country']) || (isset($queryParams['country']) && strcmp($queryParams['country'], "") == 0)){

    		throw new \Core\Rest\Exception('DEVICE_REGISTRATION_BAD_REQUEST_COUNTRY', 400, null, self::COMPONENT_NAME);
    	}

    	if(!isset($queryParams['lang']) || (isset($queryParams['lang']) && strcmp($queryParams['lang'], "") == 0)){

    		throw new \Core\Rest\Exception('DEVICE_REGISTRATION_BAD_REQUEST_LANG', 400, null, self::COMPONENT_NAME);
    	}

		if(!isset($queryParams['first']) || (isset($queryParams['first']) && strcmp($queryParams['first'], "") == 0)){

			throw new \Core\Rest\Exception('DEVICE_REGISTRATION_BAD_REQUEST_FIRST', 400, null, self::COMPONENT_NAME);
		}

    	if(!isset($queryParams['last']) || (isset($queryParams['last']) && strcmp($queryParams['last'], "") == 0)){

    		throw new \Core\Rest\Exception('DEVICE_REGISTRATION_BAD_REQUEST_LAST', 400, null, self::COMPONENT_NAME);
    	}

    	if(!isset($queryParams['email']) || (isset($queryParams['email']) && !filter_var($queryParams['email'], FILTER_VALIDATE_EMAIL))){

    		throw new \Core\Rest\Exception('DEVICE_REGISTRATION_BAD_REQUEST_EMAIL', 400, null, self::COMPONENT_NAME);
    	}

    	if((!isset($queryParams['option']) || (isset($queryParams['option']) && !(strcmp($queryParams['option'], "yes") == 0 || strcmp($queryParams['option'], "no") == 0 )))){

    		throw new \Core\Rest\Exception('DEVICE_REGISTRATION_BAD_REQUEST_OPTION', 400, null, self::COMPONENT_NAME);
    	}
    	else{
			//sanitize strings before uploading to customer services server    		
    		$queryParams = filter_var_array($queryParams, array (
    				'country'   => FILTER_SANITIZE_STRING,
    				'lang'   => FILTER_SANITIZE_STRING,
    				'first'   => FILTER_SANITIZE_STRING,
    				'last'   => FILTER_SANITIZE_STRING,
    				'option'   => FILTER_SANITIZE_STRING,
    		        'email'   => null, //Since, email address is verified already, passing this verification as null.
    		) );
    		
    		$deviceReg = new Model\Device();
    		$result = $deviceReg->newRegistration($queryParams);

    		if($result  != 'success'){
    			$this->_mapResponse($result);
    		}
    		else{
    			$this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status' => 'Success'), $outputFormat);
    		}
    	}
    }

    private function _mapResponse($response){
    	$errMsg = 'DEVICE_REGISTRATION_' . strtoupper($response);
    	throw new \Core\Rest\Exception($errMsg, 500, null, "device_registration");
    }
}
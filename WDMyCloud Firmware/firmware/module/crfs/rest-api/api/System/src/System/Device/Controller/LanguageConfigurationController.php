<?php

namespace System\Device\Controller;

use System\Device\Model;
use System\Device\Exception as DeviceException;

/**
 * \file device/LanguageConfigurationController.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class LanguageConfigurationController
 * \brief Retrieve and set language configuration
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need not be authenticated to use this component.
 *
 */
class LanguageConfigurationController /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = "language_configuration";

    /**
     * \par Description:
     * Return current language configuration if set.  If not, set default
     *
     * \par Security:
     * - No authentication is required, and request allowed in LAN only
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/language_configuration
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval language_configuration - Language configuration
     * - language:  {language}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of current language configuration
     * - 403 - Request is forbidden
     * - 404 - Resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <language_configuration>
      <language>DEFAULT</language>
      </language_configuration>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        //$langConfigObj = new Model\Language();
    	$langConfigObj = new Model\Device();

    	try {
    		$result = $langConfigObj->getConfig();
    	} catch (DeviceException $e) {
    		throw new \Core\Rest\Exception('LANGUAGE_CONFIGURATION_NOT_FOUND', 404, null, self::COMPONENT_NAME);
    	}
    	$this->generateSuccessOutput(200, self::COMPONENT_NAME, array('language' => $result), $outputFormat);
    }

    /**
     * \par Description:
     * Modify configured language.
     *
     * \par Security:
     * - No authentication is required, and request allowed in LAN only
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/language_configuration
     *
     * \param language              String  - required
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - language:  en_US/fr_FR/de_DE/es_ES/cs_CZ/hu_HU/it_IT/ja_JP/ko_KR/nb_NO/nl_NL/pl_PL/pt_BR/ru_RU/sv_SE/tr_TR/zh_CN/zh_TW
     * 				See Firmware Functional Specification for complete list of language codes.
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful update of configured language
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 403 - Request is forbidden
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <language_configuration>
      <status>success</status>
      </language_configuration>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {

    	$langConfigObj = new Model\Device();

        if (!isset($queryParams["language"])) {
        	throw new \Core\Rest\Exception('LANGUAGE_CONFIGURATION_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }

        if (!is_file("/etc/language.conf")) {
        	throw new \Core\Rest\Exception('LANGUAGE_CONFIGURATION_FILE_NOT_FOUND', 400, null, "language_configuration");
        }

        $reader = new \System\Device\StringTableReader("fr", "alertmessages.txt");
        if (!$reader->isLocaleSupported($queryParams["language"])) {
        	throw new \Core\Rest\Exception('LANGUAGE_CONFIGURATION_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }

        try {
        	$langConfigObj->configLanguage($queryParams["language"]);
        } catch (DeviceException $e) {
        	throw new \Core\Rest\Exception('LANGUAGE_CONFIGURATION_INTERNAL_SERVER_ERROR', 500, null, self::COMPONENT_NAME);
        }
        $this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status' => 'Success'), $outputFormat);
    }

    /**
     * \par Description:
     * Used for setting language on a new device. This will create the language for use by the device.
     * If a language is already set for the device, use the PUT method to change the language.
     *
     * \par Security:
     * - No authentication is required, and request allowed in LAN only
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/language_configuration
     *
     * \par HTTP POST Body
     * - language=en_US
     *
     * \param language String  - required
     * \param format   String  - optional
     *
     * \par Parameter Details:
     * - language:  en_US/fr_FR/it_IT/de_DE/es_ES/zh_CN/zh_TW/ja_JP/ko_KR/ru_RU/pt_BR
     * - See Firmware Functional Specification for complete list of language codes.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example for already created language_configuration:
     * \verbatim
      <language_configuration>
      <error_code>400</error_code>
      <http_status_code>400</http_status_code>
      <error_id></error_id>
      <error_message>ERROR_BAD_REQUEST</error_message>
      </language_configuration>
      \endverbatim
     *
     * \par XML Response
     * \verbatim
      <device>
      <status>success</status>
      </device>
      \endverbatim
     */
    function post($urlPath, $queryParams = null, $outputFormat = 'xml') {

    	$langConfigObj = new Model\Device();

        if (!isset($queryParams["language"])) {
        	throw new \Core\Rest\Exception('LANGUAGE_CONFIGURATION_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }

        if (is_file("/etc/language.conf")) {
        	throw new \Core\Rest\Exception('LANGUAGE_CONFIGURATION_FILE_EXISTS', 400, null, "language_configuration");
        }

        $reader = new \System\Device\StringTableReader("fr", "alertmessages.txt");
        if (!$reader->isLocaleSupported($queryParams["language"])) {
        	throw new \Core\Rest\Exception('LANGUAGE_CONFIGURATION_BAD_REQUEST', 400, null, self::COMPONENT_NAME);
        }

        try {
        	$langConfigObj->configLanguage($queryParams["language"]);
        } catch (DeviceException $e) {
        	throw new \Core\Rest\Exception('LANGUAGE_CONFIGURATION_INTERNAL_SERVER_ERROR', 500, null, self::COMPONENT_NAME);
        }
       	$this->generateSuccessOutput(201, self::COMPONENT_NAME, array('status' => 'Success'), $outputFormat);
    }
}
<?php

namespace Remote\Controller;

/**
 * \file remote/Config.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

use \Common\Model\GlobalConfig;

/**
 * \class Config
 * \brief Used to manage ports used by the device for communication.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 */
class Config /* extends AbstractActionController */ {

    use \Core\RestComponent;

    function __construct() {
        require_once(COMMON_ROOT . '/includes/globalconfig.inc');
        require_once(COMMON_ROOT . '/includes/outputwriter.inc');
        require_once(COMMON_ROOT . '/includes/util.inc');
    }

    /**
     * \par Description:
     * Used for retrieving the value for the passed in param name(s) set in the configuration.
     *
     * \par Security:
     * - Request honored only if it is from localhost
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/config
     *
     * \param param (or) params       String - required
	 * \param config_id       		  String - required
     * \param module      			  String - required
     *
     * \par Parameter Details:
     * - config_id  - defines which config file to read param(s) from
     * - module - defines which module in the config file to be read
     * - param (or) params - defines which param in the module to be read. Use param if you want to retrieve
     *   one or use params if you want to retrieve more than one param. In case of using params the value has to be comma seperated.
     *
     * \retval config param values
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of the param values
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
		<config>
		  <param>
		    <name>DEBUG</name>
		    <value>1</value>
		  </param>
		  <param>
		    <name>TYPE</name>
		    <value>4</value>
		  </param>
		</config>
     \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        //Verify that the request is from the local computer (this service should not be allowed to be called externally; not even on the lan)
        if ($_SERVER['REMOTE_ADDR'] != $_SERVER['SERVER_ADDR']) {
            //setHttpStatusCode(401, 'External requests not permitted.');
            $this->generateErrorOutput(401, 'config', 'ERROR_NOT_PERMITTED', $outputFormat);
            return;
        }
        $foundSettings = false;
        if ($queryParams !== null) {
            $paramArray = array();
            if (isset($queryParams['params'])) {
                $paramArray = explode(',', $queryParams['params']);
            } else if (isset($queryParams['param'])) {
                if (!in_array($queryParams['param'], $paramArray)) {
                    array_push($paramArray, $queryParams['param']);
                }
            } else {
                //setHttpStatusCode(400, 'config param names are missing ');
                $this->generateErrorOutput(400, 'config', 'ERROR_MISSING_CONFIG_PARAM', $outputFormat);
                return;
            }
            $noParams = sizeof($paramArray);
            if ($noParams > 0) {
                $queryParams['config_id'] = strtoupper($queryParams['config_id']);
                $configId = $queryParams['config_id'];
                if (!isset($configId)) {
                    //setHttpStatusCode(400, 'config_id is missing');
                    $this->generateErrorOutput(400, 'config', 'ERROR_MISSING_CONFIG_ID', $outputFormat);
                    return;
                }
                $module = $queryParams['module'];
                if (!isset($module)) {
                    setHttpStatusCode(400, 'config module is missing');
                    $this->generateErrorOutput(400, 'config', 'ERROR_MISSING_CONFIG_MODULE', $outputFormat);
                    return;
                }
                $configSettings = GlobalConfig::getInstance()->getConfig(strtoupper($configId), $module);
                if ($configSettings != null) {
                    $ow = new \OutputWriter($outputFormat);
                    $ow->pushElement('config');
                    for ($i = 0; $i < $noParams; $i++) {
                        if (isset($configSettings[$paramArray[$i]])) {
                            $ow->pushElement('param');
                            $ow->element('name', $paramArray[$i]);
                            $ow->element('value', $this->toString($configSettings[$paramArray[$i]]));
                            $ow->popElement();
                        }
                    }
                    $ow->popElement();
                    $ow->close();
                    $foundSettings = true;
                }
            }
        }
        if (!$foundSettings) {
            //setHttpStatusCode(404, 'Not Found');
            $this->generateErrorOutput(404, 'config', 'ERROR_NOT_FOUND', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Used for updating the value for the passed in param name(s) in the configuration.
     *
     * \par Security:
     * - Request honored only if it is from localhost
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/config
     *
     * \param config_id       		  	   String - required
     * \param module      			  	   String - required
     * \param {<param_name>=<param_value>} String - optional
     *
     * \par Parameter Details:
     * - config_id  - defines which config file to read param(s) from
     * - module - defines which module in the config file to be read
     * - {<param_name>=<param_value>} - defines which param in the module to be updated. (e.g) TYPE=3&DEBUG=4. any number of params can be passed by concatenating with &.
     *
     * \retval config param values
     *
     * \par HTTP Response Codes:
     * - 200 - On successful updation of the param values
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
	  <config>
		  <status>success</status>
		  <param>
		    <name>TYPE</name>
		    <value>4</value>
		  </param>
		  <param>
		    <name>DEBUG</name>
		    <value>1</value>
		  </param>
		  <param>
		    <name>RequestScope</name>
		    <value></value>
		  </param>
	  </config>
     \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        //Verify that the request is from the local computer (this service should not be allowed to be called externally; not even on the lan)
        $serverAddr = !isset($_SERVER['SERVER_ADDR']) ? $_SERVER['LOCAL_ADDR'] : $_SERVER['SERVER_ADDR'];
        if ($_SERVER['REMOTE_ADDR'] != $serverAddr) {
            //setHttpStatusCode(401, 'External requests not permitted.');
            $this->generateErrorOutput(401, 'config', 'ERROR_EXTERNAL_REQUEST_NOT_PERMITTED', $outputFormat);
            return;
        }

        //Verify that both of the required parameters are included
        if (empty($queryParams)) {
            //setHttpStatusCode(400, 'params are missing');
            $this->generateErrorOutput(400, 'config', 'ERROR_MISSING_CONFIG_PARAM', $outputFormat);
            return;
        }
        if (!isset($queryParams['config_id'])) {
            //setHttpStatusCode(400, 'config_id is missing');
            $this->generateErrorOutput(400, 'config', 'ERROR_MISSING_CONFIG_ID', $outputFormat);
            return;
        }
        if (!isset($queryParams['module'])) {
            //setHttpStatusCode(400, 'module is missing');
            $this->generateErrorOutput(400, 'config', 'ERROR_MISSING_CONFIG_MODULE', $outputFormat);
            return;
        }

        $queryParams['config_id'] = strtoupper($queryParams['config_id']);
        $configId = $queryParams['config_id'];
        $module = $queryParams['module'];
        $paramsSet = array();
        $changedArr = array('configId' => $configId,
            'section' => $module,
            'name' => array());

        if (($paramsSize = (sizeof($queryParams))) > 1) {
            $configId = strtoupper($configId);
            $config = GlobalConfig::getInstance()->getConfig($configId, $module);
            if (!empty($config)) {

                foreach ($queryParams as $key => $val) {
                    if (!preg_match('/format|config_id|module|rest_method|auth_username|auth_password|RequestScope/i', $key)) {
                    	if (strpos($key, "COMMUNICATION_STATUS") === 0) {
                    		apc_store("_CFG_COMM_STATUS", $val);
                    	}
                    	$changedArr['name'][$key] = $val;
                        $paramsSet[$key] = $val;
                    }
                }

                // save it in ini file
                if (!GlobalConfig::getInstance()->setConfigArray($changedArr))
                    $paramsSet = array();

                $ow = new \OutputWriter(strtoupper($outputFormat));
                $ow->pushElement('config');
                if (isset($paramsSet)) {
                    //echo-back params and their values
                    $ow->element('status', 'success');
                    $keys = array_keys($paramsSet);
                    $sizeKeys = sizeof($keys);
                    for ($i = 0; $i < $sizeKeys; $i++) {
                        $ow->pushElement('param');
                        $ow->element('name', $keys[$i]);
                        $ow->element('value', $paramsSet[$keys[$i]]);
                        $ow->popElement();
                    }
                } else {
                    // setHttpStatusCode(404, 'Not Found');
                    $this->generateErrorOutput(404, 'config', 'ERROR_NOT_FOUND', $outputFormat);
                }
                $ow->popElement();
                $ow->close();
            } else {
                //setHttpStatusCode(404, 'Not Found');
                $this->generateErrorOutput(404, 'config', 'ERROR_NOT_FOUND', $outputFormat);
            }
        } else {
            //setHttpStatusCode(404, 'Not Found');
            $this->generateErrorOutput(404, 'config', 'ERROR_NOT_FOUND', $outputFormat);
        }
    }

    function toString($value) {
        if (!is_array($value)) {
            return $value;
        }
        $values = '';
        $size = sizeof($value);
        for ($i = 0; $i < $size; $i++) {
            str_replace(',', '\,', $value[$i]);
            $values = $values . $value[$i];
            if ($i < $size - 1) {
                $values = $values . ',';
            }
        }
        return $values;
    }

}
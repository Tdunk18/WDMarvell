<?php

/**
 * \file SafePoint/Controller/SafepointNasDevicesController.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class SafepointNasDevicesController-disable (intentionally breaking Doxygen)
 * \brief DO NOT USE. Discovers and identifies safepoint compliant NAS units.
 *
 */
class SafepointNasDevicesController /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_nas_devices';

    /**
     * \par Description:
     * Discovers a list of NAS devices on the network. Supplies info if ip_address is supplied.
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/safepoint_nas_devices/{<ip_address>}
     *
     * \param begin_discovery     String      - optional (currently not functional)
     * \param ip_address          IP Address  - optional (127.0.0.1 for localhost)
     * \param device_username     String      - optional
     * \param device_password     String      - optional
     *
     * \par Parameter Details:
     *  - begin_discovery will be true/false to start a NAS discover process.
     *  - If ip_address is supplied, user and password will be used to authenticate against the NAS.
     *  - If ip_address is supplied, "getinfo" will return for that ip.
     *  - device_username - empty for public or device username (e.g. Windows user)
     *  - device_password - empty for public or device password (e.g. Windows password)
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
     *
     * \par XML Response Example:
     * \verbatim
<safepoint_nas_devices>
    <safepoint_nas_device>
        <name>{friendly name of NAS device}</name>
        <ip_addr>{IP address of NAS device}</ip_addr>
        <type>Windows/Linux/Apple/Unknown</type>
        <product>WD/non-wd/Unknown</product>
        <modelnumber>WD model number/Unknown </modelnumber>
        <icon>none/{URL of product icon, 120x120 png format}</icon>
        <location>self/lan/wan/cloud</location>
    </safepoint_nas_device>
</safepoint_nas_devices>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        if ( !empty($urlPath[0]) ) {
            $queryParams['ip_address'] = $urlPath[0];
        }

        $queryParams = filter_var_array($queryParams, array(
            'begin_discovery' => \FILTER_VALIDATE_BOOLEAN,
            'ip_address' => \FILTER_VALIDATE_IP,
            'device_password' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    return base64_decode($string);
                }),
            'device_username' => \FILTER_SANITIZE_STRING,
                ));

        $nsptPath = $this->getConfigFileValue('WDNAS_INSTALL_PATH');
        if ($nsptPath == null) {
            throw new \Core\Rest\Exception('WDNAS_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = empty($queryParams['ip_address']) ? "--operation=discover" : "--operation=getinfo --ip_addr=" . escapeshellarg($queryParams['ip_address']) .
                " --user=" . escapeshellarg($queryParams['device_username']) .
                " --pswd=" . escapeshellarg($queryParams['device_password']);

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        $output = $retVal = null;

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/deviceExec.pl $opts 2>&1", $output, $retVal, false);

        \Core\Logger::getInstance()->info(__METHOD__ . " deviceExec.pl $opts retVal:$retVal:");
        \Core\Logger::getInstance()->info(__METHOD__ . " Output: ", $output);

        if ($retVal == 0) {
            $discoveredNASS = $this->parseNSPTResponse($output);
            $collectionList = array(self::COMPONENT_NAME => array('safepoint_nas_device' => $discoveredNASS));
            $this->generateMultipleCollectionOutputWithTypeAndCollectionName(200, self::COMPONENT_NAME, $collectionList, $outputFormat);
        } else {
            throw new \Core\Rest\Exception("deviceExec.pl exited with non-zero exit code: $retVal", 500, null, self::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Authenticate security credentials of a NAS device.
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/safepoint_nas_devices
     *
     * \param ip_address          IP Address  - optional (127.0.0.1 for localhost)
     * \param device_username     String      - optional
     * \param device_password     String      - optional
     *
     * \par Parameter Details:
     *  - ip_address is the IP Address of NAS device
     *  - device_username empty for public or device username (e.g. Windows user)
     *  - device_password empty for public or device password (e.g. Windows password)
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
<safepoint_nas_devices>
    <status>success</status>
</safepoint_nas_devices>
      \endverbatim
     */
    public function post($urlPath, $queryParams = array(), $outputFormat = 'xml') {
        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        $queryParams = filter_var_array($queryParams, array(
            'ip_addr' => \FILTER_VALIDATE_IP,
            'pswd' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    return base64_decode($string);
                }),
            'user' => \FILTER_SANITIZE_STRING,
                ));

        if (empty($queryParams['ip_addr'])) {
            throw new \Core\Rest\Exception('Bad queryParams[ip_addr]', 400, null, self::COMPONENT_NAME);
        }

        $nsptPath = $this->getConfigFileValue('WDNAS_INSTALL_PATH');
        if (empty($nsptPath)) {
            throw new \Core\Rest\Exception('WDNAS_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = "--operation=authenticate --ip_addr=" . escapeshellarg($queryParams['ip_addr']) .
                " --user=" . escapeshellarg($queryParams['user']) .
                " --pswd=" . escapeshellarg($queryParams['pswd']);

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        $output = $retVal = null;

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl {$INCLUDE_PATH} {$nsptPath}/deviceExec.pl {$opts}", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " deviceExec.pl $opts retVal:$retVal:");
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if ($retVal == 0) {
            $this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status' => 'success'), $outputFormat);
        } else {
            throw new \Core\Rest\Exception("deviceExec.pl exited with non-zero exit code: $retVal", 500, null, self::COMPONENT_NAME);
        }
    }

}


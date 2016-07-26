<?php

/**
 * \file SafePoint/Controller/NasDiscover.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class NasDiscover
 * \brief Discover NAS devices on the local network (LAN).
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class NasDiscover /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'nas_discover';

    /**
     * \par Description:
     * Discover NAS devices on the local network (LAN).
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/nas_discover
     *
     * \param option   String - optional
     *
     * \par Parameter Details:
     *  - option can only be 'abort'
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
<nas_discover>
    <nas_devices>
        <nas_device>
            <name>{friendly name of NAS device}</name>
            <ip_addr>{IP address of NAS device}</ip_addr>
            <type>Windows/Linux/Apple/Unknown</type>
            <product>WD/non-wd/Unknown</product>
            <modelnumber>WD model number/Unknown </modelnumber>
            <icon>none/{URL of product icon, 120x120 png format}</icon>
            <location>self/lan/wan/cloud</location>
        </nas_device>
    </nas_devices>
</nas_discover>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        $queryParams = filter_var_array($queryParams, array(
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                        if (!in_array($string, array('abort'))) {
                            throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                        }
                    return $string;
                }),
        ));

        $nsptPath = $this->getConfigFileValue('WDNAS_INSTALL_PATH');
        if ($nsptPath == null) {
            throw new \Core\Rest\Exception('WDNAS_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = $this->_getOpts('discover', $queryParams);

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        set_time_limit(60*5); // discovery on the coproriate network can take a few.
        $output = $retVal = null;

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/deviceExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output: $output");

        if ($retVal == 0) {
            if ($queryParams['option'] != 'abort') {
                $discoveredNASS = $this->parseNSPTResponse($output);
                $collectionList = array('nas_devices' => array('nas_device' => $discoveredNASS));
                $this->generateMultipleCollectionOutputWithTypeAndCollectionName(200, 'nas_discover', $collectionList, $outputFormat);
            } else {
                $this->generateSuccessOutput(200, self::COMPONENT_NAME, $this->getStatusCode($retVal), $outputFormat);
            }
        } else {
            throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
        }
    }

}

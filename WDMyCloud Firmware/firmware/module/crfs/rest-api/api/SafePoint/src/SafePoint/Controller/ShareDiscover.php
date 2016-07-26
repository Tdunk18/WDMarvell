<?php

/**
 * \file SafePoint/Controller/ShareDiscover.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class ShareDiscover
 * \brief Discover SMB shares that are exposed on the local network (LAN) by a NAS device
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class ShareDiscover /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'share_discover';

    /**
     * \par Description:
     * Discover SMB shares that are exposed on the local network (LAN) by a NAS device
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/share_discover
     *
     * \param option   String - optional
     * \param ip_addr  String - required
     * \param user     String - optional
     * \param pswd     String - optional
     *
     * \par Parameter Details:
     *  - option can only be 'abort'
     *  - ip_addr is the IP Address of NAS destination device or USB for the usb device.
     *  - user empty for public or device username (e.g. Windows user)
     *  - pswd empty for public or device password (e.g. Windows password)
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
<share_discover>
    <nas_shares>
        <nas_share>
            <name>{share name}</name>
            <public>{true/false}</public>
        </nas_share>
    </nas_shares>
</share_discover>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        $queryParams = filter_var_array($queryParams, array(
            'pswd' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    return base64_decode($string);
                }),
            'version' => \FILTER_VALIDATE_FLOAT,
            'ip_addr' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    if ( strtolower($string)  == 'usb' ) {
                        return 'local'; // Translation from 'usb' to 'local' for Perl script.
                    }
                    return filter_var($string, \FILTER_VALIDATE_IP);
                }),
            'user' => \FILTER_SANITIZE_STRING,
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                        if (!in_array($string, array('abort'))) {
                            throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                        }
                    return $string;
                }),
        ));

        if (empty($queryParams['ip_addr'])) {
            throw new \Core\Rest\Exception('Bad queryParams[ip_addr]', 400, null, self::COMPONENT_NAME);
        }

        $nsptPath = $this->getConfigFileValue('WDSHARE_INSTALL_PATH');
        if (empty($nsptPath)) {
              throw new \Core\Rest\Exception('WDSHARE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = $this->_getOpts('discover', $queryParams);

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        $output = $retVal = null;

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/shareExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if ($retVal == 0) {
            if ($queryParams['option'] != 'abort') {
                $discoveredShares = $this->parseNSPTResponse($output);
                $collectionList = array('nas_shares' => array('nas_share' => $discoveredShares));
                $this->generateMultipleCollectionOutputWithTypeAndCollectionName(200, self::COMPONENT_NAME, $collectionList, $outputFormat);
            } else {
                $this->generateSuccessOutput(200, self::COMPONENT_NAME, $this->getStatusCode($retVal), $outputFormat);
            }
        } else {
            throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
        }
    }

}

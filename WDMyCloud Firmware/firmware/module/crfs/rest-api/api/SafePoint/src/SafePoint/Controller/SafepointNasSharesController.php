<?php

/**
 * \file SafePoint/Controller/SafepointNasSharesController.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class SafepointNasSharesController-disable (intentionally breaking Doxygen)
 * \brief DO NOT USE. Discovers and identifies shares on safepoint compliant NAS units.
 */
class SafepointNasSharesController /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_nas_shares';

    /**
     * \par Description:
     * Discover SMB shares that are exposed on the local network (LAN) by a NAS device
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/safepoint_nas_shares/{<ip_address>}
     *
     * \param ip_address          IP Address  - required (127.0.0.1 for localhost)
     * \param device_username     String      - optional
     * \param device_password     String      - optional
     *
     * \par Parameter Details:
     *  - ip_address - IP of a safepoint compliant NAS unit (127.0.0.1 for self)
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

        if (!empty($urlPath[0])) {
            $queryParams['ip_address'] = $urlPath[0];
        }

        $queryParams = filter_var_array($queryParams, array(
            'ip_address' => \FILTER_VALIDATE_IP,
            'device_password' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    return base64_decode($string);
                }),
            'device_username' => \FILTER_SANITIZE_STRING,
                ));


        if (empty($queryParams['ip_address'])) {
            throw new \Core\Rest\Exception('Bad queryParams[ip_address]', 400, null, self::COMPONENT_NAME);
        }

        $nsptPath = $this->getConfigFileValue('WDSHARE_INSTALL_PATH');
        if (empty($nsptPath)) {
            throw new \Core\Rest\Exception('WDSHARE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = "--operation=discover --ip_addr=" . escapeshellarg($queryParams['ip_addr']) .
                " --option=" . escapeshellarg($queryParams['option']) .
                " --user=" . escapeshellarg($queryParams['user']) .
                " --pswd=" . escapeshellarg($queryParams['pswd']);

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        $output = $retVal = null;

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/shareExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " shareExec.pl $opts retVal:$retVal:");
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if ($retVal == 0) {
            $this->generateMultipleCollectionOutputWithTypeAndCollectionName(200, self::COMPONENT_NAME, array('nas_shares' => array('nas_share' => $this->parseNSPTResponse($output))), $outputFormat);
        } else {
            throw new \Core\Rest\Exception("shareExec.pl exited with non-zero exit code: $retVal", 500, null, self::COMPONENT_NAME);
        }
    }

}


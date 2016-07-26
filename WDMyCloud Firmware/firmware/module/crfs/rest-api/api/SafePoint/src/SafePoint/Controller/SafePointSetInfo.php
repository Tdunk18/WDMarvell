<?php

namespace SafePoint\Controller;

// Copyright (c) [2011] Western Digital Technologies, Inc. All rights reserved.

/**
 * \file SafePoint/Controller/SafePointSetInfo.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class SafePointSetInfo
 * \brief Used for updating safe point info.
 *
 */
class SafePointSetInfo {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_setinfo';

    /**
     * \par Description:
     * Set safe-point information. The safe-point must be activated and in managed list of NSPT before invoking this operation.
     * A safe-point on a target share can have its information set only if it was owned by the local NAS device.
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/safepoint_setinfo
     *
     * \param option          String - optional
     * \param user            String - optional
     * \param pswd     		  String - optional
     * \param handle   		  String - optional
     * \param name      	  String - optional
     * \param description     String - optional
     *
     * \par Parameter Details:
     *  - option can only be 'abort'
     *  - user empty for public or device username (e.g. Windows user)
     *  - pswd empty for public or device password (e.g. Windows password)
     *  - name empty/new name of the safe-point
     *  - description empty/new description of the safe-point
     *  - handle - handle of safe-point
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     * .
     * \par Status Codes:
     *  - OK
     *  - INVALID
     *  - FAILED
     *  - UNAUTHORIZED
     *  - NOTFOUND
     *
     * \par XML Response Example:
     * \verbatim
<safepoint_setinfo>
    <status_code>{status code}</status_code>
    <status_name>OK</status_name>
</safepoint_setinfo>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        $queryParams = filter_var_array($queryParams, array(
            'pswd' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    return base64_decode($string);
                }),
            'name' => \FILTER_SANITIZE_STRING,
            'user' => \FILTER_SANITIZE_STRING,
            'description' => \FILTER_SANITIZE_STRING,
            'handle' => \FILTER_SANITIZE_STRING,
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtolower($string);
                    if (!in_array($string, array('abort'))) {
                        throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
                ));

        if (empty($queryParams['handle'])) {
            throw new \Core\Rest\Exception('Bad queryParams[handle]', 400, null, self::COMPONENT_NAME);
        }

        $nsptPath = $this->getConfigFileValue('WDSAFE_INSTALL_PATH');
        if (empty($nsptPath)) {
            throw new \Core\Rest\Exception('WDSAFE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = $this->_getOpts('setinfo', $queryParams);

        $output=$retVal=null;

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/safeptExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if ($retVal == 0 || $retVal == NSPT_INPROGRESS) {
            $this->generateSuccessOutput(200, self::COMPONENT_NAME, $this->getStatusCode($retVal), $outputFormat);
        } else {
            throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
        }
    }

}
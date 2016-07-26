<?php
/**
 * \file SafePoint/Controller/SafePointDestroy.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
namespace SafePoint\Controller;

/**
 * \class SafePointDestroy
 * \brief Destroy a managed SafePoint. Only if the SafePoint is owned by the NAS device
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class SafePointDestroy {

	use \Core\RestComponent;
	use SafePointTraitController;

	const COMPONENT_NAME = 'safepoint_destroy';

	/**
	 * \par Description:
	 * - Destroy a safepoint
	 *
	 * \par Security:
     * - Admin LAN request only.
	 *
	 * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/safepoint_destroy
     *
     * \param option   String - optional
     * \param handle   String - required
     * \param priority String - optional
     *
     * \par parameter details
	 * - option   - {abort}
	 * - handle   - handle of safepoint
	 * - priority - (normal/below/above}
	 *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     *
     * \par Legacy Zermatt Error Names:
     *  - OK
     *  - FAILED
     *  - INVALID
     *  - NOTFOUND
     *  - BUSY
     *  - UNREACHABLE
     *
     * \par XML Response on Success:
     * \verbatim
<safepoint_destroy>
    <status_code>{status code}</status_code>
    <status_name>OK</status_name>
</safepoint_destroy>
      \endverbatim
     * \par XML Responce on Failure:
	 * \verbatim
<safepoint_destroy>
    <status_code>{status code}</status_code>
    <status_name>{error status name}</status_name>
    <status_desc>{any status description}</status_desc>
</safepoint_destroy>
      \endverbatim
 	 */
    public function delete($urlPath, $queryParams=null, $outputFormat='xml'){

        $queryParams = filter_var_array($queryParams, array(
            'handle' => \FILTER_SANITIZE_STRING,
            'priority' => array('filter' => \FILTER_CALLBACK,
                'options' => 'strtolower',
            ),
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function ($string) {
                                    $string = strtolower($string);
                        if (!in_array($string, array('abort', 'dryrun'))) {
                            throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                        }
                    return $string;

                }),
                ));

        if( empty($queryParams['handle']) ) {
        	throw new \Core\Rest\Exception('Bad queryParams[handle]', 400, null, self::COMPONENT_NAME);
        }

        $nsptPath = $this->getConfigFileValue('WDSAFE_INSTALL_PATH');
        if($nsptPath === NULL) {
        	throw new \Core\Rest\Exception('WDSAFE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }

        $opts = $this->_getOpts('destroy', $queryParams);

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');
        $retVal = $output = null;

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/safeptExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if($retVal == 0 || $retVal == NSPT_INPROGRESS) {
            $status = $this->getStatusCode($retVal);
            $this->generateSuccessOutput(200, self::COMPONENT_NAME, array('status_code'=> NSPT_BASE_ERROR+$retVal, 'status_name' => $status['status_name'] ), $outputFormat);
        }
        else
        {
            throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
        }
    }

}
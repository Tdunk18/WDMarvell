<?php

/**
 * \file SafePoint/Controller/SafePointGetStatus.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * \class SafePointGetStatus
 * \brief Get current progress of safe-point action.
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class SafePointGetStatus /* extends AbstractActionController */ {

    use \Core\RestComponent;
    use SafePointTraitController;

    const COMPONENT_NAME = 'safepoint_getstatus';

    /**
     * \par Description:
     * Get current progress of safe-point action. This operation provides the status of an in-progress
     * action or the status of the last instance of the safe-point action. The safe-point must be
     * activated and in managed list of NSPT before invoking the restore operation.
     *
     * Note: This operation should be invoked after executing create/update/destroy/restore
     * operations to determine current status of the action.
     *
     * "OK" status not required for successful GET operation
     *
     * \par Security:
     * - Admin LAN request only.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/safepoint_getstatus
     *
     * \param option   String - optional
     * \param handle   String - required
     * \param action   String - requried
     *
     * \par Parameter Details:
     *  - option can only be one of: abort.
     *  - handle is the handle of safe-point.
     *  - action can only be one of: create, update, destroy, restore
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     *
     * \par Legacy Zermatt Error Names:
     *  - FAILED
     *  - INVALID
     *  - NOTFOUND
     *  - NOSPACE
     *  - UNREACHABLE
     *
     * \par XML Response Example:
     * \verbatim
<safepoint_getstatus>
    <progress>
        <action_state>{ok/failed/aborted/inprogress}</action_state>
        <ts_start>{timestamp action started}</ts¬_start>
        <ts_end>{timestamp action ended/estimated}</ts_end>
        <total_size>{total size of safe-point in MB}</total_size>
        <size_processed>{size of safe-point copied}</size_processed>
        <dataset>
            <type>system/backup/share</type>
            <name>{dataset name}</name>
            <ts_start>{dataset start ts}</ts_start>
            <ts_end>{dataset estimate ts}</ts_end>
            <state>ok/failed/inprogress</state>
            <total_size>{dataset size total}</total_size>
            <size_processed>{dataset size copied}</size_processed>
        </dataset>
    </progress>
</safepoint_getstatus>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        \Core\Logger::getInstance()->info(__METHOD__ . ' PARAMS: ', $queryParams);

        $queryParams = filter_var_array($queryParams, array(
            'handle' => \FILTER_SANITIZE_STRING,
            'action' => array('filter' => \FILTER_CALLBACK,
                'options' => 'strtolower',
            ),
            'option' => array('filter' => \FILTER_CALLBACK,
                'options' => function($string) {
                    $string = strtolower($string);
                    if (!in_array($string, array('abort'))) {
                        throw new \Core\Rest\Exception('Bad queryParams[option]', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }),
                ));

        if (empty($queryParams['handle'])) { // Typo in message was there originally; leaving incase they check against string.
            throw new \Core\Rest\Exception('Bad input handle]', 400, null, self::COMPONENT_NAME);
        }

        if (!in_array($queryParams['action'], array('create', 'update', 'destroy', 'restore'))) {
            throw new \Core\Rest\Exception('Bad input action', 400, null, self::COMPONENT_NAME);
        }

        $nsptPath = $this->getConfigFileValue('WDSAFE_INSTALL_PATH');
        if (empty($nsptPath)) {
            throw new \Core\Rest\Exception('WDSAFE_INSTALL_PATH missing', 500, null, self::COMPONENT_NAME);
        }


        $opts = $this->_getOpts('getstatus', $queryParams);

        $INCLUDE_PATH = $this->getConfigFileValue('INCLUDE_PATH');

        $output = $retVal = null;

        // Parameters hardcoded and escaped above.
        exec_runtime("sudo perl $INCLUDE_PATH $nsptPath/safeptExec.pl $opts", $output, $retVal, false);
        \Core\Logger::getInstance()->info(__METHOD__ . " Output:", $output);

        if ($retVal == 0) {
            if ($queryParams['option'] != 'abort') {
                $info = $this->parseNSPTResponse($output);
                
                $progress = array();
                $progress['action_state'] = $info[0]['action_state'];
                $progress['ts_start'] = $info[0]['ts_start'];
                $progress['ts_end'] = $info[0]['ts_end'];
                $progress['total_size'] = $info[0]['total_size'];
                $progress['size_processed'] = $info[0]['size_processed'];
                
                $dataset = array();
                $dataset['type'] = $info[0]['dataset_type'];
                $dataset['name'] = $info[0]['dataset_name'];
                $dataset['ts_start'] = $info[0]['dataset_ts_start'];
                $dataset['ts_end'] = $info[0]['dataset_ts_end'];
                $dataset['state'] = $info[0]['dataset_state'];
                $dataset['total_size'] = $info[0]['dataset_total_size'];
                $dataset['size_processed'] = $info[0]['dataset_size_processed'];

                $output = new \OutputWriter(strtoupper($outputFormat));

                $output->pushElement('safepoint_getstatus');
                $output->pushElement('progress');
                $output->element('action_state', $progress['action_state']);
                $output->element('ts_start', $progress['ts_start']);
                $output->element('ts_end', $progress['ts_end']);
                $output->element('total_size', $progress['total_size']);
                $output->element('size_processed', $progress['size_processed']);
                //Would have been a collection, if not for 'dataset'
                $output->pushElement('dataset');
                $output->element('type', $dataset['type']);
                $output->element('name', $dataset['name']);
                $output->element('ts_start', $dataset['ts_start']);
                $output->element('ts_end', $dataset['ts_end']);
                $output->element('state', $dataset['state']);
                $output->element('total_size', $dataset['total_size']);
                $output->element('size_processed', $dataset['size_processed']);

                $output->popElement();
                $output->popElement();
                $output->popElement();
                $output->close();
            } else {
                $this->generateSuccessOutput(200, self::COMPONENT_NAME, $this->getStatusCode($retVal), $outputFormat);
            }
        } else if ($retVal == NSPT_INPROGRESS) {
            $this->generateSuccessOutput(200, self::COMPONENT_NAME, $this->getStatusCode($retVal), $outputFormat);
        } else {
            throw new \Core\Rest\Exception('SAFEPOINT_' . $this->getStatusCode($retVal)['status_name'], 500, null, self::COMPONENT_NAME);
        }

    }

}

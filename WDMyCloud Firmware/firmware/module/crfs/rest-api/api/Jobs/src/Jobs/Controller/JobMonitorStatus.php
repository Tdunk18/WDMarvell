<?php
/*
namespace Jobs\Controller;
use Jobs\Common;
use Jobs\Common\JobMonitor;

/**
 * \file jobs/jobs.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
/*require_once(COMMON_ROOT . '/includes/logmessages.inc');

/**
 * \class JobMonitorStatus
 * \brief Retrive & Set JobMonitor Status.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 */
/*class JobMonitorStatus /* extends AbstractActionController {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'jobmonitor_status';

    function __construct() {
    }

    /**
     * \par Description:
     * - Get status of the Job Monitor and state of the Process (running/not running). The process state 'not running'
     * is not a necessarily an error condition. The first or subsequent job submission should start the job monitor process.
     *
     * \par Security:
     * - Any authenticated user can use this component.
     *
     * \par HTTP Method: GET
     * - http://<hostname>/api/1.0/rest/jobmonitor_status/
     *
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - The default value for the format parameter is xml.
     *
     * \retval XML Response as below.
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Job Monitor status get failed or Internal server error
     *
     * \par Error Codes:
     * - 57  -  USER_NOT_AUTHORIZED - User not authorized.
     * - 356 -  JOBMONITOR_STATUS_GET_FAILED - Job monitor status get failed
     * - 361 -  JOBS_NOT_SUPPORTED - Jobs functionality not supported.
     *
     * \par XML Response Example:
     * \verbatim
      <?xml version="1.0" encoding="utf-8"?>
        <jobmonitor_status>
            <status>enabled|disabled</status>
            <process>running|not running</process>
        </jobmonitor_status>
      \endverbatim

    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        // First check the if the Jobs funcationality supported...
        if(!JobMonitor::getInstance()->isJobsSupported()){
            throw new \Core\Rest\Exception('JOBS_NOT_SUPPORTED', 400, NULL, static::COMPONENT_NAME);
        }
        try {
            $monitor = JobMonitor::getInstance();

            $outWriter = new \OutputWriter($outputFormat);
            $outWriter->pushElement("jobmonitor_status");

            $monitorStatus = $monitor->getMonitorStatus();

            $outWriter->element("status", $monitorStatus);
            if($monitor->isRunning())
            {
                $outWriter->element("process", "running");
            }
            else
            {
                $outWriter->element("process", "not running");
            }
            $outWriter->popElement(); // status element
            $outWriter->close();
            return;
        }
        catch(\Exception $e) {
            $this->generateErrorOutput(500, static::COMPONENT_NAME, 'JOBMONITOR_STATUS_GET_FAILED', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Used for enabling or disabling job processing functionality (monitor status).
     *
     * \par Security:
     * - Any authenticated user user can update job monitor status.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/1.0/rest/jobmonitor_status/
     *
     * \param status     boolean - required
     * \param format     String  - optional (default is xml)
     *
     * \par Parameter Details:
     * status - {enable/disable} to specify job (Async) processing allowed or not.
     *
     *
     * \retval status   String  - success
     *
     * \par Error Codes:
     * - 33  -  INVALID_PARAMETER - Invalid parameter.
     * - 41  -  PARAMETER_MISSING - Parameter is missing.
     * - 57  -  USER_NOT_AUTHORIZED - User not authorized.
     * - 357 -  JOBMONITOR_STATUS_INVALID - Invalid job monitor status in put.
     * - 361 -  JOBS_NOT_SUPPORTED - Jobs functionality not supported.
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <jobmonitor_status>
        <status>success</status>
       </jobmonitor_status>
      \endverbatim

    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        // First check the if the Jobs funcationality supported...
        if(!JobMonitor::getInstance()->isJobsSupported()){
            throw new \Core\Rest\Exception('JOBS_NOT_SUPPORTED', 400, NULL, static::COMPONENT_NAME);
        }

        $jobmonitor_status = isset($queryParams['status']) ? strtolower(trim($queryParams['status'])) : null;

        if (!isset($jobmonitor_status)) {
            $this->generateErrorOutput(400, static::COMPONENT_NAME, 'PARAMETER_MISSING', $outputFormat);
            return;
        }
        $statusOption = \Jobs\Common\JobMonitor::getInstance()->getStatusOptions();
        if (isset($jobmonitor_status) && !in_array($jobmonitor_status, $statusOption)) {
            $this->generateErrorOutput(400, static::COMPONENT_NAME, 'INVALID_PARAMETER', $outputFormat);
            return;
        }

        try {
            $monitorResponse = \Jobs\Common\JobMonitor::getInstance()->setMonitorStatus($jobmonitor_status);
            if($monitorResponse){
                $results = array('status' => 'success');
                $this->generateSuccessOutput(200, static::COMPONENT_NAME, $results, $outputFormat);
            }
            else{
                $this->generateSuccessOutput(500, static::COMPONENT_NAME, 'JOBMONITOR_STATUS_PUT_FAILED', $outputFormat);
            }
        }
        catch (\Exception $e) {
            $this->generateErrorOutput(500, static::COMPONENT_NAME, 'JOBMONITOR_STATUS_PUT_FAILED', $outputFormat);
        }
    }
}
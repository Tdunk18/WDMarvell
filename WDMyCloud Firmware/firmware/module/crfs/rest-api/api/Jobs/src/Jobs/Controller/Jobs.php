<?php

namespace Jobs\Controller;
use Jobs\JobManager;
use Jobs\Common;
use Jobs\Common\JobMonitor;
use OutputWriter;

/**
 * \file jobs/jobs.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/outputwriter.inc');

/**
 * \class Jobs
 * \brief Retrive Jobs.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 */
class Jobs /* extends AbstractActionController */ {

    use \Core\RestComponent;
    
    const COMPONENT_NAME = 'jobs';
    

    function __construct() {
    }

    /**
     * \par Description:
     * - Get attributes of specified Job.
     *
     * \par Security:
     * - Only authenticated users can use this component.
     *
     * \par HTTP Method: GET
     * - http://<hostname>/api/1.0/rest/jobs/{job_id}
     *
     * \param job_id                Integer - optional, when provided all other parameters ignored
     * \param status                String  - optional (waiting/running/canceled/completed/failed/paused)
     * \param format                String  - optional (default is xml)
     * \param creation_time         Integer - optional
     * \param start_time            Integer - optional
     * \param completion_time       Integer - optional
     *
     * \par Parameter Details:
     * - job_id: the job id when provided all other parameters are ignored. This param is mutually exclusive with all other parameters.
     * - status: the job status, when provided with other parameters then all are logically ANDed with this parameter. Attribute value can be one of {waiting, completed, running or failed}
     * - creation_time: is the create time of the job, this is in Unix timestamp when provided with other parameters then all are logically ANDed with this parameter
     * - start_time: is the start time of the job, this is in Unix timestamp when provided with other parameters then all are logically ANDed with this parameter
     * - completion_time: is the complete time of the job, this is in Unix timestamp when provided with other parameters then all are logically ANDed with this parameter
     * - format: the default value for the format parameter is xml.

     * \retval XML Response as below.
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized to retrieve alerts.
     * - 220 - JOBS_NOT_FOUND - Job not found.
     * - 236 - ERROR_NOT_FOUND - requested resource not found.
     * - 357 - JOBS_ACCESS_FAILED - Job access failed.
     * - 361 - JOBS_NOT_SUPPORTED - Jobs functionality not supported.
     *
     * \par XML Response Example:
     * \verbatim
        <?xml version="1.0" encoding="utf-8"?>
        <jobs>
          <job>
            <job_id>1</job_id>
            <status>completed</status>
            <username>admin</username>
            <comment></comment>
            <task_details>
              <component>{name of the component for which the job was submitted. Ex:storage_active_transfer}</component>
              <recursive></recursive>
              <src_path></src_path>
              <dest_path></dest_path>
              <copy></copy>
              <overwrite></overwrite>
            </task_details>
            <create_time>1397848871</create_time>
            <start_time>1397848871</start_time>
            <complete_time>1397848873</complete_time>
            <total_work>4045</total_work>
            <complete_work>4045</complete_work>
          </job>
        </jobs>
     \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        // First check the if the Jobs funcationality supported...
        if(!JobMonitor::getInstance()->isJobsSupported()){
            throw new \Core\Rest\Exception('JOBS_NOT_SUPPORTED', 400, NULL, static::COMPONENT_NAME);
        }

        $jobId = isset($urlPath[0]) ? $urlPath[0] : NULL;
        $status = getParameter($queryParams, "status", \PDO::PARAM_STR, NULL, false);
        $username = null;
        $device_user_id = null;
        /*Since, we do not need to perform search on the basis of username and device_user_id, deprecating these two elements from doxygen as well as controller.
         * But, keeping the code as it might be an option for future enhancements.*/
           //$username = getParameter($queryParams, "username", \PDO::PARAM_STR, NULL, false);
           //$device_user_id = getParameter($queryParams, "device_user_id", \PDO::PARAM_STR, NULL, false);
        $create_time = getParameter($queryParams, "create_time", \PDO::PARAM_INT, NULL, false);
        $start_time = getParameter($queryParams, "start_time", \PDO::PARAM_INT, NULL, false);
        $complete_time = getParameter($queryParams, "complete_time", \PDO::PARAM_INT, NULL, false);

        try {
            $job_manager = JobManager::getInstance();
            $returnJobs = $job_manager->getDetails($jobId, $status, $username, $device_user_id,
                                                   $create_time, $start_time, $complete_time);
            if($returnJobs == 'USER_NOT_AUTHORIZED') {
                $this->generateErrorOutput(401, 'jobs', 'USER_NOT_AUTHORIZED', $outputFormat);
            }
            else if(empty($returnJobs) && isset($jobId)) {
                $this->generateErrorOutput(404, 'jobs', 'JOBS_NOT_FOUND', $outputFormat);
            }
            else {
                $this->generateNestedJobsCollectionOutput(200, 'jobs', 'job', $returnJobs, $outputFormat);
            }
        }
        catch(\Exception $e) {
            $this->generateErrorOutput(500, 'jobs', 'JOBS_ACCESS_FAILED', $outputFormat);
        }
        catch (\PDOException $pe) {
            $this->generateErrorOutput(500, 'jobs', 'JOBS_ACCESS_FAILED', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Update an existing job attribute information such as status & comment.
     * If any system failure occurs while a job is in running or waiting status, after system gets rebooted, that job will be updated to status 'failure' and an error message
     * "SYSTEM_SHUTDOWN_FAILURE".
     *
     * \par Security:
     * - Only the jobs owner or admin user can update a job.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/1.0/rest/jobs/job_id
     *
     * \param job_id           Integer - required
     * \param action           String  - optional
     * \param async_comment    String  - optional
     * \param format           String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - job_id - the Job Id to be updated, either to cancel the execution or update the asyn_comment (job description)
     * - action - based on the value of this variable, the status of the job will change. The acceptable value is 'cancel' only
     * - async_comment - the user comment when provided will update the job description accordingly
     *
     *
     * \retval status   String  - success
     *
     * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - User not authorized.
     * - 215 - JOBS_ID_MISSING - Job id missing.
     * - 220 - JOBS_NOT_FOUND - Job not found.
     * - 350 - JOBS_PUT_STATUS_INVALID - Invalid job status in put
     * - 351 - JOBS_PUT_NOT_WAITING - Job not in waiting state, cannot cancel
     * - 352 - JOBS_PUT_NOPARAMS - Job put no parameters specified
     * - 357 - JOBS_ACCESS_FAILED - Job access failed.
     * - 361 - JOBS_NOT_SUPPORTED - Jobs functionality not supported.
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
      <jobs>
        <status>success</status>
       </jobs>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        // First check the if the Jobs funcationality supported...
        if(!JobMonitor::getInstance()->isJobsSupported()){
            throw new \Core\Rest\Exception('JOBS_NOT_SUPPORTED', 400, NULL, static::COMPONENT_NAME);
        }

        $jobId = isset($urlPath[0]) ? $urlPath[0] : NULL;
        $status = getParameter($queryParams, "action", \PDO::PARAM_STR, NULL, false);
        $async_comment = getParameter($queryParams, "async_comment", \PDO::PARAM_STR, NULL, false);

        if(!isset($jobId)) {
            $this->generateErrorOutput(400, 'jobs', 'JOBS_ID_MISSING', $outputFormat);
            return;
        }
        if(isset($status) && strcasecmp($status, 'cancel') != 0) {
            $this->generateErrorOutput(400, 'jobs', 'JOBS_PUT_STATUS_INVALID', $outputFormat);
            return;
        }
        if($status==null && $async_comment==null) {
            $this->generateErrorOutput(400, 'jobs', 'JOBS_PUT_NOPARAMS', $outputFormat);
            return;
        }
        
        //sanitize comment
        $async_comment = filter_var($async_comment, FILTER_SANITIZE_STRING);     	
        
        try {
            $job_manager = JobManager::getInstance();

            $put_status = $job_manager->put($jobId, $status, $async_comment);
            if($put_status == 'OK') {
                $this->generateItemOutput(200, 'jobs', array('status'=>'success'), $outputFormat);
            }
            else if($put_status == 'JOBS_NOT_FOUND') {
                $this->generateErrorOutput(404, 'jobs', $put_status, $outputFormat);
            }
            else {
                $this->generateErrorOutput(403, 'jobs', $put_status, $outputFormat);
            }
        }
        catch (\Exception $e) {
            $this->generateErrorOutput(500, 'jobs', 'JOBS_ACCESS_FAILED', $outputFormat);
        }
        catch (\PDOException $pe) {
            $this->generateErrorOutput(500, 'jobs', 'JOBS_ACCESS_FAILED', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Delete an existing job.
     *
     * \par Security:
     * - Only the job owner or admin user can delete the job.
     *
     * \par HTTP Method: DELETE
     * http://localhost/api/1.0/rest/jobs/job_id
     *
     * \param job_id Integer - required
     * \param format String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - job_id - the job id to be deleted.
     *
     * \retval status String - success
     *
     * * \par Error Codes:
     * - 57  - USER_NOT_AUTHORIZED - User not authorized
     * - 215 - JOBS_ID_MISSING - Job id missing
     * - 220 - JOBS_NOT_FOUND - Job not found
     * - 353 - JOBS_DELETE_JOB_RUNNING - Job still running, cannot be deleted
     * - 357 - JOBS_ACCESS_FAILED - Job access failed.
     * - 361 - JOBS_NOT_SUPPORTED - Jobs functionality not supported.
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
      <job>
      <status>success</status>
      </job>
      \endverbatim
     */
    public function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {
        // First check the if the Jobs funcationality supported...
        if(!JobMonitor::getInstance()->isJobsSupported()){
            throw new \Core\Rest\Exception('JOBS_NOT_SUPPORTED', 400, NULL, static::COMPONENT_NAME);
        }

        $jobId = isset($urlPath[0]) ? $urlPath[0] : NULL;
        if(!isset($jobId)) {
            $this->generateErrorOutput(400, 'jobs', 'JOBS_ID_MISSING', $outputFormat);
            return;
        }

        try {
            $job_manager = JobManager::getInstance();

            $put_status = $job_manager->delete($jobId);
            if($put_status == 'OK') {
                $this->generateItemOutput(200, 'jobs', array('status'=>'success'), $outputFormat);
            }
            else if($put_status == 'JOBS_NOT_FOUND') {
                $this->generateErrorOutput(404, 'jobs', $put_status, $outputFormat);
            }
            else if($put_status == 'USER_NOT_AUTHORIZED') {
                $this->generateErrorOutput(401, 'jobs', $put_status, $outputFormat);
            }
            else {
                $this->generateErrorOutput(403, 'jobs', $put_status, $outputFormat);
            }
        }
        catch (\Exception $e) {
            $this->generateErrorOutput(500, 'jobs', 'JOBS_ACCESS_FAILED', $outputFormat);
        }
        catch (\PDOException $pe) {
            $this->generateErrorOutput(500, 'jobs', 'JOBS_ACCESS_FAILED', $outputFormat);
        }
    }

    /**
     * @param $statusCode
     * @param $compName
     * @param $itemName
     * @param $items
     * @param $outputFormat
     */
    private function generateNestedJobsCollectionOutput($statusCode, $compName, $itemName, $items, $outputFormat) {
        ob_start();
        $isFirstElement = 1;
        setHttpStatusCode($statusCode);
        $output = new OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($compName);
        $output->pushArray($itemName);
        foreach ($items as $key => $item) {
            //$output->pushElement($itemName);
            $output->pushArrayElement();

            if (strtoupper($outputFormat) == 'HTML') {
                if ($isFirstElement) {
                    $isFirstElement = 0;
                    echo '<tr>';
                    foreach ($item as $key => $val) {
                        echo '<th>' . $key . '</th>';
                    }
                    echo '</tr>';
                }
            }

            if (isset($item) && is_array($item)) {
                foreach ($item as $key => $val) {
                    if(isset($val) && \is_array($val)) {
                        $output->pushArray($key);
                        $output->pushArrayElement();
                        foreach($val as $subKey => $subVal){
                                $output->element($subKey, $subVal);
                        }
                        $output->popArrayElement();
                        $output->popArray();
                    }
                    else {
                        $output->element($key, $val);
                    }
                }
            } else if (is_object($item)) {
                $objAsArray = $item->toArray();
                foreach ($objAsArray as $key => $val) {
                    $output->element($key, $val);
                }
            }
            $output->popArrayElement();
        }
        $output->popArray();
        $output->popElement();
        $output->close();
    }
}
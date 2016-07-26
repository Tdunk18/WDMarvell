<?php

/**
 * \file Jobs/Common/TaskManager.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */

namespace Jobs\Common;
use \Auth\User\UserSecurity;

require_once JOBS_ROOT.'/includes/jobsconstants.inc';
require_once(COMMON_ROOT . '/includes/requestscope.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once FILESYSTEM_ROOT . '/includes/fileputworker.inc';
require_once FILESYSTEM_ROOT . '/includes/dirputworker.inc';
require_once STORAGE_ROOT . '/src/Storage/Transfer/Common/StorageTransferPutWorker.php';

class TaskManager {
    private $Job_Cloud_Sources;
    public function __construct() {
        $this->Job_Cloud_Sources = array('@DROPBOX','@GOOGLEDRIVE','@SKYDRIVE');
    }

    /**
     * Abort PHP task or any other shell command executing this job
     * @param type $jobId
     */
    public function cancelTask($jobId) {
        //@TODO add cancel logic here
        // Already in process of cancelling this job?

    }

    public function executeTask($jobID, \Jobs\JobManager $job_manager) {
        // Flag this job as being running
        //$job_manager->updateJobStateStarted($jobID);

        try {
            // Fetch job details
            $jobdetails = $job_manager->getDetailsById($jobID, false);

            // Get Component details to invoke respective Worker..
            $component = apc_fetch('COMPONENT_CONFIG_'.strtoupper($jobdetails[0]['component']));
            \Core\Logger::getInstance()->err("TaskManager::executeTask() - ComponentName=". $component);
            //$controller = new $component['controller_class'];
            $urlPath = json_decode($jobdetails[0]['descriptor'], true);
            $urlPath = explode("/", substr($urlPath['src_path'], 1));
            if($jobdetails[0]['descriptor_type'] !== 'NONCLOUD') {
                array_unshift($urlPath, '@'.$jobdetails[0]['descriptor_type']);
            }
            $queryParams = json_decode($jobdetails[0]['descriptor'], true);
            $queryParams['request_method'] = $jobdetails[0]['request_method'];

            // Is this a test? Then accept submission but don't run immediately
            if(isset($queryParams['async_test']) && $queryParams['async_test']=='skip_job_start') {
                return;
            } // Else, authenticate user and start the respective Job execution...

            // Check the Component (Request) type and execute appropriate Worker Object
            //\Core\Logger::getInstance()->err("TaskManager::executeTask() - Processing JobId=". $jobID);
            if($component['name'] === 'file') { // File Job execution...
                // Authenticate & Set user login session context
                $this->authenticateUser($urlPath, $queryParams, $jobdetails[0]['username']);
                // Set Job state to 'running'...
                $job_manager->updateJobStateStarted($jobID);
                $queryParams['async_exec'] = true;
                $this->_executeFilePutWorker($urlPath, $queryParams);
            }
            else if($component['name'] === 'dir') { // Dir File Job execution...
                // Authenticate & Set user login session context
                $this->authenticateUser($urlPath, $queryParams, $jobdetails[0]['username']);
                // Set Job state to 'running'...
                $job_manager->updateJobStateStarted($jobID);
                $queryParams['async_exec'] = true;
                $this->_executeDirPutWorker($urlPath, $queryParams);
            }
            else if($component['name'] === 'storage_active_transfer') { // Storage Transfer Job execution...
                // Set Job state to 'running'...
                $job_manager->updateJobStateStarted($jobID);
                $queryParams['async_exec'] = true;// Authenticate & Set user login session context
                $this->_executeTransferPutWorker($urlPath, $queryParams);
            }
            else {
                // Invalid or unsupported Job/Worker type
               \Core\Logger::getInstance()->err("TaskManager::executeTask() - Job type not supported. JobId=". $jobID);
                $job_manager->updateJobStateError($jobID, 400, "Job type not supported");
                return;
            }
            // The way Workers implemented, the Job may have already been canceled during Worker execution
            // and is not being escalted to TaskManager, so check if canceled else mark completed..
            // TODO: Need to refactor Workers->execute() to return appropriate messages to the caller!
            if(!$job_manager->isJobCanceled($jobID)){
                // Done, update job completed!
                $job_manager->updateJobStateCompleted($jobID);
            }
        }
        catch (\Exception $ex){
            $job_manager->updateJobStateError($jobID, $ex->getCode(), $ex->getMessage());
        }
    }

    //Verify User Authentication
    private function authenticateUser($urlPath, $queryParams, $username){
        $userSecurity = UserSecurity::getInstance();
        if(!$userSecurity->isAuthenticated($urlPath, $queryParams, false) &&
           !$userSecurity->setUserContext($username)) {
              // user login context session setup failed
              throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 403, NULL, 'core');
        }
        return true; // User authentication done, return!
    }

    /*
     * Handle FilePutWorker specific execution
     *
     * @param type $urlPath
     * @param type $queryParams
     *
     * Note: Caller should wrap the method in an exception block
     */
    private function _executeFilePutWorker($urlPath, $queryParams){

        $filePutWorker = \FilePutWorker::getInstance();
        $filePutWorker->setupWorker($urlPath, $queryParams);
        $filePutWorker->validate();
        $filePutWorker->execute();
    }
    /*
     * Handle DirPutWorker specific execution
     *
     * @param type $urlPath
     * @param type $queryParams
     *
     * Note: Caller should wrap the method in an exception block
     */
    private function _executeDirPutWorker($urlPath, $queryParams){

        $dirPutWorker = \DirPutWorker::getInstance();
        $dirPutWorker->setupWorker($urlPath, $queryParams);
        $dirPutWorker->validate();
        $dirPutWorker->execute();
    }

    /*
     * Handle Storage Transfer Type Execution
     * @param type $urlPath
     * @param type $queryParams
     *
     * Note: Caller should wrap the method in an exception block
     */

    private function _executeTransferPutWorker($urlPath, $queryParams){

        $transferPutWorker = \StorageTransferPutWorker::getInstance();
        $transferPutWorker->setupWorker($urlPath, $queryParams);
        $transferPutWorker->validate();
        $transferPutWorker->execute();
    }

    /**
     * Generates descriptor array that can be JSONed by caller to store all
     * descriptor details in db
     *
     * @param type $urlPath
     * @param type $queryParams
     */
    public function generateDescriptor($urlPath, $queryParams) {
        $descriptor = array();
        if(isset($queryParams['username'])) {
            $descriptor['details']['username'] = $queryParams['username'];
          //  $descriptor['details']['password'] = $queryParams['password'];
        }
        else if(isset($queryParams['auth_username'])) {
            //$descriptor['details']['auth_username'] = $queryParams['auth_username'];
            //$descriptor['details']['auth_password'] = $queryParams['auth_password'];
        }
        else {
           // $descriptor['details']['device_user_id'] = $queryParams['device_user_id'];
           // $descriptor['details']['device_user_auth_code'] = $queryParams['device_user_auth_code'];
        }
        $descriptor['details']['recursive'] = $queryParams['recursive'];
        if(in_array($urlPath[0], $this->Job_Cloud_Sources, true)!==false) {
            // Remote to Local movement
            $descriptor['jobtype_id'] = JOB_REMOTE_LOCAL;
            $cloud = substr($urlPath[0], 1);
            $descriptor['descriptor_type'] = $cloud;
            unset($urlPath[0]);
            $descriptor['details']['src_path'] = implode('/', $urlPath);
            $descriptor['details']['dest_path'] = $queryParams['dest_path'];
        }
        else if($queryParams['dest_path'][0]=='@') {
            // Local to Remote movement
            $query_array = explode('/', substr($queryParams['dest_path'], 1));
            $descriptor['jobtype_id'] = JOB_LOCAL_REMOTE;
            $cloud = $query_array[0];
            unset($query_array[0]);
            $descriptor['descriptor_type'] = $cloud;
            $descriptor['details']['src_path'] = '/'.implode('/', $urlPath);
            $descriptor['details']['dest_path'] = '/'.implode('/', $query_array);
        }
        else {
            $descriptor['jobtype_id'] = JOB_LOCAL;
            $descriptor['descriptor_type'] = 'NONCLOUD';
            $descriptor['details']['src_path'] = '/'.implode('/', $urlPath);
            $descriptor['details']['dest_path'] = $queryParams['dest_path'];
        }
        $descriptor['details']['copy'] = $queryParams['copy'];
        $descriptor['details']['overwrite'] = $queryParams['overwrite'];
        if(isset($cloud)) {
            switch($cloud) {
                case 'DROPBOX':
                    $descriptor['details']['access_token'] = $queryParams['access_token'];
                    $descriptor['details']['token_type'] = $queryParams['token_type'];
                    $descriptor['details']['uid'] = $queryParams['uid'];
                    break;
            }
        }
        return $descriptor;
    }

    /*
     * Method determines & returns the Chunk Size in bytes the Job Progress to be updated.
     *
     * TODO: The enhancement involves identifying the Source & Destination type to
     * determine the progress update frequency
     *
     * @param $workTotalInBytes - total work to be accomplished by the job
     * @return                  - returns the chunk size in bytes
     */
    public static function getProgressUpdateChunkSize($workTotalInBytes){
        $lowerBoundInBytes = 209715200; // Is 200MB
        $minUpdateFrequency = 3;

        if(!isset($workTotalInBytes) || $workTotalInBytes == 0) {
            return $lowerBoundInBytes;
        }

        if($workTotalInBytes <= $lowerBoundInBytes){
            return $workTotalInBytes / $minUpdateFrequency;
        }
        else {
             return $lowerBoundInBytes;
        }
    }
}

?>

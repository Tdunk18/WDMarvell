<?php

/**
 *
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */
namespace Jobs\Common;
use Jobs;
use Jobs\Common\TaskManager;
use PDO;

class JobMonitor {
	use \Core\RestComponent;

    static protected $self;
    private $job_manager;
    private $statusOptins = array('enable', 'disable');
    private $jobserver_socket_file;
    private $jobServer_socket;
    private $streamSocketServer;

    private function __construct() {
         $this->job_manager = Jobs\JobManager::getInstance();
         $this->jobserver_socket_file = getGlobalConfig('jobs')['JOBSERVER_SOCKET_FILE'];
         $this->jobServer_socket = "unix://" . $this->jobserver_socket_file;
         $this->streamSocketServer = null;
    }

    public static function getInstance() {
        if (!self::$self instanceof JobMonitor) {
            self::$self = new self();
        }
        return self::$self;
    }

    public function getStatusOptions() {
        return $this->statusOptins;
    }

    public function start() {
        if(!$this->isRunning()) {
            /*
             * Check if the Job Service is disabled else start the Service.
             */
            if(!$this->isJobsSupported()){
                echo 'Jobs functionality not supported.';
                $this->shutdownJobMonitor();
            }

          /*  if(!$this->isMonitorEnabled()){
                echo 'User disabled Jobs functionality.';
                $this->shutdownJobMonitor();
            }*/

            ignore_user_abort(true); // continue running this script even if client aborts connection
            set_time_limit(0);
            ob_end_flush();
            header("Connection: close");
            ob_start();

            // Start the Job Socket
            //
            if(!$this->startJobSocket()) {
                echo 'Jobmonitor start failed';
                $this->shutdownJobMonitor();
            }

            // Socket established...
            echo 'Jobmonitor started';
            http_response_code(202);
            header("Content-Length: ".ob_get_length());
            session_write_close(); //avoid blocking other requests
            ob_end_flush();
            flush(); //send response and close client connection

            // Get Wait times
            $jobsglobalconfig = getGlobalConfig('jobs');
            $max_job_monitor_wait_time = $jobsglobalconfig['MAX_JOB_MONITOR_WAIT_TIME'];
            $job_monitor_sleep_time = $jobsglobalconfig['JOB_MONITOR_SLEEP_TIME'];
            $current_wait_time = 0;
            //Job monitor will wait for max_wait_time before shutting down
            do{
                if($this->processJobs()){
                    $current_wait_time = 0; // processed - reset time
                }
                else{
                    sleep($job_monitor_sleep_time);
                    $current_wait_time+= $job_monitor_sleep_time;
                }
            }while($current_wait_time <= $max_job_monitor_wait_time);

            // User disabled jobs, clean socket and get out
            echo 'Job monitor has checked for waiting jobs in the queue. Start shutdown process...';
            $this->shutdownJobMonitor();
        }
        else {
            echo 'Jobmonitor already running';
        }
    }

    /**
     * Grab next "waiting" job record and execute that job
     */
    private function processJobs() {
       try {
           $job = $this->job_manager->getNextJobToProcess();
           if(is_array($job) && !empty($job)) {
               //\Core\Logger::getInstance()->err("JobMonitor::exec() - Processing JobId=". $job['job_id']);
               $taskManger = new TaskManager();
               $taskManger->executeTask($job['job_id'], $this->job_manager);
               return true;
           }
           return false;  // nothing to process
       }
       catch(\PDOException $pdoe) {
           $this->job_manager->updateJobStateError($job['job_id'], JOBSTATE_FAILED, $pdoe->getMessage());
       }
       catch(\Exception $e) {
           $this->job_manager->updateJobStateError($job['job_id'], JOBSTATE_FAILED, $e->getMessage());
       }
    }

    public function isRunning() {
        $is_running = false;
        $fp = stream_socket_client($this->jobServer_socket, $errno, $errstr);
        if($fp) {
            fclose($fp);
            $is_running = true;
        }
        return $is_running;
    }

    private function startJobSocket() {
        // Sanity check: Close scoket from past, if any.
        $this->clearJobSocket();
        $this->streamSocketServer = stream_socket_server($this->jobServer_socket, $errno, $errstr);
        if($this->streamSocketServer) {
            stream_socket_accept($this->streamSocketServer,-1);
            // Sanity check to confirm socket validity
            if(!$this->isRunning()){
                $this->streamSocketServer = null;
            }
        }
        else{
            \Core\Logger::getInstance()->err('Failed to start Job socket with ErrorCode:' . $errno . '. ErrorMsg: '. $errstr);
        }
        return $this->streamSocketServer;
    }

    private function clearJobSocket() {
        if(isset($this->streamSocketServer)){
            \socket_close($this->streamSocketServer);
        }
        \unlink($this->jobserver_socket_file);
    }

    public function shutdownJobMonitor(){
        // Do cleanup and exit - will terminate the apache instance
        // (process) running job loop
        $this->clearJobSocket();
        exit;
    }

    public function isJobsSupported() {
        $jobsglobalconfig = getGlobalConfig('jobs');
        return (filter_var($jobsglobalconfig['ENABLE_JOBS'], FILTER_VALIDATE_BOOLEAN)) ? true : false;
    }
    //Commenting all job monitor related code as API is not supporting job monitor enable/disable any longer

    /*public function isMonitorEnabled(){
        return $this->getMonitorStatus() === 'enabled' ? true : false;
    }*/

    /*public function getMonitorStatus() {
        try {
            $jobConfig = \Common\Model\GlobalConfig::getInstance()->getConfig("DYNAMICCONFIG", "jobs");
            if(!isset($jobConfig) || $jobConfig === false){
                \Core\Logger::getInstance()->err("Error getting Monitor Status from DynamicConfig . DynamicConfig may be corrupt.");
                return 'disabled';
            }
            return (
                    isset($jobConfig["JOBMONITOR_STATUS"]) &&
                    ($jobConfig["JOBMONITOR_STATUS"] === "enabled" || $jobConfig["JOBMONITOR_STATUS"] === "1" ||
                    $jobConfig["JOBMONITOR_STATUS"] === "true" || $jobConfig["JOBMONITOR_STATUS"] === true)
                    ) ? "enabled" : "disabled";
        } catch (\Exception $ex) {
            \Core\Logger::getInstance()->err("Exception reading Dynamic config to get Monitor Status. Exception: ". $ex->getMessage());
            //echo 'Exception reading Dynamic config to get Monitor Status. Exception: '. $ex->getMessage();
            return 'disabled';
        }
    }*/

    /*
     * Method to update the Monitor status with the provided new Status.
     * Updates the DynamicConfig with new Status.
     *
     * @param $newStatus - enable/disable
     */
   /* public function setMonitorStatus($newStatus){
        return $this->updateDynaConfigWithMonitorStatus($newStatus);
    }

    /*
     * Updates the DynamicConfig file with JobMonitor status (enabled or disabled)
     *
     * @param $newMonitorStatus - enable/disable
     */
   /* private function updateDynaConfigWithMonitorStatus($newMonitorStatus){
        try{
            if($newMonitorStatus === 'enable'){
                \Common\Model\GlobalConfig::getInstance()->setConfig("DYNAMICCONFIG", "jobs", "JOBMONITOR_STATUS", "enabled");
                ///
                /// Notify the Job Server to start
                \Jobs\Common\JobMonitor::triggerJobMonitor();
                return true;
            }
            else if ($newMonitorStatus === 'disable'){
                \Common\Model\GlobalConfig::getInstance()->setConfig("DYNAMICCONFIG", "jobs", "JOBMONITOR_STATUS", "disabled");
                // JobMonitor:start - regularly checks the Monitor status so no additional checks
                // or speacial notification required...
                return true;
            }
        } catch (\Exception $ex) {
            \Core\Logger::getInstance()->err("Exception updating the DynamicConfig with new Job Monitor Status (.". $newMonitorStatus. "). Exception: ". $ex->getMessage());
            return false;
        }
    }*/

    /*
     * The method triggers the JobMoniotr Instance to start. A new monitor instance would only start
     * if one is NOT already running else ignores the request to avoid more than one Monitor instance.
     *
     * Note: A helper method for consumers of Job Framework such as Controlers (e.g. File or Dir PUTs)
     * to trigger the Monitor upon receiving a new Job request.
     *
     * Reason: The WebServer may choose to put the instance to sleep mode if not active or the instance
     * was killed due to other reasons.
     *
     */
    public static function triggerJobMonitor() {
        $jobsglobalconfig = getGlobalConfig('jobs');
        ob_end_flush();
        $ch = curl_init($jobsglobalconfig['JOBMONITOR_JOBSTART_URL']);
        curl_setopt($ch, CURLOPT_VERBOSE, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
        curl_exec($ch);
        curl_close($ch);
    }
}
?>

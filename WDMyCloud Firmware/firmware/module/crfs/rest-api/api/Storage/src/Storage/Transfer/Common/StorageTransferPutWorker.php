<?php

/**
 * \storage_transfer    worker/storagetransferputworker.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
use Jobs\Common;
use Storage\Transfer\Model;

class StorageTransferPutWorker extends Common\JobWorker {

    use \Core\RestComponent;

    private $transferMode;
    static protected $self;

    public static function getInstance() {
        if (!self::$self instanceof StorageTransferPutWorker) {
            self::$self = new self();
        }
        return self::$self;
    }

    public function validate(){

        $sharePath = getSharePath();
        $shareName = $this->urlPath[0];
        if($shareName == ''){
            throw new \Core\Rest\Exception('STORAGE_TRANSFER_SOURCE_PATH_MISSING', 400, null, "storage_transfer");
        }

        $sharesDao = new \Shares\Model\Share\SharesDao();
        if (!$sharesDao->shareExists($shareName)) {
            throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, NULL, "storage_transfer");
        }

        //Default value of storage transfer mode is saved by user into the settings via storage_transfer API. If this variable is not passed it will follow this saved behaviour.
        if (isset($this->queryParams['transfer_mode']) && !((strcasecmp($this->queryParams['transfer_mode'],'move') == 0) || (strcasecmp($this->queryParams['transfer_mode'],'copy') == 0))) {
            throw new \Core\Rest\Exception('STORAGE_TRANSFER_BAD_REQUEST', 400, null, "storage_transfer");
        }
    }

    public function execute(){
        $jobId = $this->queryParams['job_id'];
        $status = '';
        $storageTransfer = (new Model\StorageTransfer())->initiateStorageTransfer($this->queryParams['transfer_mode'], $this->urlPath[0]);

        if($this->getAsync()) {

            $work = $this->getWorkTotal();
            $workTotalInBytes = $work['total_size_in_bytes'];
            $status = $work['status'];
            $workCompleteInBytes = $work['transferred_size_in_bytes'];

            $workTotalUpdated = false;
            $isFirstProgUpdate = true;
            $currentWorkComplete = $workCompleteInBytes;
            $oldWorkCompleteInBytes = $workCompleteInBytes; // need for progress updates

            do{
                if($status == 'running' && $workTotalInBytes > 0 && !$workTotalUpdated) { //While status of transfer process is running, total work needs to be updated

                    $work = $this->getWorkTotal();
                    $workTotalInBytes = $work['total_size_in_bytes'];
                    $status = $work['status'];
                    $workCompleteInBytes = $work['transferred_size_in_bytes'];

                    \Jobs\JobManager::getInstance()->setWorkTotal($jobId, $workTotalInBytes);

                    $limit = 1073741824; // 1GB limit
                    if($workTotalInBytes > $limit){
                        $progressUpdateChunkSize = \Jobs\Common\TaskManager::getProgressUpdateChunkSize($workTotalInBytes);
                    }else{
                        $progressUpdateChunkSize = 104857600; // If total size is less than 1GB update chunk will be 100 MB
                    }
                    $workTotalUpdated = true;
                }

                $work = $this->getWorkTotal();
                $status = $work['status'];
                $workTotalInBytes = $work['total_size_in_bytes'];
                $workCompleteInBytes = $work['transferred_size_in_bytes'];
                if($status == 'failed'){ //If status of the job has failed, then update that as well
                    \Jobs\JobManager::getInstance()->setWorkComplete($jobId, $workCompleteInBytes);
                    if(!$workTotalUpdated) {
                        \Jobs\JobManager::getInstance()->setWorkTotal($jobId, $workTotalInBytes);
                    }
                    throw new \Core\Rest\Exception('STORAGE_TRANSFER_FAILED', 500, null, "storage_transfer");
                }

                if(\Jobs\JobManager::getInstance()->isJobCanceled($jobId)){
                    exec_runtime("sudo /usr/local/sbin/storage_transfer_cancel_now.sh", $output, $retVal);
                    if(!$retVal){
                        $status = 'completed';
                    }
                }

                // Calc copy progress made so far & update the Job progress accordingly
                $currentWorkComplete += ($workCompleteInBytes - $oldWorkCompleteInBytes); // maintain the differential
                $oldWorkCompleteInBytes = $workCompleteInBytes;

                if( ($isFirstProgUpdate === true) || ($currentWorkComplete >= $progressUpdateChunkSize)) {
                    \Jobs\JobManager::getInstance()->setWorkComplete($jobId, $workCompleteInBytes);

                    if($currentWorkComplete > 0) // scripts issue - doesn't give work complete immediately
                        $isFirstProgUpdate = false;

                    if($currentWorkComplete >= $progressUpdateChunkSize) {
                        $currentWorkComplete = 0;
                    }
                }

                if( $status == 'completed' || ($workCompleteInBytes == $workTotalInBytes) ) {
                    if($workTotalInBytes == 0){ //If the script is sending 0/0 byte and status as complete, then complete work, total work will updated
                        \Jobs\JobManager::getInstance()->setWorkTotal($jobId, $workTotalInBytes);
                    }
                    \Jobs\JobManager::getInstance()->setWorkComplete($jobId, $workCompleteInBytes);
                }
            }while($status != 'completed');
        }
    }

    public function results(){}

    /**
     * Get the details from status script and create an Array with that data
     * @return Array
     */

    private function getWorkTotal(){
        $completedWork = array();
        exec_runtime("sudo /usr/local/sbin/storage_transfer_status.sh", $status, $retVal);
        if(!$retVal){
            foreach($status as $stats){
                $completeArray = explode('=', $stats);
                $completedWork[$completeArray[0]] = $completeArray[1];
            }
            return $completedWork;
        }
    }
}
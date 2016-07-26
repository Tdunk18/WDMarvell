<?php
/**
 * \file jobs/model/JobDB.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */

namespace Jobs\Model;

require_once(DB_ROOT . '/includes/dbaccess.inc');
require JOBS_ROOT.'/includes/jobsconstants.inc';


class JobDB extends \DBAccess {

    private $_db;

    private static $queries = array (
		'INSERT_JOB'                => "INSERT INTO Jobs(jobtype_id, jobstate_id, description, username, device_user_id, create_time)
                                        VALUES (:jobtype_id, :jobstate_id, :description, :username, :device_user_id, :create_time)",
        'INSERT_TASKDETAILS'        => "INSERT INTO TaskDetails(job_id, component, descriptor_type, descriptor, request_method, request_parameters)
                                        VALUES (:job_id, :component, :descriptor_type, :descriptor, :request_method, :request_parameters)",
        'DELETE_JOB_JOB'            => 'DELETE FROM Jobs where id = :id',
        'DELETE_JOB_DETAILS'        => 'DELETE FROM TaskDetails where job_id = :job_id',
        'UPDATE_JOB_JOBSTARTED'     => "UPDATE Jobs SET jobstate_id = :jobstate_id, start_time = :start_time WHERE id = :id",
        'UPDATE_JOB_JOBCOMPLETED'   => "UPDATE Jobs SET jobstate_id = :jobstate_id, complete_time = :complete_time WHERE id = :id",
        'UPDATE_JOB_CANCEL_COMMENTS'=> "UPDATE Jobs SET jobstate_id = :jobstate_id, description = :description, complete_time = :complete_time WHERE id = :id",
        'UPDATE_JOB_COMMENTS'       => "UPDATE Jobs SET description = :description, complete_time = :complete_time WHERE id = :id",
        'UPDATE_JOB_JOBERROR'       => "UPDATE Jobs SET jobstate_id = :jobstate_id, error_code = :error_code, error_message = :error_message WHERE id = :id",
        'UPDATE_JOB_WORKTOTAL'      => "UPDATE Jobs SET work_total = :work_total WHERE id = :id",
        'UPDATE_JOB_WORKCOMPLETE'   => "UPDATE Jobs SET work_complete = :work_complete WHERE id = :id",
        'GET_JOB_WORKTOTAL'         => 'SELECT work_total FROM Jobs WHERE id = :id',
        'GET_JOB_WORKCOMPLETE'      => 'SELECT work_complete FROM Jobs WHERE id = :id',
        'GET_JOB_ID'                => "SELECT Jobs.*, JobState.description as jobstate, TaskDetails.* from Jobs
                                        JOIN JobState ON Jobs.jobstate_id = JobState.id
                                        JOIN TaskDetails ON Jobs.id = TaskDetails.job_id
                                        where Jobs.id = :jobid",
        'GET_NEXTJOB_STATEID'       => 'SELECT J.*, T.* from Jobs J
                                        JOIN TaskDetails T  ON J.id = T.job_id
                                        where J.jobstate_id = :jobstate_id
                                        ORDER BY J.id ASC LIMIT 1',
        'GET_ALLJOBS'               => 'SELECT J.*, T.*, S.description AS jobstate  from Jobs J
                                        JOIN TaskDetails T  ON J.id = T.job_id
                                        JOIN JobState    S  ON J.jobstate_id = S.id
                                        ORDER BY J.id ASC',
        'GET_ALLJOBS_STATEID'       => 'SELECT J.*, T.*, S.description AS jobstate from Jobs J
                                        JOIN TaskDetails T  ON J.id = T.job_id
                                        JOIN JobState    S  ON J.jobstate_id = S.id
                                        where J.jobstate_id = :jobstate_id
                                        ORDER BY J.id ASC',
        'GET_ALL_JOBSTATES'         => 'SELECT * FROM JobState',

        'UPDATE_JOBS_AS_FAILED'     => "Update Jobs SET jobstate_id='5', error_code='500', error_message='SYSTEM_SHUTDOWN_FAILURE' where jobstate_id IN (1,2)",

        'SWITCH_ON_FOREIGN_KEY'     => "PRAGMA foreign_keys = ON",

        'DELETE_TWO_WEEKS_OLD JOBS' => "DELETE FROM Jobs where create_time < (strftime('%s', 'now') - 1209600))",
	);

	function __construct(){
        $this->_db = $this->_openDB();
        parent::__construct($this->_db);
    }

    /**
     *
     * Open the Jobs Db handle if already exists & validate
     * else creates & validate
     */
    private function _openDB() {
        $dbConfig = getGlobalConfig('jobs');
        $dbFilePath = $dbConfig['JOBS_DATABASE_FILE_PATH'];

        // if db file does not exist it will be created by validateVersion.
        $this->_db = new \PDO('sqlite:' . $dbFilePath);
        $this->_db->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION); // Turn on exceptions.

        \Jobs\Model\JobDbUpdate::validateVersion($this->_db);

        return $this->_db;
    }

    // Should validate if db is NULL else create and return
    public function getDB() {
        return $this->_db;
    }


	/* Create a new job
	 * */
	function createJob($jobtype_id,$description, $username, $device_user_id) {

		$bindArray = array(array(':jobtype_id', $jobtype_id, \PDO::PARAM_INT),
                                    array(':jobstate_id', 1, \PDO::PARAM_INT),
                                    array(':description',   $description,   \PDO::PARAM_STR),
                                    array(':username',      $username,      \PDO::PARAM_STR),
                                    array(':device_user_id',    $device_user_id,    \PDO::PARAM_INT),
                                    array(':create_time', time(),      \PDO::PARAM_INT) );

		return $this->executeInsert(self::$queries['INSERT_JOB'], 'INSERT_JOB', $bindArray);
	}

    /*
     * Deletes a given Job Id
     */
    function deleteJob($jobID) {
        /*$stmt = $this->_db->prepare("PRAGMA FOREIGN_KEYS=ON");
        $stmt->execute();*/
        $bindArray = array(array(':id', $jobID, \PDO::PARAM_INT));
        $this->executeInsert(self::$queries['DELETE_JOB_JOB'], 'DELETE_JOB_JOB', $bindArray);
        $bindArray = array(array(':job_id', $jobID, \PDO::PARAM_INT));
        return $this->executeQuery(self::$queries['DELETE_JOB_DETAILS'], 'DELETE_JOB_DETAILS', $bindArray);
    }

    /**
     * Create new TaskDetails record
     *
     * @param type $job_id
     * @param type $component
     * @param string $descriptor_type
     * @param string $discriptor
     * @param type $request_method
     * @param string $request_parameters
     * @return type
     */
    function createTaskDetails($job_id, $component, $descriptor_type, $discriptor, $request_method, $request_parameters) {
        $bindArray = array(array(':job_id',                $job_id, \PDO::PARAM_INT),
                            array(':component',          $component, \PDO::PARAM_STR),
                            array(':descriptor_type',    $descriptor_type,   \PDO::PARAM_STR),
                            array(':descriptor',         $discriptor,      \PDO::PARAM_STR),
                            array(':request_method',     $request_method,    \PDO::PARAM_STR),
                            array(':request_parameters', $request_parameters,      \PDO::PARAM_STR) );

        return $this->executeInsert(self::$queries['INSERT_TASKDETAILS'], 'INSERT_TASKDETAILS', $bindArray);

    }

    /**
     * Retrieve job record with specified id
     * @param type $jobId
     * @return type
     */
    function getJobById($jobId){
        $bindArray = array( array(':jobid', $jobId, \PDO::PARAM_INT));

        return $this->executeQuery(self::$queries['GET_JOB_ID'], 'GET_JOB_ID', $bindArray);
	}

    /*
     * Retrieves Jobs based on the filter criteria specified as method parameters
     *
     * Note: All attributes are logically AND'ed
     */
    function getJobDetails($status, $username, $device_user_id, $create_time, $start_time, $complete_time) {
        $job_states = $this->getAllJobStates();
        $states = array();
        foreach($job_states as $key => $val) {
            $states[$val['description']] = $val['id'];

        }
        $where = false;
        $select = 'SELECT J.*, T.*, S.description AS jobstate from Jobs J
                JOIN TaskDetails T  ON J.id = T.job_id
                JOIN JobState    S  ON J.jobstate_id = S.id';
        if($status) {
            $where = true;
            $select .= ' WHERE J.jobstate_id=' . $states[$status];
        }
        if($username) {
            if(!$where) {
                $where = true;
                $select .= ' WHERE J.username="' . $username . '"';
            }
            else {
                $select .= ' AND J.username="' . $username . '"';
            }
        }
        if($device_user_id) {
            if(!$where) {
                $where = true;
                $select .= ' WHERE J.device_user_id="' . $device_user_id .'"';
            }
            else {
                $select .= ' AND J.device_user_id="' . $device_user_id .'"';
            }
        }
        if($create_time) {
            if(!$where) {
                $where = true;
                $select .= ' WHERE J.create_time>=' . $create_time;
            }
            else {
                $select .= ' AND J.create_time>=' . $create_time;
            }
        }
        if($start_time) {
            if(!$where) {
                $where = true;
                $select .= ' WHERE J.start_time>=' . $start_time;
            }
            else {
                $select .= ' AND J.start_time>=' . $start_time;
            }
        }
        if($complete_time) {
            if(!$where) {
                $select .= ' WHERE J.complete_time>=' . $complete_time;
            }
            else {
                $select .= ' AND J.complete_time>=' . $complete_time;
            }
        }
        $select .= ' ORDER BY J.id ASC';
        return $this->executeQuery($select);
    }

    /*
     * Updates the given Job Id status as 'Running' with the Start Time specified.
     */
    function updateJobStateStarted($jobId, $jobstate_id, $start_time) {
        $bindArray = array(array(':id', $jobId, \PDO::PARAM_INT),
                            array(':jobstate_id', $jobstate_id, \PDO::PARAM_INT),
                            array(':start_time', $start_time, \PDO::PARAM_INT));
        return $this->executeQuery(self::$queries['UPDATE_JOB_JOBSTARTED'], 'UPDATE_JOB_JOBSTARTED', $bindArray);
    }

    /*
     * Updates the given Job Id status as 'Completed' with Complete Time specified.
     */
    function updateJobStateCompleted($jobId, $jobstate_id, $complete_time) {
        $bindArray = array(array(':id', $jobId, \PDO::PARAM_INT),
                            array(':jobstate_id', $jobstate_id, \PDO::PARAM_INT),
                            array(':complete_time', $complete_time, \PDO::PARAM_INT));
        return $this->executeQuery(self::$queries['UPDATE_JOB_JOBCOMPLETED'], 'UPDATE_JOB_JOBCOMPLETED', $bindArray);
    }

    /*
     * Updates the given Job Id status 'Canceled' with user comment (async_comment) if provided.
     */
    function updateJobStateCanceledWithComments($jobId, $comments) {
        $now = time();
        $bindArray = array(array(':id', $jobId, \PDO::PARAM_INT),
                            array(':jobstate_id', JOBSTATE_CANCELLED, \PDO::PARAM_INT),
                            array(':description', $comments, \PDO::PARAM_STR),
                            array(':complete_time', $now, \PDO::PARAM_INT));
        //print "<pre>";print_r($bindArray);exit;
        return $this->executeQuery(self::$queries['UPDATE_JOB_CANCEL_COMMENTS'], 'UPDATE_JOB_CANCEL_COMMENTS', $bindArray);
    }

    /*
     * Updates the given Job Id with user comment (async_comment).
     */
    function updateComments($jobId, $comments) {
        $now = time();
        $bindArray = array(array(':id', $jobId, \PDO::PARAM_INT),
                            array(':description', $comments, \PDO::PARAM_STR),
                            array(':complete_time', $now, \PDO::PARAM_INT));

        return $this->executeQuery(self::$queries['UPDATE_JOB_COMMENTS'], 'UPDATE_JOB_COMMENTS', $bindArray);
    }

    /*
     * Updates the given Job Id status as 'Failed' with the error info provided.
     */
    function updateJobStateError($jobId, $jobstate_id, $error_code, $error_message) {
        $bindArray = array(array(':id', $jobId, \PDO::PARAM_INT),
                            array(':jobstate_id', $jobstate_id, \PDO::PARAM_INT),
                            array(':error_code', $error_code, \PDO::PARAM_INT),
                            array(':error_message', $error_message, \PDO::PARAM_STR));
        return $this->executeQuery(self::$queries['UPDATE_JOB_JOBERROR'], 'UPDATE_JOB_JOBERROR', $bindArray);
    }

    /**
     * update work_total
     * @param type $jobId
     * @param type $work_total
     * @return type
     */
    function setWorkTotal($jobId, $work_total) {
        $bindArray = array(array(':id', $jobId, \PDO::PARAM_INT),
                            array(':work_total', strval($work_total), \PDO::PARAM_STR));
        return $this->executeQuery(self::$queries['UPDATE_JOB_WORKTOTAL'], 'UPDATE_JOB_WORKTOTAL', $bindArray);
    }


    /**
     * update work_complete
     * @param type $jobId
     * @param type $work_complete
     * @return type
     */
    function setWorkComplete($jobId, $work_complete) {
        $bindArray = array(array(':id', $jobId, \PDO::PARAM_INT),
                            array(':work_complete', strval($work_complete), \PDO::PARAM_STR));
        return $this->executeQuery(self::$queries['UPDATE_JOB_WORKCOMPLETE'], 'UPDATE_JOB_WORKCOMPLETE', $bindArray);
    }

    function getWorkTotal($jobId) {
        $bindArray = array(array(':id', $jobId, \PDO::PARAM_INT));
        return $this->executeQuery(self::$queries['GET_JOB_WORKCOMPLETE'], 'GET_JOB_WORKCOMPLETE', $bindArray);
    }

    /**
     * Return first record that is in "waiting" job state
     * @return type
     */
    public function getNextJob() {
        $bindArray = array(array(':jobstate_id', JOBSTATE_WAITING, \PDO::PARAM_INT));
        return $this->executeQuery(self::$queries['GET_NEXTJOB_STATEID'], 'GET_NEXTJOB_STATEID', $bindArray);
    }


    /**
     * Return all jobs that are in given jobstate
     * @param type $jobstate_id
     * @return type
     */
    public function getAllJobsByState($jobstate_id) {
        $bindArray = array(array(':jobstate_id', $jobstate_id, \PDO::PARAM_INT));
        return $this->executeQuery(self::$queries['GET_ALLJOBS_STATEID'], 'GET_ALLJOBS_STATEID', $bindArray);
    }

    public function getAllJobs() {
        return $this->executeQuery(self::$queries['GET_ALLJOBS'], 'GET_ALLJOBS');
    }

    public function getAllJobStates() {
        return $this->executeQuery(self::$queries['GET_ALL_JOBSTATES'], 'GET_ALL_JOBSTATES');
    }

    public function updateSystemFailureJobs(){
        return $this->executeQuery(self::$queries['UPDATE_JOBS_AS_FAILED'], 'UPDATE_JOBS_AS_FAILED');
    }

    public function switchOnPragma(){
        return $this->executeQuery(self::$queries['SWITCH_ON_FOREIGN_KEY'], 'SWITCH_ON_FOREIGN_KEY');
    }

    public function deleteTwoWeeksOldJobs(){
        return $this->executeQuery(self::$queries['DELETE_TWO_WEEKS_OLD JOBS'], 'DELETE_TWO_WEEKS_OLD JOBS');
    }
}
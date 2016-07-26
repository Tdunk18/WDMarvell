#!/usr/bin/php
<?php
define('ADMIN_API_ROOT', realpath('/var/www/rest-api/'));
require_once(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
use Jobs\Model;
use Jobs\Common;

/*Check if the jobs db file exists*/
if(is_file('/usr/local/nas/orion/jobs.db')){ //TODO: Look up GlobaConfig for path

    $jobsDb = new \Jobs\Model\JobDB(); // db handle
    $dbh = $jobsDb->getDB();
    // TODO: Take queries & create methods for these activities in JobDb.php

    //Check if there are any jobs in 'running' status, if any, update the status of those job as failure with error message "SYSTEM SHUTDOWN FAILURE"
    $updateSql = $jobsDb->updateSystemFailureJobs();

    //Check if there are any jobs in JOBS DB more than two weeks old, delete those job records from Task Details table as well as Jobs table
    $switchOnPragma = $jobsDb->switchOnPragma();
    $deleteSql = $jobsDb->deleteTwoWeeksOldJobs();

    //Commmenting this functionality as it might impact system's performance if job monitor is started while system is booting up, we may change this in future
    //Check if there are any jobs in 'waiting' status, if any, restart JOBMONITOR and start those in queue jobs
    /*$selectJobsSql = "SELECT count(id) from Jobs where jobstate_id=1";
    $select = $pdo->prepare($selectJobsSql);
    $select->execute();
    $output = $select->fetch();

    if(!empty($select)){ // TODO should be count check and NOT the handle check
        //error_log(print_r("INFO: Job Monitor Started",1));
        \Jobs\Common\JobMonitor::getInstance()->start();
    }*/
}


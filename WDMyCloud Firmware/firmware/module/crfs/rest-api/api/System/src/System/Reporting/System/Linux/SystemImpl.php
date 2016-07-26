<?php

namespace System\Reporting\System\Linux;

use System\Reporting\System\AbstractSystem;

class SystemImpl extends AbstractSystem {

    function getInfo() {
    	$instance = new SystemUtil();
    	return $instance->getInfo();
    }

    function getState() {

    	$instance = new SystemUtil();
    	return  $instance->getState();
    }

    function getLog() {
    	$instance = new SystemUtil();
    	return  $instance->getLog();
    }

    function sendLog() {
    	$instance = new SystemUtil();
    	return  $instance->sendLog();
    }

}
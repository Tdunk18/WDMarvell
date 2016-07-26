<?php

namespace System\Reporting\System;

abstract class AbstractSystem implements SystemInterface {

    public function __construct() {
        $this->init();
    }

    public function init() {
        // Nothing to see here.
    }

    abstract public function getInfo();
	
    abstract public function getState();
    
    abstract public function getLog();

    abstract public function sendLog();

}
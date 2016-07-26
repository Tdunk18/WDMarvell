<?php
/**
 * \file    worker/worker.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
namespace Jobs\Common;

abstract class JobWorker {

	protected $urlPath;
	protected $queryParams;
	protected $apiVersion;
    protected $_async;

    protected function __construct() {
		;
	}//__construct

    public function setupWorker($urlPath, $queryParams, $apiVersion=NULL) {
        $this->urlPath = $urlPath;
        $this->queryParams = $queryParams;
        $this->apiVersion = $apiVersion;
        $this->_async = false;
        if(isset($this->queryParams['async_exec']) && $this->queryParams['async_exec']=='true') {
            $this->_async = true;
        }
    }

    public function getAsync() {
        return $this->_async===true?true:false;
    }

	abstract public function validate();

	abstract public function execute();

	abstract public function results();

}
<?php
namespace Remote;

class CertificateWaitException extends \Core\Rest\Exception {

	var $waitTime = 0;
	
	public function __construct($message, $waitTime, $code=null, $previous=null) {
		$this->waitTime = $waitTime;
		parent::__construct($message, $code, $previous);
	}
	
	public function getWaitTime() {
		return $this->waitTime;
	}
	
	
}

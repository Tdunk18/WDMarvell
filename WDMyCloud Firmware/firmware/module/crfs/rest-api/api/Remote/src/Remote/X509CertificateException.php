<?php
namespace Remote;

class X509CertificateException extends \Core\Rest\Exception {

	var $waitTime = 0;
	
	public function __construct($message, $code=null, $previous=null) {
		parent::__construct($message, $code, $previous);
	}
	
}

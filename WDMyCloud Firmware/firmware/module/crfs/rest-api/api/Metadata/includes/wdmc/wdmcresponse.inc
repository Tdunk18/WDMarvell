<?php

class WDMCResponse {
	const ATTR_SUBSYSTEM      = 'Subsystem';
	const ATTR_REQUESTNAME    = 'RequestName';
	const ATTR_REQUESTER      = 'Requester';
	const ATTR_SEQUENCENUMBER = 'SequenceNumber';
	const ATTR_MOUNTPOINT     = 'MountPoint';
	const ATTR_PATH           = 'Path';
	const ATTR_STATUS         = 'Status';
	const ATTR_MESSAGE        = 'Message';
	const ELEM_TRANSCODING    = 'Transcoding';

	private $_xmlElem;
	private $_attrs;

	public function __construct($xml) {
		$this->_xmlElem = new SimpleXMLElement($xml);
		$this->_attrs = $this->_xmlElem->attributes();
	}

	public function getStatus() {
		return $this->_attrs->{WDMCResponse::ATTR_STATUS};
	}

	public function getMessage() {
		return $this->_attrs->{WDMCResponse::ATTR_MESSAGE};
	}

	public function getAttr($attrName) {
		return $this->_attrs->{$attrName};
	}


	public function getTranscodingId() {
		return (int) $this->getChildValue($this::ELEM_TRANSCODING);
	}

	public function getChildValue($elemName) {
		return $this->{$elemName};
	}

	public function getXMLElement() {
		return $this->_xmlElem;
	}

}
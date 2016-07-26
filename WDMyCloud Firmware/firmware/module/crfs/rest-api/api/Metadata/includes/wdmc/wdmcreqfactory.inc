<?php 
require_once(FILESYSTEM_ROOT . '/includes/transcoding.inc');

class WDMCReqFactory {
	const ATTR_SUBSYSTEM      = 'Subsystem';
	const ATTR_REQUESTNAME    = 'RequestName';
	const ATTR_REQUESTER      = 'Requester'; 
	const ATTR_SEQUENCENUMBER = 'SequenceNumber'; 
	const ATTR_MOUNTPOINT     = 'MountPoint';
	const ATTR_PATH           = 'Path';
	
	
	private static function _builder($attrs, $childElem = '') {
		$attrStr = '';
		foreach ($attrs as $name=>$value) {
			$attrStr .= "$name=\"$value\" ";
		} 
		
		$reqStr = 
			'<?xml version = "1.0"?>' .
			'<WDMCRequest ' . $attrStr . ' >' .
		    $childElem .
			'</WDMCRequest>' .
			"\0\0\0\0";
		
		return $reqStr;
			
	}
	
	public static function crawlerStatusReq() {
		return WDMCReqFactory::_builder(array(
			WDMCReqFactory::ATTR_SUBSYSTEM => 'system',
			WDMCReqFactory::ATTR_REQUESTNAME => 'GetStatus',
			WDMCReqFactory::ATTR_REQUESTER => 'Orion',
			));
	}
	
	public static function extractMetaDataReq($mountPoint, $path) {

		return WDMCReqFactory::_builder(array(
			WDMCReqFactory::ATTR_SUBSYSTEM => 'metadata',
			WDMCReqFactory::ATTR_REQUESTNAME => 'ExtractMetadata',
			WDMCReqFactory::ATTR_REQUESTER => 'Orion',
			WDMCReqFactory::ATTR_SEQUENCENUMBER => md5("Extract.$path"),
			WDMCReqFactory::ATTR_MOUNTPOINT => $mountPoint,
			WDMCReqFactory::ATTR_PATH => $path,
			));
		
	}
	
	public static function transcodeReq($mountPoint, $path, $transId) {
		
		return WDMCReqFactory::_builder(array(
			WDMCReqFactory::ATTR_SUBSYSTEM => 'transcoder',
			WDMCReqFactory::ATTR_REQUESTNAME => 'Transcode',
			WDMCReqFactory::ATTR_REQUESTER => 'Orion',
			WDMCReqFactory::ATTR_SEQUENCENUMBER => md5("Transcode.$path"),
			WDMCReqFactory::ATTR_MOUNTPOINT => $mountPoint,
			WDMCReqFactory::ATTR_PATH => $path,
			), "<Transcoding>$transId</Transcoding>");		
	}
	
	public static function cancelReq($seqNum) {
		return WDMCReqFactory::_builder(array(
			WDMCReqFactory::ATTR_SUBSYSTEM => 'system',
			WDMCReqFactory::ATTR_REQUESTNAME => 'CancelRequest',
			WDMCReqFactory::ATTR_REQUESTER => 'Orion',
			WDMCReqFactory::ATTR_SEQUENCENUMBER => $seqNum
			));			
	}
		
}

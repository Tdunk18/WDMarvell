<?php

require_once COMMON_ROOT . 'includes' . DS . 'globalconfig.inc';
/**
 * \file requestscope.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 *
 * A Request scoped singleton
 * @author Kai
 *
 */
class RequestScope {
	static private $scope = array();

	public static function getInstance() {
		if (!isset($_REQUEST['RequestScope'])) {
			$_REQUEST['RequestScope'] = new RequestScope();
		}
		return $_REQUEST['RequestScope'];
	}

	public function getVolMgr() {

		if (!isset(self::$scope['MediaVolMgr'])) {
			require_once (FILESYSTEM_ROOT . '/includes/mediavolumemgr.inc');
			self::$scope['MediaVolMgr'] = new MediaVolumeMgr();
		}
		return self::$scope['MediaVolMgr'];
	}

    /**
     * @return MediaVolumeMgr
     */
    public static function getMediaVolMgr() {
		return RequestScope::getInstance()->getVolMgr();
	}

	public function setOutputFormat($format) {
		self::$scope['outputFormat'] = $format;

	}

	public function getOutFormat() {
		return self::$scope['outputFormat'];
	}

	public function setOutputWriter($writer) {
		self::$scope['outputWriter'] = $writer;

	}

	public function getOutputWriter() {

		return self::$scope['outputWriter'];
	}

	public function setLoginContext($ctxt) {
		self::$scope['loginCtxt'] = $ctxt;
	}

	/**
	 * Gets the login context.
	 *
	 * @return \Auth\User\LoginContext
	 */
	public function getLoginContext() {
		if(isset(self::$scope['loginCtxt'])) {
			return self::$scope['loginCtxt'];
		} elseif(isset($_SESSION['LOGIN_CONTEXT'])) {
			\RequestScope::getInstance()->setLoginContext($_SESSION['LOGIN_CONTEXT']);
			return self::$scope['loginCtxt'];
		}
	}

	public function setQueryParams(&$queryParams) {
		self::$scope['queryParams'] = &$queryParams;
	}

	public function getQueryParams() {
		return self::$scope['queryParams'];
	}

	public function setUrlPaths(&$urlPath) {
		self::$scope['urlPath'] = &$urlPath;
	}

	public function getUrlPaths() {
		return self::$scope['urlPath'];
	}


	public function setLanRequest($lanRequest) {
		self::$scope['lanRequest'] = $lanRequest;
	}

	public function getLanRequest() {
		if(isset(self::$scope['lanRequest'])) {
			return self::$scope['lanRequest'];
		} else {
			return null;
		}
	}

	private function & _getAPCDirtyMap() {
		if(!isset(self::$scope['apcDirtyMap'])) {
			self::$scope['apcDirtyMap'] = array();
		}
		return self::$scope['apcDirtyMap'];
	}

	public function isApcDirty($key) {
		$map = &$this->_getAPCDirtyMap();

		if (isset($map[$key])) {
			return true;
		}
		return false;
	}

	public function setApcDirty($key) {
		$map = &$this->_getAPCDirtyMap();

		$map[$key] = true;

	}

	public function getApiVersion(){
	    if(isset(self::$scope['apiVersion'])){
	        return self::$scope['apiVersion'];
	    }
	    return null;
	}

	public function setApiVersion($version){
	    self::$scope['apiVersion'] = $version;
	}
}

function getSharePath($shareName = NULL)
{
	if ($shareName == NULL || !isV2MediaDb())
	{
		$dbConfig = getGlobalConfig("directories");

		return isset($dbConfig["SHARES_PATH"]) ? $dbConfig["SHARES_PATH"] : NULL;
	}
	else
	{
	    $basePath  = RequestScope::getMediaVolMgr()->getShareBasePath($shareName);
	    $lastDsPos = mb_strrpos($basePath, DS);
	    $baseName  = mb_substr($basePath, $lastDsPos + 1);
	    $dirName   = mb_substr($basePath, 0, $lastDsPos);

	    return ($baseName == $shareName) ? $dirName : $basePath;
	}
}
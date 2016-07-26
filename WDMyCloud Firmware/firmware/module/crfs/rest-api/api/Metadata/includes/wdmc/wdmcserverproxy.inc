<?php

require_once(METADATA_ROOT . '/includes/wdmc/wdmcreqfactory.inc');
require_once(METADATA_ROOT . '/includes/wdmc/wdmcresponse.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');


class WDMCServerProxy {

	private function _sendReq($reqXml, $timeout = 30) {
		$requestSocket = getWdmcRequestSocket();

		$fp = stream_socket_client($requestSocket, $errno, $errstr, $timeout);
        \Core\Logger::getInstance()->runtime('WDMC Socket opened.');
		if($fp){
			try {
                \Core\Logger::getInstance()->info('Meta Data: ', stream_get_meta_data($fp));

				//Send XML request to get status from crawler
				fwrite($fp, $reqXml);
				fflush($fp);

				//Read response from crawler
				$respXml = "";
				while(!feof($fp)){
                    $str = fread($fp, 8192);
                    \Core\Logger::getInstance()->info('Reading socket... Size of read: ' . strlen($str));
					$respXml = $respXml.$str;
					if(preg_match("/\\0\\0\\0\\0/", $respXml)) {
						break;
					}
				}

				// Close socket
				fclose($fp);
                \Core\Logger::getInstance()->runtime('WDMC Socket read and closed.');
				$ret = new WDMCResponse($respXml);
                \Core\Logger::getInstance()->runtime('WDMCResponse() return');
				return $ret;
			} catch (Exception $e) {
				fclose($fp);
				return false;
			}

		} else {
            \Core\Logger::getInstance()->err('Failed to create mediacrawler socket: ' . $errstr);
			throw new Exception('WDMC_SERVER_NOT_RUNNING', 500);
		}

		return false;

	}

	public function getStatus() {
		return $this->_sendReq(WDMCReqFactory::crawlerStatusReq());
	}

	public function transcode($mountPoint, $path, $id) {
		return $this->_sendReq(WDMCReqFactory::transcodeReq($mountPoint, $path, $id));
	}

	public function extract($mountPoint, $path) {
		return $this->_sendReq(WDMCReqFactory::extractMetaDataReq($mountPoint, $path));
	}

	/**
	 * Execute mediacrawler in mode of shell command with Reset/Rebuilding option
	 *
	 * @return boolean $status indicates the success or failure of this operation
	 */
	public function execRebuildCrawlerDB($sharePath=null) {

		$output = $retVal = null;
        $serviceConfig = \getGlobalConfig("services");
        $mediaCrawlerResetScript = $serviceConfig["MEDIACRAWLERSCRIPT_RESET"];
        exec_runtime($mediaCrawlerResetScript . ($sharePath ?: null), $output, $retVal);
		if($retVal !== 0) {
            \Core\Logger::getInstance()->err('wdmcserverd returned with non-zero value: ' . $retVal, $output);
			throw new \Metadata\Exception ('wdmcserverd returned with non-zero value: ' . $retVal, 500);
		}

        // WDPhotos is not supported in this version of Avatar so don't attempt to reset
        if( strtoupper(getDeviceTypeName() !== "avatar"))
        {
            exec_runtime("sudo /etc/init.d/wdphotodbmergerd reset " . ($sharePath ?: null), $output, $retVal);
            if($retVal !== 0) {
                \Core\Logger::getInstance()->err('wdphotodbmergerd returned with non-zero value: ' . $retVal, $output);
                throw new \Metadata\Exception ('wdphotodbmergerd returned with non-zero value: ' . $retVal, 500);
            }
        }

		return true;
	}

    /**
     * Execute mediacrawler in mode of shell command with Restart option
     *
     * @return boolean $status indicates the success or failure of this operation
     */
    public function execRestartCrawler() {
        $output = $retVal = null;
        $serviceConfig = \getGlobalConfig("services");
        $mediaCrawlerRestartScript = $serviceConfig["MEDIACRAWLERSCRIPT_RESTART"];
        exec_runtime($mediaCrawlerRestartScript, $output, $retVal);
        if($retVal !== 0) {
            \Core\Logger::getInstance()->err('wdmcserverd returned with non-zero value: ' . $retVal, $output);
            throw new \Metadata\Exception ('wdmcserverd returned with non-zero value: ' . $retVal, 500);
        }
        return true;
    }
}

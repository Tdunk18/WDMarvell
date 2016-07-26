<?php

namespace System\Configuration\Model\Vft;

require_once(COMMON_ROOT . '/includes/outputwriter.inc');

class Configuration {

    protected $enablevft = null;

    function getConfig()
    {
        $output = $retVal = NULL;

        exec_runtime('sudo /bin/pidof vft', $output, $retVal);

        return ['enablevft' => ($retVal != 0 ? 'disable' : 'enable')];
    }

    function modifyConfig($changes) {
        //Require entire representation and not just a delta to ensure a consistant representation
        if (!isset($changes["enablevft"])) {
            return 'BAD_REQUEST';
        }

        //Verify changes are valid
        if (!$this->_isValidServiceState($changes["enablevft"])) {

            return 'BAD_REQUEST';
        }

        $vftServiceStateRequested = ($changes["enablevft"] === 'enable') ? 'enabled' : 'disabled';

        // if the service is currently in the requested state then exit with sucess
        $output = $retVal = null;
        if ($vftServiceStateRequested === 'enabled') {
            if (is_file("/etc/.eula_accepted")) {
                //header("HTTP/1.0 401 Unauthorized");
            	return 'NOT_AUTHORIZED';
            }
            exec_runtime("sudo nohup /usr/local/sbin/vft 1>/dev/null 2>&1 &", $output, $retVal, false);
        } else {
            exec_runtime("sudo killall vft 1>/dev/null 2>&1", $output, $retVal, false);
        }
		return 'SUCCESS';
    }

    protected function _isValidServiceState($serviceState) {
        return ((strcasecmp($serviceState, 'enable') == 0) ||
                (strcasecmp($serviceState, 'disable') == 0));
    }

}
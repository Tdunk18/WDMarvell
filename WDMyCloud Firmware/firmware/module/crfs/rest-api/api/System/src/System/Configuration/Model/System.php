<?php

namespace System\Configuration\Model;

class System {

    protected $state = null;
    protected $percent = 0;
    protected $status = 'none';

    public function modifyState($changes) {
        //Require entire representation and not just a delta to ensure a consistant representation
        if (!isset($changes["state"])) {
            return 'BAD_REQUEST';
        }
        //Verify changes are valid
        if (!$this->_isValidState($changes["state"])) {
            return 'BAD_REQUEST';
        }

        $output = $retVal = null;
        if (strcasecmp($changes["state"], "halt") == 0) {
            exec_runtime("sudo halt ", $output, $retVal);
            if ($retVal !== 0) {
                return 'SERVER_ERROR';
            }
        } else {
            exec_runtime("sudo reboot ", $output, $retVal);
            if ($retVal !== 0) {
                return 'SERVER_ERROR';
            }
        }

        return 'SUCCESS';
    }

    protected function _isValidState($state) {
        return ((strcasecmp($state, "halt") == 0) || (strcasecmp($state, "reboot") == 0));
    }

}
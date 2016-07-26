<?php

namespace System\Device\Model;

class Eula {

    public function getAcceptance(){
        return  is_file("/etc/.eula_accepted");
    }

    public function accept(){
        //Require entire representation
        //This is a one time resource creation and we want to preserve
        //acceptance time stamp
        if(is_file("/etc/.eula_accepted")){
            return true;
        }

        //Actually accept EULA
        $output=$retVal=null;
        exec_runtime("sudo /bin/touch /etc/.eula_accepted", $output, $retVal);
        if($retVal !== 0) {
            throw new \Exception('Creation of /etc/.eula_accepted failed. Returned with "' . $retVal . '"', 500);
        }

        //JS - this is MBL/Sequoia Specific
        $deviceType = getDeviceTypeName();
        if ( empty($deviceType) || (strcasecmp($deviceType, "sequioa") == 0)) {
        	//deviceType will be empty on MBL
        	$output=$retVal=null;
        	exec_runtime( "sudo killall vft 1>/dev/null 2>&1", $output, $retVal, false);
        }

        return true;
    }
}
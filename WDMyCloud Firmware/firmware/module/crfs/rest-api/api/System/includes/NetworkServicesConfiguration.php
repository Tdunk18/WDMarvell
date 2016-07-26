<?php

class NetworkServicesConfiguration{

    var $enablessh = '';
    var $enable_ftp = '';
    var $enable_anonymous_ftp = '';
    var $enable_nfs = '';
    var $enable_afp = '';
    var $enable_cifs = '';

    function NetworkServicesConfiguration() {
    }

    function getConfig(){
        //!!!This where we gather up response
        //!!!Return NULL on error

		$networkServiceOutput=$retVal=null;
		exec_runtime("sudo /usr/local/sbin/getServiceStartup.sh vsftpd", $networkServiceOutput, $retVal);
		if($retVal !== 0) {
			return NULL;
		}

		if ($networkServiceOutput[0] === 'enabled') {
			$networkService ="true";
		}
		else {
			$networkService ="false";
		}
//return NULL;  //Error case
        return( array(
			'enable_ftp' => "$networkService",
                   ));
    }

    function modifyConfig($changes){
        //Require entire representation and not just a delta to ensure a consistant representation
        if( !isset($changes["enable_ftp"])){

            return 'BAD_REQUEST';
        }
        //Verify changes are valid
		if(!$this->isValidServiceState($changes["enable_ftp"])){

			return 'BAD_REQUEST';
		}

        //Actually do change
		$networkServiceStateRequested = ($changes["enable_ftp"] === 'true') ? 'enabled' : 'disabled';

		$networkServiceOutput=$retVal=null;
		exec_runtime("sudo /usr/local/sbin/getServiceStartup.sh vsftpd", $networkServiceOutput, $retVal);
		if($retVal !== 0) {
			return 'SERVER_ERROR';
		}

		// if the service is currently in the requested state then exit with sucess
		if ($networkServiceStateRequested === $networkServiceOutput[0]){
			return 'SUCCESS';
		}

		$networkServiceOutput=$retVal=null;
		exec_runtime("sudo /usr/local/sbin/setServiceStartup.sh vsftpd \"$networkServiceStateRequested\"", $networkServiceOutput, $retVal);
		if($retVal !== 0) {
			return 'SERVER_ERROR';
		}
		return 'SUCCESS';
    }

	function isValidServiceState($serviceState){
		if ((strcasecmp($serviceState,'true') == 0) ||
			(strcasecmp($serviceState,'false') == 0)) {
				return TRUE;
			} else {
				return FALSE;
			}
		}
}
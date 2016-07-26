<?php

use System\Device\StringTableReader;

class LanguageConfiguration{

    var $language = '';

    function LanguageConfiguration() {
    }

    function getConfig(){
    	$output = $retVal = null;
    	// create file if none exists
		if(!is_file("/etc/language.conf")){
			exec_runtime("sudo bash -c '(echo \"language DEFAULT\">/etc/language.conf)'", $output, $retVal,false);
		}

        // Return NULL on error
		$reader = new StringTableReader("fr","alertmessages.txt");

		$this->language = '';
		$output = $retVal = null;
		exec_runtime('sudo sed -e \'/^language /s/language //\' /etc/language.conf', $output, $retVal,false);
		if($retVal !== 0) {
			return null;
		}
		$this->language = $output[0];

		if ( $this->language != "DEFAULT" ) {
	        if ( ! $reader->isLocaleSupported("$output[0]")) {
	            	$this->language = "en_US";
	        }
        }

        return(array('language' => $this->language));
    }


    function modifyConfig($changes) {

        //Require entire representation and not just a delta to ensure a consistant representation
        if( !isset($changes["language"]) ){
            return 'BAD_REQUEST';
        }
        //Verify changes are valid/Verify that resource was posted to before -RETURN NOT_FOUND
        if(FALSE){
            return 'BAD_REQUEST';
        }

		if(!is_file("/etc/language.conf")){
			return 'NOT_FOUND';
		}

        //Actually do change
		$output = $retVal = null;
		$langArg = escapeshellarg("language {$changes["language"]}");
		exec_runtime("sudo bash -c '(echo $langArg >/etc/language.conf)'", $output, $retVal, false);
		if($retVal !== 0) {
			return 'SERVER_ERROR';
		}
        return 'SUCCESS';

    }


    function config($lang){
        //Require entire representation
        if( !isset($lang["language"]) ){
            return 'BAD_REQUEST';
        }
        //Verify values are valid
        if(FALSE){
            return 'BAD_REQUEST';
        }

		//if the file is present then a language has been posted already, send error
		if(is_file("/etc/language.conf")){
			return 'BAD_REQUEST';
		}
		$output = $retVal = null;
		$langArg = escapeshellarg("language {$lang["language"]}");
		exec_runtime("sudo bash -c '(echo $langArg >/etc/language.conf)'", $output, $retVal, false);
		if($retVal !== 0) {
			return 'SERVER_ERROR';
		}

        return 'SUCCESS';
    }
}
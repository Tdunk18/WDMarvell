<?php

namespace Alerts\Alert;

class AlertConfiguration{

    CONST alert_email_config_path = '/etc/alert_email.conf';
    CONST alert_notify_time_path = '/CacheVolume/alert_notify_time';
	private $alert_email_return_path;

    function getLastNotifiedTime(){
	  	if (file_exists(self::alert_notify_time_path)) {
	  		$alert_notify = parse_ini_file(self::alert_notify_time_path, true);
	  		return $alert_notify['last_notified_time'];
	  	}else{
	  		return 0;
	  	}
    }

	function getLastNotifiedId(){
	  	if (file_exists(self::alert_notify_time_path)) {
	  		$alert_notify = parse_ini_file(self::alert_notify_time_path, true);
	  		return $alert_notify['last_notified_id'];
	  	}else{
	  		return 0;
	  	}
    }

    function updateLastNotifiedTime($last_notified_time, $last_notified_id=0){

        if (! is_writable(self::alert_notify_time_path)) {
	 		exec_runtime("sudo chmod 666 ".self::alert_notify_time_path);
        }

		set_error_handler(function() {
            throw new \Alerts\Exception('Failed to open config "' . self::alert_notify_time_path . '" for write.');
		}, E_NOTICE | E_WARNING); // PHP 5.3 only
        $fh = fopen(self::alert_notify_time_path, 'w');
        restore_error_handler();

		fwrite($fh, "# Last email notified time\n");
		fwrite($fh, 'last_notified_time="'.$last_notified_time.'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");
		fwrite($fh, "# Last email notified id\n");
		fwrite($fh, 'last_notified_id="'.$last_notified_id.'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");

		fclose($fh);
    }

    function getConfig(){
	  	if (file_exists(self::alert_email_config_path)) {
        	// Make sure we can read.
	  		$alert_config = parse_ini_file(self::alert_email_config_path, true);

	  		if (isset($alert_config)) {
	  		    $emailEnabled = ($alert_config['email_enabled'] == 'off') ? 'false' : 'true';
	  		    return( array(
                    'email_enabled' => $emailEnabled,
                    'email_returnpath' => $alert_config['email_returnpath'],
                    'min_level_email' => $alert_config['min_level_email'],
                    'min_level_rss' => $alert_config['min_level_rss'],
                    'email_recipient_0' => $alert_config['email_recipient_0'],
                    'email_recipient_1' => $alert_config['email_recipient_1'],
                    'email_recipient_2' => $alert_config['email_recipient_2'],
                    'email_recipient_3' => $alert_config['email_recipient_3'],
                    'email_recipient_4' => $alert_config['email_recipient_4'],
                    ));
	  		}else{
	  			return NULL;
	  		}
	  	}
    }

    function modifyConfig($changes){
        //Require entire representation and not just a delta to ensure a consistant representation
        if( !isset($changes["email_enabled"]) ||
            !isset($changes["min_level_email"]) ||
            !isset($changes["min_level_rss"]) ||
            !isset($changes["email_recipient_0"]) ||
            !isset($changes["email_recipient_1"]) ||
            !isset($changes["email_recipient_2"]) ||
            !isset($changes["email_recipient_3"]) ||
            !isset($changes["email_recipient_4"]) ){

            return 'BAD_REQUEST';
        }

        $email_returnpath = $this->_getEmailReturnPath();
        // Save changes to config file.
        if (!is_writable(self::alert_email_config_path)) {
	 		exec_runtime("sudo chmod 666 ".self::alert_email_config_path);
        }

		set_error_handler(function() {
            throw new \Alerts\Exception('Failed to open config "' . self::alert_notify_time_path . '" for write.');
		}, E_NOTICE | E_WARNING); // PHP 5.3 only
        $fh = fopen(self::alert_email_config_path, 'w'); // No die!
        restore_error_handler();

		fwrite($fh, "# Email notifications on/off\n");
		$emailEnabled = ($changes["email_enabled"] == 'false') ? 'off' : 'on';
		fwrite($fh, 'email_enabled="'.$emailEnabled.'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");

		fwrite($fh, "#Email return address\n");
		/* Return Email address will be : wdmycloud.alerts@wdc.com  */
		fwrite($fh, 'email_returnpath='.'"'.$email_returnpath.'"');

		fwrite($fh, "\n");
		fwrite($fh, "\n");

        fwrite($fh, "#Minimum Email Alert Severity\n");
		fwrite($fh, 'min_level_email="'.$changes["min_level_email"].'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");

        fwrite($fh, "#Minimum RSS Alert Severity\n");
		fwrite($fh, 'min_level_rss="'.$changes["min_level_rss"].'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");

		fwrite($fh, "# Email address 1\n");
		fwrite($fh, 'email_recipient_0="'.$changes["email_recipient_0"].'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");


		fwrite($fh, "# Email address 2\n");
		fwrite($fh, 'email_recipient_1="'.$changes["email_recipient_1"].'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");


		fwrite($fh, "# Email address 3\n");
		fwrite($fh, 'email_recipient_2="'.$changes["email_recipient_2"].'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");


		fwrite($fh, "# Email address 4\n");
		fwrite($fh, 'email_recipient_3="'.$changes["email_recipient_3"].'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");


		fwrite($fh, "# Email address 5\n");
		fwrite($fh, 'email_recipient_4="'.$changes["email_recipient_4"].'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");

		/*
		fwrite($fh, "# Last email notified time\n");
		fwrite($fh, 'last_notified_time="'.$changes["last_notified_time"].'"');
		fwrite($fh, "\n");
		fwrite($fh, "\n");
		*/

		fclose($fh);

		$this->updateLastNotifiedTime(time());

        return 'SUCCESS';
    }

    private function _getEmailReturnPath(){
    		$alert_email_returnpath = parse_ini_file(self::alert_email_config_path, true);
    		return $alert_email_returnpath["email_returnpath"];
    }
}
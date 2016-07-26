<?php

namespace System\Configuration\Model;

class Configuration
{
    const BAD_REQUEST              = 'BAD_REQUEST';
    const SUCCESS                  = 'SUCCESS';
    const SERVER_ERROR             = 'SERVER_ERROR';
    const ERROR_ON_BATTERY_POWER   = 'ERROR_ON_BATTERY_POWER';
    const ERROR_INSUFFICIENT_POWER = 'ERROR_INSUFFICIENT_POWER';

    const EXIT_CODE_SUCCESS            = 0;
    const EXIT_CODE_ON_BATTERY_POWER   = 10;
    const EXIT_CODE_INSUFFICIENT_POWER = 11;

    function getConfig()
    {
        $output = $return_var = NULL;

        exec_runtime('sudo /usr/local/sbin/saveConfigFile.sh', $output, $return_var);

        if ($return_var !== static::EXIT_CODE_SUCCESS)
        {
            return NULL;
        }

        return ['path_to_config' => $output[0]];
    }

    function modifyConfig($changes)
    {
        if (!isset($changes['filepath']))
        {
            return static::BAD_REQUEST;
        }

        $output = $return_var = NULL;

        exec_runtime("sudo /usr/local/sbin/restoreConfig.sh '" . $changes["filepath"] . "'", $output, $return_var);

        \Core\Logger::getInstance()->info('RetVal::' . $return_var);

        if (($return_var == static::EXIT_CODE_SUCCESS) || ($return_var == 141)) // What is 141?
        {
            return static::SUCCESS;
        }

        return static::SERVER_ERROR;
    }

    function getStaus()
    {
        $output = $return_var = NULL;

        exec_runtime("sudo /usr/local/sbin/getWipeFactoryRestoreStatus.sh", $output, $return_var);

        if ($return_var !== static::EXIT_CODE_SUCCESS)
        {
            return NULL;
        }

        $status = explode(' ', $output[0]);

        return ['status' => $status[0], 'completion_percent' => (isset($status[1]) ? $status[1] : '')];
    }

    function restore($changes)
    {
        if (!isset($changes['erase']))
        {
            return static::BAD_REQUEST;
        }

        $return_var = $output = NULL;

        switch (strtolower($changes['erase']))
        {
        	case 'zero':

                exec_runtime('sudo /usr/local/sbin/getWipeFactoryRestoreStatus.sh', $output, $return_var);

                if ($return_var == static::EXIT_CODE_SUCCESS)
                {
                    $status = explode(' ', $output[0]);

                    if (strtolower($status[0]) != 'idle')
                    {
                        return static::BAD_REQUEST;
                    }

                    exec_runtime('sudo nohup /usr/local/sbin/wipeFactoryRestore.sh 1>/dev/null &', $output, $return_var, false);
                }

        	    break;

        	case 'systemonly':

            	exec_runtime('sudo /usr/local/sbin/factoryRestore.sh noreformat', $output, $return_var);

            	if ($return_var == static::EXIT_CODE_SUCCESS)
            	{
            	    exec_runtime('sudo reboot', $output, $return_var);
            	}

        	    break;

        	default: // Factory Restore, not wipe

                exec_runtime('sudo /usr/local/sbin/factoryRestore.sh', $output, $return_var);

               	if ($return_var == static::EXIT_CODE_SUCCESS)
               	{
               	    exec_runtime('sudo reboot', $output, $return_var);
               	}

        	    break;
        }

        switch ($return_var)
        {
        	case static::EXIT_CODE_SUCCESS:

        	    return static::SUCCESS;

        	case static::EXIT_CODE_ON_BATTERY_POWER:

        	    return static::ERROR_ON_BATTERY_POWER;

        	case static::EXIT_CODE_INSUFFICIENT_POWER:

        	    return static::ERROR_INSUFFICIENT_POWER;

        	default:

        	    return static::SERVER_ERROR;
        }
    }

    protected function _isValidState($state)
    {
        return in_array(strtolower($state), ['halt', 'reboot']);
    }

    public function getLedStatus()
    {
    	$return_var = NULL;
    	$output     = [];

    	exec_runtime("sudo /usr/local/sbin/getServiceStartup.sh status-led", $output, $return_var);

    	if ($return_var != 0)
    	{
    		return static::SERVER_ERROR;
    	}

    	return ($output[0] === 'enabled') ? 'true' : 'false';
    }

    public function setLedStatus($change)
    {
        if (!isset($change['enable_led']))
        {
            return static::BAD_REQUEST;
        }

        $enable_led = strtolower($change['enable_led']);

    	if (!in_array($enable_led, ['true', 'false']))
    	{
    		return static::BAD_REQUEST;
    	}
    	else
    	{
    		$statusLed  = ($enable_led === 'true') ? 'enabled' : 'disabled';
    		$return_var = $output = NULL;

    		exec_runtime("sudo /usr/local/sbin/setServiceStartup.sh status-led $statusLed" , $output, $return_var);

    		return ($return_var == 0) ? static::SUCCESS : static::SERVER_ERROR;
    	}
    }
}
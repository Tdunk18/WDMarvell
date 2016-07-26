<?php

namespace Storage\Disk\Model;

class SmartTest{

    var $percent_complete = 0;
    var $status = '';

    function SmartTest() {
    }

    function getResults($driveSpecific=null){
        //!!!This where we gather up response
        //!!!Return NULL on error

        if ($driveSpecific === 'DRIVE_SPECIFIC')
        {
           $retVal = null;
           $output = array();
            exec_runtime("sudo /usr/local/sbin/getSmartTestStatus.sh DRIVE_SPECIFIC", $output, $retVal);
            if($retVal !== 0)
            {
                return NULL;
            }

            $drives = array();
            foreach($output as $record) {
                list($cabinet_location, $status, $percent_complete) = explode(':', $record);
                $drives[] = array(
                                   'location' => $cabinet_location,
                                   'percent_complete' => $percent_complete,
                                   'status' => $status
                                  );
            }
            return($drives);
        }
        else
        {
            $retVal = $output = null;
            exec_runtime("sudo /usr/local/sbin/getSmartTestStatus.sh", $output, $retVal);
            if($retVal !== 0)
            {
                return NULL;
            }


            $status = explode(" ", $output[0]);
            $this->status = $status[0];


            if (isset($status[1]))
            {
                $this->percent_complete = $status[1];
            }
            else
            {
                $this->percent_complete = '';
            }

            return( array(
                        'percent_complete' => $this->percent_complete,
                        'status' => $this->status
                        ));
        }
    }

    function start($changes){
        //Require entire representation and not just a delta to ensure a consistant representation
        if( !isset($changes["test"]) ){
            return 'PARAMETER_MISSING';
        }

		if (strcasecmp($changes["test"], "stop") ===0 )
		{
			$retVal = $output = null;
			exec_runtime("sudo /usr/local/sbin/cmdSmartTest.sh abort", $output, $retVal);
			if($retVal !== 0)
			{
				return 'SERVER_ERROR';
			}

			return 'SUCCESS';
		}

		// if we have gotten here then the user wants to start a test,
		// must verify there is not already a test going
		$retVal = $output = null;
		exec_runtime("sudo /usr/local/sbin/getSmartTestStatus.sh", $output, $retVal);
		if($retVal !== 0)
		{
			return 'SERVER_ERROR';
		}

		$status = explode(" ", $output[0]);


		if (strcasecmp(trim($status[0]), "inprogress") ===0 )
		{
			return 'BAD_REQUEST';
		}

        // If we have gotten here means 'stop', 'status' check is already done
        // Now, check if the test type is 'start_short' or 'start_long' else return 'BAD_REQUEST'.
		if (strcasecmp($changes["test"], "start_short") ===0 )
		{
			$testCommand = "short";
		}
		else if (strcasecmp($changes["test"], "start_long") ===0 )
		{
			$testCommand = "long";
		}
        else {
            return 'BAD_REQUEST';
        }



		$retVal = $output = null;
		exec_runtime("sudo /usr/local/sbin/cmdSmartTest.sh \"$testCommand\"", $output, $retVal);
		if($retVal !== 0)
		{
			return 'SERVER_ERROR';
		}

        return 'SUCCESS';

    }
}
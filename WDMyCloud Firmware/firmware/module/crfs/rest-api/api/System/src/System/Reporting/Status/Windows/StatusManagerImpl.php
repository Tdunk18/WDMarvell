<?php

namespace System\Reporting\Status\Windows;
/**
 * Description of StatusManagerImpl
 *
 * @author VijayaD
 */

use System\Reporting\Status\StatusManager;
use Remote\Device\DeviceControl;

class StatusManagerImpl extends StatusManager {

    public function getServicesStatus(){
        $serviceArray = DeviceControl::getInstance()->getServicesScriptsAndState();

        $apps = array(
            getMediaCrawlerServiceName(),
            getCommunicationServiceName(),
        );

        $results = array();
        if(is_array($serviceArray)){
	        foreach($serviceArray as $serviceArrayK => $serviceArrayV){
	        	if(isset($serviceArrayV['SVC_NAME']) && in_array($serviceArrayV['SVC_NAME'], $apps)){
	        		$results[$serviceArrayV['SVC_NAME']] = (isset($serviceArrayV['RUNNING']) && $serviceArrayV['RUNNING']) ? 'running' : 'not running';
	        	}
	        }
        }
        return $results;
    }
}
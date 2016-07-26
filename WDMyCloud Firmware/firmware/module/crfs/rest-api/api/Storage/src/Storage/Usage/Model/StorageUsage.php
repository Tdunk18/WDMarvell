<?php

namespace Storage\Usage\Model;

/* A class for associate with storage usage
 * Retrive storage usage date from Media Crawler and Orion DB
 * */
require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');

class StorageUsage extends \DBAccess {

    static protected $queries = array(
        'GET_TOTAL_SIZE_PER_CATEGORY' => "SELECT
                                                            SUM(CASE category WHEN  '1' THEN  IFNULL(size, 0) ELSE 0 END) AS video,
                                                            SUM(CASE category WHEN  '2' THEN  IFNULL(size, 0) ELSE 0 END) AS music,
                                                            SUM(CASE category WHEN  '3' THEN  IFNULL(size, 0) ELSE 0 END) AS photos,
                                                            SUM(CASE category WHEN  '4' THEN  IFNULL(size, 0) ELSE 0 END) AS other
                                             FROM
    														<wdmc.db>.Files
                                             WHERE
    														isDeleted = 0 AND isSystem = 0"
    );


    public function addUpSizeAndUsage() {

        $result=array();
        $result['usage'] = $result['size'] = 0;

        //Get path to Volumes on either one or multiple volume device
        $volInfo = \RequestScope::getMediaVolMgr()->getMediaVolumeInfo();

        foreach($volInfo as $volInfoK => $volInfoV){
            // Include USB volume if requested else skip
            if(isset($volInfoV['DynamicVolume'])
            && filter_var($volInfoV['DynamicVolume'], FILTER_VALIDATE_BOOLEAN)
                    && (\Metadata\Model\ExternalVolumeMediaView::isScanEnabled() === '0'))
                    continue;

            //For multivolume device (like Lighining) use mount_path column from the DB,
            //For single volume (like Sequioa) use base_path
            $volumePath = (isset($volInfoV['MountPath']) && is_dir($volInfoV['MountPath'])) ? $volInfoV['MountPath'] : $volInfoV['Path'];

    		//find out and add up size and usage of each volume
    		$spaceUsage = $this->calculateUsage($volumePath);
    		$result['size'] +=$spaceUsage['size'];
    		$result['usage'] +=  $spaceUsage['usage'];
    	}

    	return $result;
    }

    //Get the total size as well as total usage
    private function calculateUsage($volumePath){
    	$command = "df -B 1 '".$volumePath."' | sed -e /Filesystem/d";
    	$retVal=$output=null;
    	exec_runtime($command, $output, $retVal, false);
    	if ($retVal !== 0 || empty($output)) {
    		$output = array(0 => "0 0 0 0");
    	}

    	$df = preg_split ("/\s+/", $output[0]);
    	$reserved = $df[1]-$df[3]-$df[2];
    	$percent = trim($df[4], '%');
    	$scaled_reserved = $reserved * (100-$percent) / 100;

    	$sizeArray['size'] = $df[1];
    	$sizeArray['usage'] = !empty($df[2]) ? $df[1]-$df[3]-$scaled_reserved : 0;
    	return $sizeArray;
    }


    public function calculateMediaBreakdown($result) {
	    //Access to Orion DB and Media Crawler DB together
	    $mediaDb = openMediaDb();
	    $dbAccess = new \DBAccess($mediaDb);
	    set_time_limit(0); // default of 30 seconds is not enough with large dataset in wdmc db
	    $categoryUsage = $dbAccess->executeQueryWithDb($mediaDb, self::$queries['GET_TOTAL_SIZE_PER_CATEGORY']);
	    closeMediaDb($mediaDb);

	    $result['music'] =  $result['photos'] = $result['video'] =$notOther = 0;
        foreach ($categoryUsage as $key => $val) {
            $result['video'] += $val['video'];
            $result['photos'] += $val['photos'];
            $result['music'] += $val['music'];
            $notOther += $val['video'] + $val['photos'] + $val['music'];
        }
		$result['other'] = $result['usage'] - $notOther;

	    return $result;
    }


    public function applyVersionSpecificUnits($result, $version) {
	    // we want to return the size in GB using base 10
	    $sizeDivision =  ('1.0' === $version) ? 1000 * 1000 * 1000 : 1;

	    foreach(array('size', 'usage', 'video', 'photos', 'music', 'other') as $keyToCheck){
			if(isset($result[$keyToCheck])){
				$result[$keyToCheck] = number_format(ceil($result[$keyToCheck]/$sizeDivision), 0, '', '');
			}
	    }

	    return $result;
    }
}

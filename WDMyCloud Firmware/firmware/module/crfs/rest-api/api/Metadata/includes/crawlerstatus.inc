<?php
require_once (FILESYSTEM_ROOT . '/includes/mediavolumemgr.inc');
require_once (FILESYSTEM_ROOT . '/includes/db/volumesdb.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/category.inc');
require_once(COMMON_ROOT . '/includes/requestscope.inc');


function getCrawlerStatus($pVolumeId = '') {
	$pVolumeId = (string)$pVolumeId;
	$ret = array();
	$volumes = (new VolumesDB())->getActiveVolumes();
	$volMgr = RequestScope::getMediaVolMgr();

	//Vol ID mountPath map
	$volIdPath = array();
	foreach($volumes as $volume){
		$volIdPath[$volume['base_path']] = $volume['volume_id'];
	}

	if($respXml = $volMgr->getCrawlerStatusDetails()){
    	$respObj = new SimpleXMLElement($respXml);
    	foreach ($respObj->xpath('//Volume') as $vol) {
    		$attrs = $vol->attributes();
    		$mountPoint = (string)$attrs['mountPoint'];
    		$volId = $volIdPath[$mountPoint];
    		$singleVolStat = array(
    			'volume_path' => $mountPoint,
    			'volume_id' => $volIdPath[$mountPoint ],
    			'volume_state' => (string)$attrs['action']
    		);
    		$categoryState = array();

    		//JS - we now get lastCrawl and lastPurge from the status, LastUpdatedDate == lastCrawl
    		$info = $vol->Info;
    		$infoAttrs = $info->attributes();
    		$lastCrawl = (int)$infoAttrs['LastCrawl'];
    		$lastPurge = (int)$infoAttrs['LastPurge'];

    		$stats = $vol->Stats;
    		foreach ($stats->Stat as $category) {
    			$catAttrs = $category->attributes();
    			$type = (int)$catAttrs['category'];
    			$categoryState[] = array(
    				'category_type' => (string)MediaTypeEnum::getCategoryName($type),
    				'mdate' => $lastCrawl,
    				'extracted_count' => (int)$catAttrs['completed'],
    				'transcoded_count' => (int)$catAttrs['completed'],
    				'total' => (int)$catAttrs['total']
    			);
    			$singleVolStat['categories'] = $categoryState;
    			//JS add these to the volume status
    			$singleVolStat['last_crawl'] = $lastCrawl;
    			$singleVolStat['last_purge'] = $lastPurge;
    		}
    		$ret[]=$singleVolStat;
    		if (null !== $pVolumeId && $pVolumeId === $volId) {
    			return $singleVolStat;
    		}
    	}
	}
	if (!empty($pVolumeId)) {
		return array();
	}

	return $ret;

}
<?php

// Constants
define("RETURN_CODE_SUCCESS", 0);
define("RETURN_CODE_FAILURE_INCORRECT_NUMBER_OF_ARGUMENTS", 1);
define("RETURN_CODE_FAILURE_INVALID_REQUEST", 2);
define("RETURN_CODE_FAILURE_EXCEPTION", 3);
define("RETURN_CODE_FAILURE_REQUEST_FAILED", 4);

// Required Files

require_once(FILESYSTEM_ROOT . '/includes/db/volumesdb.inc');

function addVolume($volumeId, $mountPoint, $drivePath, $fileSystemType, $handle = null, $storageType = NULL, $readOnly = 'false') {
	
	$DISPATCHER_PIPE = "/tmp/wddispatcher.in";
	$DELIMITER = "\0\0\0\0";
	$wdVolumeHandler = "wdVolumeHandler";
	
	$wdmcDispatcherPipe = fopen($DISPATCHER_PIPE, 'r+');
	
	if (!$wdmcDispatcherPipe) {
		$returnCode = RETURN_CODE_FAILURE_EXCEPTION;
		exit($returnCode);
	}
	
	fclose($wdmcDispatcherPipe);
	
	$volumesDB = new VolumesDB();

	/*
	 Create a volume with the following arguments:
	 volumeId, label, basePath, drivePath, isConnected, capacity, fileSystemType, readOnly,
	 handle, mountTime.
	 Note: dynamicVolume is always set to true and crawlerStatus is always set to null.
	 $volumeId, $label, $basePath, $drivePath, $isConnected, $capacity=null, $dynamicVolume=null, $fileSystemType=null, $readOnly=null, $usbHandle=null, $crawlerStatus=null, $mountedDate=null*/
	// basepath and mountpoint are synonymous here
	//we need size in MB
	$size = disk_total_space($mountPoint) / (1000 * 1000);
	$usage = $size - disk_free_space($mountPoint)/(1000 * 1000);
	$time = time();
	
	exec("ls /shares",$output, $retVal);
	$path = "";
	for($i=0; $i<count($output); $i++){
		unset($loc);
		exec("readlink -f /shares/".escapeshellarg($output[$i]), $loc, $ret);
		if ($loc[0] == $mountPoint) {
			$path='/'.$output[$i];
			break;
		}
	}
	
	
	$retrievedVolume = $volumesDB->getVolume($volumeId);

	if (empty($handle)) {
		$dynamicVolume = 'false';
	} else {
		$dynamicVolume = 'true';
	}

	if (!$retrievedVolume) {
		if (!$volumesDB->createVolume($volumeId, null, "/shares".$path, $drivePath, 'true', $size, $dynamicVolume, $fileSystemType, $readOnly, $handle, null, $time, $mountPoint, $storageType)) {
		    $returnCode = RETURN_CODE_FAILURE_REQUEST_FAILED;
		    exit($returnCode);
		}
	}
	
	$writer = new XMLWriter();

	$writer->openMemory();
	
	$writer->startDocument('1.0','UTF-8');
	
	$writer->setIndent(true);
	$writer->setIndentString(str_repeat(' ', 4));
	$writer->startElement('volume_data');
	$writer->startAttribute('version');
	$writer->text('1.0');
	$writer->endAttribute();
	
	$writer->writeElement('id', 'volume_add');
	$writer->writeElement('source', $wdVolumeHandler);
	
	$writer->startElement('volume');
	
	//for XML base_path and mount_point will have same value,
	//reason is these paramters are intended for a reason and later discarded,
	// we still have to have these attributes with same value
	
	$writer->writeElement('base_path', "/shares".$path);
	$writer->writeElement('mount_point', $mountPoint);
	$writer->writeElement('volume_id', $volumeId);
	$writer->writeElement('volume_mount_time', $time);
	$writer->writeElement('volume_read_only', $readOnly);
	
	if ($dynamicVolume === 'true') {
		$writer->writeElement('internal_volume', 'false');
	} else {
		$writer->writeElement('internal_volume', 'true');
	}
	
	$writer->writeElement('volume_capacity', $size);
	$writer->writeElement('volume_capacity_used', $usage);

	//$writer->writeElement('dev_name', '/dev/sdb1');
	//$writer->writeElement('volume_id_fs_label', 'DISK_IMG');
	//$writer->writeElement('volume_id_fs_uuid', '00EB-92D2');
	//$writer->writeElement('volume_id_fs_type', 'vfat');

	$writer->endElement(); //volume
	$writer->endElement(); //volume_data
	
	$writer->endDocument();
	$XML = $writer->outputMemory();
	
	file_put_contents($DISPATCHER_PIPE, $XML.$DELIMITER, FILE_APPEND);
}

function removeVolume($volumeId) {
	
	$DISPATCHER_PIPE = "/tmp/wddispatcher.in";
	$DELIMITER = "\0\0\0\0";
	$wdVolumeHandler = "wdVolumeHandler";
	
	$wdmcDispatcherPipe = fopen($DISPATCHER_PIPE, 'r+');
	
	if (!$wdmcDispatcherPipe) {
		$returnCode = RETURN_CODE_FAILURE_EXCEPTION;
		exit($returnCode);
	}
	
	fclose($wdmcDispatcherPipe);
	
	$volumesDB = new VolumesDB();
	
	$retrievedVolume = $volumesDB->getVolume($volumeId);
	
	if ($retrievedVolume) {
		if (!$volumesDB->deleteVolume($volumeId)) {
			$returnCode = RETURN_CODE_FAILURE_REQUEST_FAILED;
			exit($returnCode);
		}
		
		$writer = new XMLWriter();
		$writer->openMemory();
		$writer->startDocument('1.0','UTF-8');
		
		$writer->setIndent(true);
		$writer->setIndentString(str_repeat(' ', 4));
		
		$writer->startElement('volume_data');
		$writer->startAttribute('version');
		$writer->text('1.0');
		$writer->endAttribute();
		
		$writer->writeElement('id', 'volume_remove');
		$writer->writeElement('source', $wdVolumeHandler);
		
		$writer->startElement('volume');
		
		$writer->writeElement('volume_id', $volumeId);
        $writer->writeElement('base_path', $retrievedVolume['base_path']);
        $writer->writeElement('mount_point', $retrievedVolume['base_path']);

		$writer->endElement(); //volume
		$writer->endElement(); //volume_data
		
		
		$writer->endDocument();
		$XML = $writer->outputMemory();
		
		file_put_contents($DISPATCHER_PIPE, $XML.$DELIMITER, FILE_APPEND);
		
	}
}
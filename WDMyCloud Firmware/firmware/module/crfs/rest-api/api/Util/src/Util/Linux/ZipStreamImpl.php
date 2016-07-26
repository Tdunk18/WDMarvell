<?php
namespace Util\Linux;

/**
 * \file Util/src/Util/Linux/ZipstreamImpl.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp
*/

use Util\ZipStream;

/**
 * Compressed Zip Download
 * @author laha_b
 */
class ZipStreamImpl extends ZipStream{

    /**
     * @param array   $zipContent An array of files and directory path to be archived as given by the user. Path of this files or directories has to be relative to fullpath. Or a string consists absolute path of the directory to be archived
     * @param string  $fullPath A string consists absolute path of the directory, whose contents needs to be archived.
     * @param boolean $includeHiddenFile If it is true hidden directories and folders will be included otherwise not.
    **/
	public function generateZipStream($zipContent, $fullPath, $includeHiddenFile = false) {
		set_time_limit(0);
		//check if minizip utility is available
		if(file_exists('/usr/local/bin/minizip') || file_exists('/usr/bin/minizip')){

            //list_content gives both files and dirs to be zipped. create a string consisting all paths
            $zipTargets = '';
            $zipParent = '';
    		if(is_array($zipContent)){
    		    $zipParent  = escapeshellarg($fullPath);
    		    foreach($zipContent as $fileordir){
    		        $zipTargets .= escapeshellarg($fileordir).' ';//create a string of target paths separated by a space
    		    }
    		    /*For intel based devices, due the PAGE SIZE limitation of 4KB, if any string is passed to popen() with length more than 4096*31 characters long, will cause failure.
    		     *To work around this issue, and not to limit non-intel devices with this character limit, we will check device's on run time and decide if the string length is too big or small
    		     */
    		    if(strlen($zipTargets) > 100000){
        		    exec_runtime("getconf PAGE_SIZE", $pageSize, $return);
        		    if(!empty($pageSize[0])){
        		        $limitation = $pageSize[0]*31;
        		        if($limitation < strlen($zipTargets)){
        		            throw new \Core\Rest\Exception('INPUT_STRING_EXCEEDS_DEVICE_SIZE_LIMIT', 400, NULL, "core");
        		        }
        		    }
    		    }
    		}else{
    		    $zipTargets = escapeshellarg(basename($fullPath)); //get the target directory name, which has to be archived
    		    $zipParent  = escapeshellarg(dirname($fullPath)); //Get the parent directory of the target
    		}

    		$hiddenFileParam = $includeHiddenFile ? '' : "! -path '*/\.*'";
    		$fp  = popen("cd $zipParent; find $zipTargets -follow $hiddenFileParam | minizip -0 -s -i", 'r');
		}//minizip utility not available

		// make sure to send all headers first
		// Content-Type is the most important one (probably)
		header('Content-Type: application/octet-stream');
		header("Content-disposition: attachment; filename*=UTF-8''".rawurlencode(basename($fullPath)).".zip");

		// pick a buffsize that makes you happy (8192 has been suggested).
		while(!feof($fp)) {
			\ob_start();
			echo fread($fp, 8192);
			\ob_end_flush();
		}
		pclose($fp);

		set_time_limit(ini_get('max_execution_time'));
	}
}

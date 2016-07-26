<?php
/**
 * \file filesystem/filemanagerutil.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 *
 */
require_once COMMON_ROOT . '/includes/constants.inc';
require_once FILESYSTEM_ROOT . '/includes/filedescriptor.inc';
require_once FILESYSTEM_ROOT . '/includes/fileinformation.inc';
require_once FILESYSTEM_ROOT . '/includes/filehandlefilesource.inc';
require_once FILESYSTEM_ROOT . '/includes/filehandlefiledestination.inc';
require_once FILESYSTEM_ROOT . '/includes/filemanager.inc';

use Jobs\Common;
set_time_limit(0);

define('MAX_BYTES', 65536);
/**
 *
 * Copy a file defined in $sourceFileDescriptor to $destinationFileDescriptor.
 *
 * @param FileDescriptor $sourceFileDescriptor
 * @param FileDescriptor $destinationFileDescriptor
 * @param integer $jobId
 */
function copyFile(FileDescriptor $sourceFileDescriptor, FileDescriptor $destinationFileDescriptor, $overwriteFlag=false, $jobId, $async) {
	$sourceFileManager      = FileManager::getFileManager($sourceFileDescriptor);
	$destinationFileManager = FileManager::getFileManager($destinationFileDescriptor);

	$sourceRelativePath      = $sourceFileDescriptor->getRelativePath();
	$destinationRelativePath = $destinationFileDescriptor->getRelativePath();

    $workCompleteInBytes = 0;
    $workTotalInBytes = $sourceFileManager->getFileInformation($sourceRelativePath)->getFileSize();
    if($async) {
        Jobs\JobManager::getInstance()->setWorkTotal($jobId, $workTotalInBytes);
    }
    // Determine the Chunk size (in bytes) the Job progress be updated
    //
    $progressUpdateChunkSize = \Jobs\Common\TaskManager::getProgressUpdateChunkSize($workTotalInBytes);
    // Start the File(s) copy...
    //
    set_time_limit(0);
	$bytesWorkDone = _copyFile($sourceFileManager, $sourceRelativePath, $destinationFileManager,
            $destinationRelativePath,$overwriteFlag, $jobId, $workCompleteInBytes, $progressUpdateChunkSize, $async);
	set_time_limit(ini_get('max_execution_time'));
    // Done, update the Jobs with Work Completed
    //
    if($async) {
            Jobs\JobManager::getInstance()->setWorkComplete($jobId, $bytesWorkDone);
    }
}//copyFile

/**
 *
 * Internal method used to copy bytes from source to destination
 *
 * @param FileManager $sourceFileManager
 * @param unknown_type $sourceRelativePath
 * @param FileManager $destinationFileManager
 * @param unknown_type $destRelativePath
 * @param unknown_type $jobId
 * @param JobProgress $jobProgress
 */
function _copyFile(FileManager $sourceFileManager, $sourceRelativePath, FileManager $destinationFileManager,
        $destRelativePath, $overwriteFlag, $jobId, $workCompleteInBytes, $progressUpdateChunkSize, $async) {
	$sharesPath     = getSharePath();
	$sourceFilePath = $sharesPath . DS . $sourceRelativePath;
	$destFilePath   = $sharesPath . DS . $destRelativePath;

	if (!$overwriteFlag && ($destinationFileManager->fileExists($destRelativePath) || isFileLfs($destFilePath))) {
		throw new \Exception('FILE_EXISTS', 403);
	}
    if(strcasecmp($sourceFileManager->getFileManagerDescriptor()->getType(), 'Dropbox') !== 0) {
        $fstatArray = fstatLfs($sourceFilePath);
    }
	$osname = \Core\SystemInfo::getOSName() . getPlatformType();
	if($osname == 'linuxoem' && $fstatArray['size'] > 2000000000 ){
		exec_runtime("sudo cp ".escapeshellarg($sourceFilePath)." ". escapeshellarg($destFilePath), $output, $retVal,false);
		if($retVal !== 0) {
		    set_time_limit(ini_get('max_execution_time'));
            throw new \Auth\Exception('File copy failed. Returned with "' . $retVal . '"', 500);
		}
	}
    else {
        $fileHandlefileSource = $sourceFileManager->openFileForReading($sourceRelativePath);
		$destintationFileManagerType = $destinationFileManager->getFileManagerDescriptor()->getType();
        $sourceFileManagerType = $destinationFileManager->getFileManagerDescriptor()->getType();

		\Core\Logger::getInstance()->info($destRelativePath);
		/*if ( strcasecmp($destintationFileManagerType, 'LOCAL') != 0 ) { // NON-LOCAL destination file
			$sourceFileInformation = $sourceFileManager->getFileInformation($sourceRelativePath);
			$fileHandleFileDestination = $destinationFileManager->openFileForWriting($destRelativePath, $sourceFileInformation);
		} else { // LOCAL destination file
			$sourceFileInformation = $sourceFileManager->getFileInformation($sourceRelativePath);
			$fileHandleFileDestination = $destinationFileManager->openFileForWriting($destRelativePath, $sourceFileInformation);
		}*/

        $sourceFileInformation = $sourceFileManager->getFileInformation($sourceRelativePath);
		$fileHandleFileDestination = $destinationFileManager->openFileForWriting($destRelativePath, $sourceFileInformation);

        $currentProgressInBytes = 0;
        $file_size = 0;
        while(!$fileHandlefileSource->eof()) {
            $data = $fileHandlefileSource->read(MAX_BYTES);
            $write_len = $fileHandleFileDestination->write($data);
            $file_size += $write_len;
            $currentProgressInBytes += $write_len;
            $workCompleteInBytes += $write_len;
            // update progress in db
            if($currentProgressInBytes >= $progressUpdateChunkSize) {
                if($async) {
                    \Jobs\JobManager::getInstance()->setWorkComplete($jobId, $workCompleteInBytes);

                    // Check if Job is already Canceled...
                    if(\Jobs\JobManager::getInstance()->isJobCanceled($jobId)) {
                        // User canceled the Job, clean up and get out
                        $sourceFileManager->closeFileForReading();
                        $destinationFileManager->closeFileForWriting();
                        //\Jobs\JobManager::getInstance()->updateJobStateCanceled($jobId);
                        return $file_size;
                    }

                    // Check if JobMonitor is disabled...
                  /*  if(!Common\JobMonitor::getInstance()->isMonitorEnabled()) {
                        // User disabled JobMonitor, clean up and get out
                        $sourceFileManager->closeFileForReading();
                        $destinationFileManager->closeFileForWriting();
                        \Jobs\JobManager::getInstance()->updateJobStateCanceled($jobId);
                        Common\JobMonitor::getInstance()->shutdownJobMonitor();
                        return $file_size;
                    }*/
                }
                $currentProgressInBytes = 0;
            } // if
        }//while
        $sourceFileManager->closeFileForReading();
        $destinationFileManager->closeFileForWriting();
    }
    return $file_size;
}//copyFile

function copyDirectory(FileDescriptor $sourceFileDescriptor, FileDescriptor $destinationFileDescriptor,
        $overwriteFlag=false, $jobId, $async) {
    $sourceFileManager      = FileManager::getFileManager($sourceFileDescriptor);
	$destinationFileManager = FileManager::getFileManager($destinationFileDescriptor);
	$sourceBaseRelativePath      = $sourceFileDescriptor->getRelativePath();
	$destinationBaseRelativePath = $destinationFileDescriptor->getRelativePath();

	if(!$overwriteFlag && $destinationFileManager->fileExists($destinationBaseRelativePath)){
		throw new \Exception('DEST_PATH_EXISTS', 403);
	}

	$dirSize = getDirectorySize($sourceFileManager, $sourceFileDescriptor);
    Jobs\JobManager::getInstance()->setWorkTotal($jobId, $dirSize);
    \Core\Logger::getInstance()->err('Total bytes to copy: ' . $dirSize);

    // Determine the Chunk size (in bytes) the Job progress be updated
    //
    $progressUpdateChunkSize = \Jobs\Common\TaskManager::getProgressUpdateChunkSize($dirSize);
    
    $copydirstart  = microtime(true);
	$sourceDirList = [$sourceFileManager->getFileInformation($sourceBaseRelativePath)];

	//Create destination Dir if it does not exist.
	$destinationFileManager->createDir($destinationBaseRelativePath);
	$sourceBaseRelativePathLength = strlen($sourceBaseRelativePath);
    $workCompleteInBytes = 0;
    $currentProgressInBytes = 0;
    $start = microtime(true);
    set_time_limit(ini_get(0));
    while(!empty($sourceDirList)) {
        $sourceDirFileInformation = array_pop($sourceDirList); //path is relative to the root source
		$sourceDirRelativePath = $sourceDirFileInformation->getRelativePath() . '/' . $sourceDirFileInformation->getFileName();
		$sourceChildrenInfo = $sourceFileManager->getDirChildrenInformation($sourceDirRelativePath);
		//var_dump($sourceChildrenInfo);
		foreach ($sourceChildrenInfo as $sourceChildInfo) {
			if ($sourceChildInfo->getIsDir()) {
				$sourceDirList[] = $sourceChildInfo;
				$destinationDirRelativePath = $destinationBaseRelativePath. '/'
				.substr($sourceChildInfo->getRelativePath(), $sourceBaseRelativePathLength)
				.'/'.$sourceChildInfo->getFileName();
				$destinationDirRelativePath = removeDuplicateForwardSlashes($destinationDirRelativePath);
				if(!stripos($destinationDirRelativePath, '/.wdmc')){
					$destinationFileManager->createDir($destinationDirRelativePath);
				}
			} else {
				$sourceFileRelativePath = $sourceChildInfo->getRelativePath().'/'.$sourceChildInfo->getFileName();
				$destinationFileRelativePath = $destinationBaseRelativePath . '/'
				.substr($sourceChildInfo->getRelativePath(), $sourceBaseRelativePathLength)
				.'/'.$sourceChildInfo->getFileName();
				$destinationFileRelativePath = removeDuplicateForwardSlashes($destinationFileRelativePath);

                if(!stripos($destinationFileRelativePath, '/.wdmc')){

                    $file_size = _copyFile($sourceFileManager, $sourceFileRelativePath, $destinationFileManager,
                            $destinationFileRelativePath, $overwriteFlag, $jobId, $workCompleteInBytes, $progressUpdateChunkSize, $async);
                    $currentProgressInBytes += $file_size;
                    $workCompleteInBytes += $file_size;
                    if($file_size < $progressUpdateChunkSize) {
                        // _copyFile didnt get chance to update progress
                        if($currentProgressInBytes >= $progressUpdateChunkSize) {
                            // If Async, perform sanity checks & necessary updates
                            if($async) {
                                \Jobs\JobManager::getInstance()->setWorkComplete($jobId, $workCompleteInBytes);
                                // Check if Job is already Canceled...
                                if(\Jobs\JobManager::getInstance()->isJobCanceled($jobId)) {
                                    return;
                                }

                                // Check if JobMonitor is disabled...
                                /*if(!Common\JobMonitor::getInstance()->isMonitorEnabled()) {
                                    // User disabled JobMonitor, clean up and get out
                                    \Jobs\JobManager::getInstance()->updateJobStateCanceled($jobId);
                                    Common\JobMonitor::getInstance()->shutdownJobMonitor();
                                    return;
                                }*/
                            } //if($async)
                            $currentProgressInBytes = 0;
                        }
                    }
                    else {
                        $currentProgressInBytes = 0;
                    }
				} //if(!stripos($destinationFileRelativePath, '/.wdmc'))
			} // else
		}//foreach
	}//while
	set_time_limit(ini_get('max_execution_time'));
    $end = microtime(true);
    $taken = ($end - $start)*1000;
    \Core\Logger::getInstance()->err('CopyDir Time: ' . $taken);
    \Jobs\JobManager::getInstance()->setWorkComplete($jobId, $dirSize);
}//copyDirectory

function getDirectorySize(FileManager $sourceFileManager, FileDescriptor $sourceFileDescriptor) {
	$fileCount = 0;
	$dirCount = 0;
	$size = 0;

	$sourceFileManager      = FileManager::getFileManager($sourceFileDescriptor);
	$sourceBaseRelativePath = $sourceFileDescriptor->getRelativePath();

	$sourceDirList = array();
	$baseDirFileInformation = $sourceFileManager->getFileInformation($sourceBaseRelativePath);
	$sourceDirList[] = $baseDirFileInformation; //start with the base directory

    while(!empty($sourceDirList)) {
		$sourceDirFileInformation = array_pop($sourceDirList); //path is relative to the root source
		$sourceDirRelativePath = $sourceDirFileInformation->getRelativePath() . '/' . $sourceDirFileInformation->getFileName();
		$sourceChildrenInfo = $sourceFileManager->getDirChildrenInformation($sourceDirRelativePath);
		foreach ($sourceChildrenInfo as $sourceChildInfo) {
            if ($sourceChildInfo->getIsDir()) {
				$sourceDirList[] = $sourceChildInfo;
				$dirCount++;
			}
            else {
                if(stripos($sourceChildInfo->getFileName(), '/.wdmc') === FALSE) {
                    $size += $sourceChildInfo->getFileSize();
                    $fileCount++;
                }
			} // else
		}//foreach
	}//while
	return $size;
}

function getFileCount($path) {
    $file_count = 0;
    $ignore = array('.','..','.wdmc');
    $files = scandir($path);

    foreach($files as $file) {
        if(in_array($file, $ignore)) {
            continue;
        }
        else {
            if (is_dir(rtrim($path, '/') . '/' . $file)) {
                $file_count += getFileCount(rtrim($path, '/') . '/' . $file);
            } else {
                $file_count++;
            }
        }
    } // foreach
    return $file_count;
}

/**
 * This method is to perform "move" operation on a given file
 *
 * @param currentPath : current absolute path of the file
 * @param newpath : Given Absulute path of the file where it needs to be moved
 */
function moveFile($currentPath, $newPath) {
    if (@rename($currentPath, $newPath)) {
        return true;
    } else if ( @copy($currentPath, $newPath) ) {
        if (@unlink($currentPath)) {
            return true;
        }
    }
    return false;
}//_moveFile


/**
 * The method takes absolute path of the file and the mtime to set
 *
 * $fullPath - Absolute path
 * $mtime - mtime in in Linux epoch format
 *
 *   Returns true on success or false on failure to set mtime.
 */
function changeMtime($fullPath, $mtime) {
    // Setting mtime for existing file.
    if (!empty($mtime)) {
        $return = $output = null;
        $fileOwnerUid = stat($fullPath)['uid'];
        $userUid = posix_geteuid();

        if($fileOwnerUid == $userUid){
            // if the owner is same as current user, then PHP touch
            $return = (touch($fullPath, $mtime, $mtime));
        }
        else{
            // Owners are different then Linux sudo touch
            $escapedFullPath = escapeshellarg($fullPath);
            $escapedmtime = escapeshellarg("--date=@$mtime");
            $return = $output = null;
            exec_runtime("sudo touch $escapedmtime $escapedFullPath", $output, $return, false);
            $return = $return === 0 ? true : false;
        }

        return $return;
    }//if (!empty($mtime))*/
}//changeMtime

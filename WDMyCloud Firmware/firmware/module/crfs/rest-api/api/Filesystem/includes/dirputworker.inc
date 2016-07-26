<?php
use Jobs\Common;
use Shares\Model\Share\SharesDao;
setlocale(LC_ALL, 'en_US.utf8');
/**
 * \file    worker/dirputworker.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */
//require_once JOBS_ROOT . '/includes/progress/jobprogress.inc';
require_once FILESYSTEM_ROOT . '/includes/filedescriptor.inc';
require_once FILESYSTEM_ROOT . '/includes/filemanagerutil.inc';

class DirPutWorker extends Common\JobWorker {

	private $sourceFileManagerDescriptorStr;
	private $sourcePathRelative;
	private $sourceShareName;
	private $sourcePathRelativeToShare;
	private $sourcePathLocal;
	private $isSourceDirLocal;

	private $destPath;
	private $destFileManagerDescriptorStr;
	private $destPathRelative;
	private $destShareName;
	private $destPathRelativeToShare;
	private $destDirPath;
	private $destFullDir;
	private $destPathLocal;
	private $isDestDirLocal;
	private $copy;

	private $destOverwrite;
        static protected $self;

        public static function getInstance() {

            if (!self::$self instanceof DirPutWorker) {
                self::$self = new self();
            }
            return self::$self;
        }

	public function validate() {
		$sharePath = getSharePath();

		if (!startsWith($this->urlPath[0], '@')) {
			// By default if there is no 'File Descriptor' we assume it's a LOCAL Directory.
			array_unshift($this->urlPath, '@LOCAL');
		}

        if (isset($this->queryParams['new_path']) || isset($this->queryParams['dest_path'])) {
            $this->queryParams['new_path'] = isset($this->queryParams['dest_path']) ? $this->queryParams['dest_path'] : $this->queryParams['new_path'];
        }

		// Check if the source directory has a file descriptor
		$this->sourceFileManagerDescriptorStr = $this->urlPath[0];
		$this->sourcePathRelative = implode(DS, array_slice($this->urlPath, 1));
		if (startsWithIgnoreCase($this->urlPath[0], '@LOCAL')) { // LOCAL file
			$this->sourceShareName = isset($this->urlPath[1]) ? trim($this->urlPath[1]) : null;
			$this->sourcePathRelativeToShare   = implode(DS, array_slice($this->urlPath, 2));
			$this->sourcePathLocal  = $sharePath . DS . $this->sourcePathRelative;
		}

		$this->copy = isset($this->queryParams['copy']) ? in_array($this->queryParams['copy'], ['true', '1', 1]) : FALSE;

		$newPath   = isset($this->queryParams['new_path'])   ? trim($this->queryParams['new_path'])  : null;
		if ( !empty($newPath) ) {
			if (startsWith($newPath, '@')){
				throw new \Exception('INVALID_PARAMETER', 400);
			} else {
				// This supports backward compatibility to new_path for local directory.
				$this->queryParams['dest_path'] = $this->queryParams['new_path'];
			}
		}

		$this->isSourceDirLocal = isLocalDir($this->sourceFileManagerDescriptorStr);

		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'dirPath', $this->sourcePathRelativeToShare);

		if ($this->isSourceDirLocal) {
			$mtime = isset($this->queryParams['mtime']) ? trim($this->queryParams['mtime']) : null;
			$mtime = !is_numeric($mtime) ? strtotime($mtime) : $mtime;

			//Validate source directory if it's LOCAL.
			$this->_validateDirSourcePathLocal();
			$this->_setDirMtime($this->sourcePathLocal, $mtime);

            if (!(new SharesDao())->isShareAccessible($this->sourceShareName, !$this->copy, false)) {
                throw new Exception('SHARE_INACCESSIBLE', 401);
            }
		}//if ($this->isSourceDirLocal)

		$this->destPath = isset($this->queryParams['dest_path']) ? trim($this->queryParams['dest_path']) : null;
		if ( !empty($this->destPath) ) {
			$this->destPath = ltrim(rtrim($this->destPath, '/'), '/');
			$destPathArr    = explode('/', $this->destPath);

			if (!startsWith($destPathArr[0], '@')) {
				// By default if there is no 'File Descriptor' we assume it's a LOCAL Directory.
				array_unshift($destPathArr, '@LOCAL');
			}

			$this->destFileManagerDescriptorStr = $destPathArr[0];
			$this->destPathRelative = implode(DS, array_slice($destPathArr, 1));
			$this->destPathRelative = addForwardSlashIfNotAtFront($this->destPathRelative);
			if ( startsWithIgnoreCase($destPathArr[0], '@LOCAL') ) { // LOCAL file
				$this->destShareName = $destPathArr[1];
				$destPathArr   = array_slice($destPathArr, 2);
				$this->destPathRelativeToShare = implode(DS, $destPathArr);
				$this->destDirPath   = implode(DS, array_slice($destPathArr, 0, -1));
				$this->destFullDir   = implode(DS, [$sharePath, $this->destShareName, $this->destDirPath]);
				$this->destPathLocal = $sharePath . DS . $this->destPathRelative;

                if (!(new SharesDao())->isShareAccessible($this->destShareName, true, false)) {
                    throw new Exception('SHARE_INACCESSIBLE', 401);
                }
			}
			$this->destPathLocal = removeDuplicateForwardSlashes($this->destPathLocal);
			$this->isDestDirLocal = isLocalDir($this->destFileManagerDescriptorStr);

			$this->destOverwrite = isset($this->queryParams['overwrite']) ? trim($this->queryParams['overwrite']) : null;
			if($this->destOverwrite === 'false' || $this->destOverwrite === '0' || $this->destOverwrite === 0){
				$this->destOverwrite = false;
			}elseif($this->destOverwrite === 'true' || $this->destOverwrite === '1' || $this->destOverwrite === 1){
				$this->destOverwrite = true;
			}else{
				$this->destOverwrite = ($this->apiVersion >= '2.6')  ? true : false;
			}
			if ($this->isDestDirLocal) {
				//Validate destination directory
				$this->_validateDirDestPathLocal();
			}// if ($this->isDestDirLocal)
		}

	}//validate()

	public function execute() {
                $jobId = $this->queryParams['job_id'];
		if ( !empty($this->destPath) ) {
			/*$doCopy = isset($this->queryParams['copy']) ? trim($this->queryParams['copy']) : null;
			$this->copy = ($this->copy === 'true' || $this->copy === '1' || $this->copy === 1) ? true : false;*/
			if( $this->copy ) {

				//adding a check for the next character of the string to be a slash, to fix the bug in a case when new folder name contains old folder name and more characters at the end (for example copy MyFolder to MyFolderCopy)
				if (strpos(ltrim($this->destPathRelative, '/').'/', ltrim($this->sourcePathRelative, '/').'/') === 0){
					throw new \Exception('CANNOT_COPY_TO_SAME_DIRECTORY', 403);
				}

				$sourceParams = filterQueryParams('source_', $this->queryParams);
				$destParams   = filterQueryParams('dest_', $this->queryParams);

				$isDir = true;
				$sourceFileDescriptor = new FileDescriptor($this->sourceFileManagerDescriptorStr, $sourceParams, $this->sourcePathRelative, $isDir);
				$destFileDescriptor   = new FileDescriptor($this->destFileManagerDescriptorStr, $destParams, $this->destPathRelative, $isDir);

				copyDirectory($sourceFileDescriptor, $destFileDescriptor, $this->destOverwrite, $jobId, $this->getAsync());

			} else { // MOVE/RENAME
				if (!$this->isDestDirLocal || !$this->isSourceDirLocal) {
					throw new \Exception('UNSUPPORTED_OPERATION', 400);
				}
				if (file_exists($this->destPathLocal)){
					if(!\Shares\Model\Share\Listener\deleteDirRecursively($this->destPathLocal))
						throw new \Exception('MOVE_DIR_FAILED', 500);
				}
				if(!$this->_moveDir($this->sourcePathLocal, $this->destPathLocal)){
				    throw new \Exception('MOVE_DIR_FAILED', 500);
				}

			}

		}// if ( !empty($destPath) )
	}//execute()

	public function results() {
		$results = array('status' => 'success');
		if (!empty($mtime)) {
			$attributes   = getAttributes($this->sourcePathLocal, $this->sourcePathRelative, null, null);
			$results['mtime'] = $attributes['mtime']['VALUE'];
		}
		return $results;
	}//results()

	private function _validateDirSourcePathLocal() {

		$message = NULL; //@TODO
		if (trim($this->sourceShareName) == '') {
			throw new \Exception('SHARE_NAME_MISSING', 400);
		}
		if (!file_exists(getSharePath() . DS . $this->sourceShareName)) {
			throw new \Exception('SHARE_NOT_FOUND', 404);
		}
		if (trim($this->sourcePathRelativeToShare) == '') {
			throw new \Exception('DIR_NAME_MISSING', 400);
		}
		if (!isPathLegal($this->sourcePathRelativeToShare)) {
			throw new \Exception('PATH_NOT_VALID', 400);
		}
		if (!file_exists($this->sourcePathLocal)) {
			throw new \Exception('PATH_NOT_FOUND', 404);
		}
		if (!is_dir($this->sourcePathLocal)) {
			throw new \Exception('PATH_NOT_DIRECTORY', 400);
		}
        if (is_link($this->sourcePathLocal)) {
            throw new \Exception('PATH_IS_LINK', 400);
        }
		//Validation ends.
	}//_validateDirSourcePathLocal

	private function _validateDirDestPathLocal() {
		$sharePath = getSharePath();

		$message = NULL; //@TODO
		if (trim($this->destPathLocal) == '') {
			throw new \Exception('NEW_PATH_MISSING', 400);
		}
		if (!isPathLegal($this->destPathLocal)) {
			throw new \Exception('NEW_PATH_INVALID', 400);
		}
		if (trim($this->destShareName) == '') {
			throw new \Exception('SHARE_NAME_MISSING', 400);
		}
		if (!file_exists($sharePath . DS . $this->destShareName)) {
			throw new \Exception('SHARE_NOT_FOUND', 404);
		}
		if (trim($this->destPathRelativeToShare) == '') {
			throw new \Exception('DIR_NAME_MISSING', 400);
		}
		if (invalidFat32Path($this->destPathLocal, $this->destShareName)){
			throw new \Exception('INVALID_CHARACTER', 400);
		}
		if (!file_exists($this->destFullDir)) {
			throw new \Exception('NEW_DIR_NOT_FOUND', 404);
		}
		if(strcmp($this->destPathLocal, $this->sourcePathLocal) == 0){
			throw new \Exception('SOURCE_DEST_DIR_EQUAL', 400);
		}

		$destPath = implode('/', array_slice(explode('/', $this->destPathLocal), 1, (substr_count($this->sourcePathLocal, '/'))));

		\Core\Logger::getInstance()->info(strcmp($destPath, $this->sourcePathLocal));
		if(strcmp("/" . $destPath, $this->sourcePathLocal) == 0){
			throw new \Exception('SOURCE_DEST_DIR_EQUAL', 400);
		}

		if ($this->apiVersion === '1.0') {
			if (file_exists($this->destPathLocal)) {
				throw new \Exception('NEW_PATH_EXISTS', 403);
			}
		} else {
			if (file_exists($this->destPathLocal) && !$this->destOverwrite) {
				throw new \Exception('NEW_PATH_EXISTS', 403);
			}
		}
	}//_validateDirDestPathLocal

	private function _setDirMtime($sourcePathLocal, $mtime) {
		//Setting mtime for existing file.

		$message = NULL; //@TODO
		if (!empty($mtime)) {
			if (!is_numeric($mtime)) {
				throw new \Exception('INVALID_MTIME', 400);
			}
            $escapedFullPath = escapeshellarg($sourcePathLocal);
            $return = $output = null;
            exec_runtime("sudo touch --date=@$mtime $escapedFullPath", $output, $return,false);
			if ( $return != 0 ) {
				throw new \Exception('MTIME_UPDATE_FAILED', 500);
			}
		}
	}//_setDirMtime

	private function _moveDir($sourcePathLocal, $destPathLocal){
	    if(@rename($sourcePathLocal, $destPathLocal)){
	        return true;
	    }
	    else{
	        //PHP rename function does not support across Volumes renaming in Linux. So, we have to use "mv" command to overcome this limitation.
	        $sourcePathLocal = escapeshellarg($sourcePathLocal);
	        $destPathLocal = escapeshellarg($destPathLocal);
	        exec_runtime("mv $sourcePathLocal $destPathLocal", $output, $returnVal, false);
	        if(!($returnVal === 0)){
	            return false;
	        }
	        return true;
	    }
	}
}
<?php

namespace Filesystem\Model;

//Added due to failure to copy a folder which contains double-byte char inside Sequoia
setlocale(LC_ALL, 'en_US.utf8');

require_once(FILESYSTEM_ROOT . '/includes/dir.inc');

class Dir {

	private $isDeviceTypeAvatar = false;
	private $targetPathsArray = array();
	private $output;
	// User Inputs
	private $dirFullPath ="";
	private $requestedPath = "";
	private $includeHidden = false;
	private $includePermissions = false;
	private $singleDirOnly = false;
	private $includeDirCounts = false;
	private $showIsLinked = false;

	function generateDirList($outputFormat , $dirFullPath, $requestPath, $includeHidden, $includePermissions, $dirOnly,$fileOnly,
							 $singleDir=false, $includeDirCount=false, $showIsLinked=false) {
		// Set class variables that don't change in each iteration
		$this->isDeviceTypeAvatar = (getDeviceTypeName() == 'avatar');
		$this->dirFullPath = $dirFullPath;
		$this->requestedPath = $requestPath;
		$this->includeHidden = $includeHidden;
		$this->includePermissions = $includePermissions;
		$this->singleDirOnly = $singleDir;
		$this->includeDirCounts = $includeDirCount;
		$this->showIsLinked = $showIsLinked;
		// OutputWriter
		$this->output = new \OutputWriter(strtoupper($outputFormat));
		$this->output->pushElement("dir");
		$this->output->pushArray("entry");

		// Get Target paths for any links that may have been shared in the requested path
		if($this->showIsLinked){
			$this->targetPathsArray = Link::getTargetsFromTargetPrefix($this->requestedPath, TRUE, FALSE);
		}

		if ($this->singleDirOnly){
            //don't need to filter hung links for this case because of the exists check in the Dir controller
			$dir = new \SplFileInfo($this->dirFullPath);
			$this->generateAttributes($dir, true);
		}else{
			$dirIterator = new \DirectoryIterator ($this->dirFullPath) ;
			foreach ( $dirIterator as $file ) {
				//Ignore any file that starts with a period (e.g. '.', '..', '.hidden')
				if (!$this->includeHidden){
					if (substr($file, 0, 1) == '.'){
						continue;
					}
				}
				else{ // Including hidden files and folders. So just skip . and ..
					if ($file->isDot()){
						continue;
					}
				}
				//using readlink here instead of realpath because real_path fails when php is compiled without large file support
				if ($file->isLink() && !file_exists(readlink($file->getPathname()))) {//hung link
					continue;
				}
				$isDir = $file->isDir();
				$isFile = !($isDir); // What else it could be if not a Dir? A file or a symlink, right?
				if ((!$dirOnly && !$fileOnly) || // Not Only Dir or Only File
					($dirOnly && $isDir) || // Only Dir and Is Dir
					($fileOnly && $isFile) // Only File and Is File
				){
					$this->generateAttributes($file, $isDir);
				}
			}
		}
		$this->output->popArray();
		$this->output->popElement();
		$this->output->close();
	}

	private function generateAttributes($file, $isItADir) {
		$this->output->pushArrayElement();
		$fullname = $this->singleDirOnly ? $this->dirFullPath : $this->dirFullPath."/".$file;

		$fstat = $mtime = null; // Would be reused to retrieve permissions
		if($isItADir){
			$this->output->element('is_dir', 'true');
			if($this->includeDirCounts){
				$subtractDotDot = !$this->isDeviceTypeAvatar ? 2 : 0;
				if($this->includeHidden){
					$dir_count  =  count(glob($fullname."/{*,.}*", GLOB_BRACE | GLOB_ONLYDIR))-$subtractDotDot;
				}else{
					$dir_count =  count(glob($fullname."/*", GLOB_ONLYDIR));
				}
				$this->output->numberElement('dir_count', $dir_count);
			}
			$mtime = $file->getMTime();
		}else{
			$fstat = fstatLfs($fullname, $this->includePermissions);
			$this->output->element('is_dir', 'false');
			$this->output->numberElement('size', $fstat['size']);
		
			if($this->includeDirCounts){
				$this->output->numberElement('dir_count', 0);
			}
			$mtime = $fstat['mtime'];
		}
        $rTrimmedRequestPath = rtrim($this->requestedPath, '/');
		$this->output->element('path', $rTrimmedRequestPath);
		if(!$this->singleDirOnly){
			$this->output->element('name', $file->getBasename());
		}
		$this->output->numberElement('mtime', $mtime);
		
		if($this->includePermissions) {
			if(!isset($fstat)){
				$fstat = fstatLfs($fullname, $this->includePermissions);
			}
			$this->output->numberElement('mode', $fstat['mode']);
			$this->output->numberElement('owner_id', $fstat['owner_id']);
			$this->output->numberElement('group_id', $fstat['group_id']);
			$this->output->element('permissions', $fstat['permissions']);
			$this->output->element('owner_name', $fstat['owner_name']);
			$this->output->element('group_name', $fstat['group_name']);
		}

        if ($this->showIsLinked) {
            $targetPath = $rTrimmedRequestPath;
            if (!$this->singleDirOnly) {
                $targetPath .= DS . $file->getBasename();
            }

			$isLinked = false;
			if(count($this->targetPathsArray) != 0 && in_array($targetPath, $this->targetPathsArray)) {
				$isLinked = true;
			}
			$this->output->element('is_linked', $isLinked? 'true' : 'false');
        }

		$this->output->popArrayElement();
	}

	function rmdirRecursive($deleteDir)
	{
		if (!is_dir($deleteDir))
		{
			return FALSE;
		}

		$success   = TRUE;
		$directory = dir($deleteDir);

		while (FALSE !== ($dirItem = $directory->read()))
		{
			if (in_array($dirItem, ['.', '..']))
			{
				continue;
			}

			$deletePath = $deleteDir . '/' . $dirItem;

			if (is_dir($deletePath))
			{
				$success &= $this->rmdirRecursive($deletePath);
			}
			else
			{
				$success &= unlink($deletePath);
			}

			if (!$success)
			{
				break;
			}
		}

		$directory->close();

		$success &= rmdir($deleteDir);

		return $success;
	}


}

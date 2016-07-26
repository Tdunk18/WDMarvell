<?php

namespace Filesystem\Model;
setlocale(LC_ALL, 'en_US.utf8');

require_once(FILESYSTEM_ROOT . '/includes/contents.inc');

class FileContents {

	const COMPONENT_NAME = 'file_contents';

	/**
	 * Writes the uploaded file to the specified absolute path.
	 * @param $file the absolute path to the file to be written
	 * @param $tmpFile path to the temporary uploaded file
	 * @param $httpRangeFlag boolean flag about http range being passed
	 * @param $start integer start of http range
	 * @param $end integer start of http range
	 * @param $size size of http range chunk
	 * @return true (any errors are explicitely thrown exceptions)
	 */
	function writeFileFromPath($file, $tmpFile, $httpRangeFlag=false, $start=false, $size=false) {
		if ($httpRangeFlag){
				if($start<$size){
					exec_runtime('truncate -s ' . escapeshellarg($start) . ' ' . escapeshellarg($file), $output, $status, false);
				}
				exec_runtime('cat ' . escapeshellarg($tmpFile) . ' >> ' . escapeshellarg($file),  $output, $status, false);
		} else {
			if (!$status = move_uploaded_file($tmpFile, $file)) {
				return false;
			}
		}
		return true;
	}


	/**
	 * Streams uploaded file to the specified absolute path.
	 * @param $path the absolute path to the file to be written
	 * @param $httpRangeFlag boolean flag about http range being passed
	 * @param $start integer start of http range
	 * @param $end integer start of http range
	 * @param $size size of http range chunk
	 * @return true (any errors are explicitely thrown exceptions)
	 */
	function writeFileFromStream($path, $httpRangeFlag=false, $start=false, $size=false) {
		$fileAlreadyExists = file_exists($path);
		$inHandle  = fopen('php://input', 'r');
		$outHandle = fopen($path, 'a');

		if($httpRangeFlag && (bccomp($start,$size) === -1)){
			exec_runtime('truncate -s ' . escapeshellarg($start) . ' ' . escapeshellarg($path));
		}

		//fix for 4Gb filesize limit.  stream_copy_to_stream fails to copy more than 4Gb without chunking
		//if chunks are not used and we are limited by 4294967296 memory limit.
		$sizeOfChunk = 2147482623;  // buffer size of copy. Making it about 2Gb 1 Mb less just in case
		$bytesCopied   =  $totalBytesCopied = 0;
		$expectedSize = $_SERVER['CONTENT_LENGTH'];
		do{
			$bytesCopied = stream_copy_to_stream($inHandle, $outHandle, $sizeOfChunk);
			$totalBytesCopied += $bytesCopied;

		}while($bytesCopied > 0);

		if(bccomp((string)floor($totalBytesCopied), $expectedSize)!=0){
			if(!$fileAlreadyExists){
				unlink($path);
			}
			return false;
		}
		
		fclose($inHandle);
		fclose($outHandle);
		return true;
	}

	function createDir($path)
	{
		if (!isPathLegal($path)){
			throw new \Core\Rest\Exception('PATH_NOT_VALID', 400, NULL, static::COMPONENT_NAME);
		}

		$tempDirsArray = explode(DS, $path);

		foreach ($tempDirsArray as $dirPath){
			if (mb_strlen($dirPath, 'UTF-8') > 255){
				throw new \Core\Rest\Exception('DIR_NAME_LENGTH_INVALID', 400, NULL, static::COMPONENT_NAME);
			}
		}

		if (!isPathLegal($path)){
			throw new \Core\Rest\Exception('PATH_NOT_VALID', 400, NULL, static::COMPONENT_NAME);
		}

		if (!@mkdir($path, 0777, TRUE)){
			throw new \Core\Rest\Exception('DIR_CREATE_FAILED', 500, NULL, static::COMPONENT_NAME);
		}

		return TRUE;
	}

}

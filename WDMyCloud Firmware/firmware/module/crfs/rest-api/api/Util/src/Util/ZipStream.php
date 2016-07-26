<?php

namespace Util;

use \Core\SystemInfo;
use \Core\ClassFactory;

/**
 * \file Util/src/Util/ZipStream.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2011, Western Digital Corp
*/

abstract class ZipStream{

	private static $instance = NULL;

	/**
 	* getInstance()
 	*
 	* Returns the Operating System-specific singleton instance of this abstract class
 	*
 	* @return \Util\ZipStream A ZipStream implemantation class instance.
 	*/
	static public function getInstance() {
		if (is_null(self::$instance)) {
			self::$instance = ClassFactory::getImplementation('Util\ZipStream', array("osname"=>SystemInfo::getOSName()));
		}
		return self::$instance;
	}

	/**
	* \par Description:
	* Method to zip a directory or a list of files specified in $filesOrDirToZip param.
	*
	* \param filesOrDirToZip  string or string array - required
	* \param zipFileName      string - required
	* \param includeHidden    boolean - optional
	*
	* \par Parameter Details:
	* - filesOrDirToZip    -   Abs path to the directory to be ziped. Or list of files to be ziped
	*                          with filename as the key and filname with abs path as the value.
	* - zipFileName        -   Name of the zip file with .zip extension.
	* - includeHidden      -   Optional param if hidden files to be included. Not currently applicable for Windows.
	*/

	abstract public function generateZipStream($filesOrDirToZip, $zipFileName, $includeHidden);
}
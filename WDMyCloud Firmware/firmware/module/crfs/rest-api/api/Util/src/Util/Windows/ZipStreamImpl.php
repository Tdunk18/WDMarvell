<?php
namespace Util\Windows;

/**
 * \file Util/src/Util/Windows/ZipStreamImpl.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2011, Western Digital Corp
*/

use Util\ZipStream;
use Core\Logger;

class ZipStreamImpl extends ZipStream {

    /*
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
	public function generateZipStream($filesOrDirToZip, $zipFileName, $includeHidden = false){
        Logger::getInstance()->info(__METHOD__ . " PARAMS: ", array('files='.var_export($filesOrDirToZip, true), 'zipFileName' => $zipFileName, 'includeHidden' => $includeHidden));

        $zipArchive = new \ZipArchive();
        if($zipArchive->open($zipFileName, \ZipArchive::OVERWRITE) !== TRUE)
            throw "Failed to crate $zipFileName zip file.";
        if(is_array($filesOrDirToZip)) {
            $this->addFilesToZip($filesOrDirToZip, $zipArchive);
        }
        else {
            if(is_dir($filesOrDirToZip))
                $this->addFolderToZip($filesOrDirToZip, $zipArchive);
            else {
                $this->addFilesToZip(array($filesOrDirToZip), $zipArchive);
            }
        }
        $zipArchive->close();

        // Make sure to send all headers first
        // Content-Type is the most important one (probably)
        //
        header('Content-Type: application/octet-stream');
        header('Content-disposition: attachment; filename="'. $zipFileName. '"');
        header('Content-Transfer-Encoding: binary');
        header('Content-Length: ' . filesize($zipFileName));

        \ob_clean();
        \ob_start();
        // readfile() will not present any memory issues, even when sending large files, on its own.
        // If you encounter an out of memory error ensure that output buffering is off with ob_get_level().
        readfile($zipFileName);
        \ob_end_flush();
        \unlink($zipFileName);

        // Uncomment if readfile() becomes an issue.
        // pick a bufsize that makes you happy (8192 has been suggested).
/*        $fp = fopen($zipFileName, 'r');
        $bufsize = 8192;
        $buff = '';
        while( !feof($fp) ) {
            $buff = fread($fp, $bufsize);
            echo $buff;
            flush();
        }
        fclose($fp);
 *
 */
	}


    /* \par Description:
     * Function to zip a given list of files specified as first param.
     *
     * $fileList:   Supposed to be a 2-dim array with fileName as the key and
     *              filename with fullpath as the value.
     */
    function addFilesToZip($fileList = array(), $zipArchive) {
        foreach($fileList as $filePath) {
            if(is_file($filePath)) {
                $fileName = \basename($filePath);
                if(($fileName !== ".") && ($fileName !== ".."))
                    $zipArchive->addFile($filePath, $fileName);
            }
        }
    } //addFilesToZip

    /* Function to recursively add a directory, sub-directories and files to a zip archive.
     *
     * If third parameter (zipdir) is not specified, the directory being added will be
     * added at the root of the zip file preserving the folder structure. Otherwise, all
     * files are added at the root.
     *
     */
    function addFolderToZip($dir, $zipArchive, $zipdir = '') {
        if (is_dir($dir)) {
            if (($dh = opendir($dir))) {
                //Add the directory to Zip
                if(!empty($zipdir))
                    $zipArchive->addEmptyDir($zipdir);

                // Iterate thru files in the folder
                while (($file = readdir($dh)) !== false) {
                    //If it's a folder, run the function again!
                    if(!is_file($dir . $file)) {
                        // Skip parent and root directories
                        if( ($file !== ".") && ($file !== "..")) {
                            // Linux NAS devices stop at first level so no need to add sub folders.
                            // Uncomment the following if sub folders and their sub folders archiving is required.
                            // //
                            // $this->addFolderToZip($dir . $file . DIRECTORY_SEPARATOR, $zipArchive, $zipdir . $file . DIRECTORY_SEPARATOR);
                        }
                    }
                    else {// Add the file
                        $zipArchive->addFile($dir . $file, $zipdir . $file);
                    }
                }
            }
        } //if (is_dir($dir))
        else {// Add the files
            $zipArchive->addFile($dir . $file, $zipdir . $file);
        }
    } //addFolderToZip
}
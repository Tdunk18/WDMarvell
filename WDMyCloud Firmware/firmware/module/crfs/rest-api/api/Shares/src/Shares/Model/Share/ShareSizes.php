<?php

namespace Shares\Model\Share;

    /*
     * @author WDMV - Mountain View - Software Engineering
     * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
     */
use Metadata\Exception;
use Core\Logger;

/**
 * Singleton class storing share size info
 *
 */
class ShareSizes {

    private static $_instance = null;

    private $_shareSizes;   // Array containing share sizes

    /* Declaring the constructor as private to ensure that this
     * object is not created as a new instance outside of this class.
     *  Use getInstance function to create this object
     */
    private function __construct() {
    }

    public static function getInstance() {
        if (self::$_instance === null) {
            self::$_instance = new ShareSizes();
        }
        return self::$_instance;
    }

    public function getShareSize($shareName){
        if (!isset($this->_shareSizes)){
            $this->_shareSizes = $this->_loadShareSizes();
        }
        return (isset($this->_shareSizes[$shareName])) ? $this->_shareSizes[$shareName] : 0;
    }


    /*
    * Reading the Share Size info from a file.
    *
    * AS of ITR#76358, the file containing share sizes is updated only on a 60 second poll basis,
    * and only when the datavolume size has changed by a delta of 1GB over the last time it was calculated.
    * Also, the process has been limited to use at most 20% of the CPU for details.
    *
    * @param
    * @return array
    */
    private function _loadShareSizes(){
        $sizeArray = array();
        try {
            $sizeArray = array();
            if (getDeviceTypeName() == "sequioa") {
                if(($handle = parse_ini_file(getShareSizeFilePath(), true)) !== FALSE) {
                    $path = $handle['global']['WD_NAS_VAR_DIR'];
                    $cache = $handle['global']['SHARE_SIZE_CACHE'];
                    $cachePath = explode('/' , $cache);
                    $sizeFilePath = $path . '/' .$cachePath[1];
                    $sizeFile = file_get_contents($sizeFilePath);
                    $sizeFileLineArray = explode("\n", $sizeFile);
                    foreach($sizeFileLineArray as $line){
                        $results = explode("\t", $line);
                        $size = !empty($results[0]) ? $results[0] : 0;
                        $shareName = trim(str_replace('/shares/', '', $results[1]));
                        $sizeArray[$shareName] = (float)$size;
                    }
                }
            }
        } catch (\Exception $e){
            Logger::getInstance()->err(__FUNCTION__ . "Failed to load share sizes");
        }
        return $sizeArray;
    }
}
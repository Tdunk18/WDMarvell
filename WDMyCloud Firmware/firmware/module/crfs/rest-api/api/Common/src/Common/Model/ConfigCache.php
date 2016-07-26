<?php
namespace Common\Model;

/**
 * Class ConfigCache
 * This class tracks an array of cached values using APC.
 * Multiple instances of a cache can be used and are identified by the $type value (e.g. $type='HASHED_PASSWORDS').
 * In order to know when a cache is no longer valid, each instance tracks the last mtime for a specified file.
 * As long as the mtime is unchanged, the cache is still valid.  If the mtime is modified, the cache is cleared.
 * The filename is commonly a configuration file (e.g. shadow) or a database file.
 * Note: Not finding a value in the cache MUST always be properly handled (there is no guarantee that a previously stored value is still there since values can be cleared at any time).
 */
class ConfigCache {
    private $type;
    private $filename;
    private $mtime;
    private $creationTime;
    private $timeout;
    private $valuesArray;

    public static function getConfigCache($type) {
        return apc_fetch(ConfigCache::getApcKey($type));
    }

    /**
     * 
     * @param unknown $type cached entity ID
     * @param unknown $filename file path of file to watch for modifications
     * @param string $timeout in seconds
     * @return ConfigCache
     */
    public static function initializeConfigCache($type, $filename, $timeout=NULL) {
        $cache = new ConfigCache($type, $filename, $timeout);
        apc_store(ConfigCache::getApcKey($type), $cache);
        return $cache;
    }

    public function getValue($key) {
        //return NULL;
        if($this->isExpired()) {
            $this->reset();
            apc_store(ConfigCache::getApcKey($this->type), $this);
            return NULL;
        }
        if(is_array($this->valuesArray) && array_key_exists($key, $this->valuesArray))
            return $this->valuesArray[$key];
        else
            return NULL;
    }

    public function putValue($key, $value) {
        $this->valuesArray[$key] = $value;
        apc_store(ConfigCache::getApcKey($this->type), $this);
    }
    
    public function deleteValue($key) {
    	if (is_array($this->valuesArray) && array_key_exists($key, $this->valuesArray)) {
	    	unset($this->valuesArray[$key]);
	    	apc_store(ConfigCache::getApcKey($this->type), $this);
    	}
    }

    private function __construct($type, $filename, $timeout=NULL) {
        $this->type = $type;
        $this->filename = $filename;
        $this->timeout = $timeout;
        $this->reset();
    }

    private function reset() {
        $this->mtime = ($this->filename==NULL)? 0 : filemtime($this->filename);
        $this->creationTime = time();
        $this->valuesArray = array();
    }

    private function isExpired() {
        //If there is a timeout and it has passed, then it is expired
        if( ($this->timeout!=NULL) && (time() - $this->creationTime > $this->timeout) ) {
            return true;
        }
        //If there is a file and it's timestamp has changed, then it is expired
        if( ($this->filename != NULL) && ($this->mtime != filemtime($this->filename)) ) {
            return true;
        }
        return false;
    }

    public static function getApcKey($type) {
        return "CACHE_".$type;
    }

}



<?php
/**
 * New Lock class that uses apc cache instead of a lock file,. This code is synchronized between different threads because apc_add
 * is an atomic operation, so if apc_add fails, then some other thread has the lock. See: https://bugs.php.net/bug.php?id=57970
 *
 */

 namespace Util;

 class Lock{

 	private static $namePrefix = '\\Util\\Lock\\';
	private $name;
	private $lockID = 0;
	private $lockTimeout;  //max time that lock can be held for, in milliseconds


	/**
	 * Constructor - Creates a lock
	 *
	 * @param unknown $name name of lock. If a lock with this name already exists in the apc
	 * cache then this object instance will be linked to that lock, else a new one will be created.
	 * @param number $timeout number of seconds to wait before lock is released, if not released earlier, defaults to 2 seconds
	 */
	public function __construct($name, $lockTimeout=5){
		$this->name = self::$namePrefix . $name;
		$this->lockTimeout = $lockTimeout;
	}

	/**
	 * Desctructor - releases the lock if it is still acquired
	 */

	function __destruct() {
		$this->release();
	}


	/**
	 * Acquire the lock - if lock is not already acquired by this, or another, PHP thread then the lock will be acquired and this function
	 * will return immediately, else it will wait for the lock to be released up to the max. wait time.
	 *
	 * @param long $waitTimeMS the time to wait for the lock to be released if it is aquired. Defaults to 0 seconds
	 * @param long $sleepMS number of miliseconds to sleep before trying to acquire the lock again if it is locked, default is 250ms. 
	 * Use caution when setting a long sleep time: this function will block the PHP thread until the sleep time expires. 
	 * Also, try to avoid very short sleep times as this will likely lead to higher CPU usage
	 * @return boolean true if the lock was acquired, else false.
	 */
	public function acquire($waitTimeMS=0, $sleepMS=250) {
		if ($this->isAcquired()) {
			return true;
		}
		$endWaitTime = (microtime(true) + ($waitTimeMS/1000));
		while(true) {
			//apc_add is atomic, so if it returns false, we can be sure another thread has already added this variable before
			//this thread tried to add it. When release() is called by the aquiring thread to delete the named variable from the cache,
			//then apc_add will return true to the next thread that calls apc_add with the same variable name
			$now = microtime(true);
			if  (!apc_add($this->name, $now, $this->lockTimeout)) {
				if ($now < $endWaitTime) {
					usleep($sleepMS * 1000); //wait $sleeptimeMS miliseconds
				}
				else {
					return false; //wait timeout
				}
			}
			else {
				//file_put_contents("/tmp/locktrace.txt", "Lock: " . $this->name . " ACQUIRED, ID: " . $now . PHP_EOL, FILE_APPEND);
				$this->lockID = $now; //save lock ID
				return true; //lock acquired
			}
		}
	}

	/**
	 * Does what it says
	 *
	 * @return true if lock succesfully rekeased, else false
	 */
	public function release() {
		if ($this->isAcquired()) {
			if (apc_delete($this->name)) {
				//file_put_contents("/tmp/locktrace.txt", "Lock: " . $this->name . " RELEASED, ID: " . $this->lockID . PHP_EOL, FILE_APPEND);				
				$this->lockID = 0;
				return true;
			}
		}
		return false;
	}

	/**
	 * Test if the lock is acquired by this thread. This function returns immediately. i
	 * @return boolean true if lock is acquired by this thread, else false
	 */
	public function isAcquired() {
		$cachedLockID = apc_fetch($this->name);
		if (!$cachedLockID || ($cachedLockID != $this->lockID)) {
			return false;
		}
		return true;
	}

}
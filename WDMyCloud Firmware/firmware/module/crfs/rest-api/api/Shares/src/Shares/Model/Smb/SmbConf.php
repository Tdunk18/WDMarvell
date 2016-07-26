<?php

namespace Shares\Model\Smb;

require_once(COMMON_ROOT . '/includes/globalconfig.inc');

use Shares\Exception;
use Shares\Model\Share\Share;
use Shares\Model\Share\Access;
use Shares\Model\Share\AccessLevel;

require_once(FILESYSTEM_ROOT . '/includes/db/volumesdb.inc');

class SmbConf {

	const SMB_CONF_SOURCE_KEY = "SMB_CONF_SOURCE";
	const SMB_CONF_COPY_KEY = "SMB_CONF_COPY";
	const SMB_CONF_SHARENAMES_KEY = "SMB_CONF_SHARENAMES";
	const SMB_CONF_SHARES_KEY = "SMB_CONF_SHARES";
	const SMB_CONF_SHARES_ACCESS_KEY = "SMB_CONF_SHAREACCESS";
	const SMB_CONF_COPY_DIR = "/tmp/";
	const SMB_CONF_COPY_PREFIX = "smb_copy_0";

	private static $metaTagStr = "# !!";

	/**
	 * Parse a given smb conf file
	 * @param string $smbConfPath path to the conf file
 	 * @throws Exception
	 */
	private $volumes = [];
	private $smbConfPath;
	private $smbCopyDir;
	private $smbConfArray;

	private static $settingsPrefix = "__smb_";

	/**
	 * returns path to copy of samba conf file
	 */
	private function getSmbCopyPath() {
		return tempnam($this->smbCopyDir, self::SMB_CONF_COPY_PREFIX);
	}

	/**
	 * First-pass traversal of smb.conf - all this does is extract share configuration lines
	 * and add them to an associative array, indexed by share name. This gives fast access
	 * to any share definition within smb.conf
	 */
	private function readSmbConfFile($smbConfPath) {
		
		//need to clear stat before getting mtime since it might be cached and therefore incorrect
		clearstatcache();
        $currentCtime = filectime($smbConfPath);
        $lastReadSmbConfTime = apc_fetch('lastReadSmbConfTime');

        if ($currentCtime !== false && $lastReadSmbConfTime !== false && $lastReadSmbConfTime > $currentCtime) {
            $cached = apc_fetch('smbConfArray');
            if ($cached !== false) {
                $this->smbConfArray = $cached;
                return;
            }
        }
		$nowTime = time();
		$this->smbConfArray = array();
		$smbConfLines = file($smbConfPath);
		if (empty($smbConfLines)) {
			throw new Exception("SmbConf.php : failed to read smb.conf file: " . $smbConfPath );
		}
        $sectionName = null;
		foreach($smbConfLines as $confLine) {
            $confLine = trim($confLine);

			if ($confLine[0] == '[') {
				$pos = strpos($confLine, ']');
				$sectionName = trim(substr($confLine, 1, $pos-1));
				if ($sectionName == 'global' || $sectionName == 'printer') {
					$sectionName = self::$settingsPrefix . $sectionName ;   //add prefix so they don't clash with share names
				}
				$this->smbConfArray[(string)$sectionName] = array();
			}
			elseif ($sectionName !== null && !empty($confLine)) {
				$this->smbConfArray[$sectionName][] = $confLine;
			}
		}

        apc_store('lastReadSmbConfTime', $nowTime);
        apc_store('smbConfArray', $this->smbConfArray);
	}


	/**
	 * Build the internal volumes array from the Volumes table in orion.db
	 */
	private function buildVolumesArray() {
		$volumesDB = new \VolumesDB();
		$allVolumes = $volumesDB->getVolume();
		foreach($allVolumes as $allVolumesV){
			if (!empty($allVolumesV['mount_path'])) {
				$this->volumes[$allVolumesV['mount_path']]['vol_id'] = $allVolumesV['volume_id'];
				$this->volumes[$allVolumesV['mount_path']]['dynamic'] = $allVolumesV['dynamic_volume'];
				$this->volumes[$allVolumesV['mount_path']]['file_system_type'] = $allVolumesV['file_system_type'];
				$this->volumes[$allVolumesV['mount_path']]['capacity'] = $allVolumesV['capacity'];
				$this->volumes[$allVolumesV['mount_path']]['read_only'] = $allVolumesV['read_only'];
				$this->volumes[$allVolumesV['mount_path']]['handle'] = $allVolumesV['handle'];
			}
			else {
				//hack for Sequoia where mount_path = null
				$this->volumes[$allVolumesV['base_path']]['vol_id'] = $allVolumesV['volume_id'];
				$this->volumes[$allVolumesV['base_path']]['dynamic'] = $allVolumesV['dynamic_volume'];
				$this->volumes[$allVolumesV['base_path']]['file_system_type'] = $allVolumesV['file_system_type'];
				$this->volumes[$allVolumesV['base_path']]['capacity'] = $allVolumesV['capacity'];
				$this->volumes[$allVolumesV['base_path']]['read_only'] = $allVolumesV['read_only'];
				$this->volumes[$allVolumesV['base_path']]['handle'] = $allVolumesV['handle'];
			}
		}
	}

	/**
	 * Create a single share object from the tokenized smb.conf section that defines that share.
	 * This is  a key element in the Lazy PArsing of amb.conf. For a single share we only parse the part of the
	 * smb.conf file that defines that share.
	 */

	private function createShareObject($shareName, $shareConf) {

			if (empty($this->volumes)) {
				$this->buildVolumesArray();
			}

			$share = new Share();
			$share->setName($shareName);
			$share->setAbsolutePath($shareConf['path']);
			$share->setDescription($shareConf['comment']);
			$share->setReadOnly(empty($shareConf["write list"]));
			$share->setPublicAccess((strpos($shareConf['public'],'yes') === 0) ? 'true' : 'false');
			if(empty($shareConf['available'])){
				// If flag not present, Samba makes it available by default. To handle regular Shares
				// (SmartWare, TimeMachine) or legacy Shares creates prior to 2.0 (Public, Private),
				// set the Available flag to true.
				$share->setSambaAvailable(true);
			}
			else{
				$share->setSambaAvailable((strpos($shareConf['available'],'yes') === 0) ? true : false);
			}
			//set any properties
			$propertiesTag = self::$metaTagStr . "properties";
			if (isset($shareConf[$propertiesTag])) {

				//init properties to false - this is the setting if no property is set
				$share->setMediaServing(false);
				$share->setRemoteAccess(false);
				$share->setShareAccessLocked(false);
				$share->setRecycleBin(false);

				$properties = explode(",", $shareConf[$propertiesTag]);
				foreach($properties as $property) {
					if (strpos($property,"media_serving") !== false) {
						$share->setMediaServing(true);
					}
					if (strpos($property,"remote_access") !== false) {
						$share->setRemoteAccess(true);
					}
					if (strpos($property,"recycle_bin") !== false) {
						$share->setRecycleBin(true);
					}
				}
				// Look for new Cloud Shares 2.0 attributes
				// Share_Access_Locked
				if (in_array('"share_access_locked"', $properties, TRUE)) {
					$share->setShareAccessLocked(true);
				}
				else {
					$share->setShareAccessLocked(false);
				}
				// Target_Path
				if (in_array('"target_path"', $properties, TRUE)) {
					// If target_path set, then the Share Path in Smb Conf is the target_path for this Share
					// Check & remove share root (/share) from path if exists
					$shareRoot = getSharePath();
					if(strpos($shareConf['path'], $shareRoot) === 0){
						$targetRelPath = substr($shareConf['path'], strlen($shareRoot));
						$share->setTargetPath($targetRelPath);
					}
					else{
						$share->setTargetPath($shareConf['path']);
					}
				}//if in_array("@target_path"...
			}

            $foundVolume = null;
            if (!$share->getTargetPath()) {
            	if (isset($this->volumes[$shareConf['path']]) ) { //share path exactly matches volume path - probably share
            																 //for a dynamic volume
            		$foundVolume = $this->volumes[$shareConf['path']];
            	}
            }

            if (empty($foundVolume)) {
            	//share on fixed volume
                foreach ($this->volumes as $volumePath => $volumeInfo) {
                    if ($share->getTargetPath()) {
                        //NOTE: using the target share to find the volume because links need to be on the same volumes as their targets.
                        $targetShareName = explode(DS, trim($share->getTargetPath(), DS), 2)[0];
                        $shareVolumePathToTest = $volumePath . DS . $targetShareName;
                        if (is_link($shareVolumePathToTest) || file_exists($shareVolumePathToTest)) {
                            $foundVolume = $volumeInfo;
                            break;
                        }
                    } elseif (strpos($shareConf['path'] . DS, $volumePath . DS) === 0) {
                        $foundVolume = $volumeInfo;
                        break;
                    }
                }
            }

            if (!empty($foundVolume)) {
                $share->setVolumeId($foundVolume['vol_id']);
                $share->setDynamicVolume(false);

                //Set capacity, handle, read_only and file_system_type variables if it is a removable share
                if($foundVolume['dynamic'] == 'true'){

                    $share->setHandle($foundVolume['handle']);
                    $share->setCapacity(floatval($foundVolume['capacity']));
                    $share->setReadOnly($foundVolume['read_only']);
                    $share->setFileSystemType($foundVolume['file_system_type']);
                    $share->setDynamicVolume(true);
                }
            }

			//parse access list from share conf
			$this->parseShareAccess($shareName, $shareConf, $share);

			//if share is public and remote access is not set in smb.conf, then set it by default
			if ($share->getPublicAccess() && !$share->getRemoteAccess()) {
				$share->setRemoteAccess(true);
			}

			// Backward compatibility: For normal Shares that do NOT have 'available' flag set yet, set it if public is enabled.
			// What about regular Private shares?
			if($share->getPublicAccess() && !$share->getShareAccessLocked() && !$share->getTargetPath()){
				$share->setSambaAvailable(true);
			}
			
			// Set the recycle bin related share attributes.
			$share->setVfsObject($shareConf['vfs object']);
			$share->setRecycleKeeptree($shareConf['recycle:keeptree']);
			$share->setRecycleVersions($shareConf['recycle:versions']);
			$share->setRecycleSubDirMode($shareConf['recycle:subdir_mode']);
			$share->setRecycleRepository($shareConf['recycle:repository']);

			return $share;
	}

	/**
	 * Extracts key-value pairs from the raw smb.conf entry for a single share
	 * and returns them as an associative array for further processing
	 */
	private function tokenizeShareConf($shareName) {

		$smbConf = array();
		$smbConfLines = $this->smbConfArray[$shareName];
		foreach($smbConfLines as $smbConfLine) {
			$keyVal = explode("=", $smbConfLine);
			if (empty($keyVal) || empty($keyVal[0])) {
				continue;
			}
			$val = null;
			$key = trim($keyVal[0]);
			if (sizeof($keyVal) > 1) {
				$val = trim($keyVal[1]);
			}
			$smbConf[$key] = $val;
		}
		return $smbConf;

	}

	/**
	 * Object mapping for all the share entries in smb.conf.
	 */
	private function parseShares() {
		$shares = [];
		foreach($this->smbConfArray as $shareName => $value) {
			$shareName = (string) $shareName;
            if (strpos($shareName, self::$settingsPrefix) !== 0) {
                $shares[$shareName] = $this->createShareObject($shareName, $this->tokenizeShareConf($shareName));
            }
		}
		return $shares;
	}

	/**
	 * Object mapping for access records for a single share.  This function creates an array of Access objects for a single
	 * share from the tokenized share configuration. It adds this array to the access array, which is indexed by share name.
	 */
	private function parseShareAccess($shareName, $shareConf, $share = null) {
			$writeUsers = [];
			$shareAccessList = [];
			if (isset($shareConf["write list"])) {
				$writeList = explode(",", $shareConf["write list"]);
				foreach ($writeList as $rwUser) {
					if (!empty($rwUser)) {
						if (strpos($rwUser, "nobody") === false) {
							if(substr($rwUser, -1) == '"' && substr($rwUser, 0, 1) == '"'){
								$rwUser = substr($rwUser, 1, -1);
							}
							$writeUsers[$rwUser] = true;  //keep track of write users so we can ignore them if they are in the read list
														  //this is one way of simulating  a hash-set in PHP
							$userAccess = new Access();
							$userAccess->setShareName($shareName);
							$userAccess->setUsername($rwUser);
							$userAccess->setAccess(AccessLevel::READ_WRITE);
							if ($share != null) {
								$share->addAccess($userAccess);
							}
							$shareAccessList[$rwUser] = $userAccess;
						}
					}
				}
			}

			if (isset($shareConf["read list"])) {
				$readList = explode(",", $shareConf["read list"]);
				foreach ($readList as $roUser) {
					if (!empty($roUser)) {
						 if ( strpos($roUser, "nobody") === false ) {
							if(substr($roUser, -1) == '"' && substr($roUser, 0, 1) == '"'){
								$roUser = substr($roUser, 1, -1);
							}
							if (!array_key_exists($roUser, $writeUsers)) {
								//only add read-only users here. If the username was also in the write-list, then they were already added with read-write access
								$userAccess = new Access();
								$userAccess->setShareName($shareName);
								$userAccess->setUsername($roUser);
								$userAccess->setAccess(\Shares\Model\Share\AccessLevel::READ_ONLY);
								if ($share != null) {
									$share->addAccess($userAccess);
								}
								$shareAccessList[$roUser] = $userAccess;
							}
						}
					}
				}
			}
			//Process invalid users (access = NOT AUTHORIZED) - this is obsolete as deleting access for a user
			//achieves the same thing, but we still need to support it for backwards compatibility
			if (isset($shareConf["invalid users"])) {
				$invalidList = explode(",", $shareConf["invalid users"]);
				foreach ($invalidList as $invUser) {
					if (!empty($invUser)) {
						if (strpos($invUser, "nobody") === false) {
							if(substr($invUser, -1) == '"' && substr($invUser, 0, 1) == '"'){
								$invUser = substr($invUser, 1, -1);
							}
							$userAccess = new Access();
							$userAccess->setShareName($shareName);
							$userAccess->setUsername($invUser);
							$userAccess->setAccess(AccessLevel::NOT_AUTHORIZED);
							if ($share != null) {
								$share->addAccess($userAccess);
							}
							$shareAccessList[$invUser] = $userAccess;
						}
					}
				}
			}

			return($shareAccessList);
	}

	/**
	 * Take a share object and return an array of smb.conf settings for the share
	 */

	private function shareToSmb($share) {

		$shareSmb = array();

		//add properties like media-serving and remote-access as a comment
		$properties = "";

		if ($share->getMediaServing()) {
			$properties = "\"media_serving\"" ;
		}
		if ($share->getRemoteAccess()) {
			$properties = empty($properties) ? "\"remote_access\"" : $properties . ",\"remote_access\"";
		}
		if ($share->getShareAccessLocked()) {
			$properties = empty($properties) ? "\"share_access_locked\"" : $properties . ",\"share_access_locked\"";
		}
		if($share->getTargetPath()){
			$properties = empty($properties) ? "\"target_path\"" : $properties . ",\"target_path\"";
		}
		if($share->getRecycleBin()){
			$properties = empty($properties) ? "\"recycle_bin\"" : $properties . ",\"recycle_bin\"";
		}
		$isPublic = $share->getPublicAccess() ? 'yes' : 'no';
		$isAvailable = $share->getSambaAvailable() ? 'yes' : 'no';

		$username = $share->getUsername();

		$shareSmb[] = 'comment = ' . $share->getDescription();
		$shareSmb[] = 'path = ' . $share->getAbsolutePath();
		$shareSmb[] = 'browseable = yes';
		$shareSmb[] = 'public = ' . $isPublic;
		$shareSmb[] = 'available = ' . $isAvailable;
		$shareSmb[] = 'oplocks = yes';
		$shareSmb[] = 'map archive = no';
		if ($share->getPublicAccess()) {
			$shareSmb[] = 'guest ok = yes';
			$shareSmb[] = 'writable = yes';
		}
		else {
			//add any share access

			$writers = [];
			$readers = [];
			$invalid = [];
            $valid = [];

			if (!empty($username)) {
				//give share username RW access
				$writers[] = $username;
				$readers[] = $username;
                $valid[] = $username;
			}

			foreach ($share->getAccessList() as $accessUser => $access) {
				if ($access->getAccess() ==  \Shares\Model\Share\AccessLevel::READ_WRITE) {
					$writers[] = $valid[] = '"' . $accessUser . '"';
				}
				else if ($access->getAccess() ==  \Shares\Model\Share\AccessLevel::READ_ONLY){
					//read -only
					$readers[] = $valid[] = '"' . $accessUser . '"';
				}
				else if ($access->getAccess() == \Shares\Model\Share\AccessLevel::NOT_AUTHORIZED) {
					$invalid[] = '"' . $accessUser . '"';
				}
			}

			$writeList = "write list = ";

			if (!empty($writers)) {
				$writeList =  $writeList . implode(",", $writers);
			}
			$shareSmb[] = $writeList;

			$readList = "read list = ";

			if (!empty($readers)) {
				$readList = $readList . implode(",", $readers);
			}
			$shareSmb[] = $readList;

			$invalidList = 'invalid users = "nobody"';
			if (!empty($invalid)) {
				$invalidList = $invalidList . "," . implode(",", $invalid);
			}
			$shareSmb[] = $invalidList;

            $validList = 'valid users = ';
			if (!empty($valid)) {
                $validList = $validList . implode(',', $valid);
			} else {
                $validList = 'valid users = "nobody"';
            }
            $shareSmb[] = $validList;
		}

		//add recycling attributes
		if($share->getVfsObject() === 'recycle'){
    		$shareSmb[] = 'vfs object = ' . $share->getVfsObject();
    		$isRecycleKeeptree = $share->getRecycleKeeptree() ? 'yes' : 'no';
    		$shareSmb[] = 'recycle:keeptree = ' . $isRecycleKeeptree;
    		$isRecycleVersions = $share->getRecycleVersions() ? 'yes' : 'no';
    		$shareSmb[] = 'recycle:versions = ' . $isRecycleVersions;
    		$shareSmb[] = 'recycle:subdir_mode = ' . $share->getRecycleSubDirMode();
    		$shareSmb[] = 'recycle:repository = ' . $share->getRecycleRepository();
		}
		$shareSmb[] = '# !!properties = ' . $properties;

		return $shareSmb;
	}

	/**
	 * Writes SMB.conf from internal state
	 */

	private function writeSmbFile($smbConfPath) {
		//create a temp file to write into
		$tmpSmbFilePath = $this->getSmbCopyPath();

		$cr = PHP_EOL;
		$content = "";

		//write the entire smbConf array into the temp file
		foreach ($this->smbConfArray as $section => $sectionContents) {
			if (strpos($section, self::$settingsPrefix) === 0) {
				//strip prefix
				$section = substr($section, strlen(self::$settingsPrefix));
			}
			$content .= "[". $section . "]" . $cr;
			foreach ($sectionContents as $sectionLine) {
					$content .= $sectionLine . $cr;
			}
			$content .= $cr;
		}

        $written = file_put_contents($tmpSmbFilePath, $content) !== false;

        apc_delete('lastReadSmbConfTime');
        apc_delete('smbConfArray');

		//swap the files and delete the temp file
		if ($written) {
			$output = $retVal = null;
			//use mv as it is atomic
			exec_runtime("sudo chown root:share $tmpSmbFilePath && sudo chmod 660 $tmpSmbFilePath && sudo mv $tmpSmbFilePath $smbConfPath", $output, $retVal, false);
			if (file_exists($tmpSmbFilePath)) {
				unlink($tmpSmbFilePath);
			}
			if ($retVal !== 0) {
				throw new Exception('Could not copy smb configuration file ',  500);
			}
			return true;
		}
		return false;
	}

	/**
	 * Constructor - reads smb.conf and carries out initial, first-pass parse.
	 */

	public function  __construct($smbConfFilePath, $smbConfCopyDir = null) {
 		$this->smbConfPath = $smbConfFilePath;
		$this->smbCopyDir = $smbConfCopyDir ? $smbConfCopyDir : self::SMB_CONF_COPY_DIR;

		if (!file_exists($this->smbConfPath)) {
			throw new Exception("SmbConf.php : smb.conf file: " . $this->smbConfPath . " not found");
		}

		//read smb conf file into an array - read the actual file as there is no need to
		//make a copy for read and doing so just slows things down
		$this->readSmbConfFile($this->smbConfPath);

	}

	/**
	 * Get the shares defined in smb.conf.
	 *
	 * @return assoc. array of Share class instances, with shareName as the key,
	 * false if no shares
	 *
	 */

	public function getShares() {
		return $this->parseShares();
	}

	/**
	 * Get the Share Names
	 *
	 * @return a one-dimensional array of share names,
	 * false if no shares
	 *
	 */

	public function getShareNames() {
        $filtered = [];
        foreach ($this->smbConfArray as $shareName => $v) {
            if (strpos($shareName, self::$settingsPrefix) !== 0) {
                $filtered[$shareName] = $v;
            }
        }
		return $filtered;
	}

	/**
	 * Get the Share instance for a named share
	 * @param string $shareName
	 * @return Share instance matching share name, false if no match
	 */

	public function getShare($shareName) {
		if (!array_key_exists((string)$shareName, $this->smbConfArray)) {
			//share with that name does not exist
			return null;
		}

		return $this->createShareObject((string)$shareName, $this->tokenizeShareConf((string)$shareName));
	}

	/**
	 * Get teh access lists for all shares, by share name
	 */

	public function getAccessListForAllShares() {
		$allAccessList = [];
		foreach($this->smbConfArray as $shareName => $value) {
            if (strpos($shareName, self::$settingsPrefix) !== 0) {
				$allAccessList[$shareName] =
						$this->parseShareAccess($shareName, $this->tokenizeShareConf($shareName));
            }
		}
		return $allAccessList;
	}

	/**
	 * Get the access list for a named share
	 * @param string $shareName name of share
	 *
	 * @returns one dimensional array of Access objects for the share, false if no match
	 */

	public function getAccessListForShare($shareName) {
		return $this->parseShareAccess((string)$shareName, $this->tokenizeShareConf((string)$shareName));
	}

	/**
	 * Add a new share to the SMB configuration file. The share object that  passed-in is converted to the necessary lines in SMB Conf
	 * format and these are appended to a copy of the SMB Conf file. The updated copy is then used to replace the existing SMB Conf
	 * file. This now uses the new shareToSmb() function to convert a Share Object to the SMB Conf lines needed to define it
	 * @param Share $share - the share object to add
	 */
	public function addShare($share) {
		if (empty($this->volumes)) {
			$this->buildVolumesArray();
		}
		$shareAbsPath = null;

        foreach ($this->volumes as $volPath => $volume) {
            if ($share->getVolumeId() === $volume['vol_id']) {
                if ($volume['dynamic'] === 'true' && strpos($volPath . DS, DS . (string)$share->getName(). DS) !== false) {
                    $shareAbsPath = $volPath;
                } else {
                    $shareAbsPath = $volPath . DS . $share->getName();
                }
                break;
            }
        }

		// If the new Share has target_path, then set it as the share Path in the smb.conf &
		// add @target_path flag to 'Valid Users' list
		if($share->getTargetPath()) {
			// sanitize path & append share path
			$targetPathArray = explode(DS, trim($share->getTargetPath()));
			// Remove all DS from array & reIndex array
			foreach(array_keys($targetPathArray, "") as $key){
				unset($targetPathArray[$key]);
			}
			$targetPathArray = array_values($targetPathArray);
			$shareAbsPath = getSharePath() . DS. implode(DS, $targetPathArray);
		}

        $share->setAbsolutePath($shareAbsPath);

		//create a temp file to write into
		$tmpSmbFilePath = $this->getSmbCopyPath();

		if (!copy($this->smbConfPath, $tmpSmbFilePath)) {
			if (file_exists($tmpSmbFilePath)) {
				unlink($tmpSmbFilePath);
			}
			throw new Exception("SmbConf.php : failed to copy smb.conf file from: " . $this->smbConfPath . " to: " . $tmpSmbFilePath );
		}

		$shareName = (string)$share->getName();

		$this->smbConfArray[$shareName] = $this->shareToSmb($share);

		//write it out to tmp file

		$fp = fopen($tmpSmbFilePath, 'a');
		fwrite($fp, PHP_EOL.'[ ' . $shareName . ' ]' . PHP_EOL);


		foreach($this->smbConfArray[$shareName] as $shareLine) {
			if (!empty($shareLine) && !ctype_space($shareLine)) {
				fwrite($fp, $shareLine . PHP_EOL);
			}
		}

		fclose($fp);

		//swap the files and delete the temp file
		$output = $retVal = null;
		//use mv as it is atomic
		exec_runtime("sudo chown root:share $tmpSmbFilePath && sudo chmod 660 $tmpSmbFilePath && sudo mv $tmpSmbFilePath $this->smbConfPath", $output, $retVal, false);

        apc_delete('lastReadSmbConfTime');
        apc_delete('smbConfArray');

		if ($retVal !== 0) {
			throw new Exception('Could not copy smb configuration file ',  500);
		}

		return true;
	}

    /**
     * Add access levels for users to an existing share.
     *
     * @param string $inShareName the name of the share to add accesses to.
     * @param array $accesses array with username keys and access level values ('ro' or 'rw'). Both strings.
     * @return true on success, false otherwise
     */
	public function addAccessesToShare($inShareName, $accesses) {
		$shareName = (string)$inShareName;
		if ( !isset($this->smbConfArray[$shareName]) ) {
			throw new Exception("SmbConf.addAccessToShare() - share name not found in smb config: " . $shareName);
		}

		$share = $this->getShare($shareName);

		//share access lists should be small (1-10 users), this code is not intended to handle 1000's of user
		//for a single share and that is not currently a requirement

        foreach ($accesses as $username => $accessLevel) {
			//add to share
			$share->addAccess(new Access($shareName, $username, $accessLevel));
        }

        //update share object list and SmbConfArray

        $this->smbConfArray[$shareName] = $this->shareToSmb($share);
		//update smb.conf
		if (!$this->writeSmbFile($this->smbConfPath)) {
			throw new Exception("SmbConf.addAccessToShare() - failed to update smb.conf file at path: " . $this->smbConfPath);
		}

		return true;
	}

	public function modifyAccessToShare($inShareName, $username, $accessLevel) {
		$shareName = (string)$inShareName;
		if ( !isset($this->smbConfArray[$shareName]) ) {
			throw new Exception("SmbConf.modifyAccessToShare() - share name not found in smb config: " . $shareName);
		}

		//share access lists should be small (1-10 users), this code is not intended to handle 1000's of user
		//for a single share and that is not

		$share = $this->getShare($shareName);

		$share->addAccess(new Access($shareName, $username, $accessLevel));

        //update SmbConfArray

        $this->smbConfArray[$shareName] = $this->shareToSmb($share);

		//update smb.conf
		if (!$this->writeSmbFile($this->smbConfPath)) {
			throw new Exception("SmbConf.addAccessToShare() - failed to update smb.conf file at path: " . $this->smbConfPath);
		}

		return true;
	}

	public function deleteAccessToShare( $inShareName,  $username ) {
		$shareName = (string)$inShareName;
		if ( empty($this->smbConfArray[$shareName]) ) {
			throw new Exception("SmbConf.addAccessToShare() - share name not found in smb config: " . $shareName);
		}

		//update share access list and SmbConfArray

		$share = $this->getShare($shareName);

		$share->deleteAccess(new Access($shareName, $username, null));

		$this->smbConfArray[$shareName] = $this->shareToSmb($share);

		//update smb.conf

		if (!$this->writeSmbFile($this->smbConfPath)) {
			throw new Exception("SmbConf.addAccessToShare() - failed to update smb.conf file at path: " . $this->smbConfPath);
		}

		return true;

	}

	/**
	 * Modify the definition of a share in SMB Conf.
	 */

	public function modifyShare($inShareName, $share) {
		$shareName = (string)$inShareName;
		if(!isset($this->smbConfArray[$shareName])){
			throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, null, 'shares');
		}

		if ($share->getName() != $shareName) {
			//share has been renamed
			$newShareName = $share->getName();
			//replace share name in path, only if the Share path is not a target path;
			// if target path set means, path referring to a path in a different Share so no change required
			if ( !$share->getTargetPath() ) {
				//get share object for existing share
				$oldShare = $this->getShare($shareName);
				//modify existing path
				$sharePath = $oldShare->getAbsolutePath();
				$pos = strpos($sharePath, $shareName);
				$newSharePath = substr($sharePath,0, $pos) . $newShareName . substr($sharePath,$pos + strlen($shareName));
				$share->setAbsolutePath($newSharePath);
			}

			//delete smb conf for old share name
			unset($this->smbConfArray[$shareName]);
			$shareName = $share->getName();
		}
		//replace existing share settings in smbconf array
		//with settings from updated share
		$this->smbConfArray[$shareName] = $this->shareToSmb($share);

		//write the values into the file
		if (!$this->writeSmbFile($this->smbConfPath)) {
			throw new Exception("SmbConf.modifyShare() - failed to update smb.conf file at path: " . $this->smbConfPath);
		}
		return true;
	}

	public function deleteShare($inShareName) {
		$shareName = (string)$inShareName;
		if (!array_key_exists($shareName, $this->smbConfArray)) {
			//share with that name does not exist
			throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, null, 'shares');
		}

		unset($this->smbConfArray[$shareName]);

		//re-write smb.conf to remove the share
		if (!$this->writeSmbFile($this->smbConfPath)) {
			throw new Exception("SmbConf.modifyShare() - failed to update smb.conf file at path: " . $this->smbConfPath);
		}

		return true;
	}

	public function getSmbFilePath() {
		return $this->smbConfPath;
	}

}

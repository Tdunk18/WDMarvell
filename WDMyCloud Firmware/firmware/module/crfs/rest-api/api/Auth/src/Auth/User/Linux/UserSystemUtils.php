<?php
namespace Auth\User\Linux;

require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/security.inc');


use Auth\User\LoginContext;
use Auth\User\Linux\UserManagerImpl;
use Common\Model\ConfigCache;
use Auth\User\UserSecurity;
use Filesystem\Model\Link;

class UserSystemUtils {

	static $instance;

	const shadowFileKey = 'shadow';
	const groupFileKey = 'group';
	const passwdFileKey = 'passwd';
	const smbPasswdFileKey = 'smbpasswd';
	const smbConfFileKey = 'smb_conf';
	
	const uidKey = 'UID';
	const gidKey = 'GID';
	
	const usernameKey= 'user_name';
	const passwordKey = 'password';
	const informationKey = 'information';
	const homeDirKey = 'home_directory';
	const shellKey = 'shell';
	
	const groupNameKey = 'group_name';
	const groupListKey = 'group_list';
	
	const lastChangedKey = 'last_changed';
	
	const minimumKey = 'minimum';
	const maximumKey = 'maximum';
	const warnKey = 'warn';
	const inactiveKey = 'inactive';
	const expireKey = 'expire';
	
	const lanmanHashKey = 'lanman_hash';
	const ntHashKey = 'nt_hash';
	const accountFlagsKey = 'account_flags';
	const lastChangeTime = 'last_change_time';
	
	const adminGroupKey = 'administrators';
	const cloudholdersGroupKey = 'cloudholders';
	
	
	//map of locations of files used (both read and written to) in this class
	//temporary  files are created on write to be swapped for real files as an extra security measure
	//the values are obtained from globalconfig.ini
	private static $pathsMap = array();

	//column structure of each of the files modified, accept for smb_conf, since it has non-column structure
	private static $structuresMap = array(

	self::passwdFileKey => array (
			0 => self::usernameKey,
			1 => self::passwordKey,
			2 => self::uidKey,
			3 => self::gidKey,
			4 => self::informationKey,
			5 => self::homeDirKey,
			6 => self::shellKey),

	self::groupFileKey => array (
			0 => self::groupNameKey ,
			1 => self::passwordKey,
			2 => self::gidKey,
			3 => self::groupListKey),

	self::shadowFileKey => array (
			0 => self::usernameKey,
			1 => self::passwordKey,
			2 => self::lastChangedKey,
			3 => self::minimumKey,
			4 => self::maximumKey,
			5 => self::warnKey,
			6 => self::inactiveKey,
			7 => self::expireKey),

	self::smbPasswdFileKey => array (
			0 => self::usernameKey,
			1 => self::uidKey,
			2 => self::lanmanHashKey,
			3 => self::ntHashKey ,
			4 => self::accountFlagsKey,
			5 => self::lastChangeTime)

	);

    private static $reservedUsernameArray = [
                                                'root' => 'root',
                                                'messagebus' => 'messagebus',
                                                'squeezecenter'=>'squeezecenter',
                                                'ftp'=>'ftp',
                                                'sshd' => 'sshd',
                                                'www-data' => 'www-data',
                                                'nobody' => 'nobody',
                                                'daapd' => 'daapd',
                                                'guest' => 'guest'
                                            ];

	private static $exclusionArray = array(	'root' => 'root',   //system usernames
																'www-data' => 'www-data',
																'nobody' => 'nobody',
																'daapd' => 'daapd',
																'guest' => 'guest');
	
	private static $sharingGroups = array(self::adminGroupKey => '1001',
										  self::cloudholdersGroupKey => '2000');

	private static $adminUID = false;	//this value is different on different platforms and is therefore obtained from platform config
															//because user name of admin can be modified we use the ID to keep track of who the admin(owner) is

	private static $shareGroupName = "share"; //all users must belong to the group share

	private static $webserverUser = false;	//this value is different on different platforms and is therefore obtained from platform config

	private static $startUID = false;	//this value is different on different platforms and is therefore obtained from platform config
	
	private static $deviceType;
	private static $isSequoiaNas;
	private static $isAvatarNas;
	private static $isAlphaNas;
	
	private static function getDeviceType() {
		if (!isset(self::$deviceType)) {
			self::$deviceType = getDeviceTypeName();
		}
		return self::$deviceType;
	}

	private static function isSequoia() {
		if (!isset(self::$isSequoiaNas)) {
			self::$isSequoiaNas = strcasecmp(self::getDeviceType(), "sequioa") == 0 ? true : false; 
			                                                        //^SIC, do not correct
		}
		return self::$isSequoiaNas;
	}
	
	private static function isAvatar() {
		if (!isset(self::$isAvatarNas)) {
			self::$isAvatarNas = strcasecmp(self::getDeviceType(), "avatar") == 0 ? true : false;
		}
		return self::$isAvatarNas;
	}

	
	private static function isAlphaNas() {
		if(!isset(self::$isAlphaNas)) {
			self::$isAlphaNas = (!self::isSequoia() && !self::isAvatar());
		}
		return self::$isAlphaNas;
	}
	
	private function updateFtp($cmd = null) {
		if (self::isSequoia()) {
			$ftpEnabled = file_get_contents('/etc/nas/service_startup/vsftpd');
			if (strpos($ftpEnabled,'enabled') !== false ){
				// restart ftp service
				$restartCmd = "/etc/init.d/vsftpd restart";
				if ($cmd !== null) {
					$cmd = $cmd . ';' . $restartCmd;
				}
				else {
					$cmd = $restartCmd;
				}
			}
			if ($cmd !== null) {
				exec_runtime("nohup sudo sh -c \"" . $cmd . "\" > /dev/null 2>&1 &"  , $output, $retVal, false);
				if ( $retVal !== 0) {
					throw new \Auth\Exception('Failed to update or restart FTP service"' . $retVal . '"', 500);
				}
			}
		}
	}
	
	private function addFtpUser($username) {
		if (self::isSequoia()) {
			$cmd = "sudo echo " . escapeshellarg($username) . " >> /etc/user_list";
			$this->updateFtp($cmd);
		}
	}

	private function deleteFtpUser($username) {
		if (self::isSequoia()) {
			$sedArg = escapeshellarg("/$username/d");
			$cmd = "sudo sed -i $sedArg /etc/user_list";
			$this->updateFtp($cmd);
		}
	}

	private function modifyFtpUser($oldUsername, $newUsername) {
		if (self::isSequoia()) {
			$sedArgEsc = escapeshellarg("0,/$oldUsername/s/$oldUsername/$newUsername/");
			$cmd = "sudo sed -i $sedArgEsc /etc/user_list";
			$this->updateFtp($cmd);
		}
	}

	private function modifyGroups($userName, $isAdmin, $newUserName = null ) {

		//get the contents of group file
		$groupsArray = $this->getFileArray(self::groupFileKey);
	
		//loop through the array and modify the username or admin status where needed
		
		foreach($groupsArray as $groupsArrayK => $groupsArrayV){
			$groupMembers = explode(',', $groupsArrayV[self::groupListKey]);
			$foundIdx = array_search($userName, $groupMembers);
			if ($groupsArrayK==self::adminGroupKey  ) {
				if (($newUserName != null) && ($foundIdx !== FALSE)) {
					//username has changed and user is in admin group
					if ($isAdmin) {
						$groupMembers[$foundIdx] = $newUserName; //replace existing username with new username
					}
					else {
						unset($groupMembers[$foundIdx]); //remove user from administrators  groups
					}
				}
				else if (($newUserName == null) && ($foundIdx !== FALSE)) {
					//username is in administrators, if isAdmin is false, remove user
					if (!$isAdmin) {
						unset($groupMembers[$foundIdx]);
					}
				}
				else if ($isAdmin) {
					//username not found in administrators group, add if isAdmin is true
					if ($newUserName == null) {
						$groupMembers[] = $userName;
					}
					else {
						$groupMembers[] = $newUserName;
					}
				}
			}
			else if ( $groupsArrayK==self::cloudholdersGroupKey) {
				if (($newUserName != null) && ($foundIdx !== FALSE)) {
					//username has changed and user is in admin group
					$groupMembers[$foundIdx] = $newUserName; //replace existing username with new username
				}
				else if ($isAdmin && $foundIdx === FALSE) {
					//add admin user to cloudholders group as admin must be in both groups
					$groupMembers[] = $userName;
				}
			}
			else if (($newUserName != null) && ($foundIdx !== FALSE)) {
				//for all other groups, replace user name if changed - we do NOT add user to other groups if not found
				$groupMembers[$foundIdx] = $newUserName; //replace existing username with new username
			}
			//put the modified array of group members back together into a string and replace the string in general gropus array
			$groupsArray[$groupsArrayK][self::groupListKey] = implode(',', $groupMembers);
		}
		//write the information about all the records in group file and swap temp file with final file
		$this->writeToTempFile($groupsArray, self::groupFileKey);
		$this->swapFiles(array(self::groupFileKey));
	}
	
	private function __construct()
	{

		//obtain the values of platform-specific variables and fill up the "empty" (false) spaces in the maps
		$authConfig = getGlobalConfig("auth");
		self::$adminUID =  $authConfig['ADMIN_UID'];
		self::$pathsMap = 	array(				self::passwdFileKey => array(	'final' => $authConfig['PASSWD'],
																			'tmp' => $authConfig['PASSWD_TMP'],
																			'other' => $authConfig['PASSWD_OTHER']),
												self::groupFileKey => array(	'final' => $authConfig['GROUP'],
																			'tmp' => $authConfig['GROUP_TMP'],
																			'other' => $authConfig['GROUP_OTHER']),
												self::shadowFileKey => array('final' => $authConfig['SHADOW'],
																			'tmp' => $authConfig['SHADOW_TMP'],
																			'other' => $authConfig['SHADOW_OTHER']),
												self::smbConfFileKey => array('final' => $authConfig['SMB_CONF'],
																			'tmp' => $authConfig['SMB_CONF_TMP'],
																			'other' => $authConfig['SMB_CONF_OTHER']),
												self::smbPasswdFileKey => array('final' => $authConfig['SMBPASSWD'],
																			'tmp' => $authConfig['SMBPASSWD_TMP'],
																			'other' => $authConfig['SMBPASSWD_OTHER']));

		self::$webserverUser = $authConfig['WEB_SERVER_USER'];
		self::$startUID = $authConfig['START_UID'];
	}

	static public function getInstance() {
		if (!isset(self::$instance)) {
			self::$instance = new static;
		}
		return self::$instance;
	}

	public function getValidGroups() {
		if (!isset(self::$instance)) {
			self::$instance = new static;
		}
		return self::$instance;
	}
	

	/**
	 * Gets an array of the usernames for the OS users
	 *
	 * @return array $usersArray - array of usernames
	 * example return:
	 Array
		(
			[3] => admin
			[4] => katya7
			[5] => katya10
			[6] => katya11
		)
	 */
	public 	function getUsernames() {

		
		//get the contents of groups file
		$groupsArray = $this->getFileArray(self::groupFileKey);

		//users whose primary group is the share group will not be listed in group_list in group file, so we need to get them from the passwd file
		$shareGroupID = $groupsArray[self::$shareGroupName][self::gidKey];

		//get the contents of passwd file
		$passwdArray = $this->getFileArray(self::passwdFileKey);

		//accumulate the users here
		$usersArray = array();

		//exclude the system users
		$exclusionArray = array(	'root' => 'root',
												'www-data' => 'www-data',
												'nobody' => 'nobody',
												'daapd' => 'daapd',
												'guest' => 'guest',
												'squeezecenter' => 'squeezecenter',
												'messagebus' => 'messagebus');

		if (self::isAvatar()) {
			unset($exclusionArray['guest']);
		}

		foreach($passwdArray as $passwdArrayK => $passwdArrayV){
			//if the primary group if share group or this is admin user (admin user will have administrators ad primary group)  so we need that extra check

            if(($passwdArrayV[self::uidKey] >= self::$adminUID) && !isset($exclusionArray[$passwdArrayK])){
            	if (is_int($passwdArrayK)) {
            		//linux allows all-digit usernames, so we need to cast those as string to avoid a mixed-type array
            		//which most clients will not be expecting if they call this function
            		$usersArray[] = (string)$passwdArrayK;
            	}
            	else {
	                $usersArray[] = $passwdArrayK;
            	}
            }
		}

		return $usersArray;
	}


	/**
	 * Creates a user and modifies all system files that need to be modifie: passwd, group, shadow and smbconf
	 * there is no need to modify smb.conf because the new user is not present in it
	 *
	 * @param string $userName holds the new user name
	 * @param string $password holds the new user password
	 * @param string $fullName holds the new full name of the user (not used for Orion)
	 * @param string $groupMembership string group membership
	 * @return boolean $status indicates the success or failure of this operation
	 */
	public function createUser($userName, $password, $fullName, $groupMembership)
	{


		//get the contents of password file to add the new record to it and group file to add the user to it
		$passwordArray = $this->getFileArray(self::passwdFileKey);
		$groupsArray = $this->getFileArray(self::groupFileKey);


		/******PASSWD*****/

		//find all the currentlly used UIDs and the username name of the owner
		//username of the owner will be used when creating an empty value in password file
		//to use the record of the owner as the format standard
		$existingUIDsArray = array();
		$adminName = 'admin';
		foreach($passwordArray as $passwordArrayK => $passwordArrayV){
			$existingUIDsArray[$passwordArrayV[self::uidKey]]=$passwordArrayV[self::uidKey];
			if($passwordArrayV[self::uidKey] == self::$adminUID){
				$adminName = $passwordArrayV[self::usernameKey];
			}
		}

		//Find the next available UID  as there is no guarantee UIDs will be allocated sequentially
		$currentUID = self::$startUID;
		$currentUIDFound = false;
		while(!$currentUIDFound && $currentUID <65000){
			if(!isset($existingUIDsArray[$currentUID])){
				$currentUIDFound = true;
			}else{
				$currentUID =  $currentUID + 1;
			}
		}

		//if we happen to run out of user ids throw an exception
		if($currentUID==64999){
			throw new \Auth\Exception('No more user Ids available, 64999 reached', 500);
		}

		//if full name is present then information column will contain it, if not - leave it empty
		$information = ($fullName !== null && $fullName != '') ? $fullName.',,,' : '';

		//create new record for passwd file
		$passwordArray[$userName] = array(	self::usernameKey => $userName,
											self::passwordKey => 'x',
											self::uidKey => $currentUID,
											self::gidKey => $groupsArray[self::$shareGroupName][self::gidKey], //group ID of the group that all users must belong to
											self::informationKey => $information,
											self::homeDirKey => '/shares',
											self::shellKey => '/bin/sh');

		//write the information about all the records in passwd file, including the new record into temp file
		$this->writeToTempFile($passwordArray, self::passwdFileKey);
		//swap the temp file and real passwd file
		$fileKeys = array();
		$fileKeys[] = self::passwdFileKey;

		/******GROUP*****/

		//define which groups the user must belong to. first - the default group (share)
		$groupsUser = array(self::$shareGroupName => self::$shareGroupName);

		//if this is an admin user add it to administrators group
		if($groupMembership== self::adminGroupKey){
			$groupsUser[self::adminGroupKey] = self::adminGroupKey;
			$groupsUser[self::cloudholdersGroupKey] = self::cloudholdersGroupKey;
		}elseif($groupMembership== self::cloudholdersGroupKey){
			$groupsUser[self::cloudholdersGroupKey] = self::cloudholdersGroupKey;
		}

		//if we are running the webserver as 'www-data' add the user to this group
		if(self::$webserverUser!='root' && isset($groupsArray[self::$webserverUser])){
			$groupsUser[self::$webserverUser] = self::$webserverUser;
		}

		//add new user to each of the group lists of groups that were defined above
		foreach($groupsUser as $groupsUserK => $groupsUserV){
			$groupsArray[$groupsUserV][self::groupListKey] .= ','.$userName;
		}

		//write the information about all the records into temp file and swap temp file with final file
		$this->writeToTempFile($groupsArray, self::groupFileKey);
		$fileKeys[] = self::groupFileKey;
	

		/******SHADOW AND SMBPASSWD*****/

		//create empty smb password records. This is needed both if the password is to remain empty and if it needs to be modified.
		//$this->createPasswordRecordSmb($userName);

		//read shadow file into associative array
		$shadowArray = $this->getFileArray(self::shadowFileKey);

		//copy the format of admin record (the only record we can count on being there at all times)
		$newRecordForShadow = $shadowArray[$adminName];
		//replace username withn new username
		$newRecordForShadow[self::usernameKey] = $userName;
		//replace password with empty value
		$newRecordForShadow[self::passwordKey] = '';
		//add the new record to the array
		$shadowArray[$userName] = $newRecordForShadow;

		//write the information about all the records into temp file and swap temp file with final file
		$this->writeToTempFile($shadowArray, self::shadowFileKey);
		$fileKeys[] = self::shadowFileKey;
		
		$this->swapFiles($fileKeys);
			
		//if password was passed down - modify it, otherwise save an empty password value in shadow file as well
		if(empty($password)){	
			//save empty password in smbpassword
			$this->emptyPasswordRecordSmb($userName);
		}else{
			//modify password
			$this->writePasswordIn($userName, $password);
		}

				
		/****** UPDATE FTP USERS FILE *****/
		
		$this->addFtpUser($userName);
		return true;
	}

	
	/**
	 * Temporarily returning the funtions that we used in the past o
	 */
	public function createUserAlpha($userName, $password, $fullName, $groupMembership)
	{
	
		if (!empty($password)) {
			$decodedPw = base64_decode($password, false);
			if($decodedPw === false){
				throw new \Auth\Exception('Failed to decode password', 500);
			}
		}
		
		try {
			$output = $retVal = null;
			$fullNameStr = ($fullname==null) ? "" : escapeshellarg("full_name=".$fullName);
			$passwordStr = ($password==null) ? "" : escapeshellarg("password=" . $decodedPw);
			$isAdmin = ($groupMembership == self::adminGroupKey);
			exec_runtime("sudo /usr/local/sbin/addUserVendor.sh ".escapeshellarg($userName)." ".(int)$isAdmin." ".$passwordStr." ".$fullNameStr,  $output, $retVal, false);
			if ( $retVal !== 0) {
				throw new \Auth\Exception(sprintf('"addUserVendor.sh" call failed. Returned with "%d"', $retVal), 500);
			}
			
			exec_runtime("sudo /usr/local/sbin/restart_service.sh ");
			if ( $retVal !== 0) {
				throw new \Auth\Exception(sprintf('"restart_service.sh" call failed. Returned with "%d"', $retVal), 500);
			}
		
		} catch ( \Exception $e ) {
			// a "rollback" so to speak.
			$this->deleteUser($userName);
			throw $e;
		}
	
		$this->copyOtherFiles();
		return true;
	}
	
	
	
	/**
	 * Modifies a user and saves the changes in all effected  system files
	 * passwd, group, shadow, smbconf, smb.conf
	 *
	 * @param string $username holds the new user name
	 * @param string $password holds the new user password
	 * @param string $fullName holds the new full name of the user (not used for Orion)
	 * @param string $newUserName new username if it is a username change, else defaults null
	 * @return boolean $status indicates the success or failure of this operation
	 *
	 */
	public function modifyUserAlpha($userName, $fullname, $newPassword, $isAdmin, $changePassword, $newUsername = null)
	{
	
		if ($changePassword) {
			//new password can be empty
			$decodedPw = '';
			if ($newPassword != '' && $newPassword != null) {
				$decodedPw = base64_decode($newPassword, false);
				if($decodedPw == false) {
					throw new \Auth\Exception("password decode failed", 500);
				}
			}
		}
		
		$output = $retVal = null;
		$isAdminStr = ($isAdmin==null) ? "" : "is_admin=".(int)$isAdmin;
		$newUsernameStr = ($newUsername==null) ? "" : "new_username=".escapeshellarg($newUsername);
		$passwordStr = ($changePassword==null) ? "" : "password=".escapeshellarg($decodedPw);
		$fullNameStr = ($fullname==null) ? "" : "full_name=".escapeshellarg($fullName);
		
		exec_runtime("sudo /usr/local/sbin/modifyUserVendor.sh ".escapeshellarg($userName)." ".$isAdminStr." ".$newUsernameStr." ".$passwordStr." ".$fullNameStr,  $output, $retVal);
		if ( $retVal !== 0) {
			throw new \Auth\Exception(sprintf('"modifyUserVendor.sh" call failed. Returned with "%d"', $retVal), 500);
		}
		
		exec_runtime("sudo /usr/local/sbin/restart_service.sh ");
		if ( $retVal !== 0) {
			throw new \Auth\Exception(sprintf('"restart_service.sh" call failed. Returned with "%d"', $retVal), 500);
		}
	
		$this->copyOtherFiles();
		return true;
	}
	
	
	public function deleteUserAlpha($userName) {

		// delete the user
		$output = $retVal = null;
		exec_runtime("sudo /usr/local/sbin/deleteUserVendor.sh ".escapeshellarg($userName), $output, $retVal);
		if ( $retVal !== 0 ) {
			throw new \Auth\Exception(sprintf('"deleteUser.sh" call failed. Returned with "%d"', $retVal), 500);
		}
		exec_runtime("sudo /usr/local/sbin/restart_service.sh ");
		if ( $retVal !== 0) {
			throw new \Auth\Exception(sprintf('"restart_service.sh" call failed. Returned with "%d"', $retVal), 500);
		}
		
        $this->copyOtherFiles();

		return true;
	}
	
	/**
	 * Modifies a user and saves the changes in all effected  system files
	 * passwd, group, shadow, smbconf, smb.conf
	 *
	 * @param string $username holds the new user name
	 * @param string $fullName holds the new full name of the user (not used for Orion)
	 * @param string $newPassword holds the new user password
	 * @param boolean $isAdmin - if true, adds user to Administrators group if user is not in that group
	 * @param boolean $changePassword - if true the user's password will be changed to $newPassword
	 * @param string $newUserName new username if it is a username change, else defaults null
	 * @return boolean $status indicates the success or failure of this operation
	 *
	 */
	public function modifyUser($userName, $fullName, $newPassword, $isAdmin, $changePassword, $newUserName = null)
	{

		//final name variable will contain either the original name if name does not change or the new name if it does
		//changeNameFlag is a quicker way to check that the name has changed
		$changeNameFlag =  ($newUserName !== null  && $newUserName  != $userName) ;
		$changeFullNameFlag =   ($fullName !== null) ;
		$changeGroups = ($changeNameFlag || isset($isAdmin));//if $isAdmin is not set, then it did not change
		
		if ($changeNameFlag || $changePassword) {
			$shadowArray = $this->getFileArray(self::shadowFileKey);
		}
		if ($changeNameFlag || $changeFullNameFlag) {
			$passwordArray = $this->getFileArray(self::passwdFileKey);
		}
		//first change the password then the name if needed
		if ($changePassword) {
			if (empty($newPassword)) {
				//assume $changePassword == true means it really has changed
				//set empty password
				if (isset($shadowArray[$userName])) {
					//delete password hash
					$shadowArray[$userName][self::passwordKey] = '';
				}
				else {
					throw new \Auth\Exception("Modifying password in shadow file failed: username not found" , 500);
				}
					
				$this->emptyPasswordRecordSmb($userName);
			}else{
				//modify password
				$this->writePasswordIn($userName, $newPassword);
				$shadowArray = $this->getFileArray(self::shadowFileKey);
			}
			//delete the password from the cache becuase if we add > 1 user per second, it could get missed as the
			//cache checks file modified time which only has a granularity of 1 second on linux
			$cache = ConfigCache::getConfigCache('PASSWORD_HASH');
			if ($cache != NULL) {
				$cache->deleteValue($userName);
			}
		}
		if ($changeFullNameFlag) {
			//if fullname is changed modify "information" column of the record, because that is where it is contained
			//we do not use this column for any other purposes, so it can have only a format of "FullName,,," or ""
			//username can be saved to be empty
			$passwordArray[$userName][self::informationKey] = ($fullName=='') ? '' : $fullName.',,,';
		}
		//if either a name changed or is_admin property has modify groups file
		if ($changeGroups) { 
			// update group membership including administrators
			if (!isset($isAdmin)) {
				$userSecurity = UserSecurity::getInstance();
				$isAdmin = $userSecurity->isAdmin($userName); //if isAdmin not passed in, set to current value.
			}
		
			$this->modifyGroups($userName,
					$isAdmin,
					$changeNameFlag ? $newUserName : null);
		}
		/** Username change **/
		$fileKeys = array();
		
		if ($changeNameFlag) {
			//if the name has changed the name value will get updated, if not finalName variable contains the same value
			//there is no need to update the key in $passwordArray[$userName], since it is only used internally and will not
			//get written into the final file. We can use the original username to refer to the record about the user within the function
			//regardless  of whether it has been changed or not
			$passwordArray[$userName][self::usernameKey] = $newUserName;
			$shadowArray[$userName][self::usernameKey] = $newUserName;
			
			//replace the username un smb.conf share access records
			$this->replaceNameInSmbConf($userName, $newUserName);
			
			$smbPasswdArray = $this->getFileArray(self::smbPasswdFileKey);
			$smbPasswdArray[$userName]['user_name'] = $newUserName;
			//write the information about all the records in shadow file and swap temp file with final file
			$this->writeToTempFile($smbPasswdArray, self::smbPasswdFileKey);
			$fileKeys[] = self::smbPasswdFileKey;
		}
				
		//write the information about all the records in passwd & shadow file, including the modified record into temp file and swap temp file with final file
		if ($changeNameFlag || $changePassword) {
			$this->writeToTempFile($shadowArray, self::shadowFileKey);
			$fileKeys[] = self::shadowFileKey;
		}
		
		if ($changeNameFlag || $changeFullNameFlag) {
			$this->writeToTempFile($passwordArray, self::passwdFileKey);
			$fileKeys[] = self::passwdFileKey;
		}
		
		if (!empty($fileKeys)) {
			$this->swapFiles($fileKeys);
		}
				
		/** update ftp users **/

		if ($changeNameFlag) {
			$this->modifyFtpUser($userName, $newUserName);
		}
		
		return true;

	}

	/**
	 * Deletes OS user records from all system files
	 *
	 * @param string $username the username of the user account to delete
	 * @return boolean $status indicates the success or failure of this operation
	 */
	public function deleteUser($userName) {

		//remove the user from samba
		$this->replaceNameInSmbConf($userName, '');
		
		//read passwd file into associative array
		$passwordArray = $this->getFileArray(self::passwdFileKey);
		//unset the value related to the user that needs to be removed
		unset($passwordArray[$userName]);
		//write the information into temp shadow file and swap temp file with final file
		$this->writeToTempFile($passwordArray, self::passwdFileKey);
		$fileKeys = array(self::passwdFileKey);

		/* delete user from groups in group file */
		
		//read group file into associative array
		$groupsArray = $this->getFileArray(self::groupFileKey);
		//loop through each group
		foreach($groupsArray as $groupsArrayK => $groupsArrayV){
			$groupTemp = explode(',', $groupsArrayV[self::groupListKey]);
			//loop through each user of the group
			foreach($groupTemp as $groupTempK => $groupTempV){
				//remove the record about the user
				if($groupTempV == $userName){
					unset($groupTemp[$groupTempK]);
				}
			}
			//recreate the string of users without the record of the removed user
			$groupsArray[$groupsArrayK][self::groupListKey] = implode(',', $groupTemp);
		}
		//write the information into temp shadow file and swap temp file with final file
		$this->writeToTempFile($groupsArray, self::groupFileKey);
		$fileKeys[] = self::groupFileKey;


		/* delete user from file */

		//read shadow file into associative array
		$shadowArray = $this->getFileArray(self::shadowFileKey);
		//unset the value related to the user that needs to be removed
		unset($shadowArray[$userName]);
		//write the information into temp shadow file and swap temp file with final file
		$this->writeToTempFile($shadowArray, self::shadowFileKey);
		$fileKeys[] = self::shadowFileKey;
		
		/* swap all temp files in one go */
		
		$this->swapFiles($fileKeys);
		
		//delete the password from the cache because if we delete > 1 user per second, it could get missed as the
		//cache checks file modified time which only has a granularity of 1 second on linux
		$cache = ConfigCache::getConfigCache('PASSWORD_HASH');
		if ($cache != NULL) {
			$cache->deleteValue($userName);
		}
		
		/****** UPDATE FTP USERS FILE *****/
		
		$this->deleteFtpUser($userName);
		
		return true;
	}
	

	/**
	 * Reads the file, whose key is passed (e.g. group) and returns the contents in the form of an array
	 *
	 * @param string $file - the name of the file to be parsed, for example passwd
	 * @return array $fileArray - associative array with distributed values
	 * example return (for group file):
	  Array(
		  [share] => Array
			(
				[group_name] => share
				[password] => x
				[GID] => 1000
				[group_list] => root,www-data,daapd,admin,katya7,katya10,katya11
			)
		...)

	 */
	
	private function getFileArray($file){
		$fileArray = array();
		$fileContents  = file_get_contents(self::$pathsMap[$file]['final']);

		//for one of the files, shadow, file_get_contents will not work, so in that case we need to read the file as sudo
		if($fileContents==''){
			$output = $retVal = null;
			exec_runtime("sudo cat ".self::$pathsMap[$file]['final'], $output, $retVal);
			$fileContentsArray = $output;
		}else{
			$fileContentsArray = explode("\n", trim($fileContents));
		}

		//get the structure of the file from structure map
		$structureArray = self::$structuresMap[$file];

		//distribute the values into an associative array
		if(is_array($fileContentsArray)){
			foreach($fileContentsArray as $fileContentsArrayK => $fileContentsArrayV){
				$temp = explode(":", $fileContentsArrayV);
				foreach($temp as $tempK => $tempV){
					$fileArray[$temp[0]][$structureArray[$tempK]] = $tempV;
				}
			}
		}
		return $fileArray;
	}


	/**
	 * Replaces the username in smb.conf file
	 * if finalName is an empty string "" - remove the name without replacing it with anything
	 *
	 * @param string $userName - the name to be changed
	 * @param string $finalName - the new name value
	 */

	private function replaceNameInSmbConf($userName, $finalName){
		//in smb.conf share sections we have 4 categories that can list out users access, we need to loop through all of them to make changes
		$arrayCategories = array(	'valid users',
									'invalid users',
									'read list',
									'write list');

		//there are 3 format versions we will accept: usernames not surrounded by quotes, usernames surrounded by single quotes and usernames surrounded  by double quotes
		//we need to check all these versions for matches with the username we are looking for and if found we will replace with the new name in the same format
		//don't save emmpty name in smb.conf
		$finalNameQuoted = !empty($finalName) ? '"'.$finalName.'"' : "";
		
		$versionsToCheck = array(	$userName => $finalName,
									'"'.$userName.'"' =>$finalNameQuoted,
									"'".$userName."'" => $finalNameQuoted);

		//parse smb.conf file
		$smbConfContents  = $this->parseSmbConf(self::$pathsMap[self::smbConfFileKey]['final']);

		//loop through the array looking for matches of the username in each of the shares for each of the categories in $arrayCategories
		foreach($smbConfContents as $smbConfContentsK => $smbConfContentsV){
			if(is_array($smbConfContentsV)){
				foreach($arrayCategories as $arrayCategoriesV){
					foreach($versionsToCheck as $versionsToCheckK => $versionsToCheckV){
						if(isset($smbConfContents[$smbConfContentsK][$arrayCategoriesV][$versionsToCheckK])){
							//if $finalName is empty - remove the value, if there is a new value - replace the old value with the new
							if($finalName == ""){
								unset($smbConfContents[$smbConfContentsK][$arrayCategoriesV][$versionsToCheckK]);
							}else{
								$smbConfContents[$smbConfContentsK][$arrayCategoriesV][$versionsToCheckK] = $versionsToCheckV;
							}
						}

					}
				}
			}
		}
		//recreate the contents of smb.conf as a string
		$smbConfContentsTxt = $this->recreateSmbConf($smbConfContents);
		//write the information into temp smb.conf file and swap temp file with final file
		$this->writeToTempFile($smbConfContentsTxt, 'smb_conf');

		if(empty($finalName)){
			//user is being deleted, so remove from smbpasswd file, it has to be executed seperately or else we have left over users in smbpassword every other time
			$escUsername = escapeshellarg($userName);
			$output = $retval = null;
			
			exec_runtime("sudo smbpasswd -x ". $escUsername , $output, $retVal, false);
			if ( $retVal !== 0) {
				throw new \Auth\Exception('Command exec. for updating SMB password failed. Returned with: "' . $retVal . '"', 500);
			}
		} 
		
		//copy smb conf and restart samba in background
		
		$cmd = "sudo mv -f ".self::$pathsMap[self::smbConfFileKey]['tmp']." ".self::$pathsMap[self::smbConfFileKey]['final'];

		if (!self::isAlphaNas()) {
			if (file_exists("/usr/local/sbin/smbReload.sh")) {
				$cmd .= "; /usr/local/sbin/smbReload.sh" ;
			}
			if (file_exists("/usr/local/sbin/updateShareConfig.sh")) {
				$cmd .= "; sudo /usr/local/sbin/updateShareConfig.sh";
			}
		}
		$output = $retval = null;
		exec_runtime("nohup sudo sh -c \"" . $cmd . "\" > /dev/null 2>&1 &"  , $output, $retVal, false);
		if ( $retVal !== 0) {
			throw new \Auth\Exception('Command exec. for updating SMB conf and restarting samba failed. Returned with: "' . $retVal . '"', 500);
		}
	}


	/**
	 * Uses passwd and smbpasswd commands to modify password of a user
	 *
	 * @param string $userName - the name to be changed
	 * @param string $password - encrypted password
	 */
	private function writePasswordIn($userName, $password)
	{
		//Decode the password
		if (!empty($password)) {
			$decodedPw = trim(base64_decode($password, false));
			if($decodedPw === false){
				throw new \Auth\Exception('Failed to decode password', 500);
			}
		}else{
			$decodedPw = "";
		}

		//escape the variables we will pass down to shell
		$decodedPw = escapeshellarg($decodedPw);
		$userName = escapeshellarg($userName);

		//execute shell commands to modify the password
		$output = $retVal = null;
		exec_runtime("`(echo $decodedPw; echo $decodedPw) | sudo passwd $userName` > /dev/null 2>&1 &", $output, $retVal, false);
		if ( $retVal !== 0) {
			throw new \Auth\Exception('Modifying password with passwd failed. Returned with "' . $retVal . '"', 500);
		}
		//modify smbpasswd
		//parameter -a is ignored if this is an existing user, but if we do not pass it on a new user the records does not get created
		//cannot do this in the background because we will need it to be finished modifying by the time we read smbpass to change the name
		$output = $retVal = null;
		exec_runtime("(echo $decodedPw; echo $decodedPw) | sudo smbpasswd -a -s ". $userName, $output, $retVal, false);
		
		if ( $retVal !== 0) {
			throw new \Auth\Exception('Modifying password with smbpasswd failed. Returned with "' . $retVal . '"', 500);
		}
	}


	/**
	 * Creates samba password record for a user, makes it no password
	 *
	 * @param string $userName - the name to be changed
	 */
	private function createPasswordRecordSmb($userName)
	{
		//escape the variable we will pass down to shell
		$userName = escapeshellarg($userName);

		//execute shell commands to modify the password
		$output = $retVal = null;
		exec_runtime("sudo smbpasswd -n -a $userName", $output, $retVal, false);
		if ( $retVal !== 0) {
			throw new \Auth\Exception('Modifying password with smbpasswd failed. Returned with "' . $retVal . '"', 500);
		}
	}

	/**
	 * Empties the existing samba password value for a user
	 *
	 * @param string $userName - the name to be changed
	 */
	private function emptyPasswordRecordSmb($userName)
	{
		//escape the variable we will pass down to shell
		$userName = escapeshellarg($userName);
		if (!empty($oldUserName)) {
			$oldUserName = escapeshellarg($oldUserName);
		}

		//execute shell commands to modify the password
		//samba ignores "-a" paramter if this is a modification

		$output = $retVal = null;
		
		exec_runtime("(echo;echo) | sudo smbpasswd -s -a ". $userName, $output, $retVal, false);
		
		if ( $retVal !== 0) {
			throw new \Auth\Exception('Modifying password with smbpasswd failed. Returned with "' . $retVal . '"', 500);
		}
	}
	


	/**
	 * Writes the contents of the array or string into temp file
	 *
	 * @param array or string $contentsParameter - the name to be changed
	 * @param string $file - encrypted password
	 */
	private function writeToTempFile($contentsParameter, $file) {
		$content = "";

		//if the parameter passed is an array we need to turn it into a string of the format:
		//value1:value2
		//value1:value2
		if(is_array($contentsParameter)){
			foreach ($contentsParameter as $contentsParameterV) {
				$content .= implode(':', $contentsParameterV) . PHP_EOL;
			}
		}else{
			$content = $contentsParameter;
		}

		//write the contents into the temp file
		//retry if failed
		$isExit     = true;
		$countRetry = 0;
		do {
			if(file_put_contents(self::$pathsMap[$file]['tmp'], $content, LOCK_EX)) {
				$isExit = false;
			}else{
				$countRetry++;
				usleep(200);
			}
		} while($isExit && $countRetry < RETRY_COUNT);

		if($isExit){
			throw new \Auth\Exception('Failed to write to temp file '.$file, 500);
		}
	}


	/**
	 * Swaps temp files and the final files
	 *
	 * @param array or string $contentsParameter - the name to be changed
	 * @param string $file - encrypted password
	 */
	private function swapFiles($files) {
		
		$cmd = "sudo ";
		$fileGroup = 0;
		
		for($i = 0; $i < sizeof($files); $i++) {
			$file = $files[$i];
			//if the file getting swapped is shadow file and the web server does not run as root we need
			//to remember  the group that the file belongs to in order to assign ownership to this group back after the swap
			if (($fileGroup == 0) && ($file == self::shadowFileKey)) {
				//get the file group of the shadow file
				$fileGroup = filegroup(self::$pathsMap[$file]['final']);
			}
			$cmd .= "mv -f ".self::$pathsMap[$file]['tmp']." ".self::$pathsMap[$file]['final'];
			if ( sizeof($files) > 1 && $i < (sizeof($files)-1) ) {
				$cmd .= "; sudo ";	
			}
		}

		//swap the files and delete the temp file
		$output = $retVal = null;
		//js use mv as it is atomic and therefore safer than cp
		exec_runtime($cmd, $output, $retVal, false);
		if ($retVal !== 0) {
        	throw new \Auth\Exception('Could not swap temp files ',  500);
        }

		//if one of the files getting swapped is shadow file and the web server does not run as root we need
		//to assign ownership to this group back after the swap so that it can be read
		if( $fileGroup != 0){
			$output = $retVal = null;
			exec_runtime("sudo chgrp  $fileGroup ". self::$pathsMap[self::shadowFileKey]['final'], $output, $retVal, false);
			if ($retVal !== 0) {
				throw new \Auth\Exception('Could not change permissions on shadow file',  500);
			}
		}
	}


	/**
	 * Parses smb.conf file
	 *
	 * @param string $smbConfPath - path to smb conf on this system
	 * @return array of smb.conf file. Example format:Array
	 *	 [#0] => ## BEGIN ## sharename = Public #
		[Public] => Array
        (
            [valid users] => Array
                (
                    [user1] => user1
					[user2] => user2
                )

            [invalid users] => Array
                (
                    [user3] => user3
                )
			...
        )
	 */

	function parseSmbConf($smbConfPath) {
		$smbConfArray = array();
		$lines = file ($smbConfPath);
		$commentCounter = 0;

		//go through the lines one by one and determine if they are 1) commments 2) section headers 3) section contents
		//based on the first character
		foreach ($lines as $line) {
			$line = trim ($line);
			$beginChar = substr($line, 0, 1);
			$endChar = substr($line, -1);
			//if the first character is a comment save it as is in the array and increase the counter of comments
			//we need this because we can not use comments as their own keys since they can repeat and then will be overwritten
			//we also want to maintain the first character in the key so we can use it when putting the array back into a string
			if (($beginChar == "#") || ($beginChar == ";")) {
				$smbConfArray[$beginChar.$commentCounter]=$line;
				$commentCounter = $commentCounter+1;
			//if this is a new section, create new array value
			} elseif (($beginChar == "[") && ($endChar == "]")) {
				$sectionName = substr ($line, 1, -1);
			//populate new value with the records that belong to the section
			} elseif ($line != "") { // values
				$pieces = explode("=", $line);
				$valueName = trim ($pieces[0]);
				//some of the values, like "valid_users" will have comma seperated values, we need to explode them to be able to change them
				$variations = explode(",", $pieces[1]);
				foreach($variations as $variationsK => $variationsV){
					//use the usernames as keys too, so we can access them faster
					$smbConfArray[$sectionName][$valueName][trim ($variationsV)] = trim ($variationsV);
				}
			}

		}
		return $smbConfArray;
	}

	/**
	 * Recreates string format of smb.conf file from the array
	 *
	 * @param array string $smbConfArray - array to be imploded
	 */


	function recreateSmbConf($smbConfArray) {
		$textSmb = "";
		foreach ($smbConfArray as $section => $content) {
			//if the first character of the key is comment char - this element is a comment
			$beginChar = substr($section, 0, 1);
			if(($beginChar == "#") || ($beginChar == ";")){
				$textSmb .= $content."\n";
			//otherwise this element is a section to be imploded
			}else{
				$textSmb .= "[" . $section . "]\n";
				foreach ($content as $key => $values) {
					$textSmb .= "\t" . $key . " = " . implode(",", $values) . "\n";
				}
				$textSmb .= "\n";
			}
		}
		return $textSmb;
	}

	/**
	 * Checks if the user is an owner of this device based on UID
	 * @param string $userName
	 */
	function isOwner($userName) {
		$passwordArray = $this->getFileArray(self::passwdFileKey);
		if(!isset($passwordArray[$userName])){
			throw new \Auth\Exception("User not found", 404);
		}
		return($passwordArray[$userName][self::uidKey]==self::$adminUID);
	}
	
	/**
	* Determines whether the specified Group exists
	* @param String $groupName identifies the group being checked for validity
	* @return boolean indicates if such a group exists.
	*/
	function isValidGroup($groupName) {
		return isset(self::$sharingGroups[$groupName]);
	}
	
	/**
	 * Returns the user's hashed password if the user has a password; will return null if the user is not in the shadow file
	 * @param string $userName username to get password for
	 * @return string
	 */
	 function getUserPasswordHash($userName) {
	     $shadowFile =  self::$pathsMap[self::shadowFileKey]['final'];
		 $pwdHash = null;
         $cache = ConfigCache::getConfigCache('PASSWORD_HASH');
         if ($cache == NULL) {
             //Since password hash information is stored in the shadow file, the cache will watch that file for changes
             $cache = ConfigCache::initializeConfigCache('PASSWORD_HASH', $shadowFile);
         }
         $pwdHash = $cache->getValue($userName);
         //If the password hash was not in the cache, then do the normal file parsing and then store it in the cache for next time
         if($pwdHash === NULL) {
            $handle = @fopen($shadowFile, 'r');
            if ($handle != false) {
                while (($buffer = fgets($handle)) !== false) {	
                    if ($buffer[0] != '#') {
                        $data = explode(':', trim($buffer));
                        if (isset($data[0]) && isset($data[1]) && $data[0] == $userName) {
                            $pwdHash = $data[1];
                            break;
                        }
                    }
                }
                fclose($handle);
            }
            //Cache the resulting password hash for improved performance of the next request
            $cache->putValue($userName, $pwdHash);
        }
        if (!isset($pwdHash)) {
        	return NULL;
        }
        return $pwdHash;
	}

	/**
	 * Authenticates the provided local credentials and sets the appropriate session parameters.
	 * Depends on local Users table and does not contact Central Servers.
	 * After authentication it sets the appropriate session parameters.
	 * @param String $userName username for local user account
	 * @param String $password The password may not be required if the account does not have a password set
	 * @return integer UserId Returns UserId of the authenticated user (otherwise false)
	 */
	 function authenticateLocalUser($userName, $password) {
	     $isAuth = false;

         $cache = ConfigCache::getConfigCache('PASSWORD_MD5');
         if ($cache == NULL) {
             $cache = ConfigCache::initializeConfigCache('PASSWORD_MD5',  '/etc/shadow');
         }
         $properPasswordMD5 = $cache->getValue($userName);
         if($properPasswordMD5 !== NULL) {
             $isAuth = md5($password) === $properPasswordMD5;
         }

		 if (empty($userName)) {
            return false; //no username == fail authentication
         }
         if ( $isAuth == false ) {
            $pwdHash = $this->getUserPasswordHash($userName);
            if ($pwdHash === NULL) {
                return false; //unknown username == fail authentication
            }
            if ( isset($pwdHash) && empty($pwdHash) ) {
                $isAuth = (isset($password) && empty($password));  //password supplied for user with empty password == fail authentication
            }
            else {
                //unix authenticate
                $salt = substr($pwdHash, 0, 12);
                unset($challenge);
                $challenge = crypt($password, $salt);
                if ($challenge === $pwdHash) {
                    $isAuth = true;
                }
            }

            if ($isAuth) {
                //It took a lot of slow work (parsing a file) and recalculating crypt to find that this password is valid.  Now cache it.
                $cache->putValue($userName, md5($password));
            }
         }

		if ($isAuth) {
			$userManager = new UserManagerImpl();
			$user = $userManager->getUser($userName);
			if (!empty($user)) {
				$ctxt = new LoginContext($user);
				\RequestScope::getInstance()->setLoginContext($ctxt);
				return true;
			}
		}
		return false;
	}
	
	function copyOtherFiles(){
        $cmd = '';
		foreach(self::$pathsMap as $file => $contents){
            if (empty($contents['other'])) {
                continue;
            }
            $cmd .= 'sudo cp '.escapeshellarg(self::$pathsMap[$file]['final']).' '.escapeshellarg(self::$pathsMap[$file]['other']).';';
		}
        if ($cmd === '') {
            return;
        }
        $output = $retVal = null;
        exec_runtime($cmd, $output, $retVal, false);
        if ($retVal !== 0) {
            throw new \Auth\Exception('Could not copy other files with cmd: '.$cmd,  500);
        }
	}
	
	/**
	 Returns information about all group memeberships or filters
	* them by username or group name
	*
	* @param String $username  - username of the specified user or null. If null, returns all user objects
	* @param String $groupName  - username of the specified user or null. If null, returns all user objects
	* @return array of Group objects
	*/
	function getGroupMemberships($username, $groupName){
		$groupsArray = $this->getFileArray(self::groupFileKey);
		
		//filter out system groups by the sharing groups or by the group passed as a parameter
		if($groupName!==null){
			$groupList[$groupName] = explode(',', $groupsArray[$groupName][self::groupListKey]);
		}else{
			foreach(self::$sharingGroups as $sharingGroupsK => $sharingGroupsV){
				$groupList [$sharingGroupsK]= explode(',', $groupsArray[$sharingGroupsK][self::groupListKey]);
			}
		}

		//filter by username and save in correct output format
		$result = array();

		foreach($groupList  as $groupListK => $groupListV){
			if($username!==null){
				if(in_array($username, $groupListV)){
                    $result[] = array('username' => $username, self::groupNameKey  => $groupListK);
				}
			}else{
				foreach($groupListV as $groupListVK => $groupListVV){
					if(!array_key_exists($groupListVV, self::$exclusionArray)){
                        $result[] = array('username' => $groupListVV, self::groupNameKey  => $groupListK);
					}
				}
			}
		}
		return $result;
	}		
	
	/**
	* Create a record about group memeberships 
	* for the username or group name combination passed
	*
	* @param String $username  - username of the specified user
	* @param String $groupName  - group name of the specified group
	* @return true indicates if the creation was succesful
	*/
	function createGroupMembership($username, $groupName){
		$groupsArray = $this->getFileArray(self::groupFileKey);
		
		//define which groups the user must belong to. 
		$groupsUser = array(self::$shareGroupName => self::$shareGroupName);
		
		//if this is an admin user add it to administrators group
		switch($groupName){
			case self::adminGroupKey:
				$groupsUser = array(self::adminGroupKey => self::adminGroupKey,
												self::cloudholdersGroupKey => self::cloudholdersGroupKey);
				break;
			default:
				$groupsUser = array($groupName => $groupName);
		}
		
		foreach($groupsUser as $groupsUserK => $groupsUserV){
			$groupTemp = explode(',', $groupsArray[$groupsUserK][self::groupListKey]);
			$groupTempAssocArray = array();
			
			foreach($groupTemp as $groupTempK => $groupTempV){
				$groupTempAssocArray[$groupTempV] = $groupTempV;
			}
			
			$groupTempAssocArray[$username] = $username;

			//put the modified array of group members back together into a string and replace the string in general gropus array
			$groupsArray[$groupsUserK][self::groupListKey] = implode(',', $groupTempAssocArray);
		}
		
		//write the information about all the records in group file and swap temp file with final file
		$this->writeToTempFile($groupsArray, self::groupFileKey);
		$this->swapFiles(array(self::groupFileKey));
		return true;
	}
	
	/**
	 * Delete a record about group memeberships
	 * for the username or group name combination passed
	 *
	 * @param String $username  - username of the specified user
	 * @param String $groupName  - group name of the specified group
	 * @return true indicates if the deletion was succesful
	 */
	function deleteGroupMembership($username, $groupName){
		$groupsArray = $this->getFileArray(self::groupFileKey);
	
		//define which groups the user must belong to. first - the default group (share)
		$groupsUser = array(self::$shareGroupName => self::$shareGroupName);
	
		//if the user is deleted from administrators, keep them as cloudholder
		$groupTemp = explode(',', $groupsArray[$groupName][self::groupListKey]);
	
		foreach($groupTemp as $groupTempK => $groupTempV){
			//remove the record about the user
			if($groupTempV == $username){
				unset($groupTemp[$groupTempK]);
			}
		}
	
		//put the modified array of group members back together into a string and replace the string in general gropus array
		$groupsArray[$groupName][self::groupListKey] = implode(',', $groupTemp);
		
		try{
			//write the information about all the records in group file and swap temp file with final file
			$this->writeToTempFile($groupsArray, self::groupFileKey);
			$this->swapFiles(array(self::groupFileKey));
		} catch (Exception $e) {
			throw new Exception('GROUP_DELETION_FAILED', 500);
		}
		
		
		if($groupName=='cloudholders'){
			$colaborativeSpacesAndPLSsOwned = array();		
			$usersModelObj = new \Auth\Model\Users();
			$colaborativeSpacesAndPLSsOwned = $usersModelObj->getColabSpacesAndPLSForUser($username, true);
			Link::deleteLinksBy($username, NULL, TRUE);
			
			$sharesDao = new \Shares\Model\Share\SharesDao();
			foreach($colaborativeSpacesAndPLSsOwned as $shareName){
				$sharesDao->delete($shareName);
			}
		}
		
		return true;
	}

    /**
    * Checks if username is reserved
    * @param String $username
    * @return Bool true if username is reserved
    */
    public function isReservedUsername($username){
        return isset(self::$reservedUsernameArray[$username]);
    }

}


<?php

namespace Remote\DeviceUser;

/**
 * \file device.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(UTIL_ROOT . '/includes/httpclient.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

use Auth\User\UserSecurity;
use Remote\DeviceUser\Db\DeviceUsersDB;
use Remote\Device\DeviceControl;
use Core\Logger;

/**
 * DeviceUserManager class
 *
 * Singleton:: Manages CRUD for Device Users
 *
 */

class DeviceUserManager {

	private static $instance;

	//make constructor private, so class cannont be instantiated by outside code
	private function __construct()  {

	}

	/**
	 * get the singleton instance
	 */
	public static function getManager() {
		if (!isset(self::$instance)) {
			self::$instance = new DeviceUserManager();
		}
		return self::$instance;
	}

	/**
	 * addEmailDeviceUser - creates an Web Device User with an email address .
	 * The username is the username belonging to the parent user. The
	 * Device User will have access to the resources that the parent user has access to. If sendEmail is true, an invite
	 * e-mail will be sent to the email address with optional sender.
	 * e-mail is required to be unique per device for version 2.6 and later and unique per user for earler versions
	 * @param string username name of paremt user
	 * @param string email email address of device user
	 * @param boolean sendEmail if true, an invite e-mail will be sent, default is false
	 * @param string sender the name of the sender of the invite e-mail, default is null
	 * @param string $alias alias (or guest) user ???
	 * @param string $firstname first name of the device user
	 * @param string $lastname last name of the device user
	 * @throws \Remote\RemoteException
	 * @return true if Device User creation was successful, else false
	 */
	public function addEmailDeviceUser($username, $email, $firstname='', $lastname='', $sendEmail = "false", $sender=null, $alias=null, $version=null) {
		$userType = UserSecurity::getInstance()->userTypeRemote($username);

		if (!empty($email)) {
			if (!empty($version) && $version < 2.6){
				//check if device user with this e-mail address already exists for this user
				$deviceUsers = DeviceUsersDB::getInstance()->getDeviceUsersForUsernameWithEmail($username, $email);
			}else{
				//check if device user with this e-mail address already exists for this device
				$deviceUsers = DeviceUsersDB::getInstance()->getDeviceUsersForEmail($email);
			}
			if (!empty($deviceUsers)) {
				//DU with this email address already exists for this device
				throw new \Remote\RemoteException('DEVICE_USER_ALREADY_EXISTS', 403, null, 'device_user');
			}

			$status = $this->addEmailAccessToUser($username, $email, $firstname, $lastname, $sender, $sendEmail, $alias, $userType);

			if ($status !== false) {
				//check status of orion services and start them if necessary depending on remote access setting
				DeviceControl::getInstance()->updateRemoteServices();
			}
			return $status;
		}
		return true;
	}

	/**
	 * addEmailDeviceUsers - creates a set of Web Device Users with an email address.
	 * The username is the username belonging to the parent user the Device User being created.
	 * The	Device User will have access to the resources that the parent user has access to. If sendEmail is true, an invite
	 * e-mail will be sent to all email addresses with session user as the sender.
	 *
	 * @param array $emailUsers - an associate array with email & username values as required and firstname & lastname values
	 * as optional and the expected format should be like:
	 * 		 [ 	0 => ['username' => 'me', 'email' => 'me@mydomain.com', 'firstname' => 'king', 'lastname' => ''],
	 * 			1 => ['username' => 'you', 'email' => 'you@yourdomain.com', 'firstname' => 'queen', 'lastname' => '']]
	 *
	 * 	- e-mail is required and required to be unique per device and username is also required.
	 *
	 * @param bool $skipEmailExistsCheck - to avoid repeated checks at each layer, the caller should perform uniqueness of emails.
	 * 						Advised to perform these checks at higher level to avoid repetition for performance reasons.
	 * @param bool $sendEmail - sendEmail applicable to all device users being created in this call.
	 * @param string $brand - an optional device's brand. Defaults to an empty string and must be provided where applicable.
	 *
	 * @return array|bool - an array of device users if success else false.
	 * @throws \Core\Rest\Exception
	 */
	public function addEmailDeviceUsers(array $emailUsers, $skipEmailExistsCheck = false, $sendEmail = false, $brand = '') {
		// Get Specific set of KV pairs
		if(!isset($emailUsers[0])){
			// Means a single DU request and its a flat array; this helps with the subsequent operations
			$emailUsers[] = $emailUsers;
		}
		$deviceUsers = array_filter(array_map(function($user) {
			if( (isset($user['email']) && !empty($user['email'])) && (isset($user['username']) && !empty($user['username'])) )
			{
				return [ 'username' => $user['username'], 'email' => $user['email'], 'first_name' => $user['first_name'], 'last_name' => $user['last_name']];
			};
		}, $emailUsers));
		if(empty($deviceUsers)){
			// Unlikely unless caller didn't do the checks
			throw new \Remote\RemoteException('EMAIL_USERNAME_MISSING', 400, NULL, 'device_user');
		}
		// If the check is already done by the caller (the Controller) part of input validation
		// then skip it for performance reasons (see Users POST).
		if(!$skipEmailExistsCheck){
			// Verify if any of the emails already in use
			$emailIds = array_filter(array_map(function ($user) {
				return $user['email'];
			}, $emailUsers));

			if(!empty($emailIds) && DeviceUsersDB::getInstance()->checkIfExistsEmailIds($emailIds)){
				throw new \Remote\RemoteException('DEVICE_USER_ALREADY_EXISTS', 403, NULL, 'device_user');
			}
		}
		// Create device Users...
		$status = $this->addEmailAccessToUsers($emailUsers, $sendEmail, $brand);
		if ($status !== false) {
			// Don't check status of remote services but start them in background..
			DeviceControl::getInstance()->startRemoteServices();
		}
		return $status;
	}

	/**
	 * Adds email access to the specified set of users.  Calls Central Server's device_user v2 POST API to get new email based device users.
	 * Caller must make sure email uniqueness and $emailUsers format is as defined. No additional input format checks and
	 * security checks are done in here for performance reasons.
	 * Security: Caller must verify that the user is admin or have appropriate authorization privileges.
	 * @param array $emailUsers - must be an array of array as
	 * 		 [ 	0 => ['username' => '', 'email' => '', 'firstname' => '', 'lastname' => ''],
	 * 			1 => ['username' => '', 'email' => '', 'firstname' => '', 'lastname' => '']]
	 * 		username & email are required and cannot be null or empty.
	 * @param string $brand - defaults to an empty string
	 * @param bool $sendEmail - defaults to false
	 * @return array|bool - an array of device users if success else false
	 * @throws \Core\Rest\Exception
	 */
	public function addEmailAccessToUsers(array $emailUsers, $brand='', $sendEmail = false, $insertALLorNONE = true)
	{
		/* CS device_user JSON POST body format:
		 * {
			"device_id": 123,
			"device_auth": "abc123",
			"brand": "",
			"send_email": 1,
			"sender": "sharer@wdc.com",
			"device_users": [
				{ "email": "test@test.com", "first_name": "John", "last_name": "Smith"},
				{ "email": "mary@test.com", "first_name": "Mary", "last_name": "Jane" }
			]
		}*/
		// Get CS device_user API required fields
		$emailDUsToGet = [];
		foreach($emailUsers as $emailUser){
			if(!empty($emailUser['email'])) {
				$emailDUsToGet[] = ['email' => $emailUser['email'], 'first_name' => $emailUser['first_name'], 'last_name' => $emailUser['last_name'], 'user_type' => $userType = UserSecurity::getInstance()->userTypeRemote($emailUser['username'])];
			}
		}
		// email cannot be empty
		if(empty($emailDUsToGet)){
			Logger::getInstance()->debug(__FUNCTION__ . ': Error creating Email Central Server Device Users. Invalid email users input array: ', $emailUsers);
			throw new \Remote\RemoteException("Error creating Email Central Server Device Users. Invalid email users input array");
		}
		// POST body
		$body =
			[
				'device_id'   	=> getDeviceId(),
				'device_auth' 	=> getDeviceAuthCode(),
				'send_email'	=> $sendEmail ? 1 : 0,
				'sender' 		=> UserSecurity::getInstance()->getSessionUsername(),
				'device_users'	=> $emailDUsToGet
			];
		if(!empty($brand)){ // brand cannot be empty or null so don't send if not provided.
			$body['brand'] =  $brand;
		}

		// Call server device_user v2 service to add central device users with email
		$deviceConfig = getGlobalConfig('device');
		$serverUrlDeviceUser = getServerBaseUrl() . $deviceConfig['ADD_DEVICEUSER_RESTURL_V2'];
		Logger::getInstance()->debug(__FUNCTION__ . ": Request sent to Central Server: $serverUrlDeviceUser, with POST-body: ", $body);
		$hc                  = new \HttpClient();
		$response            = $hc->postV2($serverUrlDeviceUser, $body);
		Logger::getInstance()->debug(__FUNCTION__ . ": Response received from Central Server: $serverUrlDeviceUser, with response-Body: ", $response);

		if( !isset($response['status_code']) || ($response['status_code'] != 201) ) {
			Logger::getInstance()->err(__FUNCTION__ . ": Error creating Email Central Server Device Users. Error response code received from server: $serverUrlDeviceUser, response: ", $response);
			throw new \Remote\RemoteException("Error creating Email Central Server Device Users. Error response code received from server: " . $serverUrlDeviceUser);
		}
		Logger::getInstance()->debug(__FUNCTION__ . ", Creating Email Central Server Device Users: $serverUrlDeviceUser, response: ", $response);
		/* The CS JSON response:
		 * { "device_user":
		 * 	[
		 * 		{"email":"postalsharingmail1@hotmail.com","device_user_id":4858816,"device_user_auth":"12ebf5d211b61c5bb2cd20153d84a7b1"},
				{"email":"postalsharingmail1@hotmail.com",.....}
			] }
		 */
		$deviceUsers = json_decode($response['response_text'], true);
		/* JSON decoded $deviceUsers =  [ 'device_user' =>
		 * 										0 => ['email' => '', 'device_users_id' => '', 'device_user_auth' => ''],
		 * 										1 => ['email' => '', 'device_users_id' => '', 'device_user_auth' => '']
		 * 								 ]
		 */
		$csDeviceUsers = $deviceUsers['device_user'];
		if (empty($csDeviceUsers) || !is_array($csDeviceUsers))
		{
			Logger::getInstance()->err(__FUNCTION__ . ": Error creating Email Central Server Device Users. Invalid response body received from server: $serverUrlDeviceUser, response: ", $response);
			throw new \Remote\RemoteException("Error creating Email Central Server Device Users. Invalid response body received from server: " . $serverUrlDeviceUser);
		}
		// Add device_users with username reference, auth and device user id (from server).
		$orionDeviceUsers = [];
		foreach($csDeviceUsers as $csDeviceUser){
			$email = $csDeviceUser['email'];
			$deviceUserId = $csDeviceUser['device_user_id'];
			$deviceUserAuth = $csDeviceUser['device_user_auth'];

			// get the Username for this device user from input $emailUsers. Assumption: emails are unique & input $emailUsers array is as documented.
			// If dup emails exist, something really went bad in layers above, but here the last one is used.
			$duToInsert = array_filter(array_map(function($emailUser) use($email,$deviceUserId,$deviceUserAuth){
				if(strtolower($emailUser['email']) == strtolower($email)) {
					return [ 'username' => $emailUser['username'], 'email' => $email, 'device_user_id' => $deviceUserId,
						'device_user_auth' => $deviceUserAuth, 'name' => '', 'type' => 'webuser', 'active' => 1,
						'enable_wan_access' => 1, 'dac' => null, 'dac_expiration' => null ];
				}
			}, $emailUsers));
			$duToInsert = array_pop($duToInsert);
			if(!empty($duToInsert)) {
				$orionDeviceUsers[] = $duToInsert;
			}
		}
		// Insert new CS device users into Orion Db in bulk...
		if(empty($orionDeviceUsers)){
			// Again, unlikely unless CS's DU response is bad
			Logger::getInstance()->err(__FUNCTION__ . ": Error creating Email Central Server Device Users. Invalid response received from server: $serverUrlDeviceUser, response: ", $response);
			throw new \Remote\RemoteException("Error creating Email Central Server Device Users. Invalid response received from server: " . $serverUrlDeviceUser);
		}
		DeviceUsersDB::getInstance()->createDeviceUsers($orionDeviceUsers);
		return $orionDeviceUsers;
	}

	/**
	 * addDeviceUser - creates a Device User and optionally returns a DAC (Device User Access Code)
	 * The username is the username belonging to the parent user. The
	 * Device User will have access to the resources that the parent user has access to. TIf $dacFlag is true, this function
	 * returns a Device Activation Code for the Device User to be used to retrieve the generated Device user Id and
	 * Device User Auth Code pair.
	 *
	 * @param string $username name of parent user
	 * @param boolean $dacFlag true if a DC should be created and returned
	 * @param string alias an optional alias string for this device user
	 *
	 * @throws \Remote\RemoteException
	 * @return Device Activation Code
	 */
	public function addDeviceUser($username, $dacFlag, $alias) {
		$userType = UserSecurity::getInstance()->userTypeRemote($username);
		$credentialsArray = $this->addDACAccessToUser($username, $dacFlag, $alias, $userType);
		if ($credentialsArray ) {
			//check status of orion services and start them if necessary depending on remote access setting
			DeviceControl::getInstance()->updateRemoteServices();
		}
		return $credentialsArray;
	}


	/**
	 * Calls the service of the Central Servers to delete the device user.
	 * @param integer $deviceUserId Primary identifier of the Central User
	 * @param integer $deviceUserAuthCode
	 * @return boolean indicating whether the device user was successfully deleted
	 */
	function deleteDeviceUserFromCS($deviceUserId, $deviceUserAuth) {
		$config = getGlobalConfig('device');
		$serverUrl = getServerBaseUrl() . $config['DELETE_DEVICEUSER_RESTURL'];
		$accQueryParams = array();
		$accQueryParams['deviceUserId'] = $deviceUserId;
		$accQueryParams['deviceUserAuth'] = $deviceUserAuth;

		if ($serverUrl == null) {
			return false;
		}

		$serverUrl = urlReplaceQueryParams($serverUrl, $accQueryParams);

		if (validUrl($serverUrl) == false) {
			return false;
		}

	$hc = new \HttpClient();
	$response = $hc->get($serverUrl);

	if ($response['status_code'] != 200) {
		return false;
	}
	return true;
	}

  /**
	* Deletes the specified DeviceUser from both the local DeviceUsers table and centrally by calling a service.
	* @param $deviceUserId The identifier of which DeviceUser is to be deleted (primary key of DeviceUsers table)
	* @return boolean Indicates whether the deletion was successful.
	*/
	public function deleteDeviceUser($deviceUserId, $deviceUserAuthCode)
	{
		$deviceUsersDb = DeviceUsersDB::getInstance();

		if (!$deviceUsersDb->isValid($deviceUserId, $deviceUserAuthCode))
		{
			return FALSE;
		}

		$status       = $deviceUsersDb->deleteDeviceUser($deviceUserId, $deviceUserAuthCode);
		$globalConfig = getGlobalConfig('global');

		if ($status && isset($globalConfig['ENABLEREMOTEACCESS']) && $globalConfig['ENABLEREMOTEACCESS'] == 1)
		{
			// DELETE DEVICE USER FROM CENTRAL SERVER
			$status = $this->deleteDeviceUserFromCS($deviceUserId, $deviceUserAuthCode);
		}

		return $status;
	}


	/**
	 * Adds DAC access to the specified user.  Calls central service so that central DB also holds the info.
	 * Security: Calling function must verify that the user is admin or is the specified userId.
	 * @param int $userId Account to which the DAC will provide access.
	 * @return String Returns the DAC that needs to be shown to the user (e.g. in 10 foot UI or Flex UI).  Returns false if it fails.
	 */
	public function addDACAccessToUser($userId, $dacFlag, $alias = null, $userType=1) {
		$globalConfig = getGlobalConfig('global');

		$duQueryParams = array(	'deviceId' => getDeviceId(),
								'deviceauth' => getDeviceAuthCode(),
								'user_type' => $userType,
								'alias' => $alias,
								'dac' => $dacFlag);

		if(isset($globalConfig['ENABLEREMOTEACCESS']) && $globalConfig['ENABLEREMOTEACCESS']==1){
			$deviceUser = $this->getDeviceUserCredentialsRemote($duQueryParams);
			if($deviceUser===false)
				return false;
			$enableWanAccess = true;
		}else{
			$deviceUser = $this->getDeviceUserCredentialsLocal($duQueryParams);
			$enableWanAccess = false;
		}

		$dac           = (string) $deviceUser->dac;
		$dacExpiration = (string) $deviceUser->dac_expiration;

		// Add device_user with user_id reference, auth and device user id (from server).
		// email is NULL
		DeviceUsersDB::getInstance()->createDeviceUser($userId, $deviceUser->device_user_id,
		    $deviceUser->device_user_auth, '', '', '', FALSE, $enableWanAccess, $dac,$dacExpiration);

		if($dacFlag == 1) {
			return array('device_user_id' => $deviceUser->device_user_id,
					'device_user_auth' => $deviceUser->device_user_auth,
					'dac' => $dac, 'dac_expiration' =>$dacExpiration);
		}else{
			return array('device_user_id' => $deviceUser->device_user_id,
					'device_user_auth' => $deviceUser->device_user_auth);
		}
	}


	private function  getDeviceUserCredentialsRemote($duQueryParams){
		// Call server deviceuser service to add central device user with NULL email
		$deviceConfig = getGlobalConfig('device');

		// Add device user for this device
		// 'null' user - we need to get a device activation code for this device user
		$serverUrlDeviceUser = getServerBaseUrl().$deviceConfig['ADD_DEVICENULLUSER_RESTURL'];
		$serverUrlDeviceUser = urlReplaceQueryParams($serverUrlDeviceUser, $duQueryParams);

		$hc = new \HttpClient();
		$response = $hc->get($serverUrlDeviceUser);
		Logger::getInstance()->debug(__FUNCTION__ . ", Creating DAC device user: $serverUrlDeviceUser, response: " . $response);
		if($response['status_code'] != 200) {
			return false;
		}
		$deviceXml = $response['response_text'];

		//check response
		$deviceUser = simplexml_load_string($deviceXml);
		if (!stristr($deviceUser->status, 'success')) {
			//log error
			return false;
		}

		return $deviceUser;
	}



	private function  getDeviceUserCredentialsLocal($duQueryParams){

			//read the latest used number that forms device user id
			$my_file = '/usr/local/nas/orion/device_user_counter';
			$data =file_get_contents($my_file);
			$device_user_id =  ($data == "") ? 0 : $data;

			//check these device user id, device user auth code and dac are not present in the DB, if they are - recalculate them. If something goes wrong - exit
			$deviceUserDb = DeviceUsersDB::getInstance();

			//create device user id, check it
			do{
				$device_user_id =  $device_user_id+1;
				$countCollisions = $deviceUserDb->checkIfExistsDeviceUser(['device_user_id' => $device_user_id]);
			}while($countCollisions);

			if($countCollisions === false){
				return false;
			}

			//create device user auth code, check it
			do{
				$device_user_auth = bin2hex(openssl_random_pseudo_bytes(16));
				$countCollisions  = $deviceUserDb->checkIfExistsDeviceUser(['auth' =>  $device_user_auth]);
			}while($countCollisions);

			if($countCollisions === false){
				return false;
			}

			//check dac
			do{
				$dac = substr(number_format(time() * rand(),0,'',''),0,12);
				$countCollisions = $deviceUserDb -> checkIfExistsDeviceUser(array('dac' => $dac));
			}while($countCollisions);

			if($countCollisions === false){
				return false;
			}

			//save the latest used number that forms part of device user id
			file_put_contents($my_file, $device_user_id);

			//device_user_id is retrieved from CS as "string". So, setting type of $device_user_id as string to maintain symmetry
			settype($device_user_id, "string");

			return (object)array(	'device_user_id' => $device_user_id,
												'device_user_auth' => $device_user_auth,
												'dac' => $dac,
												'dac_expiration' => (new \DateTime())->getTimestamp()+172800);

	}


	/**
	 * Adds email access to the specified user.  Calls central service so that central DB also holds the info.
	 * Security: Calling function must verify that the user is admin or is the specified userId.
	 * @param int $username Account to which the DAC will provide access.
	 * @param string $email email address to which access should be given
	 * @param string $sender e-mail address of sender
	 * @param string $alias of sender (sender's name)
	 * @param $userType 1: DeviceUser is attached to a local user, 2: a DeviceUser is attached to the Guest user
	 * @param string $firstname first name of the device user
	 * @param string $lastname last name of the device user
	 * @return an array containing the DeviceUserId and DeviceUserAuth code
	 */
	public function addEmailAccessToUser($username, $email, $firstname='', $lastname='', $sender = NULL, $sendEmail='true', $alias=null, $userType=1, $overwrite=false)
	{
		// Call server deviceuser service to add central device user with email
		$deviceConfig = getGlobalConfig('device');
		// Add device user for this device

		$params =
		[
		    'deviceId'   => getDeviceId(),
		    'deviceauth' => getDeviceAuthCode(),
		    'email'      => $email,
		    'user_type'  => $userType,
		    'alias'      => $alias,
		    'send_email' => $sendEmail,
		    'overwrite'  => $overwrite ? 'true' : 'false',
		    'first_name' => $firstname,
		    'last_name'  => $lastname
		];

		if (!empty($sender))
		{
			$params['sender'] = $sender;
		}

		$serverUrlDeviceUser = urlReplaceQueryParams(getServerBaseUrl() . $deviceConfig['ADD_DEVICEUSER_RESTURL'], $params);
		$hc                  = new \HttpClient();
		$response            = $hc->get($serverUrlDeviceUser);

		Logger::getInstance()->debug(__FUNCTION__ . ", Creating Email Central server device user: $serverUrlDeviceUser, response: " . $response);

		$deviceUser = @simplexml_load_string($response['response_text']); //suppress errors for bad XML

		if (!$deviceUser || !stristr($deviceUser->status, 'success'))
		{
			//log error
			Logger::getInstance()->err(__FUNCTION__ . ", Error in creating Email Central server device user: $serverUrlDeviceUser, response: " . $response);

			return FALSE;
		}

		// Add device_user with user_id reference, auth and device user id (from server).
		$deviceUserDb = DeviceUsersDB::getInstance();
		$du           = $deviceUserDb->getDeviceUser($deviceUser->device_user_id);

		if ($du && $overwrite && !$deviceUserDb->updateDeviceUserById($deviceUser->device_user_id,
		                              [DeviceUsersDB::COL_USER => $username]))
		{
			Logger::getInstance()->err(__FUNCTION__ . ', Create user with overwrite failed for duid: ' .
			                             $deviceUser->device_user_id . ',  duac: ' . $deviceUser->device_user_auth);
		}
		elseif (!$deviceUserDb->createDeviceUser($username, $deviceUser->device_user_id, $deviceUser->device_user_auth,
			                                     $email, '', 'webuser', TRUE, TRUE))
		{
			Logger::getInstance()->err(__FUNCTION__ . ', Create user with insert failed for duid: ' . $deviceUser->device_user_id .
			                             ',  duac: ' . $deviceUser->device_user_auth);
		}

		return ['device_user_id' => $deviceUser->device_user_id, 'device_user_auth' => $deviceUser->device_user_auth];
	}

	public function updateDeviceUser($deviceUserId, $deviceUserType, $deviceUserName, $deviceUserEmail, $isActive,
        $typeName, $application, $version=null)
	{
		//check if device user with this e-mail address already exists for this user
		$deviceUserDb = DeviceUsersDB::getInstance();
		$existingDeviceUser = $deviceUserDb->getDeviceUser($deviceUserId);
		if ((!empty($version) && $version >= 2.6) && $existingDeviceUser->getEmail() !== $deviceUserEmail) {
            $deviceUsersWithEmail = $deviceUserDb->getDeviceUsersForEmail($deviceUserEmail);
            if (!empty($deviceUsersWithEmail)) {
                throw new \Remote\RemoteException('DEVICE_USER_ALREADY_EXISTS', 403, null, 'device_user');
            }
        }
		return DeviceUsersDB::getInstance()->updateDeviceUser($deviceUserId, $deviceUserType, $deviceUserName,
		                                                      $deviceUserEmail, $isActive, $typeName, $application);
	}

	/**
	 * Calls the service of the Central Servers to resend email to the device user.
	 * @param integer $deviceUserId Primary identifier of the Central User
	 * @return boolean indicating whether the email was successfully sent.
	 */
	public function resendEmail($deviceUserId, $sender = NULL)
	{
		$config     = getGlobalConfig('remoteuser');
		$deviceUser = DeviceUsersDB::getInstance()->getDeviceUser($deviceUserId);

		if (empty($deviceUser))
		{
			return FALSE;
		}

		$accQueryParams = ['dev_user_id' => $deviceUserId, 'dev_user_auth' => $deviceUser->getDeviceUserAuthCode()];

		if (!empty($sender))
		{
			$accQueryParams['sender'] = $sender;
		}

		$serverUrl = getServerBaseUrl() . $config['RESEND_EMAIL_RESTURL'];

		if ($serverUrl == null) {
			return false;
		}

		$serverUrl = urlReplaceQueryParams($serverUrl, $accQueryParams);
		$serverUrl = str_replace('/device_user?', '/device_user/'.$deviceUserId.'?', $serverUrl);

		if (!validUrl($serverUrl))
		{
			return FALSE;
		}

		$hc       = new \HttpClient();
		$response = $hc->get($serverUrl);

		return ($response['status_code'] == 200);
	}

	
	/**
	 * Calls the service of the Central Servers to resend email to the device user.
	 * @param string $username username of the NAS user
	 * @param array $parameters - array of parameters to update
	 * @return boolean indicating whether the update was successful
	 */
	public function updateUserParameters($username, $parameters)
	{
		/* CS device_user JSON PUT body format:
		 * {
			 "device_user_id": 123,
			 "device_user_auth": "abc123",
			 "first_name": "John",
			 "last_name": "Smith",
			 "user_type": 3
		}*/
		$config     = getGlobalConfig('remoteuser');
		$deviceUsers = DeviceUsersDB::getInstance()->getOwnedDeviceUsersForUser($username);
		$serverUrl = getServerBaseUrl() . $config['UPDATE_DEVICEUSER_RESTURL'];
		
		if (!validUrl($serverUrl))	{
			return false;
		}
		
		foreach($deviceUsers as $deviceUser){
			if($deviceUser->getType()=='webuser'){
				$parameters['device_user_id']  = $deviceUser->getDeviceUserId();
				$parameters['device_user_auth'] = $deviceUser->getDeviceUserAuthCode();

				Logger::getInstance()->debug(__FUNCTION__ . ": Request sent to Central Server: $serverUrl, with PUT-body: ", $parameters);
				$hc = new \HttpClient();
				$response            = $hc->put($serverUrl, $parameters);
				Logger::getInstance()->debug(__FUNCTION__ . ": Response received from Central Server: $serverUrl, with response-Body: ", $response);
				if($response['status_code'] != 200){
					Logger::getInstance()->err(__FUNCTION__ . ": Error creating Updating Central Server Device User. Error response code received from server: $serverUrl, response: ", $response);
					return false;
				}
			}
		}
		return true;
	}
	
	/**
	 * Calls the service of the Central Servers to send access email to the device user.
	 * @param integer $deviceUserId Primary identifier of the Central User
	 * @return boolean indicating whether the email was successfully sent.
	 */
	public function sendAccessEmail($deviceUserId, $deviceUserAuthCode, $email, $albumId, $albumName, $mediaType, $expiredDate, $expiredDays, $message) {
		$config         = getGlobalConfig('remoteuser');
		$accQueryParams = array();
		$accQueryParams['dev_user_id']   = $deviceUserId;
		$accQueryParams['dev_user_auth'] = $deviceUserAuthCode;
		$serverUrl = getServerBaseUrl().$config['RESEND_EMAIL_RESTURL'];

		if ($serverUrl == null) {
			return false;
		}

		$serverUrl = urlReplaceQueryParams($serverUrl, $accQueryParams);
		$serverUrl = str_replace('/device_user?', '/device_user/'.$deviceUserId.'?', $serverUrl);
		$serverUrl = str_replace('device_user?', '/device_user/'.$deviceUserId.'?', $serverUrl);

		if (validUrl($serverUrl) == false) {
			return false;
		}

		if (strpos($albumName, 'APICreatedAlbumName') !== false) {
			$albumName = 'Gift Box';
		}
		$email_template_params = "EMAIL:".urlencode($email);
		$email_template_params .= ",ALBUM_ID:".urlencode($albumId);
		$email_template_params .= ",ALBUM_NAME:".urlencode($albumName);
		$email_template_params .= ",MEDIA_TYPE:".urlencode($mediaType);
		$email_template_params .= ",EXPIRATION_DATE:".urlencode($expiredDate);
		$email_template_params .= ",EXPIRATION_DAYS:".urlencode($expiredDays);
		$email_template_params .= ",CUSTOM_MESSAGE:".urlencode($message);
		$serverUrl             .= '&album_id='.$albumId;
		$serverUrl             .= '&email_template_params='.$email_template_params;
		$serverUrl             .= '&email_template=ALBUM_SHARE_1';

		Logger::getInstance()->debug(__FUNCTION__ . ", Sending request: $serverUrl");
		$hc = new \HttpClient();
		$response = $hc->get($serverUrl);
		if ($response['status_code'] != 200) {
			Logger::getInstance()->err(__FUNCTION__ . ", server request failed");
			return false;
		}
		return true;
	}

	/**
	 * If PUT_DEVICE_USER_NOTIFICATION_SCRIPT is defined in the device section of globalconfig.ini, this routine
	 * will call the defined script with the parameters of 'update <deviceUserId>'.
	 */
	public function runDeviceUserNotifyScript($deviceUserId, $action) {
		$deviceConfig = getGlobalConfig('device');
		if (isset($deviceConfig) && sizeof($deviceConfig) > 0) {
			$putDeviceUserNotificationScript = $deviceConfig['PUT_DEVICE_USER_NOTIFICATION_SCRIPT'];
			if (!empty($putDeviceUserNotificationScript)) {
				system($putDeviceUserNotificationScript . ' '. $action . ' ' . $deviceUserId, $response);
			}
		}
	}

    /**
     * Checks whether e-mail is valid
     * @param String $email e-mail to be verified
     * @return boolean indicating whether the email is valid
     */
    public function validEmail($email) {
        return (bool)(preg_match('/^([a-zA-Z0-9\\+_.-])+@([a-zA-Z0-9_.-])+\\.([a-zA-Z])+$/i', $email));
    }

}

<?php
/**
 * \author WDMV - Mountain View - Software Engineering
 * \file remote/DeviceUser.php
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Remote\Controller;

use Auth\User\UserManager;
use Auth\User\UserSecurity;
use Remote\Device\DeviceControl;
use Remote\DeviceUser\DeviceUserManager;
use Remote\DeviceUser\Db\DeviceUsersDB;

/**
 * \class DeviceUser
 * \brief Create, retrieve, update, and delete device users.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \see Device, Users
 */
class DeviceUser
{
    use \Core\RestComponent;

	const COMPONENT_NAME='device_user';

    /**
     * \par Description:
     * Retrieve one device user or a list to which user has access. An Admin
     * User can get a list of all Device Users if a username is not provided in the
     * parameter list
     *
     * \par Security:
     * - Only the user or admin user can get a device user account.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/device_user/{device_user_id}
     * - http://localhost/api/@REST_API_VERSION/rest/device_user?username={username}
     *
     * \param device_user_id Integer - optional
     * \param username       String  - optional
     * \param format         String  - optional
     *
     * \par Parameter Details:
     * - If device_user_id is set, then return only that device user is returned
     * - If username is set, then all associated device users are returned
     *
     * \retval device_users - Array of device user accounts
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of device user(s)
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <device_users>
      <device_user>
      <device_user_id>62580</device_user_id>
      <device_user_auth_code>6b8ebf52e99c0f1437d4bd52c84a75dd</device_user_auth_code>
      <username>guest</username>
      <device_reg_date>1297211862</device_reg_date>
      <type></type>
      <name></name>
      <active></active>
      <email>guest@mywebmail.net</email>
      <dac>951914401933</dac>
      <dac_expiration>1297298315</dac_expiration>
      <type_name></type_name>
      <application></application>
      </device_user>
      </device_users>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml', $version = null) {
        $deviceUserId = !empty($urlPath[0]) ? $urlPath[0] : null;
        $deviceUsersDb = DeviceUsersDB::getInstance();
        if (!is_null($deviceUserId)) {
            $deviceUser = $deviceUsersDb->getDeviceUser($deviceUserId);

            if (isset($deviceUser) && $deviceUser != false) {
                $item = $deviceUser->toArray();
                $this->generateItemOutput(200, self::COMPONENT_NAME, $item, $outputFormat);
            } else {
                $this->generateErrorOutput(404, self::COMPONENT_NAME, 'DEVICE_USER_NOT_FOUND', $outputFormat);
            }
        } else {
        	$sessionUsername = UserSecurity::getInstance()->getSessionUserName();
        	if ( isset($queryParams['username']) ) {
        		$username = trim($queryParams['username']);
        		$userManager = UserManager::getInstance();
				if (!$userManager->isValid($username)) {
					$this->generateErrorOutput(404, self::COMPONENT_NAME, 'DEVICE_USER_NOT_FOUND', $outputFormat);
					return;
        		}
        	}
        	else if (isset($queryParams['user_id'])) {
	            $username = trim($queryParams['user_id']);
        	}
        	else if (!UserSecurity::getInstance()->isAdmin($sessionUsername)){
        		$username = $sessionUsername;
        	}
        	//only Admin users can get the device user list for another user
        	if (!empty($username) && ($username != $sessionUsername && !UserSecurity::getInstance()->isAdmin($sessionUsername))) {
        		throw new \Remote\RemoteException('USER_NOT_AUTHORIZED',401, null, self::COMPONENT_NAME);
        	}

            $items = array();

            foreach ($deviceUsersDb->getDeviceUsersForUser($username) as $deviceUser) {
                $item = $deviceUser->toArray();
                if ( $version == 1.0 ) {
                    $item['user_id'] = $item['username'];
                }

                array_push($items, $item);
            }
            $this->generateCollectionOutput(200, 'device_users', self::COMPONENT_NAME, $items, $outputFormat);
        }
    }

    /**
     * \par Description:
     * Create a new device user.
     *
     * \par Security:
     * - Only the user or admin user can create a device user account.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/device_user
     *
     * \par Web User:
     * \param email                    String   - optional (if a web user needs to be created this becomes a required field and needs to be unique)
     * \param user_id (or) username    String   - optional
     * \param sender      			   String   - optional
     * \param send_email  			   String   - optional
     * \param alias    	  			   String   - optional
     * \param first_name                String   - optional
     * \param last_name                 String   - optional
     * \param format      			   String   - optional
     *
     * - email      - email address that will be used to create a device user of the type webuser. Email needs to be unique per device for version 2.6 and after and unique per user for earlier versions
     * - username   - to which the device user need to be associated
     * - sender     - name of the sender
     * - send_email - {true/false} describes whether to send email or not
     * - alias      - display name for this device on the wd2go Portal
     * - first_name  - first name of the device user
     * - last_name   - last name of the device user
     * - dac        - set to 1 to return a DAC, defaults to 1.
     *
     * \par To create device user for Web use following params(other params even if passed will not be honored):
     * - email
     * - username
     * - sender
     * - alias
     * - sender_email
     * - first_name
     * - last_name
     *
     * \par To create device user for Mobile use following params(other params even if passed will not be honored):
     * - username
     * - alias
     *
     * \par On non-remote access sytems parameters: email, sender, send_email are invalid. Valid parameters are:
     * - username
     * - alias
     * - dac
     * - format
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 201 - On successful creation of device user
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
	 <device_user>
    	<status>success</status>
    	<device_user_id>62580</device_user_id>
    	<device_user_auth>6b8ebf52e99c0f1437d4bd52c84a75dd</device_user_auth>
	 </device_user>
      \endverbatim
     */
    function post($urlPath, $queryParams = null, $outputFormat = 'xml', $version=null)
    {
    	$email = $this->_issetOr($queryParams['email']);

    	if (isset($queryParams['username']))
    	{
    		$username = trim($queryParams['username']);
    	}
    	elseif (isset($queryParams['user_id']))
    	{
    		$username = trim($queryParams['user_id']);
    	}
    	else
    	{
    		$username = UserSecurity::getInstance()->getSessionUserName();
    	}

    	if (empty($username))
    	{
    		throw new \Remote\RemoteException('USER_NAME_MISSING', 400, NULL, static::COMPONENT_NAME);
    	}

    	if (!UserManager::getInstance()->isValid($username))
    	{
    		throw new \Remote\RemoteException('USER_NAME_NOT_FOUND', 404, NULL,  static::COMPONENT_NAME);
    	}

    	$sender       = $this->_issetOr($queryParams['sender']);
    	$send_email   = $this->_issetOr($queryParams['send_email']);
    	$globalConfig = getGlobalConfig('global');
		$remoteAccess = strtolower(getRemoteAccess());

    	if (isset($globalConfig['ENABLEREMOTEACCESS']) && $globalConfig['ENABLEREMOTEACCESS'] == 0 &&
    	    ($email !== NULL || $sender !== NULL || $send_email !== NULL))
    	{
    	    throw new \Remote\RemoteException('INVALID_PARAMETER', 400, NULL, static::COMPONENT_NAME);
    	}
    	elseif ('false' === $remoteAccess)
		{
			throw new \Remote\RemoteException('REMOTE_ACCESS_OFF', 400, NULL, static::COMPONENT_NAME);
		}
		
		//sanitize alias string
		$alias = $this->_issetOr($queryParams['alias']);
		if (!empty($alias)) {
			$alias =  filter_var($alias, FILTER_SANITIZE_STRING);
		}

		//sanitize firstname string
		$firstname = (isset($queryParams['first_name']) && filter_var($queryParams['first_name'], FILTER_SANITIZE_STRING)) ? $queryParams['first_name'] : '';

		//sanitize lastname string
		$lastname = (isset($queryParams['last_name']) && filter_var($queryParams['last_name'], FILTER_SANITIZE_STRING)) ? $queryParams['last_name'] : '';

    	$deviceControl = DeviceControl::getInstance();
        if (!$deviceControl->assureDeviceRegistration()){
            throw new \Remote\RemoteException('DEVICE_NOT_REGISTERED', 403, NULL, static::COMPONENT_NAME);
        }

    	$deviceUserManager = DeviceUserManager::getManager();

    	if (!empty($email))
    	{
    		$credentialsArray = $deviceUserManager->addEmailDeviceUser($username, $email, $firstname, $lastname, $send_email, $sender, $alias, $version);
    	}
    	else
    	{
    		$credentialsArray = $deviceUserManager->addDeviceUser($username, $this->_issetOr($queryParams['dac'], 1), $alias);
    	}

    	if (is_array($credentialsArray))
    	{
            $credentialsArray['status'] = 'success';

	        $this->generateSuccessOutput(201, self::COMPONENT_NAME, $credentialsArray, $outputFormat);
    	}
    	else
    	{
    		throw new \Remote\RemoteException('DEVICE_USER_CREATE_FAILED', 500, null,  self::COMPONENT_NAME);
    	}
    }

    /**
     * \par Description:
     * Update an existing device user.
     *
     * \par Security:
     * - Only the user or admin user can update a device user account.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/device_user/{device_user_id}
     * - http://localhost/api/@REST_API_VERSION/rest/device_user/{device_user_id}?resend_email=true
     *
     * \param device_user_id        Integer  - required
     * \param type                  Integer  - required
     * \param name                  String   - required only for email device user
     * \param email                 String   - required only for email device user
     * \param device_user_auth_code String   - optional
     * \param type_name             String   - optional
     * \param application           String   - optional
     * \param resend_email          Boolean  - optional (if this parameter is passed all other parameters are ignored except sender)
     * \param sender                String   - optional
     * \param is_active             Boolean  - optional
     * \param format                String   - optional
     *
     * \par On non-remote access sytems parameters: email, sender, resend_email are invalid. Valid parameters are:
     * - device_user_id
     * - type
     * - name
     * - device_user_auth_code
     * - type_name
     * - application
     * - is_active
     * - format
     *
     * \par Parameter Details:
     * - The device_user_id and device_user_auth_code are required.
     *
     * \par Type Parameter Details:
     * <table>
     * <tr>
     * <th>Type</th>
     * <th>Enumerated Value</th>
     * </tr>
     * <tr>
     * <td align="center">1</td>
     * <td>iPhone</td>
     * </tr>
     * <tr>
     * <td align="center">2</td>
     * <td>iPad Touch</td>
     * </tr>
     * <tr>
     * <td align="center">3</td>
     * <td>iPad</td>
     * </tr>
     * <tr>
     * <td align="center">4</td>
     * <td>Andoid Phone</td>
     * </tr>
     * <tr>
     * <td align="center">5</td>
     * <td>Andoid Tablet</td>
     * </tr>
     * <tr>
     * <td align="center">6</td>
     * <td>Sync Application</td>
     * </tr>
     * </table>
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful updation of the device user.
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <users>
      <status>success</status>
      </users>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml', $version=null) {
        $putData = $this->getPutData();
        if ($putData) {
            foreach ($putData as $key => $val) {
                $queryParams[$key] = $val;
            }
        }
        if (!isset($urlPath[0])) {
            $this->generateErrorOutput(400, self::COMPONENT_NAME, 'DEVICE_USER_ID_MISSING', $outputFormat);
            return;
        }
        $status = $this->modifyDeviceUser($urlPath, $queryParams, $version);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'status', $status);
        if ($status === 400) {
            $this->generateErrorOutput(400, self::COMPONENT_NAME, 'PARAMETER_MISSING', $outputFormat);
        } else if ($status === 401) {
            $this->generateErrorOutput(400, self::COMPONENT_NAME, 'INVALID_PARAMETER', $outputFormat);
        } else if ($status) {
            $results = array('status' => 'success');
            $this->generateSuccessOutput(200, self::COMPONENT_NAME, $results, $outputFormat);
        } else {
            $this->generateErrorOutput(500, self::COMPONENT_NAME, 'DEVICE_USER_UPDATE_FAILED', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Delete an existing device user.
     *
     * \par Security:
     * - Only the user or admin user can delete a device user account.
     *
     * \par HTTP Method: DELETE
     * - http://localhost/api/@REST_API_VERSION/rest/device_user/{deviceUserId}?device_user_auth_code={auth_code}
     *
     * \param device_user_id        Integer - required
     * \param device_user_auth_code String  - required
     * \param format                String  - optional
     *
     * \par Parameter Details:
     * - The device_user_id and device_user_auth_code are required.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful deletion of the device user
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
     <users>
     <status>success</status>
     </users>
     \endverbatim
     */
    function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {
    	if (empty($urlPath[0])) {
    		$this->generateErrorOutput(400, self::COMPONENT_NAME, 'DEVICE_USER_ID_MISSING', $outputFormat);
    	} else {
    		$deviceUserId = $urlPath[0];
    		if ( empty($deviceUserId) || empty($queryParams['device_user_auth_code'])) {
    			throw new \Remote\RemoteException('PARAMETER_MISSING', 400, null,  self::COMPONENT_NAME);
    		}
    		$deviceID = getDeviceId();
    		if (empty($deviceID)) {
    			throw new \Remote\RemoteException('DEVICE_NOT_REGISTERED', 403, null,  self::COMPONENT_NAME);
    		}

    		$deviceUsersDb = DeviceUsersDB::getInstance();
    		$deviceUser = $deviceUsersDb->getDeviceUser($deviceUserId);

    		//Validating device_user_id and device-user_auth_code
    		if(!$deviceUser){
    			throw new \Remote\RemoteException('INVALID_AUTH_CODE', 400, null, self::COMPONENT_NAME);
    		}
    		else{
    			$deviceUserArr = $deviceUser->toarray();
    			if($deviceUserArr['device_user_auth_code'] != $queryParams['device_user_auth_code']){
    				throw new \Remote\RemoteException('INVALID_AUTH_CODE', 400, null, self::COMPONENT_NAME);
    			}
    		}

    		//Before deleting a device user check if the user has admin access or the deleting own device-user instance
    		$userSecurity = UserSecurity::getInstance();
			if($deviceUserArr['username'] == $userSecurity->getSessionUsername() || $userSecurity->isAdmin($userSecurity->getSessionUsername())){

	    		$deviceUserAuthCode = $queryParams['device_user_auth_code'];
	    		$deviceUserManager = DeviceUserManager::getManager();
	    		$status = $deviceUserManager->deleteDeviceUser($deviceUserId, $deviceUserAuthCode);
	    		$globalConfig = getGlobalConfig('global');

	    		if($status){
	    			if(isset($globalConfig['ENABLEREMOTEACCESS']) && $globalConfig['ENABLEREMOTEACCESS']==1){
		    			//check and stop services if they are running, if there are no device users
		    			DeviceControl::getInstance()->updateRemoteServices();
	    			}
	    		}
	    		else{
	    			throw new \Remote\RemoteException('DELETE_DEVICE_USERS_FAILED', 500, null, self::COMPONENT_NAME);
	    		}
	    		if ($status) {
	    			$results = array('status' => 'success');
	    			$this->generateSuccessOutput(200, self::COMPONENT_NAME, $results, $outputFormat);
	    		} else {
	    			$this->generateErrorOutput(404, self::COMPONENT_NAME, 'DEVICE_USER_NOT_FOUND', $outputFormat);
	    		}
    		}
    		else{
    			throw new \Remote\RemoteException('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
    		}
    	}
    }

    private function modifyDeviceUser($urlPath, $queryParams, $version=null) {
		$deviceUserId = $urlPath[0];
		$deviceUserType = isset($queryParams['type']) ? trim($queryParams['type']) : null;

		$deviceUserName = isset($queryParams['name']) ? trim($queryParams['name']) : null;
		$deviceUserEmail = isset($queryParams['email']) ? trim($queryParams['email']) : null;
		$isActive = isset($queryParams['is_active']) && $queryParams['is_active'] == 'false' ? false : true;
		$typeName = isset($queryParams['type_name']) ? trim($queryParams['type_name']) : null;
		$application = isset($queryParams['application']) ? trim($queryParams['application']) : null;
		$resendEmail = !empty($queryParams['resend_email']) && $queryParams['resend_email'] == 'true' ? 'true' : 'false';

		$sender = isset($queryParams['sender']) ? trim($queryParams['sender']) : null;

		$globalConfig = getGlobalConfig('global');
		if(isset($globalConfig['ENABLEREMOTEACCESS']) && $globalConfig['ENABLEREMOTEACCESS']==0){
			if($deviceUserEmail !==null || $sender !== null || $resendEmail !== 'false'){
				throw new \Remote\RemoteException('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
			}
		}

		//check email address
		if (!empty($deviceUserEmail) && !filter_var($deviceUserEmail, FILTER_VALIDATE_EMAIL))
		{
			throw new \Remote\RemoteException('INVALID_PARAMETER', 400, NULL, static::COMPONENT_NAME);
		}
		
		//sanitize string params
		if (!empty($typeName)) {
			$typeName =  filter_var($typeName, FILTER_SANITIZE_STRING);
		}

		if (!empty($application)) {
			$application =  filter_var($application, FILTER_SANITIZE_STRING);
		}
		if (!empty($sender)) {
			$sender =  filter_var($sender, FILTER_SANITIZE_STRING);
		}
		
		$deviceUserManager = DeviceUserManager::getManager();

    	if (empty($deviceUserId) || !is_numeric($deviceUserId) || $deviceUserId < 0) {
			throw new \Remote\RemoteException('DEVICE_USER_ID_MISSING', 400, null,  self::COMPONENT_NAME);
		}

		$deviceUsersDb = DeviceUsersDB::getInstance();
		$deviceUser = $deviceUsersDb->getDeviceUser($deviceUserId);
        if (!isset($deviceUser) || $deviceUser == false) {
			throw new \Remote\RemoteException('DEVICE_USER_NOT_FOUND', 400, null,  self::COMPONENT_NAME);
		}
		if(isset($globalConfig['ENABLEREMOTEACCESS']) && $globalConfig['ENABLEREMOTEACCESS']==1){
			$isDACNotExpired = $deviceUsersDb->isWanAccessEnabled($deviceUserId);
		}else{
			$isDACNotExpired = $deviceUsersDb->isDACNotExpired($deviceUserId);
		}
		if(!$isDACNotExpired) {
			throw new \Remote\RemoteException('DEVICE_USER_DAC_EXPIRED', 400, null,  self::COMPONENT_NAME);
		}

		if ($resendEmail == 'true') {
			if (0 !== strcmp('webuser', $deviceUser->getType())) {
			    throw new \Remote\RemoteException('DEVICE_USER_WRONG_TYPE', 400, null,  self::COMPONENT_NAME);
			}
			$result = $deviceUserManager->resendEmail($deviceUserId, $sender);
			//JS: just ignore any other parameters???
			return $result;
		}

		if ( !empty($deviceUserEmail) && (empty($deviceUserType) || empty($deviceUserName))) {
			throw new \Remote\RemoteException('PARAMETER_MISSING', 400, null,  self::COMPONENT_NAME);
		}

		$result = $deviceUserManager->updateDeviceUser($deviceUserId, $deviceUserType, $deviceUserName, $deviceUserEmail, $isActive, $typeName, $application, $version);
		//The only time an update is done is when the deviceUser is first registered.
		//When this happens, we need to do a callback to notify the system
		if ($result) {
			$deviceUserManager->runDeviceUserNotifyScript($deviceUserId,'update');
		}
		return $result;
	}

}
<?php
/**
 * \file auth/users.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 *
 */

namespace Auth\Controller;

/**
 * \class Users
 * \brief Used for Creating, retrieving, updating, and deleting user accounts.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 * - There is no facility to delete all users in one API call.
 *
 * \see Album, DeviceUser, Login, RemoteAccount, Shares
 */

use Auth\User\UserManager;
use Auth\User\UserSecurity;
use Core\Rest\Exception;
use Remote\DeviceUser\Db\DeviceUsersDB;
use Remote\Device\DeviceControl;
use Remote\DeviceUser\DeviceUserManager;

class Users
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'users';

    /**
     * \par Description:
     * Used for delete an existing user in the device.
     * When a cloudholder or admin user that has created a share with target_path or a share with share_access_locked is deleted - these shares get deleted as well
     * When a user that has created links is deleted links are removed as well
     *
     * \par Security:
     * - An Admin user can delete any user accounts.
     * - A Cloud Holder user can delete regular user accounts.
     * - Original system admin can not be deleted
     *
     * \par HTTP Method: DELETE
     * - http://localhost/api/@REST_API_VERSION/rest/users/{username}
     *
     * \param username String  - required
     * \param format   String  - optional
     *
     * \par Parameter Details:
     * - The username provides the username associated with the user account to delete.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful deletion of the user
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 33  - INVALID_PARAMETER - Invalid parameter.
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized delete the passed in username.
     * - 90  - USER_NOT_FOUND - user not found.
     * - 49  - USER_DELETE_FAILED - Failed to delete the user.
     *
     * \par XML Response Example:
     * \verbatim
      <users>
      <status>success</status>
      </users>
      \endverbatim
     */
    public function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $userManager = UserManager::getInstance();
        $userSecurity = UserSecurity::getInstance();
        
        if (isset($urlPath[0])) {
            $username = trim($urlPath[0]);
        } else {
        	// JS for backwards compatibility, we will take user_id or username as they should be the same
            if (isset($queryParams['username'])) {
	        	$username = trim($queryParams['username']);
			}
			else  if (isset($queryParams['user_id'])) {
				$username = trim($queryParams['user_id']);
			}
	        else {
	        	$this->generateErrorOutput(400, 'users', 'INVALID_PARAMETER', $outputFormat);
	        	return;
	        }
        }

        $username = strtolower($username);
        $sessionUsername = UserSecurity::getInstance()->getSessionUsername();
        
        if($userSecurity->isCloudholder($username) && !$userSecurity->isAdmin($sessionUsername)){
        	throw new \Core\Rest\Exception('CHS_CAN_NOT_REMOVE_CHS_OR_ADMINS', 400, NULL, static::COMPONENT_NAME);
        }
        if (strcasecmp($username, $sessionUsername) == 0) {
            $this->generateErrorOutput(403, 'users', 'You cannot delete yourself.', $outputFormat);
            return;
        }

        if (!$userManager->isValid($username)) {
            $this->generateErrorOutput(404, 'users', 'USER_NOT_FOUND', $outputFormat);
            return;
        }
        
        if($userSecurity->isDeviceOwner($username)){
        	throw new \Core\Rest\Exception('ORIGINAL_ADMIN_RECORD_DELETION_FORBIDDEN', 400, NULL, static::COMPONENT_NAME);
        }
        
        try {
			$deviceUsers = DeviceUsersDB::getInstance()->getDeviceUsersForUser($username);
			foreach ($deviceUsers as $deviceUser) {
				$item = $deviceUser->toArray();
				$deviceUserId = $item['device_user_id'];
				$deviceUserAuthCode = $item['device_user_auth_code'];
				$deviceUserManager = DeviceUserManager::getManager();
				$status = $deviceUserManager->deleteDeviceUser($deviceUserId, $deviceUserAuthCode);
				if ($status) {
					//check and stop services if they are running, if there are no device users
					DeviceControl::getInstance()->updateRemoteServices();
				}
				else{
					throw new \Remote\RemoteException('DELETE_DEVICE_USERS_FAILED', 500, null, self::COMPONENT_NAME);
				}
			}
			$userManager->deleteUser($username);
		} catch ( \Exception $e ) {
			throw new \Core\Rest\Exception('USER_DELETE_FAILED', 500, $e, static::COMPONENT_NAME);
		}

        $results = array('status' => 'success');
        $this->generateSuccessOutput(200, 'users', $results, $outputFormat);
    }

    /**
     * \par Description:
     * Used to retrive account information about the supplied username. Only a Cloud Holder/Admin user or users on the LAN will receive information on all users.
     * A non-Cloud Holder/non-Admin user, not on the LAN, may make a request for information only for themselves.
     * A single user is identified by the  username. If a matching user account is found with the given name, then that user's details will be returned, else an error will be returned.
     * If the optional email parameter is specified, only users with that partial email address will be returned.
     *
     * \par Security:
     * - Only the user or a Cloud Holder/Admin user can get a user account.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/users
     * - http://localhost/api/@REST_API_VERSION/rest/users/{username}
     * - http://localhost/api/@REST_API_VERSION/rest/users?email=guest@wdc.com
     * - http://localhost/api/@REST_API_VERSION/rest/users?show_emails=true
     * - http://localhost/api/@REST_API_VERSION/rest/users?device_user_id=4857194
     *
     * \param username String - optional
     * \param email    String - optional
     * \param format   String - optional
     * \param show_emails Boolean - optional
     * \param device_user_id Integer - optional
     *
     * \par Parameter Details:
     *
     * - Only a Cloud Holder/Admin user or users on the LAN will receive information on all users.  A non-Cloud Holder/non-Admin user, not on the LAN, may make a request for information only for themselves.
     *
     * - A single user is identified by the  username. If a matching user account is found with the given name, then that user's details will be returned,
     *   else an error will be returned.
     * - A single user can also be identified by device_user_id_filter. If device_user_id_filter is set, then only information about the user associated with this device 
     *   user is returned. if username or user_id is passed along with device_user_id_filter, device_user_id_filter parameter is ignored. 
     *
     * - If the optional email parameter is specified, usernames will be returned for Users that have DeviceUsers that match the
     *   supplied e-mail address. If the email parameter ends with '%', then a partial match will be performed
     *   Example 1: email=ralph.ralphson@aol.com  will only return users that have DeviceUsers with an exact email adddress match
     *   Example 2: email=ralph% will match ralph.ralphson@aol.com ralph@yahoo.com, ralphy1234@gmail.com, etc.
     *
     * - The optional show_emails parameter controls the existance of the <emails> node. If true it is returned, otherwise it is not.
     * 
     * - with pre 2.6 version of REST API regular users on users GET get filtered out and not dispayed and group_names tag is not displayed 
     *
     * \retval users Array - user account info
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 78  - USER_GET_FAILED - Failed to get user.
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized delete the passed in username.
     * - 90  - USER_NOT_FOUND - user not found.
     *
     * \par XML Response Example:
     * \verbatim
<users>
    <user>
    <user_id>guest</user_id>
    <username>guest</username>
    <fullname>Guest User</fullname>
    <is_admin>false</is_admin>
    <is_password>false</is_password>
    <group_names>
      <group_name>administrators</group_name>
      <group_name>cloudholders</group_name>
    </group_names>
    <emails>
        <email>guest@wdc.com</email>
    </emails>
    </user>
</users>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml', $version = null) {
     	$userManager = UserManager::getInstance();
     	$userSecurity = UserSecurity::getInstance();

        /**
         * Business rules:
         * LAN requests - No Authentication requried: full access to all functionality.
         * WAN requests - Requires Authentication.
         *     - Only Admin is allowed full access to all functionality
         *     - Users allowed to see their own info only.
         */

        if (isset($urlPath[0])) {
            $username = trim($urlPath[0]);
        } else {
        	//JS for backwards compatibility, we will take user_id or username as they should be the same
            if (isset($queryParams['username'])) {
	        	$username = trim($queryParams['username']);
			}elseif (isset($queryParams['user_id'])) {
				$username = trim($queryParams['user_id']);
			}elseif (isset($queryParams['device_user_id_filter'])) {
				$deviceUsersDb = DeviceUsersDB::getInstance();
				$deviceUser = $deviceUsersDb->getDeviceUser($queryParams['device_user_id_filter']);
				$username = is_object($deviceUser) ? $deviceUser->getParentUsername() : null;
				if(empty($username)){
					 throw new \Core\Rest\Exception('USER_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
				}
			}
        }
        $username = strtolower($username);

        $email = isset($queryParams['email']) ? trim($queryParams['email']) : '';
        $showEmails = isset($queryParams['show_emails']) && $queryParams['show_emails'] === 'true';
        $isLanRequest = isLanRequest();
        $sessionUsername = $userSecurity->getSessionUsername();
        $isCloudholder = $userSecurity->isCloudholder($sessionUsername);

        if (!$isLanRequest && !$isCloudholder && !empty($username) && $username !== $sessionUsername) {
            throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, NULL, static::COMPONENT_NAME);
        }

        $users = [];
        if (!empty($email)) {
            $users = $userManager->getUsersWithEmail($email, strpos($email, '%') !== false);//always an array of User obects
        } else {
            $users = $userManager->getUser($username);//could be NULL or a single User object or an array of User objects
            if (!empty($users) && !is_array($users)) {
                $users = [$users];
            }
        }

        if (empty($users)) {
            throw new \Core\Rest\Exception('USER_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
        }

        if (!$isLanRequest && !$isCloudholder) {
            foreach ($users as $i => $user) {
                if ($user->getUsername() !== $sessionUsername) {
                    unset($users[$i]);
                }
            }
        }

        $userEmails = [];
        if ($showEmails) {
            $deviceUsers = DeviceUsersDB::getInstance()->getDeviceUsersForUser($username);//username could be empty
            foreach ($deviceUsers as $deviceUser) {
                $deviceUserEmail = trim($deviceUser->getEmail());
                if (empty($deviceUserEmail)) {
                    continue;
                }

                if (!isset($userEmails[$deviceUser->getParentUsername()])) {
                    $userEmails[$deviceUser->getParentUsername()] = [];
                }
                $userEmails[$deviceUser->getParentUsername()][] = $deviceUserEmail;
            }
        }

        ob_start();
        setHttpStatusCode(200);
        $output = new \OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement(self::COMPONENT_NAME);
        $output->pushArray('user');
        foreach ($users as $user) {
        	if ($version < 2.6 && !$user->getIsCloudholder()) {
        		continue;
        	}
            $output->pushArrayElement();

            $output->element('username', $user->getUsername());
            $output->element('user_id', $user->getUsername());//for backwards comaptibility until clients get updated
            $output->element('fullname', $user->getFullName());
            $output->element('is_admin', $user->getIsAdmin() ? 'true' : 'false');
            $output->element('is_password', $user->getIsPassword() ? 'true' : 'false');
            if ($version >= 2.6){
	            $output->pushElement('group_names');
	            $output->pushArray('group_name');
	            foreach ($user->getGroupNames() as $groupName) {
	                $output->arrayElement($groupName);
	            }
	            $output->popArray();
	            $output->popElement();
            }
            
            if ($showEmails) {
                $output->pushElement('emails');
                $output->pushArray('email');
                if (isset($userEmails[$user->getUsername()])) {
                    foreach ($userEmails[$user->getUsername()] as $userEmail) {
                         $output->arrayElement($userEmail);
                    }
                }
                $output->popArray();
                $output->popElement();
            }

            $output->popArrayElement();
        }
        $output->popArray();
        $output->popElement();
        $output->close();
    }

    /**
     * \par Description:
     * Used for creating an user in the device.
     *
     * \par Security:
     * - An Admin user can create any user accounts.
     * - A Cloud Holder user can create regular user accounts.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/users
	 *
	 * \par HTTP POST Body - required if not provided as query parameters, and body should not be used when making the requesting with query parameters.
	 * - Content-Type header needs to be application/json when using POST body.
	 * - Body should be a JSON object similar to:
	 * \code
	{"users":
		[
			{"email": "", "username": "user","password": "", "fullname": "", "is_admin": "", "group_names": "", "first_name": "", "last_name": ""},
			{"email": "user2@theDomain.com", "username": "","password": "", "fullname": "", "is_admin": "", "group_names": "", "first_name": "", "last_name": ""}
		]
	}	\endcode
     *
     * \param users		  JSON Array - required if POST body used
	 * \param email       String   - optional
     * \param username    String   - optional if email provided else required
     * \param password    String   - optional
     * \param fullname    String   - optional
     * \param is_admin    Boolean  - optional
     * \param group_names String   - optional
     * \param first_name  String   - optional
     * \param last_name   String   - optional
     * \param format      String   - optional
     *
     * - The password must be base 64 encoded.
     *
     * \par Parameter Details:
     *
     * - email    - optional - if provided, a device user will be created as well as a local (Linux) user.
	 * 				A device user is created only if the Linux user creation succeeds first. If the device user creation fails,
	 * 				the Linux user will be deleted part of the cleanup. The email must be unique per device.
     * - username - optional if email is provided. If not provided, email is required and a unique username will be generated from email.
     *              Usernames with upper case characters will be converted into lowercase.
     *              Usernames must start with a lower case letter or an underscore, followed by lower case letters, digits, underscores or dashes.
     *              In regular expression terms: [a-z_][a-z0-9_-]*
     * 				Usernames may only be up to 32 characters long.
     * - password - The User's password. Password string has to be base64 allowed character sets.The length of a password can be between 0 and 255 characters
     *              and can contain any ASCII character except‎ new line. Password passed to this function needs to be base 64 encoded.
     * - fullname - fullname of the user to be created, it can contain unicode letters, numbers, underscore whitespaces and characters '.-; They can end with a dollar sign.  In regular expression terms ^[-0-9_.\' \p{L}]*[$]?+$  Full name can be between 0 and 255 characters.
     * - is_admin - indicates the user to be created is an admin or not.
     * - group_names  - indicates which user groups the user is supposed to belong to. Accepts a comma separated list of group names.  If only administrators group name is passed both administrators and cloudholders group memberships are created
     *            if none of the group names are passed but is_admin flag is set as true both group memberships are created. If the flag is passed as false but the group name for administrators is passed, error message is returned
     * - first_name - first name of the device user
     * - last_name  - last name of the device user
     * - format   - Output Format: can be: 'xml' or 'json' (defaults to xml)
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 201 - On successful creation of the user and, if email is provided, of the device user
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 48  - USER_CREATE_FAILED - Failed to create a user.
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized to create a user.
     * - 33  - INVALID_PARAMETER - Invalid parameter.
     * - 54  - USER_NAME_EXISTS - username already exists.
     * - 306 - INVALID_PASSWORD - Invalid password.
     * - 73  - DEVICE_USER_CREATE_FAILED - Failed to create device user.
     * - 11  - DEVICE_NOT_REGISTERED - Device is not registered
     * - 312 - REMOTE_ACCESS_OFF - Remote access is turned off
     * - 49  - USER_DELETE_FAILED - Failed to delete the user (as part of a cleanup if device user creation failed after (Linux) user creation succeeded)
     * - 235 - DEVICE_USER_ALREADY_EXISTS - A Device User with the same e-mail address already exists
     * - 4000 - INVALID_EMAIL - Invalid e-mail
     * - 4001 - INVALID_USERNAME - Invalid UserName
	 * - 4004 - USERS_FIELD_MISSING - users field is missing
	 * - 4005 - USERS_FIELD_NOT_ARRAY - users field is not an array
	 * - 4006 - INVALID_FULLNAME - Invalid fullname
	 * - 139 - GROUP_NOT_FOUND - Group not found
	 * - 3005 - CHS_CAN_NOT_CREATE_CHS_OR_ADMINS - Cloudholder users can not create administrator or cloudholder users
	 * - 4007 - EMAIL_NOT_UNIQUE - Email should be unique
	 * - 4008 - EMAIL_USERNAME_MISSING - Email and/or username missing
	 * - 4009 - USERNAME_NOT_UNIQUE - Username should be unique
     *
     * \par XML Response Example - To preserve the backward compatibility, the query parameters based request response is:
     * \verbatim
      <users>
        <status>success</status>
        <username>guest</username>
	    <user_id>guest</user_id>
      </users>
      \endverbatim
	 * \par XML Response Example - if the request parameters are passed in as JSON POST body, the response is:
	 * \verbatim
		<users>
			<user>
				<username>guest</username>
				<email></email>		<== non-email based user creation so no device user either
			</user>
			<user>
				<username>king</username>
				<email>king@kingdom.com</email>
			</user>
		</users>
		\endverbatim
	 *
     */
    public function post($urlPath, $queryParams = null, $outputFormat = 'xml')
	{
		// To keep the response output backward compatible - check if the request is query parameter based or
		// POST body based. version doesn't help since 2.6 already went out (mirrorman) and others going out with the same version.
		$newResponseOutputFormat = false;
		$usersToCheck = [];
		//ignoring any parameters on content-type for json since the spec doesn't define any and yet browsers (firefox) send it.
		if (isset($_SERVER['CONTENT_TYPE']) && trim(explode(';', $_SERVER['CONTENT_TYPE'], 2)[0]) === 'application/json') {
			$body = json_decode(file_get_contents("php://input"), true);
			if (!isset($body['users'])) {
				throw new \Core\Rest\Exception('USERS_FIELD_MISSING', 400, NULL, self::COMPONENT_NAME);
			}

			if (!is_array($body['users'])) {
				throw new \Core\Rest\Exception('USERS_FIELD_NOT_ARRAY', 400, NULL, self::COMPONENT_NAME);
			}
			$usersToCheck = $body['users'];
			$newResponseOutputFormat = true; // could be single or multi-user request
		} else {
			$usersToCheck[] = $queryParams;
			$newResponseOutputFormat = false; // means single user create request only
		}

		// Optimization flags
		$userSecurity = UserSecurity::getInstance();
		$isSessionUserAdmin = $userSecurity->isAdmin($userSecurity->getSessionUsername());

		$usersToCreate = [];
		$emailIds = []; // needed for dup check during validation & later for existence check
		$usernames = []; // needed for username dup checks during validation
		foreach ($usersToCheck as $user) {
			$email = isset($user['email']) && !empty($user['email']) ? strtolower($user['email']) : NULL;
			$username = isset($user['username']) && !empty($user['username']) ? strtolower($user['username']) : NULL;
			$password = isset($user['password']) && !empty($user['password']) ? $user['password'] : NULL;
			$fullname = isset($user['fullname']) ? str_replace('+', ' ', $user['fullname']) : '';
			$isAdmin = isset($user['is_admin']) ? $user['is_admin'] : '';
			$isAdmin = $isAdmin == 'true' || $isAdmin == '1' ? true : false;
			$groupNames = isset($user['group_names']) ? $user['group_names'] : '';
			$firstname = (isset($user['first_name']) && filter_var($user['first_name'], FILTER_SANITIZE_STRING)) ? $user['first_name'] : '';
			$lastname = (isset($user['last_name']) && filter_var($user['last_name'], FILTER_SANITIZE_STRING)) ? $user['last_name'] : '';

			// Email based user?
			if (!empty($email)) {
				$deviceUserManager = DeviceUserManager::getManager();
				if (!$deviceUserManager->validEmail($email)) {
					throw new \Core\Rest\Exception('INVALID_EMAIL', 400, NULL, static::COMPONENT_NAME);
				}
				// Check for uniqueness & continue if unique...later check if exists in Db
				if(isset($emailIds[$email])){
					throw new \Core\Rest\Exception('EMAIL_NOT_UNIQUE', 400, NULL, self::COMPONENT_NAME);
				}
				$emailIds[$email] = $email; // isset would be faster than in_array() so make the KV same
			} else {
				if (empty($username)) {
					throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, static::COMPONENT_NAME);
				}
			}

			// Username provided? Verify then...
			$userManager = UserManager::getInstance();
			if (!empty($username)) {
				if (!$userManager->isValidUsernameFormat($username) || $userManager->isReservedUsername($username)) {
					throw new \Core\Rest\Exception('INVALID_USERNAME', 400, NULL, static::COMPONENT_NAME);
				}
				if ($userManager->isValid($username)) {
					throw new \Core\Rest\Exception('USER_NAME_EXISTS', 403, NULL, static::COMPONENT_NAME);
				}
				// Check uniqueness in input/request data
				if(isset($usernames[$username])){
					throw new \Core\Rest\Exception('USERNAME_NOT_UNIQUE', 400, NULL, self::COMPONENT_NAME);
				}
				$usernames[$username] = $username; // isset would be faster than in_array() so make the KV same
			}

			// Password valid?
			if(!empty($password)) {
				if (strlen($password) > 255) {
					throw new \Core\Rest\Exception('INVALID_PASSWORD', 400, NULL, static::COMPONENT_NAME);
				}
				$decodedPw = base64_decode($password, true);
				if (!empty($password) && !$decodedPw || ($decodedPw && (strlen($password) % 4) != 0) || trim(preg_replace('/\s+/', ' ', $decodedPw)) !== base64_decode($password)) {
					throw new \Core\Rest\Exception('INVALID_PASSWORD', 400, NULL, static::COMPONENT_NAME);
				}
			}

			// Fullname provided & valid?
			if (!empty($fullname) && !$userManager->isValidFullnameFormat($fullname)) {
				throw new \Core\Rest\Exception('INVALID_FULLNAME', 400, NULL, static::COMPONENT_NAME);
			}

			// Group provided & valid?
			if (!empty($groupNames)) {
				$groupNames = explode(',', $groupNames);
				foreach ($groupNames as $groupName) {
					if (!$userManager->isValidGroup($groupName)) {
						throw new \Core\Rest\Exception('GROUP_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
					}
				}
				if (isset($queryParams['is_admin']) && filter_var($queryParams['is_admin'], FILTER_VALIDATE_BOOLEAN) == false && in_array('administrators', $groupNames)) {
					throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, self::COMPONENT_NAME);
				}
			}
			$groupMembership = null;
			if ($isAdmin) {
				$groupMembership = 'administrators';
			} else if (!empty($groupNames)) {
				if (in_array('administrators', $groupNames)) {
					$groupMembership = 'administrators';
				} elseif (in_array('cloudholders', $groupNames)) {
					$groupMembership = 'cloudholders';
				}
			}

			//Only admins can modify cloudholders group and modify cloudholder/admin users' status
			if (!$isSessionUserAdmin && !empty($groupMembership)) {
				throw new \Core\Rest\Exception('CHS_CAN_NOT_CREATE_CHS_OR_ADMINS', 400, NULL, static::COMPONENT_NAME);
			}

			// Fullname?
			if (empty($fullname) && !empty($firstname) && !empty($lastname)) {
				$fullname = $firstname . ' ' . $lastname;
			}

			// Batch users to be Created
			$usersToCreate[] = ['email' => $email, 'username' => $username, 'password' => $password,
								'first_name' => $firstname, 'last_name' => $lastname, 'fullname' => $fullname,
								'groupMembership' => $groupMembership];
		} //foreach ($usersToCheck as $user)

		$emailIds = array_keys($emailIds);// Need just keys from here..
		// Get out sooner...Is the request to create a DEVICE USER as well?
		if(!empty($emailIds)) {
			$globalConfig = getGlobalConfig('global');
			$remoteAccess = strtolower(getRemoteAccess());
			if ((isset($globalConfig['ENABLEREMOTEACCESS']) && $globalConfig['ENABLEREMOTEACCESS'] == 0) || ('false' === $remoteAccess)) {
				throw new \Remote\RemoteException('REMOTE_ACCESS_OFF', 400, NULL, static::COMPONENT_NAME);
			}

			$deviceControl = DeviceControl::getInstance();
			if (!$deviceControl->assureDeviceRegistration()) {
				throw new \Remote\RemoteException('DEVICE_NOT_REGISTERED', 403, NULL, static::COMPONENT_NAME);
			}
		}
		// Check if any emailIds already in use
		if(!empty($emailIds) && DeviceUsersDB::getInstance()->checkIfExistsEmailIds($emailIds)){
			throw new \Core\Rest\Exception('DEVICE_USER_ALREADY_EXISTS', 403, NULL, static::COMPONENT_NAME);
		}

		// ====== Verification done - User/DU creation starts....
		// Sort by username (push no username to array bottom) so users with username are created first
		// so to avoid collision with the email Ids later for e.g. input array =
		// 0 => [email = 'sharingidiot@wdc.com', username = '', ...], -> this one will result in "sharingidiot" user
		// 1 => [email = '', username=''sharingidiot',... ] -> which this would then create a soft collision which gets un-noticed :)
		// sorted to array =
		// 0 => [email = '', username = 'sharingidiot', ...], -> this one will result in "sharingidiot" user
		// 1 => [email = 'sharingidiot@wdc.com', username=''sharingidiot',... ] -> now a unique username generated for this instead of "sharingidiot".
		usort($usersToCreate, function($user1, $user2){
			$userName1 = $user1['username'];
			$userName2 = $user2['username'];
			return ($userName1 == $userName2) ? 0 : (($userName1 > $userName2) ? -1 : 1);
		}
		);
		// 1) Create Linux OS User fist
		foreach($usersToCreate as $id => $user) {
			$email = $user['email'];
			$username = $user['username'];
			$password = $user['password'];
			$fullname = $user['fullname'];
			$groupMembership = $user['groupMembership'];
			try {
				if (empty($username)) {
					$username = $userManager->generateUserNameFromEmail($email);
					$usersToCreate[$id]['username'] = $username;
				}
				$userManager->createUser($username, $password, $fullname, $groupMembership);
			} catch (\Exception $e) {
				throw new \Core\Rest\Exception('USER_CREATE_FAILED', 500, $e, static::COMPONENT_NAME);
			}
		}
		//
		// 2) Then, create device users, if requested....
		if(!empty($emailIds)) {
			try {
				// Get required set of KV pairs
				if(!isset($usersToCreate[0])){
					$usersToCreate[] = $usersToCreate;
				}
				$deviceUsersToCreate = array_filter(array_map(function($user) {
					if((isset($user['email']) && !empty($user['email'])) && (isset($user['username']) && !empty($user['username']))) {
						return [ 'username' => $user['username'], 'email' => $user['email'], 'first_name' => $user['first_name'], 'last_name' => $user['last_name']];
					};//if
				}, $usersToCreate));
				// Remote possibility but lets protect the sanity of the data/system - don't just spin the cycles.
				if(empty($deviceUsersToCreate)){
					throw new \Exception();
				} //if(empty($deviceUsersToCreate))
				// Now, create Device Users
				$deviceUserManager = DeviceUserManager::getManager();
				$credentialsArray = $deviceUserManager->addEmailDeviceUsers($deviceUsersToCreate, true);
				if (!is_array($credentialsArray)) {
					throw new \Exception();
				}
			} catch (\Remote\RemoteException $remoteE) {
				// Linux Users CleanUp
				try{
					$userManager->deleteUsers($usersToCreate);
				}
				catch(Exception $e) {}
				throw new \Remote\RemoteException('DEVICE_USER_CREATE_FAILED', 500, $remoteE, self::COMPONENT_NAME);
			} catch (\Exception $e) {
				// Linux Users CleanUp
				try{
					$userManager->deleteUsers($usersToCreate);
				}
				catch(Exception $e) {}
				throw new \Core\Rest\Exception('DEVICE_USER_CREATE_FAILED', 500, $e, static::COMPONENT_NAME);
			}
		} //if($deviceUserRequired)
		//
		// Generate Success output
		if($newResponseOutputFormat){
			$usernameAndIds = array_filter(array_map(function($user) {
				return [ 'username' => $user['username'], 'email' => $user['email']];
			}, $usersToCreate));
			$this->generateCollectionOutput(201, 'users', 'user', $usernameAndIds, $outputFormat);
		}
		else{
			foreach($usersToCreate as $newUser) { // supposed to be one user
				$results = array('status' => 'success', 'username' => $newUser['username'], 'user_id' => $newUser['username']);
				$this->generateSuccessOutput(201, 'users', $results, $outputFormat);
			}
		}
	}


    /**
     * \par Description:
     * Used for update an existing user in the device.
     *
     * \par Security:
     * - An Admin user can update any user accounts.
     * - A Cloud Holder user can update regular user accounts.
     * - Original system admin can not be modified to not be an administrator
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/users/{existing_username}
     *
     * \param username     String  - optional
     * \param new_password String  - optional
     * \param fullname     String  - optional
     * \param is_admin     String  - optional
     * \param first_name String - optional
     * \param last_name String - optional
     * \param format       String  - optional
     * \param rest_method  String  - required
     *
     * \par Parameter Details:
     *
     * - A single user is identified by {existing_username} in the URL.
     *
     * - The password must be base 64 encoded.
     *
  	 * \par Parameter Details:
     *
     * - existing_username - the username of the user account top be modified
     * - username - the new username for the user. Usernames with upper case characters will be converted into lowercase. Usernames must start with a lower case letter or an underscore, followed
     * 				by lower case letters, digits, underscores, or dashes. They can end with a dollar sign. In regular expression terms: [a-z0-9_][a-z0-9_-]*[$]?
     * 				Usernames may only be up to 32 characters long.
     * - new_password - The User's new password. Password string has to be base64 allowed character sets.The length of a password can be between 0 and 255 characters
     *              and can contain any ASCII character except‎ new line. Password passed to this function needs to be base 64 encoded.
     * - fullname - fullname of the user to be created, it can contain unicode letters, numbers, underscore whitespaces and characters '.-; They can end with a dollar sign.  In regular expression terms ^[-0-9_.\' \p{L}]*[$]?+$  Full name can be between 0 and 255 characters.
     * - is_admin - indicates the user is to have admin rights if true - on changing this webuser-type device_users that belong to this user will be updated on Central Server
     * - first_name - first name of the device user - updates Central Server
     * - last_name  - last name of the device user - updates Central Server
     * - format   - Output Format: can be: 'xml' or 'json' (defaults to xml)
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful updation of passed in username
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 53  - USER_UPDATE_FAILED - Failed to update an user.
     * - 57  - USER_NOT_AUTHORIZED - current user is not authorized to create an user.
     * - 33  - INVALID_PARAMETER - Invalid parameter.
     * - 54  - USER_NAME_EXISTS - username already exists.
     * - 306 - INVALID_PASSWORD - Invalid password.
     * - 307 - MISSING_PARAMETER - Parameter Misssing
     * - 4001 - INVALID_USERNAME - Invalid UserName
     *
     * \par XML Response Example:
     * \verbatim
      <users>
      <status>success</status>
      </users>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $userManager = UserManager::getInstance();
        $userSecurity = UserSecurity::getInstance();

        if (isset($urlPath[0])) {
        	$username = trim($urlPath[0]);
        }
        if (empty($username)) {
        	//check user_id for backwards compatability
        	$username = isset($queryParams['user_id']) ? trim($queryParams['user_id']) : null;
        	if (empty($username)) {
        		throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
        		return;
        	}
        }
        $username = strtolower($username);

        if (!$userManager->isValid($username)) {
            throw new \Core\Rest\Exception('USER_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
            return;
        }

        $newUsername = isset($queryParams['username']) ? strtolower($queryParams['username']) : null;
        $fullname = isset($queryParams['fullname']) ? str_replace('+', ' ', $queryParams['fullname']) : null;
        
        $firstname = (isset($queryParams['first_name']) && (filter_var($queryParams['first_name'], FILTER_SANITIZE_STRING)) || $queryParams['first_name'] === "") ? $queryParams['first_name'] : null;
        $lastname = (isset($queryParams['last_name']) && (filter_var($queryParams['last_name'], FILTER_SANITIZE_STRING)) || $queryParams['last_name'] === "") ? $queryParams['last_name'] : null;
        // Fullname?
        if (empty($fullname) && !empty($firstname) && !empty($lastname)) {
        	$fullname = $firstname . ' ' . $lastname;
        }
        
        $oldPassword = isset($queryParams['old_password']) ? $queryParams['old_password'] : null;
        $newPassword = isset($queryParams['new_password']) ? $queryParams['new_password'] : null;
        $isAdminFlag = isset($queryParams['is_admin']) ? $queryParams['is_admin'] : null;
		if ( isset($isAdminFlag)) {
			if ($isAdminFlag == 'true') {
				$isAdmin = true;
			}
			else if ($isAdminFlag == 'false') {
				$isAdmin = false;
			}
			if (!isset($isAdmin)) {
				throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, static::COMPONENT_NAME);
				return;
			}
		}
		
		//Only admins can modify cloudholders and modify cloudholder/admin status
		$sessionUsername = UserSecurity::getInstance()->getSessionUsername();
		if(!$userSecurity->isAdmin($sessionUsername) && ((isset($isAdminFlag)) || $userSecurity->isCloudholder($username))){
			throw new \Core\Rest\Exception('CHS_CAN_NOT_MODIFY_CHS_OR_ADMINS', 400, NULL, static::COMPONENT_NAME);
		}
		
        
		if(isset($isAdminFlag) && $isAdmin == false && $userSecurity->isDeviceOwner($username)){
			throw new \Core\Rest\Exception('ORIGINAL_ADMIN_DELETION_FORBIDDEN', 400, NULL, static::COMPONENT_NAME);
		}
		
        // set boolean for signaling password change action
        // If this is NOT set in QS, it'd not do any action in DB

        if ($newPassword === null) {
            $changePassword = false;
        } else {
            $changePassword = true;
        }

        //check if new_password is valid
        if($changePassword && (!empty($newPassword) && !base64_decode($newPassword, true) || (base64_decode($newPassword, true) && (strlen($newPassword) % 4) != 0) || trim(preg_replace('/\s+/', ' ', base64_decode($newPassword)))!== base64_decode($newPassword)) ){
        	throw new \Core\Rest\Exception('INVALID_PASSWORD', 400, NULL, static::COMPONENT_NAME);
        	return;
        }

        ### CHECK IF USERNAME IS NEW AND ALREADY EXISTS
        if ( ($newUsername != $username) && $newUsername!==null) {
            if ($userManager->isValid($newUsername)) {
                throw new \Core\Rest\Exception('USER_NAME_EXISTS', 400, NULL, static::COMPONENT_NAME);
                return;
            }

            if (!$userManager->isValidUsernameFormat($newUsername) || $userManager->isReservedUsername($newUsername)) {
            	throw new \Core\Rest\Exception('INVALID_USERNAME', 400, NULL, static::COMPONENT_NAME);
            	return;
            }
        }

        if (strlen($newPassword) > 255) {
            throw new \Core\Rest\Exception('INVALID_PASSWORD', 400, NULL, static::COMPONENT_NAME);
            return;
        }

        if (!empty($fullname) && !$userManager->isValidFullnameFormat($fullname)) {
        	throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, static::COMPONENT_NAME);
        	return;
        }

        try {
			$status = $userManager->updateUser($username, $newUsername, $fullname, $oldPassword,
        								   $newPassword, $isAdmin, $changePassword);
         	if($status){
         		$updateCS = ($firstname!==null || $lastname!==null || isset($isAdminFlag));

         		if($updateCS || $newUsername){
         			$deviceUsersDb = DeviceUsersDB::getInstance();
         			$deviceUsers = $deviceUsersDb->getOwnedDeviceUsersForUser($username);
         		}
                if($newUsername){
                    foreach($deviceUsers as $deviceUser){
                    	$item = $deviceUser->toArray();
                        $deviceUsersDb->updateDeviceUserUsername($item['device_user_id'],$newUsername);
					}
				}
				if($updateCS && count($deviceUsers)){
					if($newUsername){
						$username = $newUsername;
					}
					$deviceControl = DeviceControl::getInstance();
					if($firstname!==null){
						$parametersToUpdate['first_name'] = $firstname;
					}
					if($lastname!==null){
						$parametersToUpdate['last_name'] = $lastname;
					}
					if(isset($isAdminFlag)){
						$parametersToUpdate['user_type'] = $userSecurity->userTypeRemote($username);
					}
					if ($deviceControl->assureDeviceRegistration()) {
						$deviceUserManager = DeviceUserManager::getManager();
						$deviceUserManager->updateUserParameters($username, $parametersToUpdate);
					}
				}
			}
        } catch ( \Exception $e ) {
            throw new \Core\Rest\Exception('USER_UPDATE_FAILED', 500, $e, static::COMPONENT_NAME);
        }

        if (!$status) {
            throw new \Core\Rest\Exception('USER_UPDATE_FAILED', 500, NULL, static::COMPONENT_NAME);
            return;
        }
        $results = array('status' => 'success');
        $this->generateSuccessOutput(200, 'users', $results, $outputFormat);
    }
}

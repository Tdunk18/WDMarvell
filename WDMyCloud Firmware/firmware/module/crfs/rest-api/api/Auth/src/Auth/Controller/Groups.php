<?php
namespace Auth\Controller;

/**
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */

use Auth\User\UserManager;
use Auth\User\UserSecurity;
use Auth\User\Linux\UserSystemUtils;
use Filesystem\Model\Link;
use Remote\Device\DeviceControl;
use Remote\DeviceUser\DeviceUserManager;

/**
 * \class Groups
 * \brief Used for creating, retrieving and deleting group information.
 */
class Groups
{
	use \Core\RestComponent;

	const COMPONENT_NAME = 'groups';

	/**
	* \par Description:
	* Used to retrieve group information.
	*
	* \par Security:
	* Only an admin user or users on the LAN will receive information on all users. 
	* A non-admin user, not on the LAN, may make a request for information only for themselves.
	* On changing this webuser-type device_users that belong to this user will be updated on Central Server
	*
	* \par HTTP Method: GET
	* - http://localhost/api/@REST_API_VERSION/rest/groups
    * - http://localhost/api/@REST_API_VERSION/rest/groups/{group_name}
	*
	* \par Parameters: 
	* \param group_name		String  - optional (default is null)
	* \param format					String  - optional (deafult is xml)
	*
	* \par Parameter Details:
	*
	* - If group_name is specified, then the returned content will be restricted to only
	*   include group records of the group specified. Group names in the system are stored in lower case, the request 
	*   parameter will be automatically cast to lower case
    *
    * \par Parameter Usage Examples:
	* - http://192.168.1.108/api/2.6/rest/groups
	* - http://192.168.1.108/api/2.6/rest/groups/cloudholders
	*
	* \par Return values:
	* \retval groups Array - group listing
	*
	* \par HTTP Response Codes:
	* - 200 - On success for getting group list
	* - 400 - Bad request, if parameter or request does not correspond to the api definition
	* - 401 - User is not authorized
	* - 403 - Request is forbidden
	* - 404 - Requested resource not found
	* - 500 - Internal server error
	*
	* \par Error Codes:
	* - 57 - USER_NOT_AUTHORIZED - User not authorized
	* - 90 - USER_NOT_FOUND
	* - 139 - GROUP_NOT_FOUND
	* - 372 - GROUPS_NOT_FOUND
	*
	* \par XML Response Example:
	* \verbatim
<groups>
    <group>
        <group_name>administrators</group_name>
        <usernames>
            <username>admin</username>
        </usernames>
    </group>
    <group>
        <group_name>cloudholders</group_name>
        <usernames>
            <username>spouse</username>
            <username>admin</username>
        </usernames>
    </group>
</groups>
	\endverbatim
	 */
	public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
		$userManager = UserManager::getInstance();
		$userSecurity = UserSecurity::getInstance();
		
		//input validation
		$groupName = null;
		if(isset($urlPath[0])){
			$groupName = strtolower($urlPath[0]);
			if (!$userManager->isValidGroup($groupName)) {
				throw new \Core\Rest\Exception('GROUP_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
			}
		}

		// if user is not an admin then use the session user name
        $username = null;
		if (!isLanRequest()) {
			$sessionUsername = $userSecurity->getSessionUsername();
			if (!$userSecurity->isAdmin($sessionUsername)) {
				$username = $sessionUsername;
			}
		}

		$groupMemberships = $userManager->getGroupMemberships(null, $groupName);
		if (empty($groupMemberships)) {
			throw new \Core\Rest\Exception('GROUPS_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
		}

        //group groupMemberships by group
        $groups = [];
        foreach ($groupMemberships as $groupMembership) {
            if (!isset($groups[$groupMembership['group_name']])) {
                $groups[$groupMembership['group_name']] = [];
            }

            $groups[$groupMembership['group_name']][] = $groupMembership['username'];
        }

        ob_start();
        setHttpStatusCode(200);
        $output = new \OutputWriter(strtoupper($outputFormat), false);

        $output->pushElement(self::COMPONENT_NAME);
        $output->pushArray('group');
        foreach ($groups as $gn => $users) {
            if (!empty($username) && !in_array($username, $users)) {
                continue;
            }

            $output->pushArrayElement();

            $output->element('group_name', $gn);
            $output->pushElement('usernames');
            $output->pushArray('username');
            foreach ($users as $username) {
                $output->arrayElement($username);
            }
            $output->popArray();
            $output->popElement();

            $output->popArrayElement();
        }
        $output->popArray();
        $output->popElement();
        $output->close();
	}
	
	
	/**
	 * \par Description:
	 * Used for updating a group.
	 *
	 * \par Security:
	 * Only an admin user can update a group record
	 * On changing this webuser-type device_users that belong to this user will be updated on Central Server
	 *
	 * \par HTTP Method: PUT
	 * http://localhost/api/2.1/rest/groups/{group_name}/{username}
	 *
	 * \par Parameters: 
	 * \param username			String  - required
	 * \param group_name		String  - required 
	 * \param format				String  - optional (deafult is xml)
	 *
	 * \par Parameter Details:
	 *
	 * - username for which the record is to be created. Usernames in the system are stored in lower case, the request
	 *   parameter will be automatically cast to lower case. Both username and group_name expected to exist in the system
	 *
	 * - group_name for which the record is to be created. Group names in the system are stored in lower case, the request
	 *   parameter will be automatically cast to lower case. Both username and group_name expected to exist in the system
	 *   
	 *   when a user is added to the administrators group, one is automatically added for the cloudholder group for the same user.
	 *   when an attempt is made to add an existing user to a group, success is retured and nothing changes.
	 *
	 * \par Parameter Usage Examples:
	 * http://192.168.1.108/api/2.6/rest/groups/cloudholders/spouse
	 *
	 * \par Return values:
	 * \retval status String - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On success for getting group list
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
	 * \par Error Codes:
	 * - 57 - USER_NOT_AUTHORIZED - User not authorized
	 * - 90 - USER_NOT_FOUND
	 * - 307 - MISSING_PARAMETER
	 * - 139 - GROUP_NOT_FOUND
	 *
	 * \par XML Response Example:
	 * \verbatim
<groups>
    <status>success</status>
</groups>
	 \endverbatim
	 */
	public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
		$userManager = UserManager::getInstance();
		$userSecurity = UserSecurity::getInstance();

		//input validation
		$username = $groupName = null;
		if (isset($urlPath[1])) {
			$username = trim(strtolower($urlPath[1]));
			if($username==""){
				throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
			}
			if (!$userManager->isValid($username)) {
				throw new \Core\Rest\Exception('USER_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
			}
		}else{
			throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
		}
		
		if(isset($urlPath[0])){
			$groupName = trim(strtolower($urlPath[0]));
			if($groupName==""){
				throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
			}
			if (!$userManager->isValidGroup($groupName)) {
				throw new \Core\Rest\Exception('GROUP_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
			}
		}else{
			throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
		}
		try {
			$groupMemberships = $userManager->getGroupMemberships($username, $groupName);
			if(!empty($groupMemberships)){
				foreach ($groupMemberships as $groupMembership) {
					if ($groups[$groupMembership['group_name']]==$groupName) {
						$this->generateSuccessOutput(200, static::COMPONENT_NAME, array('status' => 'success'), $outputFormat);
					}
				}
			}
			$userManager->createGroupMembership($username, $groupName);
		} catch ( \Exception $e ) {
			throw new \Core\Rest\Exception('GROUP_UPDATE_FAILED', 500, NULL, static::COMPONENT_NAME);
		}
		$deviceControl = DeviceControl::getInstance();
		if ($deviceControl->assureDeviceRegistration()) {
			$parametersToUpdate['user_type'] = $userSecurity->userTypeRemote($username);
			$deviceUserManager = DeviceUserManager::getManager();
			$deviceUserManager->updateUserParameters($username, $parametersToUpdate);
		}
		$this->generateSuccessOutput(200, static::COMPONENT_NAME, array('status' => 'success'), $outputFormat);
	}	
	
	/**
	 * \par Description:
	 * Used for deleting from a group
	 *
	 * \par Security:
	 * Only an admin user can delete from a group record
	 *
	 * \par HTTP Method: DELETE
	 * http://localhost/api/2.1/rest/groups/{group_name}/{username}
	 *
	 * \par Parameters:
	 * \param username			String  - required
	 * \param group_name		String  - required
	 * \param format				String  - optional (deafult is xml)
	 *
	 * \par Parameter Details:
	 *
	 * - username for which the record is to be deleted. Usernames in the system are stored in lower case, the request
	 *   parameter will be automatically cast to lower case. Both username and group_name expected to exist in the system
	 *
	 * - group_name for which the record is to be deleted. Group names in the system are stored in lower case, the request
	 *   parameter will be automatically cast to lower case. Both username and group_name expected to exist in the system
	 *
	 *   when a user is deleted from the administrators group, they remain in the cloudholders group.
	 *   when an attempt to delete a cloudholder user from the administratros group, an error is returned.
	 *   administrators or cloudholders status can not be removed for the original admin user
	 *   
	 *   when a user gets removed from cloudholder group the shares they have created that have target_path and  shares with with share_access_locked are deleted
     *   when a user that has created links is removed from cloudholder group the links are removed as well
	 *
	 * \par Parameter Usage Examples:
	 * http://192.168.1.108/api/2.6/rest/groups/cloudholders/spouse
	 *
	 * \par Return values:
	 * \retval status String - success
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On success for getting group list
	 * - 400 - Bad request, if parameter or request does not correspond to the api definition
	 * - 401 - User is not authorized
	 * - 403 - Request is forbidden
	 * - 404 - Requested resource not found
	 * - 500 - Internal server error
	 *
	 * \par Error Codes:
	 * - 57 - USER_NOT_AUTHORIZED - User not authorized
	 * - 90 - USER_NOT_FOUND
	 * - 307 - MISSING_PARAMETER
	 * - 139 - GROUP_NOT_FOUND
	 *
	 * \par XML Response Example:
	 * \verbatim
<groups>
    <status>success</status>
</groups>
	 \endverbatim
	 */
	public function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {
		$userManager = UserManager::getInstance();
		$userSecurity = UserSecurity::getInstance();
	
		//input validation
		$username = $groupName = null;
		if (isset($urlPath[1])) {
			$username = trim(strtolower($urlPath[1]));
			if($username==""){
				throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
			}
		}else{
			throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
		}
	
		if(isset($urlPath[0])){
			$groupName = trim(strtolower($urlPath[0]));
			if($groupName==""){
				throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
			}
		}else{
			throw new \Core\Rest\Exception('MISSING_PARAMETER', 400, NULL, static::COMPONENT_NAME);
		}
		
		$groupMemberships = $userManager->getGroupMemberships($username, $groupName);
		if (empty($groupMemberships)) {
			if (!$userManager->isValid($username)) {
				throw new \Core\Rest\Exception('USER_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
			}
			if (!$userManager->isValidGroup($groupName)) {
				throw new \Core\Rest\Exception('GROUP_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
			}
			throw new \Core\Rest\Exception('GROUPS_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
		}
		
		if($userSecurity->isDeviceOwner($username)){
			throw new \Core\Rest\Exception('ORIGINAL_ADMIN_DELETION_FORBIDDEN', 400, NULL, static::COMPONENT_NAME);
		}
		
		if($groupName=='cloudholders' &&	$userSecurity->isAdmin($username)){
			throw new \Core\Rest\Exception('GROUP_DELETION_FORBIDDEN', 400, NULL, static::COMPONENT_NAME);
		}
		
		try {
			$userManager->deleteGroupMembership($username, $groupName);
		} catch ( \Exception $e ) {
			throw new \Core\Rest\Exception('GROUP_DELETION_FAILED', 500, NULL, static::COMPONENT_NAME);
		}
		$deviceControl = DeviceControl::getInstance();
		if ($deviceControl->assureDeviceRegistration()) {
			$parametersToUpdate['user_type'] = $userSecurity->userTypeRemote($username);
			$deviceUserManager = DeviceUserManager::getManager();
			$deviceUserManager->updateUserParameters($username, $parametersToUpdate);
		}
		$this->generateSuccessOutput(200, static::COMPONENT_NAME, array('status' => 'success'), $outputFormat);
	}
}

<?php
/**
 * \file Shares/Controller/SharesAccessController.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
namespace Shares\Controller;

require_once implode(DS, [COMMON_ROOT, 'includes', 'security.inc']);

use Auth\User\UserManager;
use Shares\Model\Share\AccessLevel;

/**
 * \class SharesAccessController
 * \brief Create, retrieve, update, or delete a share access.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see Albums, Shares, Users
 */
class SharesAccessController /* extends AbstractRestfulController */ {

    use \Core\RestComponent;
    use SharesTraitController;

    const COMPONENT_NAME = 'share_access';

    /**
     * \par Description:
     * Delete the specified share access.
     *
     * \par Security:
     * - Only a Cloud Holder with write permission or an Admin can delete a share access.
     *   When share access of a cloudholder user that has RW permissions gets deleted, links they have created that 
     *   have targets in this share or are located in this share and shares they have created that have target_path are deleted
     *
     * \par HTTP Method: DELETE
     * http://localhost/api/@REST_API_VERSION/rest/share_access/{share_name}
     *
     * \param share_name String - required
     * \param username   String - required
     *
     * \par Parameter Details:
     *
     * \retval status String - success
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
     * - 41 - PARAMETER_MISSING - Missing or incorrect parameter.
     * - 90 - USER_NOT_FOUND - User does not exist.
     * - 75 - SHARE_NOT_FOUND - Share does not exist.
     * - [TBD] - USER_ACCESS_NOT_FOUND - User doesn't have permission to delete the share.
     * - 99 - SHARE_FUNCTION_FAILED - Internal server error.
     *
     * \par XML Response Example:
     * \verbatim
		<share_access>
			<status>success</status>
		</share_access>
      \endverbatim
     */
    public function delete($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $shareName = $this->_findShareName($urlPath, $queryParams, true);
        $username  = $queryParams['username'] ? : null;

        if (empty($username)) {
            throw new \Core\Rest\Exception('PARAMETER_MISSING', 400, null, self::COMPONENT_NAME);
        }
        
        // CHECK IF USER EXISTS
        $userManager = UserManager::getInstance();
        
        if (!$userManager->isValid($username)) {
            throw new \Core\Rest\Exception('USER_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }

        // CHECK IF SHARE EXISTS
        $sharesDao = new \Shares\Model\Share\SharesDao();
        if ( ($share = $sharesDao->get($shareName)) == false) {
            throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }

        // CHECK IF USER HAS ACCESS TO SHARE
     	if (!$sharesDao->isShareAccessible($shareName, true)) { 
            throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
        }

		// CHECK IF ACCESS EXISTS
		$acl = $sharesDao->getAccessToShare($shareName, $username);
		if (empty($acl) || $acl->getAccess() == AccessLevel::NOT_AUTHORIZED) {
			throw new \Core\Rest\Exception('NO_SHARE_ACCESS', 404, null, self::COMPONENT_NAME);
		}

		// CHECK IF SHARE_ACCESS_LOCKED
		if($share->getShareAccessLocked()){
			throw new \Core\Rest\Exception('SHARE_ACCESS_LOCKED_ACCESS_CHANGES_FORBIDDEN', 403, null, self::COMPONENT_NAME);
		}

        try {
        	$sharesDao->deleteAccessToShare($shareName, $username);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('SHARE_FUNCTION_FAILED', 500, $e, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, 'share_access', ['status' => 'success'], $outputFormat);
    }

    /**
     * \par Description:
     * Retrieve the specified share access.
     *
     * \par Security:
     * - User must be authenticated and have RO or RW permission to the share.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/share_access/{share_name}
     *
     * \param share_name String - required
     * \param username   String - optional
     *
     * \par Parameter Details:
     *
     * \retval status String - success
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
     * - 90 - USER_NOT_FOUND - User not found.
     * - 57 - USER_NOT_AUTHORIZED - User not authorized.
     * - 69 - NO_SHARE_ACCESS - request not supported.
     *
     * \par XML Response Example:
     * \verbatim
		<share_access_list>
			<share_name>Public</share_name>
			<share_access>
				<user_id>Admin</user_id>
				<username>admin</username>
				<access>RW</access>
			</share_access>
		</share_access_list>
      \endverbatim
     */
    public function get($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $shareName = $this->_findShareName($urlPath, $queryParams, true);
        $username  = isset($queryParams['username']) ? $queryParams['username'] : null;

        $sharesDao = new \Shares\Model\Share\SharesDao();

        // CHECK IF USER EXISTS
        $userManager = UserManager::getInstance();
        
        if (!empty($username) && !$userManager->isValid($username)) {
            throw new \Core\Rest\Exception('USER_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }

        if ( ($share = $sharesDao->get($shareName)) == null) {
            throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }

        if (!$sharesDao->isShareAccessible($shareName, false)) {
            throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
        }

        $acl = $sharesDao->getAccessToShare($share->getName(), $username);
        if (empty($acl)) {
            throw new \Core\Rest\Exception('NO_SHARE_ACCESS', 404, null, self::COMPONENT_NAME);
        }
        if (!empty($username)) {
			//convert single Access object to array        	
        	$acl = array($acl);
        }
        $allNa = true;
        foreach ($acl as $access) {
            if ($access->getAccess() != AccessLevel::NOT_AUTHORIZED) {
                $allNa = false;
                break;
            }
        }
        if ($allNa) {
            throw new \Core\Rest\Exception('NO_SHARE_ACCESS', 404, null, self::COMPONENT_NAME);
        }
        
        require_once(COMMON_ROOT . '/includes/outputwriter.inc');
        
        $output = new \OutputWriter(strtoupper($outputFormat));
        
        $output->pushElement('share_access_list');
        $output->element('share_name', $shareName);
        $output->pushArray("share_access");

        foreach ($acl as $access) {
            if ($access->getAccess() == AccessLevel::NOT_AUTHORIZED) {
                continue;
            }
            $access = $access->toArray();
            
            $output->pushArrayElement();
            $output->element('username', $access['username']);
            $output->element('user_id', $access['username']);
            $output->element('access', $access['access_level']);
            $output->popArrayElement();
        }
        
        $output->popArray();
        $output->popElement();
        $output->close();
    }

    /**
     * \par Description:
     * Create a new  share access.
     *
     * \par Security:
     * - Only a Cloud Holder with write permission or an Admin can create a new share access.
     *
     * \par HTTP Method: POST
     * http://localhost/api/@REST_API_VERSION/rest/share_access/{share_name}
     *
     * \par HTTP POST Body - required if not using username/access parameters, and should not be given when using username/access parameters.
     * - Content-Type header needs to be application/json when using a body.
     * - Only the last of duplicate usernames in the share_access array will be used.
     * - Body should be a JSON object similar to:
     * \code
{
    "share_access": [
        {"username": "joe", "access": "ro"},
        {"username": "bob", "access": "rw"}
    ]
}
    \endcode
     *
     * \param share_name String - required
     * \param username   String - required if not using a json body, and should not be given when using a json body.
     * \param access     String - required if not using a json body, and should not be given when using a json body.
     *
     * \par Parameter Details:
     *  - access can only be one of: ro, rw
     *  - RO: Read Only; RW: Read and Write
     *
     * \retval status String - success
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
     * - 75 - SHARE_NOT_FOUND - Share not found.
     * - 41 - PARAMETER_MISSING - Missing parameter.
     * - 90 - USER_NOT_FOUND - User not found.
     * - 106 - SHARE_ACCESS_EXISTS - Share access record already exists.
     * - 99 - SHARE_FUNCTION_FAILED - Internal server error.
	 * - 2404 - SHARE_ACCESS_LOCKED_ACCESS_CHANGES_FORBIDDEN - Share access locked. Access modifications not allowed
     *
     * \par XML Response Example:
     * \verbatim
		<share_access>
			<status>success</status>
		</share_access>
      \endverbatim
     */
    public function post($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $shareName = $this->_findShareName($urlPath, $queryParams, true);
		$sharesDao = new \Shares\Model\Share\SharesDao();
        $share = $sharesDao->get($shareName);
        if (!$share) {
            throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }

        $shareName = $share->getName();

        if ($share->getPublicAccess()) {
            throw new \Core\Rest\Exception('Share has public access', 403, null, self::COMPONENT_NAME);
        }

        if (!$sharesDao->isShareAccessible($shareName, true)) {
        	throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
        }

        // CHECK IF SHARE_ACCESS_LOCKED
		if($share->getShareAccessLocked()){
			throw new \Core\Rest\Exception('SHARE_ACCESS_LOCKED_ACCESS_CHANGES_FORBIDDEN', 403, null, self::COMPONENT_NAME);
		}

        $shareAccessesToCheck = [];
        //ignoring any parameters on content-type for json since the spec doesn't define any and yet browsers (firefox) send it.
        if (isset($_SERVER['CONTENT_TYPE']) && trim(explode(';', $_SERVER['CONTENT_TYPE'], 2)[0]) === 'application/json') {
            $body = json_decode(file_get_contents("php://input"), true);
            if (!isset($body['share_access'])) {
                throw new \Core\Rest\Exception('PARAMETER_MISSING', 400, NULL, self::COMPONENT_NAME);
            }

            if (!is_array($body['share_access'])) {
                throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, self::COMPONENT_NAME);
            }

            $shareAccessesToCheck = $body['share_access'];
        } else {
            $shareAccessesToCheck[] = $queryParams;
        }

        $checkedShareAccesses = [];
        foreach ($shareAccessesToCheck as $shareAccess) {
            // CHECK IF PARAMETER MISSING
            if (!isset($shareAccess['username']) || !isset($shareAccess['access'])) {
                throw new \Core\Rest\Exception('PARAMETER_MISSING', 400, null, self::COMPONENT_NAME);
            }

            if (!is_string($shareAccess['username']) || !is_string($shareAccess['access'])) {
                throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
            }

            $shareAccess['username'] = strtolower($shareAccess['username']);
            $shareAccess['access'] = strtoupper($shareAccess['access']);

            if (!isset(\Shares\Model\Share\Access::$accessLabels[$shareAccess['access']])) {
                throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
            }

            // CHECK IF USER EXISTS
            if (!UserManager::getInstance()->isValid($shareAccess['username'])) {
                throw new \Core\Rest\Exception('USER_NOT_FOUND', 404, null, self::COMPONENT_NAME);
            }

            //CHECK IF SHARE_ACCESS_EXISTS
            $existingShareAccess = $sharesDao->getAccessToShare($shareName, $shareAccess['username']);
            if ($existingShareAccess != null && $existingShareAccess->getAccess() != AccessLevel::NOT_AUTHORIZED) {
                throw new \Core\Rest\Exception('SHARE_ACCESS_EXISTS', 404, null, self::COMPONENT_NAME);
            }

            $checkedShareAccesses[$shareAccess['username']] = $shareAccess['access'];
        }

        $addResult = null;
        try {
            $addResult = $sharesDao->addAccessesToShare($share, $checkedShareAccesses);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('SHARE_FUNCTION_FAILED', 500, $e, self::COMPONENT_NAME);
        }

        if (!$addResult) {
            throw new \Core\Rest\Exception('SHARE_FUNCTION_FAILED', 500, null, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(201, 'share_access', ['status' => 'success'], $outputFormat);
    }

    /**
     * \par Description:
     * Update an existing share access.
     *
     * \par Security:
     * - Only a Cloud Holder with write permission or an Admin can update a share access.
     *   when a cloudholder user that has RW permissions to a share gets modified to have RO or NA permissions, links they have created that 
     *   have targets in this share or are located in this share and shares they have created that have target_path are deleted
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/share_access/{share_name}
     *
     * \param share_name String - required
     * \param username   String - required
     * \param access     String - required
     *
     * \par Parameter Details:
     *
     * \retval status String - success
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
     * - 75 - SHARE_NOT_FOUND - Share not found.
     * - 41 - PARAMETER_MISSING - Missing parameter.
     * - 99 - SHARE_FUNCTION_FAILED - Internal server error.
	 * - 2404 - SHARE_ACCESS_LOCKED_ACCESS_CHANGES_FORBIDDEN - Share access locked. Access modifications not allowed
     *
     * \par XML Response Example:
     * \verbatim
		<shares>
			<status>success</status>
		</shares>
      \endverbatim
     */
    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $shareName = $this->_findShareName($urlPath, $queryParams, true);
        $sharesDao = new \Shares\Model\Share\SharesDao();
        if ( ($share = $sharesDao->get($shareName)) == false) {
            throw new \Core\Rest\Exception('SHARE_NOT_FOUND', 404, null, self::COMPONENT_NAME);
        }

        $params = filter_var_array($queryParams, ['username' => \FILTER_SANITIZE_STRING,
            'access' =>  ['filter' => \FILTER_CALLBACK,
                'options' => function ( $string ) {
                    $string = strtoupper($string);
                    if (!in_array($string, array_keys(\Shares\Model\Share\Access::$accessLabels))) {
                        throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, null, self::COMPONENT_NAME);
                    }
                    return $string;
                }]
            ]);

        // CHECK IF PARAMETER MISSING
        if (empty($params['username']) || empty($params['access'])) {
            throw new \Core\Rest\Exception('PARAMETER_MISSING', 400, null, self::COMPONENT_NAME);
        }

		// CHECK IF SHARE IS ACCESSIBLE
        if (!$sharesDao->isShareAccessible($shareName, true)) { 
        	throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, self::COMPONENT_NAME);
        }

		// CHECK IF SHARE ACCESS EXISTS FOR THE GIVEN USER
        $existingAccess = $sharesDao->getAccessToShare($shareName, strtolower($params['username']));
		if ($existingAccess == null || $existingAccess->getAccess() == AccessLevel::NOT_AUTHORIZED) {
			throw new \Core\Rest\Exception('SHARE_ACCESS_NOT_FOUND', 404, null, self::COMPONENT_NAME);
		}

		// CHECK IF SHARE_ACCESS_LOCKED
		if($share->getShareAccessLocked()){
			throw new \Core\Rest\Exception('SHARE_ACCESS_LOCKED_ACCESS_CHANGES_FORBIDDEN', 403, null, self::COMPONENT_NAME);
		}

        try {
            $sharesDao->setAccessToShare($shareName, $params['username'], $params['access']);
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception('SHARE_FUNCTION_FAILED', 500, $e, self::COMPONENT_NAME);
        } 
        $this->generateSuccessOutput(200, 'share_access', ['status' => 'success'], $outputFormat);
    }

}

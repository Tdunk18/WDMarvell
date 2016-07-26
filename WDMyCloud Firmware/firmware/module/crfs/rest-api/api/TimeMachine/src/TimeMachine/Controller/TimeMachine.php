<?php
namespace TimeMachine\Controller;
/**
 * \file timemachine/TimeMachine.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 *
 *
 */

use Core\Logger;

define("RETURN_CODE_SUCCESS", 0);
define("RETURN_CODE_SHARE_DOES_NOT_EXIST", 2);
define("RETURN_CODE_UNABLE_TO_CREATE_TIME_MACHINE_DIRECTORY", 3);
define("RETURN_CODE_UNABLE_TO_CONFIGURE_TIME_MACHINE_DIRECTORY", 4);

/**
 * \class TimeMachine
 * \brief Retrieve or set configuration for Apple's Time Machine.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated.
 */
class TimeMachine {
	use \Core\RestComponent;

	const COMPONENT = 'time_machine';

	/**
	 * \par Description:
	 *  Retrieve Time Machine configuration.  It will indicate if the user has
	 *  enabled Time Machine backups through the NAS, the name of the backup
	 *  share, and a limit (if any) to the amount of space Time Machine can use
	 *  on the backup share.  If the size limit is set to zero, then there is
	 *  no limit and the entire size of the share may be used by Time Machine.
	 *  It is possible for Time Machine backups to be enabled before the backup
	 *  share name is specified.  In this state, Time Machine backups are not
	 *  yet possible.
	 *
	 * \par Security:
	 * - No authentication required for LAN.
	 *
	 * \par HTTP Method: GET
	 * http://localhost/api/@REST_API_VERSION/rest/time_machine
	 *
	 * \param format String - optional (default is xml)
	 *
	 * \par Parameter Details:
	 * - format: refer main page for details
	 *
	 * \retval backup_enabled    Boolean  - backup enabled or not
	 * \retval backup_share      String   - share name
	 * \retval backup_size_limit Integer  - size in Bytes
	 * \retval error_code        Integer  - error number
	 * \retval error_message     String   - description of error
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful retrieval of time machine configuration
     * - 500 - Internal server error
	 *
	 * \par Response Error Codes:
	 * -208 - INTERNAL_ERROR - Internal error
	 *
	 * \par Successful XML Response Example:
	 * \verbatim
	 <time_machine>
	 <backup_enabled>true</backup_enabled>
	 <backup_share>Cruzer</backup_share>
	 <backup_size_limit>0</backup_size_limit>
	 </time_machine>
	 \endverbatim
	 *
	 * \par Unsuccessful XML Response Example:
	 * \verbatim
	 <time_machine>
	 <error_code>500</error_code>
	 <error_id>200</error_id>
	 <error_message>Internal error</error_message>
	 </time_machine>
	 \endverbatim
	 */
	public function get($urlPath, $queryParams=null, $outputFormat='xml'){
		$output=array();
		$returnCode=null;
		exec_runtime("sudo /usr/local/sbin/getTimeMachineConfig.sh", $output, $returnCode);

		if($returnCode == RETURN_CODE_SUCCESS) {
			unset($config);
			$config = array();
			foreach ($output as $line) {
				$pair = explode('=', $line);
				if (strcmp($pair[0], "backupEnabled") == 0) {
					$config['backup_enabled'] = $pair[1];
				}
				elseif (strcmp($pair[0], "backupShare") == 0) {
					$config['backup_share'] = $pair[1];
				}
				elseif (strcmp($pair[0], "backupSizeLimit") == 0) {
					$config['backup_size_limit'] = $pair[1];
				}
			}
			if (isset($config['backup_enabled']) && isset($config['backup_share']) && isset($config['backup_size_limit'])) {
				$this->generateSuccessOutput(200, self::COMPONENT, $config, $outputFormat);
				return;
			}
		}
		$this->generateErrorOutput(500, self::COMPONENT, 'INTERNAL_ERROR', $outputFormat);
	}

	/**
	 * \par Description:
	 *  Set Time Machine configuration. The parameters allow the user to enable
	 *  or disable Time Machine backups through the NAS, specify the name of the
	 *  backup share, and to limit the amount of space Time Machine can use on
	 *  the specified backup share.
	 *
	 * \par Security:
	 * - User authentication required.
	 *
	 * \par HTTP Method: PUT
	 * http://localhost/api/@REST_API_VERSION/rest/time_machine
	 *
	 * \param backup_enabled    Boolean  - optional
	 * \param backup_share      String   - optional (Cannot be a empty string)
	 * \param backup_size_limit Integer  - optional (Size in Bytes)
	 * \param format            String   - optional (default is xml)
	 *
	 * \par Parameter Details:
	 *  Each parameter can be set without the other parameters specified.  To
	 *  allow flexibility for the client, it is possible to enable Time Machine
	 *  backups through the NAS before specifying the name of the backup share;
	 *  However, Time Machine backups through the NAS will not be possible until
	 *  a share name is given.  If there is to be no size limit for the backup,
	 *  then the value for the limit must be set to zero.  When a new backup
	 *  share is specified, it must be present and writable for the request to
	 *  succeed.  A TimeMachine directory will be created on the share, which
	 *  will be the backup location specified to Time Machine.  The default value
	 *  for the format parameter is xml.
	 *
	 * \retval status        String  - success
	 * \retval error_code    Integer - HTTP error code
	 * \retval error_id      Integer - error number
	 * \retval error_message String  - description of error
	 *
	 * \par HTTP Response Codes:
	 * - 200 - On successful change of time machine configuration
	 * - 400 - Bad request, or Invalid backup size limit parameter value or backup enabled parameter value
     * - 401 - User is not authorized
     * - 403 - Forbidden request
     * - 404 - Requested resource not found
     * - 500 - Internal server error
	 *
	 * \par Response Error Codes:
	 * - 202 - TM_ERROR_INVALID_BACKUP_ENABLED_VALUE - Invalid backup enabled parameter value
	 * - 203 - TM_ERROR_INVALID_BACKUP_SIZE_LIMIT_VALUE - Invalid backup size limit parameter value
	 * - 206 - TM_ERROR_BACKUP_SHARE_DOES_NOT_EXIST - Backup share does not exist
	 * - 204 - TM_ERROR_UNABLE_TO_CREATE_TIME_MACHINE_DIRECTORY - Unable to create Time Machine directory
	 * - 205 - TM_ERROR_UNABLE_TO_CONFIGURE_TIME_MACHINE_DIRECTORY - Unable to configure Time Machine directory
	 *
	 * \par Successful XML Response Example:
	 * \verbatim
	 <time_machine>
	 <status>success</status>
	 </time_machine>
	 \endverbatim
	 *
	 * \par Unsuccessful XML Response Example:
	 * \verbatim
	 <time_machine>
	 <error_code>404</error_code>
	 <error_id>199</error_id>
	 <error_message>Backup share does not exist</error_message>
	 </time_machine>
	 \endverbatim
	 */

	public function put($urlPath, $queryParams=null, $outputFormat='xml') {

		// Since parameters can be in the body or in the URL, favor any parameters in the body by
		// moving them to the parameters taken from the URL.  If they are in both places, the ones
		// from the body will overwrite the ones in the URL.

		if((isset($queryParams['backup_enabled']) && (strcmp($queryParams['backup_enabled'], "") == 0)) ||
		   (isset($queryParams['backup_share']) && (strcmp($queryParams['backup_share'], "") == 0)) ||
		   isset($queryParams['backup_size_limit']) && (strcmp($queryParams['backup_size_limit'], "") == 0) ||
		   (!(isset($queryParams["backup_enabled"]) || isset($queryParams["backup_share"]) || isset($queryParams["backup_size_limit"])))){

			$this->generateErrorOutput(400, self::COMPONENT, 'TM_ERROR_BAD_REQUEST', $outputFormat);
			return;
		}

		$backupEnabled = isset($queryParams['backup_enabled']) && (strcmp($queryParams['backup_enabled'], "") != 0) ? strtolower(trim($queryParams['backup_enabled'])) : null;
		$backupShare = isset($queryParams['backup_share']) && (strcmp($queryParams['backup_share'], "") != 0) ? trim($queryParams['backup_share']) : null;
		$backupSizeLimit = isset($queryParams['backup_size_limit']) && (strcmp($queryParams['backup_size_limit'], "") != 0) ? trim($queryParams['backup_size_limit']) : null;

		Logger::getInstance()->info(__FUNCTION__ . ", PARAMS: (backupEnabled=$backupEnabled, backupShare=$backupShare, backupSizeLimit=$backupSizeLimit)");

		# If backup enable or backup size limit is specified, ensure their values are valid.
		if (($backupEnabled !== null) && (strcmp($backupEnabled, "true") != 0) && (strcmp($backupEnabled, "false") != 0)) {
			$this->generateErrorOutput(400, self::COMPONENT, 'TM_ERROR_INVALID_BACKUP_ENABLED_VALUE', $outputFormat);
			return;
		}

		if (($backupSizeLimit !== null) && (!is_numeric($backupSizeLimit))) {
			$this->generateErrorOutput(400, self::COMPONENT, 'TM_ERROR_INVALID_BACKUP_SIZE_LIMIT_VALUE', $outputFormat);
			return;
		}

		# Set the time machine configuration with the new parameters.

		$output=$returnCode=null;
		exec_runtime("sudo /usr/local/sbin/setTimeMachineConfig.sh '$backupEnabled' '$backupShare' '$backupSizeLimit' &> /dev/null", 
			$output, $returnCode, false);
		if ($returnCode == RETURN_CODE_SUCCESS) {
		$this->generateSuccessOutput(200, self::COMPONENT, array('status' => 'success'), $outputFormat);
		}
		elseif ($returnCode == RETURN_CODE_SHARE_DOES_NOT_EXIST) {
		$this->generateErrorOutput(404, self::COMPONENT, 'TM_ERROR_BACKUP_SHARE_DOES_NOT_EXIST', $outputFormat);
        }
				elseif ($returnCode == RETURN_CODE_UNABLE_TO_CREATE_TIME_MACHINE_DIRECTORY) {
				$this->generateErrorOutput(400, self::COMPONENT, 'TM_ERROR_UNABLE_TO_CREATE_TIME_MACHINE_DIRECTORY', $outputFormat);
				}
				elseif ($returnCode == RETURN_CODE_UNABLE_TO_CONFIGURE_TIME_MACHINE_DIRECTORY) {
				$this->generateErrorOutput(400, self::COMPONENT, 'TM_ERROR_UNABLE_TO_CONFIGURE_TIME_MACHINE_DIRECTORY', $outputFormat);
				}
				else {
						$this->generateErrorOutput(500, self::COMPONENT, 'INTERNAL_ERROR', $outputFormat);
				}
		}
}
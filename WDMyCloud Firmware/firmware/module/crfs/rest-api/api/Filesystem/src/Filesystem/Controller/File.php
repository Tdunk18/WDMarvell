<?php
/**
 * \file    filesystem/file.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Filesystem\Controller;
use Jobs;
use \Auth\User\UserSecurity;

require_once(FILESYSTEM_ROOT . '/includes/contents.inc');
require_once(FILESYSTEM_ROOT . '/includes/dir.inc');
require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/util.inc');
require_once(COMMON_ROOT . '/includes/constants.inc');
require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');
require_once FILESYSTEM_ROOT . '/includes/fileputworker.inc';
require_once COMMON_ROOT . '/includes/security.inc';
setlocale(LC_ALL, 'en_US.utf8');

/**
 * \class File
 * \brief Retrieve file information, rename, move, or delete a file.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User must be authenticated to use this component.
 *
 * \see Dir, FileContents, MetaDBInfo
 */
class File /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'file';

    public function __construct()
    {
        clearstatcache();
    }

    /**
     * \par Description:
     * This DELETE request is used delete a file under specified share.
     *
     * \par Security:
     * - User must be authenticated.
     *
     * \par HTTP Method: DELETE
     * - http://localhost/api/@REST_API_VERSION/rest/file/{share_name}/{file_path}
     *
     * \param share_name String  - required
     * \param file_path  String  - required
     * \param format     String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - share_name - the name of the share.
     * - file_path - the file to be deleted.
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
     * - 26 - FILE_NOT_FOUND - File not found
     * - 43 - PATH_NOT_FILE - Path is not a file
     * - 47 - SHARE_NAME_MISSING - Share name is missing
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 92 - FILE_PATH_MISSING - File path missing
     *
     * \par XML Response Example:
     * \verbatim
      <file>
      <status>success</status>
      </file>
      \endverbatim
     */
    function delete($urlPath, $queryParams = null, $outputFormat = 'xml')
    {
        $sharePath = $this->_getSharePathFromUrlPath($urlPath, TRUE, TRUE, TRUE, TRUE);
        $filePath  = $sharePath->getRelativePath();

        if ($filePath == '')
        {
            throw new \Core\Rest\Exception('FILE_PATH_MISSING', 400, NULL, static::COMPONENT_NAME);
        }

        if (!$sharePath->exists())
        {
            throw new \Core\Rest\Exception('FILE_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
        }

        if (!$sharePath->isFile() || $sharePath->isLink())
        {
            throw new \Core\Rest\Exception('PATH_NOT_FILE', 400, NULL, static::COMPONENT_NAME);
        }

        if (!isPathLegal($filePath))
        {
            throw new \Core\Rest\Exception('INVALID_PATH', 404, NULL, static::COMPONENT_NAME);
        }

        // if not  testing, then delete the file
        if ('testing' != $_SERVER['APPLICATION_ENV'])
        {
            try
            {
                $sharePath->delete();
            }
            catch (\Filesystem\Model\SharePathException $spe)
            {
                throw new \Core\Rest\Exception($spe->getMessage(), $spe->getCode(), $spe, $outputFormat);
            }
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, ['status' => 'success'], $outputFormat);
    }

    /**
     * \par Description:
     * This GET request returns attributes of specified file.
     *
     * \par Security:
     * - User must be authenticated.
     * - HMAC may be used as an alternative method of authentication.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/file/{share_name}/{file_path}
     *
     * \param share_name          String  - required
     * \param file_path           String  - required
     * \param include_permissions String  - optional (default is false)
     * \param format              String  - optional (default is xml)
     * \param show_is_linked      Boolean - optional (default is false)
     *
     * \par Parameter Details:
     * - share_name - the name of the share.
     * - file_path - the file to get attribute information on.
     * - show_is_linked - True to include a field in the response called is_linked which contains a boolean.
     *                    The boolean is true if this file is the target of a link, and false otherwise.
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
     * - 26 - FILE_NOT_FOUND - File not found
     * - 47 - SHARE_NAME_MISSING - Share name is missing
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     *
     * \par XML Response Example:
     * \verbatim
      <file>
      <is_dir>false</is_dir>
      <size>79872</size>
      <path>/Public/Castle.jpg</path>
      <mtime>1283371267</mtime>
      <ctime>1283371267</ctime>
      </file>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml')
    {
        $skipAccessibleCheck = FALSE;
        if (isset($queryParams['hmac'])) {
            try {
                \Auth\Model\Hmac::validatePacket($queryParams['hmac'], implode(DS, $urlPath));
            } catch (\Exception $e) {
                throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, NULL, static::COMPONENT_NAME);
            }

            $skipAccessibleCheck = TRUE;
        }

        $sharePath = $this->_getSharePathFromUrlPath($urlPath, FALSE, FALSE, TRUE, TRUE, $skipAccessibleCheck);

        if (!$sharePath->exists())
        {
            throw new \Core\Rest\Exception('FILE_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
        }

        $incPerms   = isset($queryParams['include_permissions']) ? trim($queryParams['include_permissions']) : FALSE;
        $showIsLinked = isset($queryParams['show_is_linked']) ? trim($queryParams['show_is_linked']) : FALSE;

        $attributes = getAttributes(
            $sharePath->getAbsolutePath(),
            DS . implode(DS, $urlPath),
            NULL,
            in_array($incPerms, ['true', '1', 1]),
            NULL,
            NULL,
            in_array($showIsLinked, ['true', '1', 1])
        );

        $this->generateItemOutputWithType(200, static::COMPONENT_NAME, $attributes, $outputFormat);
    }

    /**
     * \par Description:
     * This PUT request is used copy, move, rename, or change mtime of the specified file.
     * \verbatim
       When 'copy' param is enabled, users can now copy files between NAS
       device and third party cloud storage services like Dropbox. Please read
       the below sections to fully understand the usage.
       	File descriptor :
       	  Users need to use file descriptors to differentiate
          between NAS, Dropbox and other cloud storage device files. This string starts
          with @ symbol. By default if there is no @ then it assumes the file is
          from local NAS device.
       	Source and Destination Files :
          The source file is part of the URL request path.
          The destination file is a request param called 'dest_path'.
          Use of 'new_path' as a destination file is not supported with
          file descriptor(starting with @) in the front.
       	Ex. @DROPBOX/dropbox/Photos/passport.jpeg
            @LOCAL/Public/photos/passport.jpeg
       	Source and Destination param :
          The source and destination file specific parameters are abreviated
          using 'source_' and	'dest_' strings in parameter keys.
          Ex. source_XXXXX, dest_XXXXX
        Dropbox request params :
          Following are minimum set of required parameters for
          either source or destination files.
            a. xxxx_oauth_consumer_key
            b. xxxx_oauth_token
            c. xxxx_oauth_signature_method
            d. xxxx_oauth_signature
            Where xxxx are either 'source' or 'dest'.
        Usage :
        http://<device-host-name>/api/@REST_API_VERSION/rest/file/@DROPBOX/dropbox/Photos/sample.gif?dest_path=/FLASHBLU/sampletest.gif&rest_method=put&copy=true&source_oauth_consumer_key=58cwr61j0wu2ob8&source_oauth_token=4dgcnyf68k3cm5i&source_oauth_consumer_secret=bh1ca1jcgfdmzeu&source_oauth_token_secret=pghuibbizhgs9nk&auth_username=admin&auth_password=&overwrite=true
        http://<device-host-name>/api/@REST_API_VERSION/rest/file/FLASHBLU/test2.gif?dest_path=@DROPBOX/dropbox/Photos/test1.gif&rest_method=put&copy=true&dest_oauth_consumer_key=58cwr61j0wu2ob8&dest_oauth_token=4dgcnyf68k3cm5i&dest_oauth_consumer_secret=bh1ca1jcgfdmzeu&dest_oauth_token_secret=pghuibbizhgs9nk&auth_username=admin&auth_password=&overwrite=true
       \endverbatim
     * Note: As of now only Dropbox is supported.
     *
     * \par Security:
     * - User must be authenticated.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/file/{share_name}/{file_path}
     *
     * \param share_name    String  - required
     * \param file_path     String  - required
     * \param new_path      String  - optional (Deprecated. Please use dest_path. This is supported only for local NAS files.)
     * \param dest_path     String  - optional, only required for copy or move or rename
     * \param copy          Boolean - optional (default is false)
     * \param overwrite     Boolean - optional (default is false)
     * \param mtime         Integer - optional
     * \param format        String  - optional (default is xml)
     * \param async         Boolean - optional (default is false. Only required if request to be handled as an Async Job request)
     * \param async_comment String  - optional (default is emty. Only considered if asyn param set to true)
     *
     *
     * \par Parameter Details:
     * - share_name - the name of the share.
     * - file_path - the file to be copy, move, rename, or change mtime.
     * - new_path - Deprecated. Please use dest_path. This is a full path to be applied to the new file
     * - dest_path - this is a full path to be applied to the new file
     * 	  If  the path is to be created on a FAT32 formatted volume - the following characters are not permitted to be used: ':', '<', '>', '\\', '?', '*', '"
     *   '|' pipe character is not supported on any filesystem as a part of a path
     * - mtime - this is the modified time of the file, this is in unix timestamp
     * - copy - if set to true will copy the file to the destination path
     * - overwrite - if set to true will overwrite the destination path if it already exists
     * - async - if set to true, will treat the request as an asynchronous Job and return the Job Id in response
     * - async_comment - if set, will treat the comment as job description
     *
     * \par HTTP POST Body
     * - dest_path=/Public/new_castle.jpg
     * - copy=true
     * - overwrite=true
     * - mtime=1311187249
     *
     * * \par Error Codes:
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 223 - UNSUPPORTED_OPERATION - Unsupported Operation
     * - 45 - PATH_NOT_VALID - Path not valid
     * - 71 - INVALID_CHARACTER - Invalid character
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 202 - On async success (new job created)
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <file>
      <status>success</status>
      </file>
      \endverbatim
     * \par XML Response with mtime when mtime parameter is passed Example:
     * \verbatim
      <file>
      <status>success</status>
      <mtime>1331991830</mtime>
      </file>
      \endverbatim
     * \par XML Response with Job Id when async parameter is true Example:
     * \verbatim
      <file>
        <job_id>1</job_id>
        <status>success</status>
      </file>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        try {
            $filePutWorker = \FilePutWorker::getInstance();
            $filePutWorker->setupWorker($urlPath, $queryParams);
        	$filePutWorker->validate();
        	
        	//sanitize asynch comment
        	$queryParams['async_comment'] = filter_var($queryParams['async_comment'], FILTER_SANITIZE_STRING);

            if($queryParams['async'] == 'true') {
                // Job stuff here. Add this to Job queue so that Job Manager can work on it
                $job_manager = \Jobs\JobManager::getInstance();
                $job_manager->initManager($urlPath, $queryParams, 'put', $this::COMPONENT_NAME, "COPY");
                $username = UserSecurity::getInstance()->getSessionUsername();
                $deviceUserId = \RequestScope::getLoginContext()->getDeviceUserId();
                $jobid = $job_manager->create($queryParams['async_comment'], $username, $deviceUserId);

                if(isset($jobid) && $jobid > 0) {
                    $this->generateSuccessOutput(202, self::COMPONENT_NAME, array('job_id' => $jobid, 'status' => 'success'), $outputFormat);
                    if(!isset($queryParams['async_test']) || $queryParams['async_test']!=='skip_job_start') {
                        // async_test not a require param but only used during testing to skip job start trigger
                        \Jobs\Common\JobMonitor::triggerJobMonitor();
                    }
                }
                else {
                    $this->generateErrorOutput(500, self::COMPONENT_NAME, 'JOB_MANAGER_CREATE_ERROR', $outputFormat);
                }
            }
            else {
                $filePutWorker->execute();
                $this->generateSuccessOutput(200, 'file', $filePutWorker->results(), $outputFormat);
            }
        }
        catch (\Exception $e) {
			//var_dump($e);
        	throw new \Core\Rest\Exception($e->getMessage(), $e->getCode(), $e, static::COMPONENT_NAME);
        }
    }
}
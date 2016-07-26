<?php

namespace Filesystem\Controller;
use Jobs;
use Filesystem\Model;
use \Auth\User\UserSecurity;

/**
 * \file filesystem/Controller/dir.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(FILESYSTEM_ROOT . '/includes/dir.inc');
require_once FILESYSTEM_ROOT . '/includes/dirputworker.inc';
require_once implode(DS, [COMMON_ROOT, 'includes', 'security.inc']);

/**
 * \class Dir
 * \brief Provides services to create, retrieve, update, or delete
 * a directory under a specified share.
 *
 *  Format of Error XML Response:
 *  <?xml version="1.0" encoding="utf-8"?>
 *  <dir>
 *  <error_code>{error number}</error_code>
 *  <error_message>{description or error}</error_message>
 *  </dir>
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 * \see File, FileContents
 */
class Dir /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'dir';

    /**
     * \par Description:
     * This DELETE request is used delete a directory under the specified share,
     * the directory has to be empty unless the recursive param is set to true.
     *
     * \par Security:
     * - User must be authenticated.
     *
     * \par HTTP Method: DELETE
     * - http://localhost/api/@REST_API_VERSION/rest/dir/{share_name}/{dir_path}
     *
     * \param share_name String  - required
     * \param dir_path   String  - required
     * \param recursive  Boolean - optional (default is false)
     * \param format     String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - share_name - the name of the share.
     * - dir_path - the directory to be deleted.
     * - recursive - if set to true will delete the directory and all of its subdirectories and files.
     *   USE CAUTION WHEN USING THE RECURSIVE OPTION!
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful delete of a directory under the share name
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 18 - DIR_DELETE_FAILED - Failed to delete directory
     * - 19 - DIR_NAME_MISSING - Directory name is missing
     * - 22 - DIRECTORY_NOT_EMPTY - Directory not empty
     * - 42 - PATH_NOT_DIRECTORY - Path is not a directory
     * - 44 - PATH_NOT_FOUND - Path not found
     * - 45 - PATH_NOT_VALID - Path not valid
     * - 47 - SHARE_NAME_MISSING - Share name is missing
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 75 - SHARE_NOT_FOUND - Share name does not exists
     *
     * \par XML Response Example:
     * \verbatim
      <dir
      <status>success</status>
      </dir>
      \endverbatim
     */
    function delete($urlPath, $queryParams = null, $outputFormat = 'xml', $apiVersion = NULL)
    {
        $sharePath = $this->_getSharePathFromUrlPath($urlPath, TRUE, FALSE);
        $relPath   = $sharePath->getRelativePath();

        if ($relPath == '')
        {
            throw new \Core\Rest\Exception('DIR_NAME_MISSING', 400, NULL, static::COMPONENT_NAME);
        }

        if (!isPathLegal($relPath))
        {
            throw new \Core\Rest\Exception('PATH_NOT_VALID', 400, NULL, static::COMPONENT_NAME);
        }

        if (!$sharePath->isDir())
        {
            throw new \Core\Rest\Exception('PATH_NOT_DIRECTORY', 403, NULL, static::COMPONENT_NAME);
        }

        if (!$sharePath->exists())
        {
            throw new \Core\Rest\Exception('PATH_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
        }

        if ($sharePath->isLink())
        {
            throw new \Core\Rest\Exception('PATH_IS_LINK', 400, NULL, static::COMPONENT_NAME);
        }

        $recursive = isset($queryParams['recursive']) ? trim($queryParams['recursive']) : FALSE;
        $absPath   = $sharePath->getAbsolutePath();

        if (in_array($recursive, ['true', '1', 1]))
        {
            if (!(new Model\Dir())->rmdirRecursive($absPath))
            {
                throw new \Core\Rest\Exception('DIR_DELETE_FAILED', 500, NULL, static::COMPONENT_NAME);
            }
        }
        else
        {
            if (count(preg_grep('/^([^.])/', scandir($absPath))) > 0)
            {
                throw new \Core\Rest\Exception('DIRECTORY_NOT_EMPTY', 403, NULL, static::COMPONENT_NAME);
            }

            if (!@rmdir($absPath))
            {
                throw new \Core\Rest\Exception('DIR_DELETE_FAILED', 500, NULL, static::COMPONENT_NAME);
            }
        }

        $this->generateSuccessOutput(200, static::COMPONENT_NAME, ['status' => 'success'], $outputFormat);
    }

    /**
     * \par Description:
     * This GET request is used to get a directory listing for a specified share. if one of the parameter 'dirs' or 'files' is set to true then this API returns file list
     * or directory list. If it is set to false, then the ressponce will be invalid parameter.
     *
     * \par Security:
     * - User must be authenticated.
     * - HMAC may be used as an alternative method of authentication.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/dir/{share_name}
     *
     * \param share_name          String  - required
     * \param include_hidden      Boolean - optional (default is false)
     * \param include_permissions Boolean - optional (default is false)
     * \param include_dir_count  Boolean - optional (default is false)
     * \param single_dir          Boolean - optional (default is false)
     * \param format              String  - optional (default is xml)
     * \param files                 String  - Optional
     * \param dirs                    String  - Optional
     * \param show_is_linked Boolean - optional (default is false)
     *
     * \par Parameter Details:
     * - share_name - the name of the share
     * - include_hidden - if include_hidden is set to true then the return list will include hidden files and directories
     * - include_permissions - if include_permissions is set to true then the return list will include the permissions of the files and directories
     * - single_dir - if single_dir is set to true then the return list will only contain a single entry for the given share, without files/dirs within the share.
     * - dirs - if dirs is set to true then dir list is returned
     * - files - if files is set to true then file list is returned
     * - include_dir_count - include_dir_count - include the count of sub-directories. Do not include hidden directories unless "include_hidden" parameter is also passed. Only include the sub-directories, not files and not the children of sub-directories.
     * - show_is_linked - True to include a field in each entry in the response called is_linked which contains a boolean.
     *                    The boolean is true if its entry is the target of a link, and false otherwise.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success returns list of files and directories under the specified directory
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 42 - PATH_NOT_DIRECTORY - Path is not a directory
     * - 44 - PATH_NOT_FOUND - Path not found
     * - 45 - PATH_NOT_VALID - Path not valid
     * - 47 - SHARE_NAME_MISSING - Share name is missing
     * - 75 - SHARE_NOT_FOUND - Share not found
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 33 - INVALID_PARAMETER - if any of these prameters'dirs' or 'files' are set to false
     *
     * \par XML Response Example:
     * \verbatim
      <dir>
      <entry>
      <is_dir>true</is_dir>
      <path>/Public/Shared Pictures</path>
      <name>Vacation</name>
      <mtime>1303151712</mtime>
      <ctime>1303151714</ctime>
      </entry>
      </dir>
      <dir>
      <entry>
      <is_dir>false</is_dir>
      <size>3058869</size>
      <path>/Public/Shared Pictures</path>
      <name>Castle.jpg</name>
      <mtime>1303151712</mtime>
      <ctime>1303151714</ctime>
      </entry>
      </dir>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml', $apiVersion = NULL)
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

        $sharePath = $this->_getSharePathFromUrlPath($urlPath, FALSE, FALSE, FALSE, FALSE, $skipAccessibleCheck);

        if (!isPathLegal($sharePath->getRelativePath()))
        {
            throw new \Core\Rest\Exception('PATH_NOT_VALID', 400, NULL, static::COMPONENT_NAME);
        }

        if (!$sharePath->exists())
        {
            throw new \Core\Rest\Exception('PATH_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
        }

        if (!$sharePath->isDir())
        {
            throw new \Core\Rest\Exception('PATH_NOT_DIRECTORY', 400, NULL, static::COMPONENT_NAME);
        }

        $includeHidden      = isset($queryParams['include_hidden']) ? trim($queryParams['include_hidden']) : FALSE;
        $includePermissions = isset($queryParams['include_permissions']) ? trim($queryParams['include_permissions']) : FALSE;
        $singleDir          = isset($queryParams['single_dir']) ? trim($queryParams['single_dir']) : FALSE;
        $dirOnly            = isset($queryParams['dirs']) ? $this->_isParamTrue($queryParams['dirs']) : FALSE;
        $fileOnly           = isset($queryParams['files']) ? $this->_isParamTrue($queryParams['files']) : FALSE;
        $includeDirCount    = isset($queryParams['include_dir_count']) ? $this->_isParamTrue($queryParams['include_dir_count']) : FALSE;
        $showIsLinked       = isset($queryParams['show_is_linked']) ? $this->_isParamTrue($queryParams['show_is_linked']) : FALSE;
        $trueArray          = ['true', '1', 1];
        $includeHidden      = in_array($includeHidden, $trueArray);
        $includePermissions = in_array($includePermissions, $trueArray);
        $singleDir          = in_array($singleDir, $trueArray);
        $showIsLinked       = in_array($showIsLinked, $trueArray);

        set_time_limit(0);

        (new Model\Dir())->generateDirList($outputFormat, $sharePath->getAbsolutePath(), DS . implode(DS, $urlPath),
                                           $includeHidden, $includePermissions, $dirOnly, $fileOnly, $singleDir,
                                           $includeDirCount, $showIsLinked);

        set_time_limit(ini_get('max_execution_time'));
    }

    /**
     * \par Description:
     * This POST request is used create a directory under a specified share.
     *
     * \par Security:
     * - User must be authenticated.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/dir/{share_name}/{dir_path}
     *
     * \param share_name String  - required
     * \param dir_path   String  - required
     * \param format     String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - share_name - the name of the share.
     * - dir_path - the directory to be created. This supports creating nested recursive directories.
     *   If  the path is to be created on a FAT32 formatted volume - the following characters are not permitted to be used: ':', '<', '>', '\', '?', '*', '"
     *   '|' pipe character is not supported on any filesystem as a part of a path. Character limit is 254
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
     * - 17 - DIR_CREATE_FAILED - Failed to create directory
     * - 19 - DIR_NAME_MISSING - Directory name is missing
     * - 21 - DIRECTORY_EXISTS - Directory already exists
     * - 25 - FILE_EXISTS - File already exists with the same name
     * - 45 - PATH_NOT_VALID - Path not valid
     * - 46 - SHARE_INACCESSIBLE - Share is inaccessible
     * - 47 - SHARE_NAME_MISSING - Share name is missing
     * - 75 - SHARE_NOT_FOUND - Share not found
     * - 71 - INVALID_CHARACTER - Invalid character
     *
     * \par XML Response Example:
     * \verbatim
      <dir>
      <status>success</status>
      </dir>
      \endverbatim
     */
    function post($urlPath, $queryParams = null, $outputFormat = 'xml', $apiVersion = NULL)
    {
        $sharePath = $this->_getSharePathFromUrlPath($urlPath, TRUE, FALSE);
        $relPath   = $sharePath->getRelativePath();

        if ($relPath == '')
        {
            throw new \Core\Rest\Exception('DIR_NAME_MISSING', 400, NULL, static::COMPONENT_NAME);
        }

        if (mb_strlen($relPath, 'UTF-8') > 255)
        {
            throw new \Core\Rest\Exception('DIR_NAME_LENGTH_INVALID', 400, NULL, static::COMPONENT_NAME);
        }

        if (!isPathLegal($relPath))
        {
            throw new \Core\Rest\Exception('PATH_NOT_VALID', 400, NULL, static::COMPONENT_NAME);
        }
        if (invalidFat32Path($relPath, $sharePath->getShareName())){
        	throw new \Core\Rest\Exception('INVALID_CHARACTER', 400, NULL, static::COMPONENT_NAME);
        }
        
        if ($sharePath->exists())
        {
            if ($sharePath->isDir())
            {
                throw new \Core\Rest\Exception('DIRECTORY_EXISTS', 403, NULL, static::COMPONENT_NAME);
            }

            if ($sharePath->isFile())
            {
                throw new \Core\Rest\Exception('FILE_EXISTS', 403, NULL, static::COMPONENT_NAME);
            }
        }

        if (!@mkdir($sharePath->getAbsolutePath(), 0777, true))
        {
            throw new \Core\Rest\Exception('DIR_CREATE_FAILED', 500, NULL, static::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(201, static::COMPONENT_NAME, ['status' => 'success'], $outputFormat);
    }

    /**
     * \par Description:
     * This PUT request is used copy, move, rename, or change mtime of the specified directory.
     * \verbatim
       When 'copy' param is enabled, users can now copy directories between NAS
       device and third party cloud storage services like Dropbox. Please read
       the below sections to fully understand the usage.
           File descriptor :
             Users need to use file descriptors to differentiate between NAS, Dropbox
          and other cloud storage device directories. This string starts with @ symbol.
          By default if there is no @ then it assumes the directory is from local NAS device.
           Source and Destination Directories :
          The source directory is part of the URL request path.
          The destination directory is a request param called 'dest_path'.
          Use of 'new_path' as a destination file is not supported with
          file descriptor(starting with @) in the front.
           Ex. @DROPBOX/dropbox/Photos/passport.jpeg
            @LOCAL/Public/photos/passport.jpeg
           Source and Destination param :
          The source and destination directory specific parameters are abreviated
          using 'source_' and    'dest_' strings respectively in parameter keys.
          Ex. source_XXXXX, dest_XXXXX
        Dropbox request params :
          Following are minimum set of required parameters for
          either source or destination directories.
            a. xxxx_oauth_consumer_key
            b. xxxx_oauth_token
            c. xxxx_oauth_signature_method
            d. xxxx_oauth_signature
            Where xxxx are either 'source' or 'dest'.
        Usage :
        http://<device-host-name>/api/@REST_API_VERSION/rest/dir/@DROPBOX/dropbox/test1?dest_path=@LOCAL/FLASHBLU/test1&rest_method=put&copy=true&source_oauth_consumer_key=58cwr61j0wu2ob8&source_oauth_token=4dgcnyf68k3cm5i&source_oauth_consumer_secret=bh1ca1jcgfdmzeu&source_oauth_token_secret=pghuibbizhgs9nk&auth_username=admin&auth_password=&overwrite=true
        http://<device-host-name>/api/@REST_API_VERSION/rest/dir/@LOCAL/FLASHBLU/test1?dest_path=@DROPBOX/dropbox/test1&rest_method=put&copy=true&dest_oauth_consumer_key=58cwr61j0wu2ob8&dest_oauth_token=4dgcnyf68k3cm5i&dest_oauth_consumer_secret=bh1ca1jcgfdmzeu&dest_oauth_token_secret=pghuibbizhgs9nk&auth_username=admin&auth_password=&overwrite=true
       \endverbatim
     * Note: As of now only Dropbox is supported.
     *
     * \par Security:
     * - User must be authenticated.
     *
     * \par HTTP Method: PUT
     * - http://localhost/api/@REST_API_VERSION/rest/dir/{share_name}/{dir_path}
     *
     * \param share_name    String  - required
     * \param dir_path      String  - required
     * \param new_path      String  - optional (Deprecated. Please use dest_path. This is supported only for local NAS files.)
     * \param dest_path     String  - optional, only required for copy or move or rename
     * \param mtime         Integer - optional
     * \param copy          String  - optional (default is false)
     * \param overwrite     String  - optional (default is true for 2.6 version and higher false for lower versions)
     * \param format        String  - optional (default is xml)
     * \param apiVersion    String  - optional (default is 2.1)
     * \param async         Boolean - optional (default is false. Only required if request to be handled as an Async Job request)
     * \param async_comment String  - optional (default is emty. Only considered if asyn param set to true)
     *
     * \par Parameter Details:
     * - share_name - the name of the share.
     * - dir_path - the directory to be copy, move or rename.
     * - new_path - Deprecated. Please use dest_path. This is a full path to be applied to the new directory
     * - dest_path - this is a full path to be applied to the new directory
     *   If  the path is to be created on a FAT32 formatted volume - the following characters are not permitted to be used: ':', '<', '>', '\', '?', '*', '"
     *   '|' pipe character is not supported on any filesystem as a part of a path. Character limit is 254
     * - mtime - this is the modified time of the directory, this is in unix timestamp
     * - copy - if set to true will copy the contains of the directory to the destination directory
     * - overwrite - if set to true will overwrite the destination directory if it already exists, it is true by default for REST API version 2.6 and higher, false for lower versions
     *   All subdirectories and files will be copy or move is this is set to true.
     * - async - if set to true, will treat the request as an asynchronous Job and return the Job Id in response
     * - async_comment - if set, will treat the comment as job description
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
     * \par Error Codes:
     * - 19 - DIR_NAME_MISSING - Directory name is missing
     * - 42 - PATH_NOT_DIRECTORY - Path is not a directory
     * - 44 - PATH_NOT_FOUND - Path not found
     * - 45 - PATH_NOT_VALID - Path not valid
     * - 47 - SHARE_NAME_MISSING - Share name is missing
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 75 - SHARE_NOT_FOUND - Share name does not exists
     * - 223 - UNSUPPORTED_OPERATION - Unsupported Operation
     * - 287 - SOURCE_DEST_DIR_EQUAL - Source and Destination directory paths are same
     * - 71 - INVALID_CHARACTER - Invalid character
     * - 37 - New path already exists
     *
     * \par XML Response Example:
     * \verbatim
      <dir>
      <status>success</status>
      </dir>
      \endverbatim
     * \par XML Response with mtime when mtime parameter is passed Example:
     * \verbatim
      <dir>
      <status>success</status>
      <mtime>1331991830</mtime>
      </dir>
      \endverbatim
     * \par XML Response with asymc when async parameter is true Example:
     * \verbatim
      <dir>
        <job_id>1</job_id>
        <status>success</status>
      </dir>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml', $apiVersion = NULL)
    {
        // TODO: add checks for destination path
        $dirPutWorker = \DirPutWorker::getInstance();
        $dirPutWorker->setupWorker($urlPath, $queryParams, $apiVersion);
        try
        {
            $dirPutWorker->validate();
            if ($queryParams['async'] == 'true') {
                // Add request to Job queue so the Job Manager can work on it
                $job_manager = Jobs\JobManager::getInstance();
                $job_manager->initManager($urlPath, $queryParams, 'put', static::COMPONENT_NAME, 'COPY');
                $username = UserSecurity::getInstance()->getSessionUsername();
                $deviceUserId = \RequestScope::getLoginContext()->getDeviceUserId();
                $jobid = $job_manager->create($queryParams['async_comment'], $username, $deviceUserId);
                if (isset($jobid)) {
                    $this->generateSuccessOutput(202, static::COMPONENT_NAME, ['job_id' => $jobid, 'status' => 'success'],
                                                 $outputFormat);
                    if(!isset($queryParams['async_test']) || $queryParams['async_test']!=='skip_job_start') {
                        \Jobs\Common\JobMonitor::triggerJobMonitor();
                    }
                }
                else {
                    throw new \Core\Rest\Exception('JOB_MANAGER_CREATE_ERROR', 500, NULL, static::COMPONENT_NAME);
                }
            }
            else {
                $dirPutWorker->execute();
                $this->generateSuccessOutput(200, static::COMPONENT_NAME, $dirPutWorker->results(), $outputFormat);
            }
        }
        catch (\Exception $e)
        {
             throw new \Core\Rest\Exception($e->getMessage(), $e->getCode(), $e, static::COMPONENT_NAME);
        }
    }

    protected function _isParamTrue($parameter)
    {
        if (!in_array(strtolower(trim($parameter)), ['true', '1', 1]))
        {
            throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, static::COMPONENT_NAME);
        }

        return TRUE;
    }
}
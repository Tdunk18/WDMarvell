<?php
namespace Filesystem\Controller;

// Copyright (c) [2014] Western Digital Technologies, Inc. All rights reserved.

/**
 * \file Filesystem/Controller/ListContents.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */

/**
 * \class ListContents
 * \brief Download the contents of specified files and/or directories
 *
 */


use Util\ZipStream;

setlocale(LC_ALL, "en_US.UTF-8");

class ListContents
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'list_contents';

    /**
     * \par Description:
     * This GET request is used get the contents of specified files and/or directories. The files/directories to be downloaded are specified via
     * an array of parameteres json stringified into a string. The content is returned as a zip file. The zip file is streamed as a response body of the request.
     * If one or more of the paths are not valid it would return an error. If no file/dir to download is specified it would return the entire directory identified in the url.
     * In this case hidden files/directories would be excluded, unless the parameter include_hidden with the value true is passed.
     * If the path is specified as {share_name}/{dir1}/{dir2} and the download_path is also provided, then the archive is named dir2.zip and includes the set of files and folders specified by the download_path.
     * If the path is specified as {share_name}/{dir1}/{dir2} and the download_path is not provided, then the archive is named dir2.zip and includes dir2 and all it's contents.
     *
     * \par Security:
     * - User must be authenticated.
     * - HMAC may be used as an alternative method of authentication.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/list_contents/{share_name}/{dir_path}
     *
     * \param share_name     String  - required
     * \param dir_path       String  - required
     * \param download_path	 String representation of an Array - optional
     * \param include_hidden Boolean - optional (default is false)
     *
     * \par Parameter Details:
     * - share_name - the name of the share
     * - dir_path - the directory to get the contents from
     * - download_path - string represantation of an array of paths to files and/or directories relative to the path {share_name}/{dir_path} to be downloaded. If hidden files
     *    names are passed but include_hidden parameter is not set to true Bad request error message will be returned Example: {"1":"myFile.jpg","2":"MusicDir"} (url encoded:%7B%221%22%3A%22myFile.jpg%22%2C%222%22%3A%22myFile2.jpg%22%7D)
     * - include_hidden - false by default, if set to true then the return list will contain hidden files and directories. If one or
     *    more hidden files/dirs are requested as download_path or dir_path and include_hidden is not set to true, error is returned
     *
     * \return zipped directory contents
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the zip file
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 404 - Request not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 42 - PATH_NOT_DIRECTORY - Path is not a directory
     * - 44 - PATH_NOT_FOUND - Path not found
     * - 47 - SHARE_NAME_MISSING - Share name is missing
     * - 46 - USER_NOT_AUTHORIZED - Share is inaccessible
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml')
    {
		set_time_limit(0);

        $skipAccessibleCheck = FALSE;
        if (isset($queryParams['hmac'])) {
            try {
                \Auth\Model\Hmac::validatePacket($queryParams['hmac'], implode(DS, $urlPath));
            } catch (\Exception $e) {
                throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, NULL, static::COMPONENT_NAME);
            }

            $skipAccessibleCheck = TRUE;
        }
        $sharePath     = $this->_getSharePathFromUrlPath($urlPath, FALSE, FALSE, FALSE, FALSE, $skipAccessibleCheck);
    	$includeHidden = isset($queryParams['include_hidden']) ? \Core\Config::stringToBoolean(trim($queryParams['include_hidden'])) : false;

		$fullPath  = $sharePath->getAbsolutePath();

        if (!$sharePath->exists()){
            throw new \Core\Rest\Exception('PATH_NOT_FOUND', 404, NULL, self::COMPONENT_NAME);
        }

        if (!$sharePath->isDir()){
            throw new \Core\Rest\Exception('PATH_NOT_DIRECTORY', 400, NULL, self::COMPONENT_NAME);
        }

        if(substr(basename($fullPath), 0, 1) == '.' && !$includeHidden){
        	throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, self::COMPONENT_NAME);
        }
		if(isset($queryParams['download_path'])){
			if(!is_string($queryParams['download_path'])){
				 throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, self::COMPONENT_NAME);
			}else{
				$queryParams['download_path'] = json_decode($queryParams['download_path'], true);
				if(!is_array($queryParams['download_path'])){
					throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, self::COMPONENT_NAME);
				}else{
					$downloadList = array();
					foreach($queryParams['download_path'] as $downloadPathV){
						if (!file_exists($fullPath."/".$downloadPathV)){
							throw new \Core\Rest\Exception('PATH_NOT_FOUND', 404, NULL, self::COMPONENT_NAME);
						}
						if(substr($downloadPathV, 0, 1) == '.' && !$includeHidden){
							throw new \Core\Rest\Exception('INVALID_PARAMETER', 400, NULL, self::COMPONENT_NAME);
						}
						$downloadList[] = $downloadPathV;
					}
				}
			}
		}else{
			 $downloadList = $sharePath->getAbsolutePath();
		}
		ZipStream::getInstance()->generateZipStream($downloadList, $fullPath, $includeHidden);
    }
}
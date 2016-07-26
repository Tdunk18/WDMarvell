<?php
/**
 * \file system_configuration/Configuration.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace System\Configuration\Controller;

use System\Configuration\Model;

require_once FILESYSTEM_ROOT . '/includes/contents.inc';

/**
 * \class Configuration
 * \brief Used for saving and restoring the device configuration.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 */
class Configuration
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'system_configuration';

    /**
     * \par Description:
     * Returns path to the file that contains the system configuration.
     * If attach_file is enabled, file will be streamed as part of the HTTP get.
     *
     * \par Security:
     * - No authentication required and request allowed in LAN only.
     *
     * \par HTTP Method: GET
     * - http://localhost/api/@REST_API_VERSION/rest/system_configuration
     * - http://localhost/api/@REST_API_VERSION/rest/system_configuration?attach_file=true
     *
     * \param format        String   - optional (default is xml)
     * \param attach_file   Boolean  - optional (default is xml)
     *
     * \par Parameter Details:
     *	attach_file: default is set to false. so, no file is streamed as part of the response.
     *
     * \retval system_configuration - System configuration file
     * attach_file:  true/false
     * path_to_config:  {path to configuration file on device}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the configuration location and/or configuration file.
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 146  - SYSTEM_CONFIGURATION_INTERNAL_ERROR - System configuration internal server error.
     *
     * \par XML Response Example:
     * \verbatim
      <system_configuration>
      <path_to_config>/CacheVolume/name-20120530-1823.conf</path_to_config>
      </system_configuration>
      \endverbatim
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $result = (new Model\Configuration())->getConfig();

        if ($result !== NULL)
        {
            if (isset($queryParams['attach_file']) && $queryParams['attach_file'] === 'true')
            {
                readFileFromPathNew(NULL, $result['path_to_config'], NULL);
            }
            else
            {
                $results = ['path_to_config' => $result['path_to_config']];

                $this->generateSuccessOutput(200, static::COMPONENT_NAME, $results, $outputFormat);
            }
        }
        else
        {
            throw new \Core\Rest\Exception('SYSTEM_CONFIGURATION_INTERNAL_ERROR', 500, NULL, static::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Restore to previous saved configuration file. If user restores with file created from different NAS, an informational
     * content will be returned in the success body indicating machine name, description and network setting were not restored.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN only.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@RST_API_VERSION/rest/system_configuration
     *
     * \par HTTP POST Body
     * - filepath=/CacheVolume/filename (or) file can be streamed as part of request
     *
     * \param filepath  String - optional
     *
     * \par Parameter Details:
     * - filepath:  path to file containing configuration to restore
     *
     * \retval status String - success
     *
     * \par Shell Code - description
     * - 110 full restore
     * - 111 partial restore, network settings not restored
     * - 112 no restore, file format error
     *
     * \par HTTP Response Codes:
     * - 200 - On successful restore of the configuration
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 146  - SYSTEM_CONFIGURATION_INTERNAL_ERROR - System configuration internal server error.
     * - 147  - SYSTEM_CONFIGURATION_BAD_REQUEST - System configuration bad request.
     * - 41   - PARAMETER_MISSING - filepath or file not included in the post.
     *
     * \par XML Response Example:
     * \verbatim
      <system_configuration>
      	<status>SUCCESS</status>
      </system_configuration>
      \endverbatim
     */
    public function post($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        // Check if filepath is an input from browser and if the path is of a valid file
		if (isset($queryParams['filepath']))
		{
		    if (!file_exists($queryParams['filepath']))
		    {
		        throw new \Core\Rest\Exception('FILE_NOT_FOUND', 404, NULL, static::COMPONENT_NAME);
		    }
		}
		elseif (isset($_FILES['file']['tmp_name']))
	 	{
            $queryParams['filepath'] = $_FILES['file']['tmp_name'];
        }
        else
        {
            throw new \Core\Rest\Exception('PARAMETER_MISSING', 400, NULL, static::COMPONENT_NAME);
        }

        $results = (new Model\Configuration())->modifyConfig($queryParams);

        switch ($results)
        {
            case 'SUCCESS':

                $this->generateSuccessOutput(200, static::COMPONENT_NAME, ['status' => $results], $outputFormat);

                break;

            case 'BAD_REQUEST':

                throw new \Core\Rest\Exception('SYSTEM_CONFIGURATION_BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);

                break;

            case 'SERVER_ERROR':

                throw new \Core\Rest\Exception('SYSTEM_CONFIGURATION_INTERNAL_ERROR', 500, NULL, static::COMPONENT_NAME);

                break;
          }
    }
}
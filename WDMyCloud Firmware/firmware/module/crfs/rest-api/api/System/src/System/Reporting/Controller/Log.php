<?php
/**
 * \file system_reporting/Log.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace System\Reporting\Controller;

use System\Reporting\System;

require_once implode(DS, [FILESYSTEM_ROOT, 'includes', 'contents.inc']);

/**
 * \class Log
 * \brief Create system logs and return path to log file.
 *
 * - This component extends the Rest Component.
 * - Supports xml format.
 * - User must be authenticated to use this component.
 *
 */
class Log
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'system_log';

    /**
     * \par Description:
     * Returns path to the file that contains the logs.
     * If attach_file is true, file will be streamed as part of the HTTP get.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/system_log
     *
     * \param format        String  - optional (default is xml)
     * \param attach_file   Boolean  - optional
     *
     * \par Parameter Details:
     *  attach_file: default is false. No file is streamed as part of the response. {true/false}
     *
     * \retval system_log - Path to System log file
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the log file path
     * - 500 - Internal server error
     *
     * \par Error codes:
     * - 241 - ERROR_GENERATING_SYS_LOG - Error in generating system log
     *
     * \par XML Response Example:
     * \verbatim
      <system_log>
      <path_to_log>/CacheVolume/systemLog_WCAZA0470171_1338507122.zip</path_to_log>
      </system_log>
      \endverbatim
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
    	$result = \System\Reporting\SystemReporting::getManager()->getLog();

        // for testing, set success output
        if ('testing' == $_SERVER['APPLICATION_ENV'])
        {
            return $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
        }

    	if ($this->_checkResult($result, 'ERROR_GENERATING_SYS_LOG'))
    	{
    	    if (isset($queryParams['attach_file']) && 'true' === $queryParams['attach_file'])
    	    {
                readFileFromPathNew(null, $result['path_to_log']);
            }
            else
            {
                $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
            }
    	}
    }

    /**
     * \par Description:
     * Generate log file and transfer to customer support.
     *
     * \par Security:
     * - No authentication required and request allowed in LAN only.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/system_log
     *
     * \param format String - optional
     *
     * \par Parameter Details:
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On successful sending of the log files to the customer support
     * - 500 - Internal server error
     *
     * \par Error codes:
     * - 241 - ERROR_SYS_LOG_UPLOAD - Error in uploading system log
     *
     * \par XML Response Example:
     * \verbatim
      <system_log>
      <transfer_success>succeeded</transfer_success>
      <logfilename>systemLog_WCAZA0470171_1338507712.zip</logfilename>
      </system_log>
      \endverbatim
     */
    public function post($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
    	$result = \System\Reporting\SystemReporting::getManager()->sendLog();

        if ($this->_checkResult($result, 'ERROR_SYS_LOG_UPLOAD'))
        {
            $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
        }
    }

    /**
     * Checks the result of the system reporting manager and abstracts handling the error scenario.
     *
     * @param mixed $result The result to check
     * @param string $errorMessage The error message to use when throwing an exception if there is an error.
     * @throws \Core\Rest\Exception Thrown if $result === NULL
     * @return boolean Returned on success.
     */
    protected function _checkResult($result, $errorMessage)
    {
    	if (NULL === $result)
    	{
            throw new \Core\Rest\Exception($errorMessage, 500, NULL, static::COMPONENT_NAME);
    	}

    	return TRUE;
    }
}
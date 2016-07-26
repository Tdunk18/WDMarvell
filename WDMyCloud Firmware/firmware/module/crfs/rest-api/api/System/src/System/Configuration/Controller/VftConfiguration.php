<?php
/**
 * \file system_configuration/VftConfiguration.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace System\Configuration\Controller;

use System\Configuration\Model;

require_once COMMON_ROOT . '/includes/outputwriter.inc';

/**
 * \class VftConfiguration
 * \brief Used for Retrieving and updating VFT configuration.
 * The VFT process handles the communication protocol used for Manufacturing Test.
 *
 * - This component extends the Rest Component.
 * - Supports xml formats for response data
 * - User must be authenticated to use this component.
 *
 */
class VftConfiguration
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'vft_configuration';

    /**
     * \par Description:
     * Returns VFT configuration of the device.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN only.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/vft_configuration
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval vft_configuration - VFT configuration
     * - enablevft:  {enable/disable}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the vft configuration status
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <vft_configuration>
      <enablevft>{enable/disable}</enablevft>
      </vft_configuration>
      \endverbatim
     */
    public function get($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $result = (new Model\Vft\Configuration())->getConfig();

        if ($result !== NULL)
        {
            $this->generateSuccessOutput(200, static::COMPONENT_NAME, $result, $outputFormat);
        }
        else
        {
            throw new \Core\Rest\Exception('INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);
        }
    }

    /**
     * \par Description:
     * Used for updating VFT configuration.
     * As VFT process handles the communication protocol used for Manufacturing Test,
     * this API will result in '401 - User is not authorized' if device has end user license agreement.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN only.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/vft_configuration
     *
     * \param enablevft             String  - required
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - enablevft:  enable/disable
     *
     * \retval status   String  - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example: -NONE
     * \verbatim
      \endverbatim
     */
    public function put($urlPath, $queryParams = NULL, $outputFormat = 'xml')
    {
        $result = (new Model\Vft\Configuration())->modifyConfig($queryParams);

        switch ($result)
        {
        	case 'NOT_AUTHORIZED':

        	    throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, NULL, static::COMPONENT_NAME);

        		break;

            case 'SUCCESS':

            	$this->generateSuccessOutput(200, static::COMPONENT_NAME, ['status' => 'Success'], $outputFormat);

                break;

            case 'BAD_REQUEST':

        	    throw new \Core\Rest\Exception('BAD_REQUEST', 400, NULL, static::COMPONENT_NAME);

                break;

            case 'SERVER_ERROR':

        	    throw new \Core\Rest\Exception('INTERNAL_SERVER_ERROR', 500, NULL, static::COMPONENT_NAME);

                break;
        }
    }
}
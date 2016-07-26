<?php
/**
 * \file Version/src/Version/Controller/Version.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2011, Western Digital Corp
 */

namespace Version\Controller;

use Version\FirmwareVersion\FirmwareVersion;
use Version\ComponentVersion\ComponentVersion;

/**
 * \class Version
 * \brief Get version of the firmware.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see MioCrawlerStatus, Status
 */
class Version
{
	use \Core\RestComponent;

	const COMPONENT_NAME = 'version';
     /**
     * \par Description:
     * Get version of the firmware and versions of the components.
     *
     * \par Security:
     * - No authentication required.
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/version
     *
     * \param format String - optional (default is xml)
     * \param components String - optional (default is false)
     *
     * \retval firmware String - version of firmware
     * \retval restapi String - version of REST-API build ("unavailable" if can't be retrieved)
     * \retval crawler String - version of media crawler ("unavailable" if can't be retrieved)
     * \retval commanager String - version of Communications Manager ("unavailable" if can't be retrieved)
     * \retval x_orion String - version of the REST-API
     *
     * \par HTTP Response Codes:
     * - 200 - On successful return of the version
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     *
     * \par Error Codes:
     * - 0  - UNKNOWN_ERROR - unknown error.
     *
     * \par XML Response Example with no params specified:
     * \verbatim
      <version>
       <firmware>01.00.08-432</firmware>
      </version>
      \endverbatim
      *
      * \par XML Response Example with param components=true:
      * \verbatim
      <version>
       <firmware>01.00.08-432</firmware>
       <restapi>2.6.0-48</restapi>
       <crawler>2.3.3.53de1ab2c1d04d9bc2b0385b87860f4dff3dcf70</crawler>
       <commanager>1.4.2.002</commanager>
       <x_orion>2.5</x_orion>
      </version>
      \endverbatim
      *
      */

    public function get($urlPath, $queryParams = null, $outputFormat = 'xml')
    {
        if (isset($queryParams['components']) && $queryParams['components'] == "true"){
            try{
                $results = ComponentVersion::getComponentVersion();
            } catch (\Exception $e) {
                throw new \Core\Rest\Exception('INTERNAL_SERVER_ERROR', 500, $e, static::COMPONENT_NAME);
            }
        }else{
            $results = FirmwareVersion::getInstance()->getVersion($urlPath, $queryParams, $outputFormat);
        }

    	if (!$results)
    	{
    	    throw new \Core\Rest\Exception('VERSION_RETRIEVAL_FAILED', 400, NULL, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, self::COMPONENT_NAME, $results, $outputFormat);
    }
}
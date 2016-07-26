<?php
/**
 * \file SafePoint/Controller/SafePointDeactivate.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
namespace SafePoint\Controller;

/**
 * \class SafePointDeactivate
 * \brief Deactivate a SafePoint from a managed list of Safepoints
 *
 * - This component uses Core\RestComponent.
 * - Uses SafePointTraitController
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - Legacy Zermatt code
 * - Uses custom perl script for execution.
 */
class SafePointDeactivate {

	use \Core\RestComponent;
	use SafePointTraitController;

	const COMPONENT_NAME = 'safepoint_deactivate';

	/**
	 * \par Description:
	 * - Deactivates a safepoint from the list of SafePoints
	 *
	 * \par Security:
     * - Admin LAN request only.
	 *
	 * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/safepoint_deactivate
     *
     * \param option   String - optional
     * \param handle   String - required
     *
     * \par parameter details
	 * - option - {abort}
	 * - handle - handle of safepoint
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     * - 400 - Bad request
     * - 500 - Internal server error
     * .
     * \par Legacy Zermatt Error Names:
     *  - OK
     *  - FAILED
     *  - INVALID
     *  - NOTFOUND
     *
     * \par XML Response on Success:
     * \verbatim
     <safepoint_deactivate>
	   <status_code>{status code}</status_code>
  	   <status_name>OK</status_name>
	 </safepoint_deactivate>
      \endverbatim
	 * \par XML Responce on Failure:
	 * \verbatim
	 <safepoint_deactivate>
		  <status_code>{status code}</status_code>
  		  <status_name>{error status name}</status_name>
   	 	  <status_desc>{any status description}</status_desc>
	 </safepoint_deactivate>
      \endverbatim
	 */
    public function post($urlPath, $queryParams=null, $outputFormat='xml') {
        throw new \Core\Rest\Exception('NOTSUPPORTED', 405, null, self::COMPONENT_NAME);
    }

}

<?php

namespace DlnaServer\Controller;

use DlnaServer\Model;

/**
 * \file DlnaServer/Database.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * \class Database
 * \brief Retrieve media server database status and start rebuild.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 *
 */
class Database /* extends AbstractActionController */ {

    use \Core\RestComponent;

    /**
     * \par Description:
     * Returns status of DLNA.
     *
     * \par Security:
     * - Requires user authentication (LAN/WAN)
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/media_server_database
     *
     * \param format   String  - optional (default is xml)
     *
     * \par Parameter Details:
     *
     * \retval media_server_database - Media server database
     * version:  {version of twonkey}
     * time_db_update:  {Time of last database update}
     * music_tracks:  {number of music tracks}
     * pictures:  {number of pictures}
     * videos:  {number of videos}
     * scan_in_progress:  {true/false}
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of the DLNA status
     * - 400 - Bad request
     * - 401 - User is not authorized
     * - 403 - Request is forbidden
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par XML Response Example:
     * \verbatim
      <media_server_database>
      <version>2.2.2.6492C</version>
      <time_db_update>1338486474</time_db_update>
      <music_tracks>0</music_tracks>
      <pictures>0</pictures>
      <videos>0</videos>
      <scan_in_progress>false</scan_in_progress>
      </media_server_database>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $outputFormat = 'xml') {

        $dlnaServerDataBaseObj = new Model\Database();
        $result = $dlnaServerDataBaseObj->getStatus();

        if ($result !== NULL) {
            $results = array('version' => $result['version'],
                'time_db_update' => $result['time_db_update'],
                'music_tracks' => $result['music_tracks'],
                'pictures' => $result['pictures'],
                'videos' => $result['videos'],
                'scan_in_progress' => $result['scan_in_progress'],
            );

            $this->generateSuccessOutput(200, 'media_server_database', $results, $outputFormat);
        } else {
            //Failed to collect info
            $this->generateErrorOutput(500, 'media_server_database', 'MEDIA_SERVER_DATABASE_INTERNAL_SERVER_ERROR', $outputFormat);
        }
    }

    /**
     * \par Description:
     * Configure the DLNA database. This is use to rebuild the database, reset the database back to default and for rescan the database.
     *
     * \par Security:
     * - Requires Admin User authentication and request is from LAN.
     *
     * \par HTTP Method: PUT
     * http://localhost/api/@REST_API_VERSION/rest/media_server_database
     *
     * \param database              String  - required
     * \param format                String  - optional (default is xml)
     *
     * \par Parameter Details:
     * - database:  {rebuild, reset_defaults, rescan}
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
     * \par XML Response Example:
     * \verbatim
      <media_server_database>
      <status>success</status>
      </media_server_database>
      \endverbatim
     */
    function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        $dlnaServerDataBaseObj = new Model\Database();
        $result = $dlnaServerDataBaseObj->config($queryParams);

        switch ($result) {
            case 'SUCCESS':
                $results = array('status' => 'success');
                $this->generateSuccessOutput(200, 'media_server_database', $results, $outputFormat);
                break;
            case 'BAD_REQUEST':
                $this->generateErrorOutput(400, 'media_server_database', 'MEDIA_SERVER_DATABASE_BAD_REQUEST', $outputFormat);
                break;
            case 'SERVER_ERROR':
                $this->generateErrorOutput(500, 'media_server_database', 'MEDIA_SERVER_DATABASE_INTERNAL_SERVER_ERROR', $outputFormat);
                break;
        }
    }

}

/*
 * Local variables:
 *  indent-tabs-mode: nil
 *  c-basic-offset: 4
 *  c-indent-level: 4
 *  tab-width: 4
 * End:
 */

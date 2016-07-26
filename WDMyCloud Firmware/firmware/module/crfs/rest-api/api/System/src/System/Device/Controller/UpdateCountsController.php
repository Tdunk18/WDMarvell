<?php

/**
 * \file device/UpdateCountsController.php
 * \author WD
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace System\Device\Controller;
use System\Device\Model\UpdateCounts;

/**
 * \class UpdateCountsController
 * \brief This component provides a service that allows changes to sections of
 * the NAS database to be detected.  The service aims to reduce the amount
 * of messaging and processing typically required to detect database changes
 * through polling.  Two sections of the NAS database each have a count
 * associated with their data that is incremented every time the data changes.
 * Those counts are available through a GET request.  The counts should be
 * obtained before the initial read of the database.  Then, the update counts
 * should be periodically read.  If an update count changes, its associated
 * section of the database should be read to obtain the latest data. With parameter
 * 'Counter' only counts related to that particular counts can be retrieved.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - User need not be authenticated to use this component.
 *
 */
class UpdateCountsController /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'update_counts';

    //counters that are *required* for 1.0 API 
    static $V1Counters = array('share_update_count','usb_update_count');
    
    /**
     * \par Description:
     * Returns the update counts for items in the NAS database.
     * The update counts reflects the number of changes that was made to that area (such as shares).
     * When a share is created, the counts will increase by some number.
     * The increase in the update counts is how many internal calls it makes.
     * This number of internal calls depends on how many attributes need changes.
     * There is not a one-to-one to the number of attributes sent to create this area (such as shares) to the increase to the update counts.
     *
     *The 2.1 API only returns the key/value pairs for the counters supported by the queried NAS device. For example for Sequioa those are:
     * 		alert
     * 	    share
     * 	    WDSAFE
     * 	    data_volume_write
     * 	    firmware_update
     * 	    system_state
     * 	    usb
     * 	    
     * 	 For Alpha products those are:
     * 		alert
     * 	    share
     * 	    WDSAFE
     * 	    data_volume_write
     * 	    firmware_update
     * 	    system_state
     * 	    usb
     * 	    raid
     * 	    
     * 	 For Avatar those are:
     * 		alert
     * 	    data_volume_write
     * 	    firmware_update
     * 	    system_state
     * 	    wifi_ap
     * 	    wifi_client_connection
     * 	    battery
     * 
     * The default values for all update counts should be 1
     *
     *"data_volume_write": is incremented whenever there has been a change in size (either positive or negative) to the data_volume. There is a 1 GB filter to the counter, so that it would only update when 1GB or more had been added/removed. 
     * 
     * "system_state" is comprised of: 
     * Volume status 
     * Temperature status 
     * Disk SMART status 
     * 
     * The "system_state" update count will be incremented whenever the individual states of each status changes. 
     * 
     * For volumes, it is the status of the volumes (good/bad). For example, if the data volume cannot be mounted, the volume status is bad.
     * 
     * \par Security:
     * - No authentication is required, and request allowed in LAN only
     *
     * \par HTTP Method: GET
     * http://localhost/api/@REST_API_VERSION/rest/update_counts
     * http://localhost/api/@REST_API_VERSION/rest/update_counts?counter={name_of_counter}
     *
     * \param format   String - optional (default is xml)
     * \param counter  String - optional
     *
     * \par Parameter Details:
     * - counter: Name of update counter. This is the name before the '_update_count'.
     *  {example would be alert, share}
     *
     * \retval update_counts - Update counts
     *
     * \par HTTP Response Codes:
     * - 200 - On successful retrieval of counts
     * - 400 - Bad request, if parameter or request does not correspond to the api definition
     * - 401 - User is not authorized
     * - 404 - Requested resource not found
     * - 500 - Internal server error
     *
     * \par Error Codes:
     * - 500 Internal error
     * - 273 UPDATE_COUNTER_NOT_FOUND - Update Counter Not Found
     *
     * \par XML Response Example:
     * \verbatim
      <update_counts>
      <alert_update_count>20</alert_update_count>
      <share_update_count>7</share_update_count>
      <usb_update_count>4</usb_update_count>
      <user_update_count>7</user_update_count>
      <data_volume_write_update_count>50</data_volume_write_update_count>
	  <raid_update_count>1<raid_update_count>
	  <safepoint_update_count>0</safepoint_update_count>
	  <remote_access_count>5</remote_access_count>
	  <firmware_update_count>1<firmware_update_count>
	  <system_state_update_counter>5<system_state_update_counter>
	  <events_update_count>0</events_update_count>
      </update_counts>
      \endverbatim
     */
    function get($urlPath, $queryParams = null, $ouputFormat = 'xml', $version = NULL) {
        $counter = null;
        if (isset($queryParams['counter'])) {
            $counter = trim($queryParams['counter']);
            if ($counter === '') {
                throw new \Core\Rest\Exception('UPDATE_COUNTER_NOT_FOUND', 404, null, self::COMPONENT_NAME);
            }
        }

        $counts = UpdateCounts::get($counter);
        if ($counts === false) {
            throw new \Core\Rest\Exception('INTERNAL_ERROR', 500, null, self::COMPONENT_NAME);
        }

        //append _update_count to each count name
        foreach ($counts as $countName => $count) {
            $counts["{$countName}_update_count"] = $count;
            unset($counts[$countName]);
        }

        if ( $version == 1.0 ) {
            //make sure we output 1.0 supported counts, set any that are missing to 1
            foreach (self::$V1Counters as $v1Counter) {
                if (!isset($counts[$v1Counter])) {
                    $counts[$v1Counter] = 1;
                }
            }
        }

        ksort($counts);

        $this->generateSuccessOutput(200, self::COMPONENT_NAME, $counts, $ouputFormat);
    }

}
<?php

namespace Core\Controller;

/*
 * \file Core\Controller\ApcClearCache.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
/*
 * \class ApcClearCache
 * \brief Clears the APC Cache.
 *
 * - This component extends the Rest Component.
 * - Supports xml and json formats for response data. Default format is xml.
 * - This component can be executed from browser, flash UI app or any script.
 * - User need not be authenticated to use this component.
 *
 * \see ErrorCodes, Status, Version
 */

class ApcClearCache /* extends AbstractActionController */ {

    use \Core\RestComponent;

    const COMPONENT_NAME = 'apc_cc';

    /*
     * \par Description:
     * Clears the APC Cache.
     *
     * \par Security:
     * - Admin LAN Only
     *
     * \par HTTP Method: PUT
     * http://localhost/api/1.0/rest/apc_cc
     *
     * \param cache - String optional
     * \param key - String optional
     *
     * \par Parameter Details
     * - cache - defaults to 'all'. cache can be 'all' or 'user' - or any other supported PHP value (currently PHP only supports 'user')
     * - key - a certain apc key to delete. The cache parameter has no affect if key is given.
     *
     * \retval success - String
     *
     * \par HTTP Response Codes:
     * - 200 - On success
     *
     * \par XML Response Example:
     * \verbatim
<apc_cc>
    <success>success</success>
</apc_cc>
      \endverbatim
     */

    public function put($urlPath, $queryParams = null, $outputFormat = 'xml') {
        if (isset($queryParams['key'])) {
            apc_delete($queryParams['key']);
        } else {
            $cacheType = isset($queryParams['type']) ? $queryParams['type'] : 'all';
            switch ( $cacheType ) {
                case 'all':
                    apc_clear_cache();
                    apc_clear_cache('user');
                    break;
                default:
                    apc_clear_cache($cacheType);
            }
        }

        $this->generateItemOutput(200, self::COMPONENT_NAME, array('success' => 'success'), $outputFormat);
    }
}


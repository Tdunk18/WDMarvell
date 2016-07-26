<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Shares\Controller;

use Shares\Model\Share\SharesDao;

/**
 * Description of Common
 *
 * @author gabbert_p
 */
trait SharesTraitController {

    /**
     * Attempts to locate the sharename from the URL or query parameters.
     * Share name can contain alphanumeric characters, - and _ and can be between 1 and 32 characters in length.
     *
     * @param type $urlPath
     * @param type $queryParams
     * @return type
     * @throws \Core\Rest\Exception
     */
    protected function _findShareName($urlPath, $queryParams, $required = false) {

        $shareName = null;
        if (isset($urlPath[0])) {
            $shareName = trim($urlPath[0]);
        } else if (isset($queryParams["share_name"])) {
            $shareName = trim($queryParams["share_name"]);
        }

        if ($shareName == '') {
            if ($required) {
                throw new \Core\Rest\Exception('SHARE_NAME_MISSING', 400, null, self::COMPONENT_NAME);
            } else {
                return null;
            }
        }

        if ($required && !SharesDao::isShareNameValid($shareName)) {
            throw new \Core\Rest\Exception('INVALID_SHARE_NAME', 400, null, self::COMPONENT_NAME);
        }

        return $shareName;
    }

}


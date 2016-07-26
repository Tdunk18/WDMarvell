<?php

namespace Auth\Controller;

require_once COMMON_ROOT . 'includes' . DS . 'security.inc';

use Auth\Model;

/**
 * \class Hmac
 * \brief Get a hash message authentication code.
 *
 * - Supports xml and json formats for response data. Default format is xml.
 * - User must be authenticated to use this component.
 */
class Hmac
{
    use \Core\RestComponent;

    const COMPONENT_NAME = 'hmac';

    /**
     * \par Description:
     * This POST request is used to retrieve a hash message authentication code (hmac).
     *
     * \par Security:
     * - User must be authenticated as a Cloud Holder/Admin.
     * - Device user's user must be the same as the session user.
     * - Device user's user must be a Cloud Holder/Admin and must have at least read only access to the path they are attempting to create an hmac for.
     *
     * \par HTTP Method: POST
     * - http://localhost/api/@REST_API_VERSION/rest/hmac/{path}?device_user_id=123456
     *
     * \param path            String - required
     * \param device_user_id  String - required
     * \param access          String - optional (default is RO)
     * \param format          String - optional (default is xml)
     *
     * \par Parameter Details:
     * - path - the path to give access under rooted at the share name (eg /Public/foo).
     * - device_user_id - The id of the device user to create the hmac for.
     * - access - Either RO or RC for read-only and read-create.
     *
     * \retval status String - success
     *
     * \par HTTP Response Codes:
     * - 200 - OK
     * - 400 - Bad Request
     * - 401 - Unauthorized
     * - 404 - Not Found
     * - 500 - Internal Server Error
     *
     * \par Error Codes:
     * - 47 - SHARE_NAME_MISSING - Share name is missing
     * - 46 - SHARE_INACCESSIBLE - Share is inaccessible
     * - 57 - USER_NOT_AUTHORIZED - User not authorized
     * - 14 - DEVICE_USER_ID_MISSING - Device user id missing
     * - 15 - DEVICE_USER_NOT_FOUND - Device user not found
     *
     * \par XML Response Example:
     * \verbatim
<?xml version="1.0" encoding="utf-8"?>
<hmac>
  <hmac>0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef</hmac>
</hmac>
      \endverbatim
     */
    public function post(array $urlPath, $queryParams = null, $outputFormat = 'xml')
    {
        if (!isset($queryParams['device_user_id'])) {
            throw new \Core\Rest\Exception('DEVICE_USER_ID_MISSING', 400, NULL, self::COMPONENT_NAME);
        }

        $path = implode(DS, $urlPath);

        $hmacPacket = NULL;
        try {
            if (isset($queryParams['access'])) {
                $hmacPacket = Model\Hmac::generatePacket($path, $queryParams['device_user_id'], $queryParams['access']);
            } else {
                $hmacPacket = Model\Hmac::generatePacket($path, $queryParams['device_user_id']);
            }
        } catch (\Exception $e) {
            throw new \Core\Rest\Exception($e->getMessage(), $e->getCode(), $e, self::COMPONENT_NAME);
        }

        $this->generateSuccessOutput(200, self::COMPONENT_NAME, ['hmac' => $hmacPacket], $outputFormat);
    }
}

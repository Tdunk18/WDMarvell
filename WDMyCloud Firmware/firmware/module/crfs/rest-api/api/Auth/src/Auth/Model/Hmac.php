<?php

namespace Auth\Model;

require_once COMMON_ROOT . 'includes' . DS . 'requestscope.inc';

class Hmac
{
    /**
     * Generates an hmac packet.
     *
     * @param string $path A path rooted at the share name (eg /Public/foo).
     * @param string $deviceUserId a device user id.
     * @param string $access Either RO or RC for read-only or read-create.
     * @return string the hmac packet.
     */
    public static function generatePacket($path, $deviceUserId, $access = 'RO')
    {
        if ($access !== 'RO' && $access !== 'RC') {
            throw new \Exception('HMAC_ACCESS_INVALID', 400);
        }

        $deviceUser = \Remote\DeviceUser\Db\DeviceUsersDB::getInstance()->getDeviceUser($deviceUserId);
        if ($deviceUser === NULL) {
            throw new \Exception('DEVICE_USER_NOT_FOUND', 400);
        }

        $path = DS . trim(trim($path), DS);
        $pathParts = explode(DS, $path);
        if (empty($pathParts[1])) {
            throw new \Exception('SHARE_NAME_MISSING', 400);
        }

        if (!(new \Shares\Model\Share\SharesDao())->isShareAccessible($pathParts[1], $access !== 'RO', TRUE, $deviceUser->getParentUsername())) {
            throw new \Exception('SHARE_INACCESSIBLE', 401);
        }

        //since the device user's user must match the session user, we are guarenteeing the device user's user is a cloudholder since the module config specifies.
        if (\Auth\User\UserSecurity::getInstance()->getSessionUsername() !== $deviceUser->getParentUsername()) {
            throw new \Exception('DEVICE_USER_PARENT_DOES_NOT_MATCH_SESSION_USER', 400);
        }

        $data = ['device_user_id' => $deviceUser->getDeviceUserId(), 'path' => $path];
        if ($access !== 'RO') {
            $data['access'] = $access;
        }
        $hmac = hash_hmac('sha256', json_encode($data), $deviceUser->getDeviceUserAuthCode());
        $data['hmac'] = $hmac;
        return base64_encode(json_encode($data));
    }

    /**
     * Validate an hmac packet.
     *
     * @param string $hmacPacket the hmac packet given from generate().
     * @param string $path A path rooted at the share name (eg /Public/foo). This path is checked to be under the $hmacPacket path.
     * @param string $neededAccess A needed access. Either RO or RC for read-only or read-create.
     * @return void
     */
    public static function validatePacket($hmacPacket, $path, $neededAccess = 'RO')
    {
        $packet = json_decode(base64_decode($hmacPacket), TRUE);

        $deviceUser = \Remote\DeviceUser\Db\DeviceUsersDB::getInstance()->getDeviceUser($packet['device_user_id']);
        if ($deviceUser === NULL) {
            throw new \Exception('DEVICE_USER_NOT_FOUND', 400);
        }

        $givenHmac = $packet['hmac'];
        unset($packet['hmac']);
        $generatedHmac = hash_hmac('sha256', json_encode($packet), $deviceUser->getDeviceUserAuthCode());

        if ($givenHmac !== $generatedHmac || !\Auth\User\UserSecurity::getInstance()->isCloudholder($deviceUser->getParentUsername())) {
            throw new \Exception('USER_NOT_AUTHORIZED', 401);
        }

        $path = DS . trim(trim($path), DS);

        if (strpos($path, $packet['path']) === FALSE) {
            throw new \Exception('USER_NOT_AUTHORIZED', 401);
        }

        $pathParts = explode(DS, $path);
        if (empty($pathParts[1])) {
            throw new \Exception('SHARE_NAME_MISSING', 400);
        }

        if ($neededAccess !== 'RO') {
            if ($neededAccess !== 'RC') {
               throw new \Exception('SHARE_INACCESSIBLE', 401);
            }
            if (!isset($packet['access']) || $packet['access'] !== 'RC') {
                throw new \Exception('SHARE_INACCESSIBLE', 401);
            }
        }

        if (!(new \Shares\Model\Share\SharesDao())->isShareAccessible($pathParts[1], $neededAccess !== 'RO', TRUE, $deviceUser->getParentUsername())) {
            throw new \Exception('SHARE_INACCESSIBLE', 401);
        }
    }
}

<?php

namespace Remote\DeviceUser;

/**
 * DevieUser class
 *
 * Container bean for a DeviceUser
 *
 * @author joesapsford
 *
 */
class DeviceUser {
    private $deviceUserId;
    private $deviceUserAuthCode;
    private $parentUsername;
    private $createdDate;
    private $type;
    private $typeName;
    private $name;
    private $email;
    private $dac;
    private $dacExpiration;
    private $applicationName;
    private $isActive;
    private $enableWanAccess;

    public function __construct($array = array()) {
        $this->parentUsername = $array['username'];
        $this->deviceUserId = $array['device_user_id'];
        $this->deviceUserAuthCode = $array['auth'];
        $this->email = $array['email'];
        $this->type = $array['type'];
        $this->typeName = $array['type_name'];
        $this->name = $array['name'];
        $this->dac = $array['dac'];
        $this->dacExpiration = $array['dac_expiration'];
        $this->applicationName = $array['application'];
        $this->isActive = $array['is_active'];
        $this->enableWanAccess = $array['enable_wan_access'];
        $this->createdDate = $array['created_date'];
    }

    public function getParentUsername() {
        return $this->parentUsername;
    }

    public function getDeviceUserId() {
        return $this->deviceUserId;
    }

    public function getDeviceUserAuthCode() {
        return $this->deviceUserAuthCode;
    }

    public function getEmail() {
        return $this->email;
    }

    public function getType() {
        return $this->type;
    }

    public function getTypeName() {
        return $this->typeName;
    }

    public function getName() {
        return $this->name;
    }

    public function getDac() {
        return $this->dac;
    }

    public function getDacExpiration() {
        return $this->dacExpiration;
    }

    public function getApplicationName() {
        return $this->applicationName;
    }

    public function getIsActive() {
        return $this->isActive;
    }

    public function getEnableWanAccess() {
        return $this->enableWanAccess;
    }

    public function getCreatedDate() {
        return $this->createdDate;
    }

    public function toArray() {
        return array(
            'device_user_id' => $this->deviceUserId,
            'device_user_auth_code' => $this->deviceUserAuthCode,
            'username' => $this->parentUsername,
            'device_reg_date' => $this->createdDate,
            'type' => $this->type,
            'name' => $this->name,
            'active' => $this->isActive,
            'email' => $this->email,
            'dac' => $this->dac,
            'dac_expiration' => $this->dacExpiration,
            'type_name' => $this->typeName,
            'application' => $this->applicationName,
            'enable_wan_access' => $this->enableWanAccess
        );
    }
}
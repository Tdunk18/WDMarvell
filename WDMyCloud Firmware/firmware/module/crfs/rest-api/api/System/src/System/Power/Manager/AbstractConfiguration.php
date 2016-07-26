<?php

namespace System\Power\Manager;

abstract class AbstractConfiguration implements ConfigurationInterface {

    abstract public function getBatteryStatus();

    abstract public function getPowerProfile();

    abstract public function setPowerProfile($profile);

}

<?php

namespace Storage\Raid\Manager;

abstract class AbstractConfiguration implements ConfigurationInterface {

    abstract public function getDriveStatus();

    abstract public function getDrivesInfo();

    abstract public function getConfigurationStatus();

    abstract public function initRaid($raidMode = '');

    abstract public function getDriveStatusOld();
}
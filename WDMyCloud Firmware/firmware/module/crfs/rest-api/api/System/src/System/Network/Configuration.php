<?php

namespace System\Network;

class Configuration {

    const PUBLIC_SHARE_NAME = 'Public';

    /**
     * @var \System\Network\Configuration\ConfigurationInterface
     */
    static protected $configuration = null;

    /**
     * Returns a OS based implementation of the Network.
     *
     * @return \System\Network\Configuration\NetworkInterface
     */
    static public function getManager() {
        if (empty(self::$configuration)) {
            self::$configuration = \Core\ClassFactory::getImplementation('System\Network\Configuration\AbstractConfiguration', ['osname' => \Core\SystemInfo::getOSName()]);
            \Core\Logger::getInstance()->info(__METHOD__ . " returning network: " . get_class(self::$configuration));
        }

        return self::$configuration;
    }

}

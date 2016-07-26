<?php

namespace Storage\Raid;

class Manager {

    /**
     * @var \Storage\Raid\Manager\ConfigurationInterface
     */
    static protected $manager = null;

    /**
     * Returns a OS based implementation of the Raid Configuration.
     *
     * @return \Storage\Raid\Manager\ConfigurationInterface
     */
    static public function getManager() {
        if (empty(self::$manager)) {
            self::$manager = \Core\ClassFactory::getImplementation('Storage\Raid\Manager\ConfigurationInterface', ['osname' => \Core\SystemInfo::getOSName()]);
            \Core\Logger::getInstance()->info(__METHOD__ . " returning manager: " . get_class(self::$manager));
        }

        return self::$manager;
    }

}

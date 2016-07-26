<?php

namespace System\Power;

class Manager {

    /**
     * @var \System\Power\Manager\ConfigurationInterface
     */
    static protected $manager = null;

    /**
     * Returns a OS based implementation of the Power Configuration.
     *
     * @return \System\Power\Manager\ConfigurationInterface
     */
    static public function getManager() {
        if (empty(self::$manager)) {
            self::$manager = \Core\ClassFactory::getImplementation('System\Power\Manager\ConfigurationInterface', ['osname' => \Core\SystemInfo::getOSName()]);
            \Core\Logger::getInstance()->info(__METHOD__ . " returning manager: " . get_class(self::$manager));
        }

        return self::$manager;
    }

}

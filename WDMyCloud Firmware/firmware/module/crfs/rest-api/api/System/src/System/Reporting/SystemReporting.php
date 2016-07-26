<?php

namespace System\Reporting;

class SystemReporting {

    const PUBLIC_SHARE_NAME = 'Public';

    /**
     * @var \System\Reporting\System\SystemInterface
     */
    static protected $system = null;

    /**
     * Returns a OS based implementation of the System Reporting.
     *
     * @return \System\Reporting\System\SystemInterface
     */
    static public function getManager() {
        if (empty(self::$system)) {
            self::$system = \Core\ClassFactory::getImplementation('System\Reporting\System\AbstractSystem', ['osname' => \Core\SystemInfo::getOSName()]);
            \Core\Logger::getInstance()->info(__METHOD__ . " returning system reporting: " . get_class(self::$system));
        }

        return self::$system;
    }

}

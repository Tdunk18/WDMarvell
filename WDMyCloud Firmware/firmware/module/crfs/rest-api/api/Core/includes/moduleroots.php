<?php

/**
 *
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * Define module roots.
 * Add new modules here to have respective root defined.
 */
$modules = ['Core', 'Common', 'Db', 'System', 'Util', 'Filesystem', 'Metadata', 'Shares',
            'Albums', 'Remote', 'Alerts', 'Jobs', 'Social', 'Storage', 'Wifi', 'Auth', 'iTunes',
            'SafePoint', 'Usb'];

foreach($modules as $module) {
    define(strtoupper($module) . '_ROOT', join(DS, [\MODULES_ROOT, $module, null]));
}

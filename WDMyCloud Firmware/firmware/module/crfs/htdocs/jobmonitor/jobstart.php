<?php

/**
 * 
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */


use Jobs\Common;

$_SERVER['APPLICATION_ENV'] = getenv('APPLICATION_ENV') ? : 'production';

/**
 * This makes our life easier when dealing with paths. Everything is relative
 * to the application root now.
 */
if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    define('ADMIN_API_ROOT', $_SERVER["APPL_PHYSICAL_PATH"] . DIRECTORY_SEPARATOR . 'rest-api' . DIRECTORY_SEPARATOR);
}
else {
     define('ADMIN_API_ROOT', $_SERVER["__ADMIN_API_ROOT"] . '/');
}

require_once ADMIN_API_ROOT . 'api/Core/init_autoloader.php';
 
// Start Job Monitor
// 
\Jobs\Common\JobMonitor::getInstance()->start();
 
?>

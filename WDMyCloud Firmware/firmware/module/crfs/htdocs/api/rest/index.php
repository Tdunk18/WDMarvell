<?php

define('APPLICATION_START_TIME', microtime(true));

$_SERVER['APPLICATION_ENV'] = getenv('APPLICATION_ENV') ? : 'production';
setlocale(LC_ALL, 'en_US.utf8');

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
 //This accelerates GET file_contents.  To optimize performance, no other classes should be loaded before this.
 require (ADMIN_API_ROOT . '/api/Common/includes/getAccelerator.php');
 if(handleAcceleratedRequest()) return;
 
require(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');

\Core\NasController::init()->exec();
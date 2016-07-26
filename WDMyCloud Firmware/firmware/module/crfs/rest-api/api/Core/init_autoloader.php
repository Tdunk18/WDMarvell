<?php

if (!isset($_SERVER['APPLICATION_ENV'])) {
    $_SERVER['APPLICATION_ENV'] = getenv('APPLICATION_ENV') ? : 'production';
}

/**
 * This makes our life easier when dealing with paths. Everything is relative
 * to the application root now.
 */
define('MODULES_ROOT', realpath(ADMIN_API_ROOT . '/api'));
define('LIB_ROOT', realpath(ADMIN_API_ROOT . '/lib'));
define('DS', DIRECTORY_SEPARATOR);
define('NS', '\\');
define('CONFIG_ROOT', realpath(ADMIN_API_ROOT . '/config'));
setlocale(LC_ALL, 'en_US.utf8');

chdir(ADMIN_API_ROOT);
ini_set('include_path', join(PATH_SEPARATOR, [
            LIB_ROOT, /* Local library directory */
            ini_get('include_path')
        ]));

/* Set our debug constant
 *   - APP_ENV currently defined at the index.php level.
 */
define('ORION_DEBUG', (
            (!empty($_REQUEST['ORION_DEBUG'])) ||
            (isset($_SERVER['APPLICATION_ENV']) && (in_array($_SERVER['APPLICATION_ENV'], ['localhost', 'development']))))
        );
define('PRETTY', !empty($_REQUEST['pretty']));

// Class loader for third party libs
include implode(DS, [MODULES_ROOT, 'Core', 'ClassAutoLoader.php']);

$classAutoLoader = new \Core\ClassAutoLoader([implode(DS, [ADMIN_API_ROOT, 'lib', 'autoload_classmap.php'])]);

include implode(DS, [MODULES_ROOT, 'Core', 'includes', 'moduleroots.php']);

include implode(DS, [MODULES_ROOT, 'Util', 'includes', 'exec.php']);

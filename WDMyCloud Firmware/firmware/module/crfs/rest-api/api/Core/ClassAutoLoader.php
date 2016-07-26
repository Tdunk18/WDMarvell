<?php
/**
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2013, Western Digital Corp. All rights reserved.
 */

namespace Core;

use Traversable;

/**
 * ClassAutoLoader - Class autoloader
 *
 * Utilizes class-map files to lookup classfile locations.
 *
 *
 */
class ClassAutoLoader
{
    /**
     * Registry of map files that have already been loaded
     * @var array
     */
    protected $mapsLoaded = array();

    /**
     * Class name/filename map
     * @var array
     */
    protected $map = array();

    /**
     * Constructor
     *
     * Create a new instance, and optionally configure the autoloader.
     *
     * @param  null|array|Traversable $options
     */
    public function __construct($options = null)
    {
        if (null !== $options) {
            $this->registerAutoloadMaps($options);
        }

        $this->register();
        $this->loadModuleConfig();
    }

    /**
     * Loops through currently existing installed modules (within MODULES_ROOT) and loads
     *   their config into the cache.
     *
     * In debug mode: clears user cache.
     */
    public function loadModuleConfig($forceReload = false) {
        // We want to constantly refresh the cache while on development servers.
        if (!$forceReload && apc_fetch('COMPONENT_CONFIG_LOADED')) {
            return;
        }

        $dh = opendir(MODULES_ROOT);
        $moduleConfig = array();

        while (($entry = readdir($dh)) == true) {
            if ((strcmp(substr($entry, 0, 1), '.') === 0) /* .directories */
                    || !is_dir(MODULES_ROOT . '/' . $entry) /* A file within module directory. */)
                continue;

            //Logger::getInstance()->runtime(sprintf('%s::ModuleConfig() for %s start', __CLASS__, $entry));
            $moduleConfig[$entry] = Config::getModuleConfig($entry);
        }

        closedir($dh);
        apc_store('COMPONENT_CONFIG_LOADED', true);
    }

    /**
     * Register an autoload map
     *
     * An autoload map may be either an associative array, or a file returning
     * an associative array.
     *
     * An autoload map should be an associative array containing
     * classname/file pairs.
     *
     * @param  null|array|Traversable  $map
     * @throws \InvalidArgumentException
     * @return ClassMapAutoloader
     */
    public function registerAutoloadMap($map)
    {
        if (is_string($map)) {
            $location = $map;
            if ($this === ($map = $this->loadMapFromFile($location))) {
                return $this;
            }
        }

        if (!is_array($map)) {
            throw new \InvalidArgumentException(sprintf(
                'Map file provided does not return a map. Map file: "%s"',
                (isset($location) && is_string($location) ? $location : 'unexpected type: ' . gettype($map))
            ));
        }

        $this->map = array_merge($this->map, $map);

        if (isset($location)) {
            $this->mapsLoaded[] = $location;
        }

        return $this;
    }

    /**
     * Register many autoload maps at once
     *
     * @param  null|array|Traversable $locations
     * @throws \InvalidArgumentException
     * @return ClassMapAutoloader
     */
    public function registerAutoloadMaps($locations)
    {
        if (!is_array($locations) && !($locations instanceof Traversable)) {
            throw new \InvalidArgumentException('Map list must be an array or implement Traversable');
        }
        foreach ($locations as $location) {
            $this->registerAutoloadMap($location);
        }
        return $this;
    }

    /**
     * Retrieve current autoload map
     *
     * @return array
     */
    public function getAutoloadMap()
    {
        return $this->map;
    }

    /**
     * Defined by Autoloadable
     *
     * @param  string $class
     * @return void
     */
    public function autoload($class)
    {
            //Instead of hard-coding a big file which is very slow to deserialize using use APC cache, the following simple mapping logic finds the Zend classes
        if(strpos($class, "Zend\\")===0) {
            $subpath = str_replace("\\", "/", $class);
            $fullPath = LIB_ROOT. DS . $subpath . ".php";
            require_once $fullPath;
        } else
        if (isset($this->map[$class])) {
            // Third party libs
            require_once $this->map[$class];
        }
        else {
            // This is WD module
            $exploded       = explode(NS, $class);
            $moduleName     = $exploded[0]; // First element is module name
            $namespacedFile = implode(DS, $exploded) . '.php';
            $moduleRoot     = MODULES_ROOT . DS . $moduleName;
            $srcFile        = implode(DS, [$moduleRoot, 'src', $namespacedFile]);
            $testFile       = implode(DS, [$moduleRoot, 'tests', $namespacedFile]);

            if (file_exists($srcFile))
            {
                require_once $srcFile;

                return TRUE;
            }
            elseif (file_exists($testFile))
            {
                require_once $testFile;

                return TRUE;
            }

            return FALSE;
        }
    }

    /**
     * Register the autoloader with spl_autoload registry
     *
     * @return void
     */
    public function register()
    {
        spl_autoload_register(array($this, 'autoload'), true);
    }

    /**
     * Load a map from a file
     *
     * If the map has been previously loaded, returns the current instance;
     * otherwise, returns whatever was returned by calling include() on the
     * location.
     *
     * @param  string $location
     * @return ClassMapAutoloader|mixed
     * @throws \InvalidArgumentException for nonexistent locations
     */
    protected function loadMapFromFile($location)
    {
        if (!file_exists($location)) {
            throw new \InvalidArgumentException(sprintf(
                'Map file provided does not exist. Map file: "%s"',
                (is_string($location) ? $location : 'unexpected type: ' . gettype($location))
            ));
        }

        if (!$path = static::realPharPath($location)) {
            $path = realpath($location);
        }

        if (in_array($path, $this->mapsLoaded)) {
            // Already loaded this map
            return $this;
        }

        $map = include $path;

        return $map;
    }

    /**
     * Resolve the real_path() to a file within a phar.
     *
     * @see https://bugs.php.net/bug.php?id=52769
     * @param string $path
     * @return string
     */
    public static function realPharPath($path)
    {
        if (strpos($path, 'phar:///') !== 0) {
            return;
        }

        $parts = explode('/', str_replace(array('/','\\'), '/', substr($path, 8)));
        $parts = array_values(array_filter($parts, function($p) { return ($p !== '' && $p !== '.'); }));

        array_walk($parts, function ($value, $key) use(&$parts) {
            if ($value === '..') {
                unset($parts[$key], $parts[$key-1]);
                $parts = array_values($parts);
            }
        });

        if (file_exists($realPath = 'phar:///' . implode('/', $parts))) {
            return $realPath;
        }
    }
}

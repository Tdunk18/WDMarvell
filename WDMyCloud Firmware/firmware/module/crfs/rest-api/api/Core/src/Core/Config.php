<?php

namespace Core;

class Config {

    protected static $xmlReader;

    // TOOD: move globalconfig.inc stuff into here.

    public static $globalConfig;

    static protected function getDeviceName(){
        return @parse_ini_file(CONFIG_ROOT.'/globalconfig.ini')["DEVICETYPENAME_" . strtoupper(\Core\SystemInfo::getModelNumber())];
    }

    static public function getModuleConfig($module) {
        $moduleKey = 'MODULE_CONFIG_' . strtoupper($module);
        $config    = apc_fetch($moduleKey);

    	if (!empty($config)) {
    		return $config;
    	}

        $config = apc_fetch('MODULE_CONFIG') ?: array();

        $config[$module] = array();
        self::$xmlReader = self::$xmlReader ? : new \Zend\Config\Reader\Xml();
        // Modules will all have the same naming format:
        //    module.config.xml for base name.
        //    module.<env>.config.xml -- Optional environment specific config
        //    module.<platform>.config.xml -- Optional environment specific config
        $configFileList = ['module.config.xml', 'platform/module.'.self::getDeviceName().'.config.xml', 'module.' . ($_SERVER['APPLICATION_ENV'] ? : 'null') . '.config.xml']; // 5.4 Only
        $configFileDirectory = implode(DS, [ADMIN_API_ROOT, 'api', $module, 'config', '']); // NULL creates a trailing / (or \ on Win)

        foreach ($configFileList as $configFileName) {
            if (!file_exists($configFileDirectory . $configFileName)) {
                continue;
            }

            $cache = self::$xmlReader->fromFile($configFileDirectory . $configFileName);
            if (isset($cache['components']) && count($cache['components']) > 0) {
                /* When there is only one component, it doesn't come across as an array: fix it. */
                $cache['components']['component'] = isset($cache['components']['component']['name']) ?
                        array($cache['components']['component']) : $cache['components']['component'];

                foreach ($cache['components']['component'] as $idx => $component) {
                    // Translaction layer: convert USER_AUTH to \Core\NasController::USER_AUTH constant value.
                    $tmp = array(); // Using tmp var to prevent any mucking up with array pointers from the 'all' instance
                    $componentName = $component['name'];
                    foreach ($component['auth_security'] as $k => $auth) {
                        if (strcasecmp('all', $k) === 0) {
                            /*
                             * Check for class constant of the similar name: one name applies to all.
                             */
                            if (defined('\Core\NasController::' . strtoupper($auth))) {
                                // Explode out ALL
                                foreach ( array('put', 'post', 'delete', 'get') as $restMethod ) {
                                    $tmp[$restMethod] = constant('\Core\NasController::' . strtoupper($auth));
                                }
                            } elseif (isset(\Core\NasController::${strtolower($auth)}) &&
                                    is_array(\Core\NasController::${strtolower($auth)})) {
                                /*
                                 * These are permission groups: one group permission relates to a set of predefined
                                 *    set of permissions.
                                 */
                                if ( $module == "Shares" ) Logger::getInstance()->info("($componentName) Breaking out {$auth} to", \Core\NasController::${strtolower($auth)} );
                                foreach (\Core\NasController::${strtolower($auth)} as $method => $auth) {
                                    $tmp[strtolower($method)] = $auth;
                                }
                            }
                        } else {
                            $tmp[strtolower($k)] = ctype_digit((string) $auth) ? $auth : constant('\Core\NasController::' . strtoupper($auth));
                        }
                    }
                    $component['auth_security'] = $tmp;
                    $componentKey               = 'COMPONENT_CONFIG_' . strtoupper($componentName);
                    $component                  = array_replace_recursive(apc_fetch($componentKey) ? : array(), $component);

                    $cache['components'][$componentName] = $component;
                    apc_store($componentKey, $component);
                }

                // No longer necessary
                unset($cache['components']['component']);
            }

            if (isset($cache['class_factory']) && count($cache['class_factory']) > 0) {

                // Converting SimpleXML caveats
                $factories = isset($cache['class_factory']['implementation']) ?
                        array($cache['class_factory']) : $cache['class_factory'];

                //$mapper = array();
                foreach ($factories as $factory) {
                    if (empty($factory['factory'])) {
                        Logger::warn(sprintf('No factory class defined for class factory implementations in module "%s"', $module));
                        continue;
                    }

                    // Remove any leading \
                    if (strpos($factory['factory'], '\\') == 0) {
                        $factory['factory'] = substr($factory['factory'], 1);
                    }

                    $interface = ClassFactory::getInstance()->addInterface($factory['factory']);

                    foreach ($factory['implementation'] as $implementation) { // Factory should always have two or more implementations; so no need to convert SimpleXML caveats.
                        $interface->addImplementation($implementation['class_name'], $implementation['attributes']);
                    }
                }

                apc_store('_CLASSFACTORIES', ClassFactory::getInstance()->getCache());
                // no longer necessary
                unset($cache['class_factory']);
            }

            $config[$module] = array_replace_recursive($config[$module], $cache);
        }

        apc_store($moduleKey, $config[$module]);

        // Used in just one place: /version
        apc_store('MODULE_CONFIG', $config);

        return $config[$module];
    }

    /**
     * Converts a string representation of a boolean to a boolean value.
     *
     * @param string $string
     * @return boolean
     */
    public static function stringToBoolean($string) {
        return filter_var($string, \FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Converts a boolean value to it's string representation: true/false.
     *
     * @param boolean $bool
     * @return string
     */
    public static function booleanToString($bool) {
        return $bool ? 'true' : 'false';
    }

}
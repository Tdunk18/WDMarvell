<?php

namespace System\Network\Configuration;

interface ConfigurationInterface {

	/**
	 * Gets information about the system.
	 *
	 * @return \System\Network\Configuration\Linux\ConfigurationImpl
	 */
    public function getSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
	 * Gets information about the system.
	 *
	 * @return \System\Network\Configuration\Linux\ConfigurationImpl
	 */
    public function putSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
	 * Gets information about the system.
	 *
	 * @return \System\Network\Configuration\Linux\ConfigurationImpl
	 */
    public function postSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function deleteSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function getNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function putNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function postNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function deleteNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function getNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function putNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function postNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function deleteNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function getNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function putNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function postNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml');

    /**
     * Gets information about the system.
     *
     * @return \System\Network\Configuration\Linux\ConfigurationImpl
     */
    public function deleteNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml');

}
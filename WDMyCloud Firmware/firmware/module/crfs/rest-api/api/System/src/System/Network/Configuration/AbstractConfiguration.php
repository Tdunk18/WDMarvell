<?php

namespace System\Network\Configuration;

abstract class AbstractConfiguration implements ConfigurationInterface {

    abstract public function getSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function putSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function postSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function deleteSshConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function getNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function putNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function postNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function deleteNetworkConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function getNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function putNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function postNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function deleteNetworkServicesConfiguration($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function getNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function putNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function postNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml');

    abstract public function deleteNetworkWorkgroup($urlPath, $queryParams=null, $ouputFormat='xml');

}
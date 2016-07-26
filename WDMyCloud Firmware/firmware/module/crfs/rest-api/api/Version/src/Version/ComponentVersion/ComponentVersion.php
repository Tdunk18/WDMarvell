<?php
/**
 * \file Version/src/Version/ComponentVersion/ComponentVersion.php \author WDMV - Mountain View - Software
 * Engineering \copyright Copyright (c) 2011, Western Digital Corp
 */

namespace Version\ComponentVersion;

use Wifi\Exception;

require_once (COMMON_ROOT."/includes/globalconfig.inc");

class ComponentVersion
{
     private static $not_available = "unavailable";

     public static function getComponentVersion(){

        $components = apc_fetch('componentversions');
        if($components === FALSE) {

           $components = [
               'firmware' => self::getFirmwareVersion(),
               'restapi' => self::getRestApiVersion(),
               'crawler' => self::getCrawlerVersion(),
               'commanager'=> self::getCommunicationManagerVersion(),
               'x_orion' => self::getXOrionVersion(),
           ];

           apc_store('componentversions', $components);
        }
        return $components;
     }

     public static function getFirmwareVersion(){
         if(!file_exists('/etc/version')){
             throw new \Exception('getFirmwareVersion() - /etc/version is missing');
         }
         $version = trim(file_get_contents('/etc/version'));
         if ($version == ""){
             $version = self::$not_available;
         }
         return $version;
     }

     public static function getRestApiVersion(){
         //the installation package replaces the file with the actual build number
         if(!file_exists('/var/www/rest-api/api/Version/src/Version/ComponentVersion/build-number')){
             throw new Exception('getRestApiVersion() - build-number file is missing');
         }
         $version = trim(file_get_contents('/var/www/rest-api/api/Version/src/Version/ComponentVersion/build-number'));
         if ($version == ""){
             $version = self::$not_available;
         }
         return $version;
     }

     public static function getCommunicationManagerVersion(){
         $version = self::$not_available;
         $deviceType = getDeviceTypeName();
         if ($deviceType == 'avatar'){
             $version = self::$not_available;
             return $version;
         }
         $return_var = 0;
         exec_runtime('sudo '.getCommManagerScriptStatus(), $output, $return_var);
         if (isset($output[0]) && preg_match('/Version: (.*)/', $output[0], $match)){
            if (isset($match[1]) && ($match[1]!="")){
                $version = trim($match[1]);
            }
         }
         return $version;
     }

    public static function getCrawlerVersion(){
        //Open UNIX domain socket
        $requestSocket = getWdmcRequestSocket();
        $fp = stream_socket_client($requestSocket);
        if($fp){
            //Send XML request to get version from crawler
            $reqXml = '<?xml version = "1.0"?>'.'<WDMCRequest Subsystem = "system" RequestName = "GetVersion" Requester = "Orion"/>';
            $reqXml .= "\0\0\0\0";
            $result  = fwrite($fp, $reqXml);
            if (!$result){
                fclose($fp);
                throw new Exception('getCrawlerVersion() - failed to write to crawler socket');
            }
            fflush($fp);

            //Read response from crawler
            $respXml = "";
            while(!feof($fp)){
                $str = fread($fp, 1024);
                $respXml .= $str;
                if(preg_match('/Version ID="(.*?)"/', $respXml, $match)){
                    break;
                }
            }

            // Close socket
            fclose($fp);

            if (empty($match)){
                throw new Exception('getCrawlerVersion() - failed to retrieve crawler version');
            }
            if (isset($match[1]) && ($match[1]!="")){
                return trim($match[1]);
            }
        }
        return self::$not_available;
    }

    public static function getXOrionVersion() {
         $matches = [];
         preg_match('/X-Orion-Version\s*"(.*?)"/', @file_get_contents('/etc/apache2/conf.d/orionversion.conf'), $matches);
         if (isset($matches[1])) {
             return $matches[1];
         }

         return self::$not_available;
    }
}

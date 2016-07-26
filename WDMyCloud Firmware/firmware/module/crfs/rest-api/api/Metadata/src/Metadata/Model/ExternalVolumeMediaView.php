<?php
/**
 * The \Metadata\Model\RemovableStorage.php class file.
 */

namespace Metadata\Model;

require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once METADATA_ROOT . '/includes/wdmc/wdmcserverproxy.inc';

/**
 * The \Metadata\Model\RemovableStorageScanSetting class.
 *
 * sets and retrieves settings that enable/disable Removable Storage Scan
 */
class ExternalVolumeMediaView
{
    public static function getExternalVolumeMediaViewSetting(){
        $setting = self::isScanEnabled();
        if ($setting === '1'){
            $res['external_scan'] = 'true';
        } elseif ($setting === '0'){
            $res['external_scan'] = 'false';
        } else {
            throw new \Exception('getExternalVolumeMediaViewSetting() - failed to retrieve setting');
        }
        return $res;
    }

    /*
     * Saves ExternalMediaView setting
    * @param bool $setting the query parameter from the client's request
    */
    public static function setExternalVolumeMediaViewSetting($setting){
        $value = ($setting === true) ? 1 : 0;
        //save the setting
        $output = $retVal = null;
        exec_runtime('sudo /usr/local/sbin/setExternalStorageScan.sh '. $value, $output, $retVal);
        if($retVal !== 0) {
            \Core\Logger::getInstance()->err('Call to setExternalStorageScan.sh returned with non-zero value: '.$value . $retVal, $output);
            throw new \Exception ('Call to setExternalStorageScan.sh returned with non-zero value: ' . $retVal, 500);
        }
        //restart the crawler
        try {
            (new \WDMCServerProxy())->execRestartCrawler();
        }
        catch (\Exception $e){
            throw new \Exception('setExternalVolumeMediaViewSetting() - failed to restart the crawler ');
        }
        return true;
    }

    /**
     * Retrieve details from /usr/local/sbin/getExternalVolumeScan, to determine if scanning is on/off
     */

    public static function isScanEnabled(){
        $output = $retVal = null;
        exec_runtime('sudo /usr/local/sbin/getExternalStorageScan.sh', $output, $retVal);
        if($retVal !== 0) {
            \Core\Logger::getInstance()->err('Call to getExternalStorageScan.sh returned with non-zero value: ' . $retVal, $output);
            throw new \Exception ('Call to getExternalStorageScan.sh returned with non-zero value: ' . $retVal, 500);
        } else {
            if (isset($output[0]) && ($output[0] === '0' || $output[0] === '1')){
                return $output[0];
            } else {
                throw new \Exception('getExternalVolumeMediaViewSetting() - failed to retrieve setting');
            }
        }
    }
}
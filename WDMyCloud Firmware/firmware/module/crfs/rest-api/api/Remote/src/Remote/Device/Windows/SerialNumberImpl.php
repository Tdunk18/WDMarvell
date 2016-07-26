<?php

namespace Remote\Device\Windows;

class SerialNumberImpl extends \Remote\Device\SerialNumber {

    public function getSerialNumber() {

        //"Cscript.exe C:\inetpub\OrionSite2.1\bin\GetSerialNum.vbs";
        //$serialNumScript = 'Cscript.exe '. $_SERVER["APPL_PHYSICAL_PATH"] . DIRECTORY_SEPARATOR . 'bin\GetSerialNum.vbs';
        $deviceConfig = getGlobalConfig('device');
        $serialNum = '';
        $serialNumScript = 'Cscript.exe  ' . $deviceConfig['SERIAL_NUM_SCRIPT'];
        $retvalue = exec_runtime($serialNumScript, $serialNum);
        //echo 'SerialNumber = '. $retvalue;
        if($retvalue == -1)
            return $_SERVER['COMPUTERNAME'];
        else
            return $retvalue;
    }
}
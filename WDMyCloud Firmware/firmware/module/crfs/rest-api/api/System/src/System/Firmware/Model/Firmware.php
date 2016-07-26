<?php

namespace System\Firmware\Model;

define('SKIP_SHELL_SCRIPT', false);

class Firmware {

    public function getFirmwareUpdate() {

        $output=$retVal=null;
        exec_runtime("sudo /usr/local/sbin/getFirmwareUpdateStatus.sh", $output, $retVal);
        if ($retVal !== 0) {
            return NULL;
        }

        if (strcasecmp($output[0], "idle") === 0) {
            return array('status' => 'idle', 'completion_percent' => '', 'error_code' => '',
                'error_description' => '');
        }
        // if we've gotten to this point then there is an update status available

        $tempStatus = explode(" ", $output[0]);

        if (strcasecmp($tempStatus[0], "failed") === 0) {
            $status = explode('"', $output[0]);
            $status2 = explode(" ", $status[0]);
            $update = array('status' => $status2[0], 'completion_percent' => '', 'error_code' => $status2[1],
                'error_description' => $status[1]);
        } else {
            $status = explode(" ", $output[0]);
            $update = array('status' => $status[0], 'completion_percent' => $status[1], 'error_code' => '',
                'error_description' => '');
        }
        return $update;
    }

    public function manualFWUpdate($changes) {

        if (!isset($changes['filepath'])) {
            return 'BAD_REQUEST';
        }

        $output=$retVal=null;
		$escFirmwareArg = escapeshellarg($changes["filepath"]);
        exec_runtime("sudo nohup /usr/local/sbin/updateFirmwareFromFile.sh $escFirmwareArg 1>/dev/null 2>&1 &", $output, $retVal, false);

        return 'SUCCESS';
    }

    public function automaticFWUpdate($changes) {

        $output=$retVal=null;
        // cant use unlink function, file is owned by root
        exec_runtime("sudo unlink /tmp/fw_download_status", $output, $retVal);
        if (isset($changes['reboot_after_update']) && (strcasecmp($changes['reboot_after_update'], 'true') == 0)) {
            exec_runtime("sudo nohup /usr/local/sbin/updateFirmwareToLatest.sh reboot 1>/dev/null 2>&1 &", $output, $retVal, false);
        } else if (isset($changes['image'])) {
            $imageLink = $changes['image'];
			$escImageLink = escapeshellarg($imageLink);
            exec_runtime("sudo nohup /usr/local/sbin/updateFirmwareToLatest.sh $escImageLink 1>/dev/null 2>&1 &", $output, $retVal, false);
        } else {
            exec_runtime("sudo nohup /usr/local/sbin/updateFirmwareToLatest.sh 1>/dev/null 2>&1 &", $output, $retVal, false);
        }

        return 'SUCCESS';
    }

    /**
     * PG: Pulled in from FirmwareInfo class.
     *
     */

    /**
     * Gets available firmware packages
     *
     * @return null
     */
    public function getAvailPackages($immediate = false) {
        $current = array();

        $sysConf = parse_ini_file('/etc/system.conf');

        if (isset($sysConf['modelName'])) {
            $name = $sysConf['modelName'];
            $name = $name . ' ';
        } else {
            $name = 'MyBookLive ';
        }

        $nasConfig = parse_ini_file('/etc/nas/config/wd-nas.conf', true);

        $useShellScriptForPackage = false;
        $useShellScriptForUpgrade = false;
        if ($nasConfig === false) {
            $useShellScriptForPackage = true;
            $useShellScriptForUpgrade = true;
        } else {
            if (!isset($nasConfig['global']['VERSION_FILE']) || !isset($nasConfig['settings']['VERSION_BUILDTIME_FILE']) || !isset($nasConfig['settings']['VERSION_UPDATE_FILE'])) {
                $useShellScriptForPackage = true;
            }
            if ($immediate || !isset($nasConfig['settings']['UPGRADE_LINK']) || !isset($nasConfig['settings']['UPGRADE_INFO'])) {
                $useShellScriptForUpgrade = true;
            }
        }

        if (SKIP_SHELL_SCRIPT && !$useShellScriptForPackage) {
            $version = @file_get_contents($nasConfig['global']['VERSION_FILE']);
            if ($version === false) {
                $useShellScriptForPackage = true;
            } else {
                $version = trim($version);
                $description = 'Core F/W';
                if (file_exists($nasConfig['global']['SSH_LOGIN_TRIGGER'])) {
                    $description = $nasConfig['global']['SSH_LOGIN_DESCRIPTION_STRING'];
                }
                $buildTime = @file_get_contents($nasConfig['settings']['VERSION_BUILDTIME_FILE']);
                if ($buildTime === false) {
                    $useShellScriptForPackage = true;
                } else {
                    $buildTime = trim($buildTime);
                    $lastUpgradeTime = @file_get_contents($nasConfig['settings']['VERSION_UPDATE_FILE']);
                    if ($lastUpgradeTime === false) {
                        $useShellScriptForPackage = true;
                    } else {
                        $lastUpgradeTime = trim($lastUpgradeTime);
                        $current = array('package' => array());
                        array_push($current['package'], array('name' => $name, 'version' => $version, 'description' => $description,
                            'package_build_time' => $buildTime, 'last_upgrade_time' => $lastUpgradeTime));
                    }
                }
            }
        }
        if (!SKIP_SHELL_SCRIPT || $useShellScriptForPackage) {
          	$output=array();
          	$retVal=null;
            exec_runtime("sudo /usr/local/sbin/getCurrentFirmwareDesc.sh", $output, $retVal);
            if ($retVal !== 0) {
                return NULL;
            }

            $current = array('package' => array());
            foreach ($output as $package) {
                $currentPackageWithBlanks = explode('"', $package);

                //strip the blanks and spaces from the device array
                foreach ($currentPackageWithBlanks as $key => $value) {
                    if ($value == " ") {
                        unset($currentPackageWithBlanks[$key]);
                    }
                }
                //unset the leading blank string
                unset($currentPackageWithBlanks[0]);

                $currentPackageContents = array_values($currentPackageWithBlanks);

                array_push($current['package'], array('name' => $currentPackageContents[0], 'version' => $currentPackageContents[1],
                    'description' => $currentPackageContents[2],
                    'package_build_time' => $currentPackageContents[3],
                    'last_upgrade_time' => $currentPackageContents[4]));
            }
        }

        // add new upgrade xml body format
        unset($upgradesOutput);
        $upgradesOutput = array();

        if (SKIP_SHELL_SCRIPT && !$useShellScriptForUpgrade) {
            if (file_exists($nasConfig['settings']['UPGRADE_LINK'])) {
                $delAbortedAttempts = @unlink($nasConfig['settings']['UPGRADE_LINK']);
                if ($delAbortedAttempts === false) {
                    $useShellScriptForUpgrade = true;
                }
            }
            if (!$useShellScriptForUpgrade) {
                $upgradesOutput = @file_get_contents($nasConfig['settings']['UPGRADE_INFO']);
                if ($upgradesOutput === false) {
                    $useShellScriptForUpgrade = true;
                } else {
                    $upgradesOutput = explode("\n", $upgradesOutput);
                }
            }
        }
        if (!SKIP_SHELL_SCRIPT || $useShellScriptForUpgrade) {
            $immediateParam = $immediate ? ' immediate' : '';
            $upgradesOutput=$retVal=null;
            exec_runtime("sudo /usr/local/sbin/getNewFirmwareUpgrade.sh" . $immediateParam , $upgradesOutput, $retVal);
            if ($retVal !== 0) {
                //return NULL;
            }
        }

        if (strcasecmp(trim($upgradesOutput[0], '"'), "no upgrade") === 0) {
            $available = 'false';
        } else if (strcasecmp(trim($upgradesOutput[0], '"'), "error") === 0) {
            $available = 'error';
        } else {
            $available = 'true';
        }

        if ($available != 'true') {
            // 3G response format (legacy)
            $update = array
                (
                'available' => $available,
                'package' => array()
            );

            array_push($update['package'], array
                (
                'name' => "",
                'version' => "",
                'description' => ""
                    )
            );

            // 3.5G response format
            $upgrades = array
                (
                'available' => $available,
                'message' => "",
                'upgrade' => array()
            );

            array_push($upgrades['upgrade'], array
                (
                'version' => "",
                'image' => "",
                'filesize' => "",
                'releasenotes' => "",
                'message' => "",
                'name' => "",
                'description' => ""
                    )
            );
        } else {
            // there are upgrades available
            $name = $upgradesOutput[0];
            $version = $upgradesOutput[1];
            $description = $upgradesOutput[2];
            $image = $upgradesOutput[3];
            $message = $upgradesOutput[4];
            $releasenotes = $upgradesOutput[5];
            $filesize = $upgradesOutput[6];

            // get second package if it exists
            $name_1 = $upgradesOutput[7];
            $version_1 = $upgradesOutput[8];
            $description_1 = $upgradesOutput[9];
            $image_1 = $upgradesOutput[10];
            $message_1 = $upgradesOutput[11];
            $releasenotes_1 = $upgradesOutput[12];
            $filesize_1 = $upgradesOutput[13];

            // 3G response format (legacy)
            $update = array('available' => 'true', 'package' => array());

            array_push($update['package'], array
                (
                'name' => $name,
                'version' => $version,
                'description' => $description
                    )
            );

            // 3.5G response format
            $upgrades = array
                (
                'available' => 'true',
                'message' => "",
                'upgrade' => array()
            );

            // put a loop here if needed (currently only two packages are handled below)
            //			foreach ($output as $package)
            //			{
            //			}
            array_push($upgrades['upgrade'], array
                (
                'name' => $name,
                'version' => $version,
                'description' => $description,
                'image' => $image,
                'message' => $message,
                'releasenotes' => $releasenotes,
                'filesize' => $filesize
                    )
            );

            if ($name_1 != null) {
                array_push($upgrades['upgrade'], array
                    (
                    'name' => $name_1,
                    'version' => $version_1,
                    'description' => $description_1,
                    'image' => $image_1,
                    'message' => $message_1,
                    'releasenotes' => $releasenotes_1,
                    'filesize' => $filesize_1
                        )
                );
            }
        }


        return array('current' => $current, 'update' => $update, 'upgrades' => $upgrades);       //$fullPackage;     //
    }

    public function modifyUpdateAvailable() {

        //Actually do change
        $output=$retVal=null;
        exec_runtime("sudo /usr/local/sbin/getNewFirmwareUpgrade.sh immediate", $output, $retVal);
        if ($retVal !== 0) {
            return 'SERVER_ERROR';
        }

        return 'SUCCESS';
    }

}

/*
 * Local variables:
 *  indent-tabs-mode: nil
 *  c-basic-offset: 4
 *  c-indent-level: 4
 *  tab-width: 4
 * End:
 */

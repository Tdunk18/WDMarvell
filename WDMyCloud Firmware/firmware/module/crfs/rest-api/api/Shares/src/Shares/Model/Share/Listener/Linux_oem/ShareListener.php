<?php

namespace Shares\Model\Share\Listener\Linux_oem;

use Auth\User\UserSecurity;
use Filesystem\Model\Link;

class ShareListener implements \Shares\Model\Share\Listener\ShareListenerInterface {

	private static $accessTypes = ["RO" => "read_only", "RW" => "read_write"];
	
	public function shareAdded(\Shares\Model\Share\Share $share ) {
        if ($share->getTargetPath()) {
            $targetPathTrimmed = trim(trim($share->getTargetPath()), DS);

			// Handle target_path: if specified then the new Share should be a symLink referring to the target path.
			// Use the Links Model to create this Share as a symLink so tracked in the system & we know how to handle if mods needed.
			$targetLinkMap = array("links" => array(
				"target_path" => $targetPathTrimmed,
				"link_path" => $share->getName()));
			try {
				$sessionUsername = UserSecurity::getInstance()->getSessionUsername();
				Link::createLinks($targetLinkMap, $sessionUsername, TRUE);
			} catch (LinkException $lnExp) {
				// Link creation failed - should the share be deleted?
				//try{ (new SharesDao())->delete($share->getName());} catch(Exception $e){}
				throw new \Core\Rest\Exception('SHARE_CREATE_WITH_TARGET_PATH_FAILED', 500, $lnExp);
			}

            //create link under /mnt. NOTE this choses the first volume.
            $shareMountPath = self::getShareMountPath($share->getName());
            $targetAbsPath = getSharesPath() . DS . $targetPathTrimmed;
            if (!symlink($targetAbsPath, $shareMountPath)) {
                throw new \Shares\Exception("symlink() failed for '$shareMountPath' -> '$targetAbsPath'", 500);
            }
		} else if (!$share->getSambaAvailable()) {
            if (!mkdir($share->getAbsolutePath())) {
                throw new \Shares\Exception("mkdir() failed for '{$share->getAbsolutePath()}'", 500);
            }

            if (!symlink($share->getAbsolutePath(), $share->getSymbolicPath())) {
                throw new \Shares\Exception("symlink() failed for '{$share->getSymbolicPath()}' -> '{$share->getAbsolutePath()}'", 500);
            }
        }

        $output = $retVal = null;
        $mediaServing = $share->getMediaServing() ? "true" : "false";
        exec_runtime("sudo /usr/local/sbin/smbShare.sh add ".escapeshellarg($share->getName())." 'media_serving=$mediaServing'", $output, $retVal, false);
        if ($retVal !== 0) {
            throw new \Shares\Exception('"smbShare.sh" call failed. Returned with "' . $retVal . '"', 500);
        }
	}

	public function shareModified( $oldShareName, $share) {
        $output=$retVal=null;

        if ($oldShareName !=  $share->getName()) {
            if ($share->getTargetPath()) {
                $shareName = $share->getName();
				// 1. remove old one
				$linkArray[] = $oldShareName;
				try {
					Link::deleteLinks($linkArray, TRUE, TRUE);
				} catch (LinkException $lnExp) {
					throw new \Core\Rest\Exception('SHARE_CREATE_WITH_TARGET_PATH_FAILED', 500, $lnExp);
				}
                $targetPathTrimmed = trim(trim($share->getTargetPath()), DS);
				// 2. Create
				$targetLinkMap = array("links" => array(
					"target_path" => $targetPathTrimmed,
					"link_path" => $shareName));
				try {
					$sessionUsername = UserSecurity::getInstance()->getSessionUsername();
					Link::createLinks($targetLinkMap, $sessionUsername, TRUE);
				} catch (LinkException $lnExp) {
					throw new \Core\Rest\Exception('SHARE_CREATE_WITH_TARGET_PATH_FAILED', 500, $lnExp);
				}

                //replace link under /mnt
                $oldShareMountPath = self::getShareMountPath($oldShareName);
                $newShareMountPath = dirname($oldShareMountPath) . DS . $share->getName();
                $targetAbsPath = getSharesPath() . DS . $targetPathTrimmed;
                @unlink($oldShareMountPath);
                if (!symlink($targetAbsPath, $newShareMountPath)) {
                    throw new \Shares\Exception("symlink() failed for '$newShareMountPath' -> '$targetAbsPath'", 500);
                }
            } else {
                if (!$share->getSambaAvailable()) {
                    $dirnameAbsPath = dirname($share->getAbsolutePath());
                    $dirnameSymbolicPath = dirname($share->getSymbolicPath());

                    $oldAbsPath = "$dirnameAbsPath/$oldShareName";
                    $newAbsPath = "$dirnameAbsPath/{$share->getName()}";

                    $oldSymbolicPath = "$dirnameSymbolicPath/$oldShareName";
                    $newSymbolicPath = "$dirnameSymbolicPath/{$share->getName()}";

                    if (!rename($oldAbsPath, $newAbsPath)) {
                        throw new \Shares\Exception("rename() failed for '$oldAbsPath' -> '$newAbsPath'", 500);
                    }

                    @unlink($oldSymbolicPath);
                    if (!symlink($newAbsPath, $newSymbolicPath)) {
                        throw new \Shares\Exception("symlink() failed for '$newSymbolicPath' -> '$newAbsPath'", 500);
                    }
                }

                Link::updateLinkPathsInCache($oldShareName, $share->getName());
            }

            exec_runtime("sudo /usr/local/sbin/smbShare.sh rename ".escapeshellarg($oldShareName)." ".escapeshellarg($share->getName()), $output, $retVal, false);
            if ($retVal !== 0) {
                throw new \Shares\Exception('"smbShare.sh" call failed. Returned with "' . $retVal . '"', 500);
            }
        }

		$mediaServing = $share->getMediaServing() ? "true" : "false";
		exec_runtime("sudo /usr/local/sbin/smbShare.sh update ".escapeshellarg($share->getName())." 'media_serving=$mediaServing'", $output, $retVal, false);
		if ($retVal !== 0) {
			throw new \Shares\Exception('"smbShare.sh" call failed. Returned with "' . $retVal . '"', 500);
		}	
	}

	public function shareDeleted(\Shares\Model\Share\Share $share) {
        if ($share->getTargetPath()) {
			// Handle target_path: if specified then the Share being deleted is a symLink referring to a target path.
			// Links Model was used to create this Share so use the Links to delete it as well.
			$linkArray[] = $share->getName();
			try {
				Link::deleteLinks($linkArray, TRUE, TRUE);
			} catch (LinkException $lnExp) {
				throw new \Core\Rest\Exception('SHARE_CREATE_WITH_TARGET_PATH_FAILED', 500, $lnExp);
			}

            //remove link under /mnt
            $shareMountPath = self::getShareMountPath($share->getName());
            if (!unlink($shareMountPath)) {
                throw new \Shares\Exception("unlink() failed for '$shareMountPath'", 500);
            }
		} else {
            try {
                Link::deleteLinksBy(NULL, $share->getName(), TRUE);
            } catch (\Exception $ex) {
                throw new \Shares\Exception('Deleting links when deleting share failed.', 500, $ex);
            }

            if (!$share->getSambaAvailable()) {
                if (!\Shares\Model\Share\Listener\deleteDirRecursively($share->getAbsolutePath())) {
                    throw new \Shares\Exception("deleteDirRecursively() failed for '{$share->getAbsolutePath()}'", 500);
                }

                if (!unlink($share->getSymbolicPath())) {
                    throw new \Shares\Exception("unlink() failed for '{$share->getSymbolicPath()}'", 500);
                }
            }
        }

        $output = $retVal = null;
        exec_runtime("sudo /usr/local/sbin/smbShare.sh delete  ".escapeshellarg($share->getName()), $output, $retVal, false);
        if ($retVal !== 0) {
            throw new \Shares\Exception('"smbShare.sh" call failed. Returned with "' . $retVal . '"', 500);
        }
	}

	public function accessAdded(\Shares\Model\Share\Share $share, $username, $access) {
		$output = $retVal= null;
		$shareName = $share->getName();
		exec_runtime("sudo /usr/local/sbin/smbShareAccess.sh add  ".escapeshellarg($shareName)." ".escapeshellarg($username)." " . self::$accessTypes[$access], $output, $retVal, false);
		
		if ($retVal !== 0) {
			throw new \Shares\Exception('"smbShareAccess.sh" call failed. Returned with "' . $retVal . '"', 500);
		}
		
	}

	public function accessModified(\Shares\Model\Share\Share $share, $userName, $access) {
		$output = $retVal= null;
		$shareName = $share->getName();

        if ($access === 'NA') {
            exec_runtime("sudo /usr/local/sbin/smbShareAccess.sh delete ".escapeshellarg($shareName)." ".escapeshellarg($userName), $output, $retVal, false);
        } else {
            exec_runtime("sudo /usr/local/sbin/smbShareAccess.sh update ".escapeshellarg($shareName)." ".escapeshellarg($userName)." ". self::$accessTypes[$access], $output, $retVal, false);
        }

		if ($retVal !== 0) {
			throw new \Shares\Exception('"smbShareAccess.sh" call failed. Returned with "' . $retVal . '"', 500);
		}
	}

	public function accessDeleted(\Shares\Model\Share\Share $share, $username) {
		$output = $retVal= null;
		$shareName = $share->getName();		
		exec_runtime("sudo /usr/local/sbin/smbShareAccess.sh delete ".escapeshellarg($shareName)." ".escapeshellarg($username), $output, $retVal, false);
				
		if ($retVal !== 0) {
			throw new \Shares\Exception('"smbShareAccess.sh" call failed. Returned with "' . $retVal . '"', 500);
		}
		
	}

    /**
     * Gets the share path under /mnt. NOTE if not found the first volume from the database is used.
     *
     * @param string $shareName the share name
     * @return string absolute path to share under /mnt
     */
    private static function getShareMountPath($shareName) {
        $volumes = (new \VolumesDB())->getVolume();
        foreach ($volumes as $volume) {
            $shareMountPath = $volume['mount_path'] . DS . $shareName;

            if (is_link($shareMountPath) || file_exists($shareMountPath)) {
                return $shareMountPath;
            }
        }

        return $volumes[0]['mount_path'] . DS . $shareName;
    }
}

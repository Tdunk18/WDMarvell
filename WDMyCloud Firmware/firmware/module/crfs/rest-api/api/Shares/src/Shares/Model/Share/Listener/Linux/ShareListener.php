<?php

namespace Shares\Model\Share\Listener\Linux;

	use Auth\User\UserSecurity;
	use Filesystem\Model\Link;
	use Shares\Model\Share\SharesDao;
    use System\Device\Model\UpdateCounts;

	class ShareListener implements \Shares\Model\Share\Listener\ShareListenerInterface {

	public function shareAdded(\Shares\Model\Share\Share $share ) {
		$shareName = escapeshellarg(escapeshellcmd($share->getName()));
		if(!$share->getTargetPath()){
			$output = $retVal = null;
			$shareDesc = escapeshellarg(escapeshellcmd($share->getDescription()));
			exec_runtime("sudo /usr/local/sbin/createShare.sh " .  $shareName . " " . $shareDesc , $output, $retVal, false);
			if ($retVal) {
				throw new \Shares\Exception('"createShare.sh" call failed. Returned with "' . $retVal . '"', 500);
			}
			// Check if media serving is "any".
			if ($share->getMediaServing() == "any") {
				exec_runtime("sudo /usr/local/sbin/modShareMediaServing.sh {$shareName} \"any\"", $output, $retVal, false);
				if ($retVal !== 0) {
					throw new \Shares\Exception('"modShareMediaServing.sh" call failed. Returned with "' . $retVal . '"', 500);
				}
			}
		}
		else {
			// Handle target_path: if specified then the new Share should be a symLink referring to the target path.
			// Use the Links Model to create this Share as a symLink so tracked in the system & we know how to handle if mods needed.
			$targetLinkMap = array("links" => array(
				"target_path" => trim(trim($share->getTargetPath()), DS),
				"link_path" => $share->getName()));
			try {
				$sessionUsername = UserSecurity::getInstance()->getSessionUsername();
				Link::createLinks($targetLinkMap, $sessionUsername, TRUE);
			} catch (LinkException $lnExp) {
				// Link creation failed - should the share be deleted?
				try{ (new SharesDao())->delete($share->getName());} catch(Exception $e){}
				throw new \Core\Rest\Exception('SHARE_CREATE_WITH_TARGET_PATH_FAILED', 500, $lnExp);
			}

            $nasConfig = parse_ini_file('/etc/nas/config/wd-nas.conf', TRUE);
            if (isset($nasConfig['wd-nas']['NOTIFIER_TRIGGER'])) {
                exec_runtime("sudo touch {$nasConfig['wd-nas']['NOTIFIER_TRIGGER']}" . DS . ".{$shareName}", $output, $retVal, false);
            }
		}

        UpdateCounts::increment('share');
	}

	public function shareModified( $oldShareName, $share) {
		$output = $retVal = null;
		if(!$share->getTargetPath()){
			if ($oldShareName != $share->getName()) {
				if ( !$share->isDynamicVolume() /* don't call modShareName for dynamic shares (USB) */ ) {
					exec_runtime("sudo /usr/local/sbin/modShareName.sh ".escapeshellarg(escapeshellcmd($oldShareName))." ". escapeshellarg(escapeshellcmd($share->getName())), $output, $retVal, false);
					if ($retVal !== 0) {
						throw new \Shares\Exception('"modShareName.sh" call failed. Returned with "' . $retVal . '"', 500);
					}
				}

                Link::updateLinkPathsInCache($oldShareName, $share->getName());
			}
		}
		else{
			// Handle target_path: if Share with target_path being renamed, then the symLink referring to old to be deleted
			// & recreated with the new name - target path doesn't change though!
			// Use the Links Model to recreate this Share as a symLink so tracked in the system & we know how to handle if mods needed.
			if($oldShareName != $share->getName()){
				// 1. remove old one
				$linkArray[] = $oldShareName;
				try {
					Link::deleteLinks($linkArray, TRUE, TRUE);
				} catch (LinkException $lnExp) {
					throw new \Core\Rest\Exception('SHARE_CREATE_WITH_TARGET_PATH_FAILED', 500, $lnExp);
				}
				// 2. Create
				$targetLinkMap = array("links" => array(
					"target_path" => trim(trim($share->getTargetPath()), DS),
					"link_path" => $share->getName()));
				try {
					$sessionUsername = UserSecurity::getInstance()->getSessionUsername();
					Link::createLinks($targetLinkMap, $sessionUsername, TRUE);
				} catch (LinkException $lnExp) {
					throw new \Core\Rest\Exception('SHARE_CREATE_WITH_TARGET_PATH_FAILED', 500, $lnExp);
				}

                $nasConfig = parse_ini_file('/etc/nas/config/wd-nas.conf', TRUE);
                if (isset($nasConfig['wd-nas']['NOTIFIER_TRIGGER'])) {
                    $oldTriggerPath = $nasConfig['wd-nas']['NOTIFIER_TRIGGER'] . DS . ".$oldShareName";
                    $newTriggerPath = $nasConfig['wd-nas']['NOTIFIER_TRIGGER'] . DS . ".{$share->getName()}";
                    exec_runtime("sudo rm $oldTriggerPath; sudo touch $newTriggerPath");
                }
			}
		} // Handling Share with target path set

		$mediaServing = $share->getMediaServing() ? "any" : "none";
		exec_runtime("sudo /usr/local/sbin/modShareMediaServing.sh ".escapeshellarg(escapeshellcmd($share->getName()))." " . $mediaServing, $output, $retVal, false);
		if ($retVal) {
			throw new \Shares\Exception('"modShareMediaServing.sh" call failed. Returned with "' . $retVal . '"', 500);
		}

        // Persist the share setting (through the AutoMounter) if the share resides on a USB drive.
        // This allows the share settings to be restored the next time the USB drive is inserted.
        if ($share->isDynamicVolume()) {
            $publicAccess = $share->hasPublicAccess() ? 'true' : 'false';
            $remoteAccess = $share->hasRemoteAccess() ? 'true' : 'false';
            exec_runtime("sudo /usr/local/sbin/wdAutoMountAdm.pm updateShare ".escapeshellarg(escapeshellcmd($oldShareName))." ".escapeshellarg(escapeshellcmd($share->getName()))." ".escapeshellarg(escapeshellcmd($share->getDescription()))."  '$publicAccess' '$mediaServing' '$remoteAccess'", $output, $retVal, false);
            if ($retVal !== 0) {
                throw new \Shares\Exception('"wdAutoMountAdm.pm updateShare" call failed. Returned with "' . $retVal . '"', 500);
            }
        }

        if ($share->getSambaAvailable()) {
            exec_runtime('sudo daemon -U -X "/usr/local/sbin/updateShareConfig.sh"', $output, $retVal);
        }

        UpdateCounts::increment('share');
	}

	public function shareDeleted(\Shares\Model\Share\Share $share) {
		if(!$share->getTargetPath()){
            $shareName = $share->getName();

            try {
                Link::deleteLinksBy(NULL, $shareName, TRUE);
            } catch (\Exception $ex) {
                throw new \Shares\Exception('Deleting links when deleting share failed.', 500, $ex);
            }

            $output = $retVal = null;

            if ($share->getMediaServing()) {
				//remove from DLNA server share list
				exec_runtime("sudo /usr/local/sbin/modShareMediaServing.sh  " . escapeshellarg(escapeshellcmd($share->getName())) . " none", $output, $retVal, false);
				if ($retVal) {
					throw new \Shares\Exception('"modShareMediaServing.sh" call failed. Returned with "' . $retVal . '"', 500);
				}
			}

			exec_runtime("sudo /usr/local/sbin/deleteShare.sh " . escapeshellarg(escapeshellcmd($shareName)) , $output, $retVal, false);

			if ($retVal !== 0) {
				throw new \Shares\Exception('"deleteShare.sh" call failed. Returned with "' . $retVal . '"', 500);
			}
		}
		else{
			// Handle target_path: if specified then the Share being deleted is a symLink referring to a target path.
			// Links Model was used to create this Share so use the same Links to delete it as well.
			$linkArray[] = $share->getName();
			try {
				Link::deleteLinks($linkArray, TRUE, TRUE);
			} catch (LinkException $lnExp) {
				throw new \Core\Rest\Exception('SHARE_CREATE_WITH_TARGET_PATH_FAILED', 500, $lnExp);
			}
		}

        UpdateCounts::increment('share');
	}

	public function accessAdded(\Shares\Model\Share\Share $share, $username, $access) {
        $this->_modAcl($share, $username, $access);
	}

	public function accessModified(\Shares\Model\Share\Share $share, $username, $access) {
        $this->_modAcl($share, $username, $access);
	}

	public function accessDeleted(\Shares\Model\Share\Share $share, $username) {
            $this->_modAcl($share, $username, 'NA');
	}


	protected function _modAcl($share, $username, $access) {
		$output = $retVal = null;

        $typeArg = $share->hasPublicAccess() ? 'public' : 'private';
		exec_runtime("sudo daemon -U -X \"updateShareBindMntDir.sh --update ".escapeshellarg(escapeshellcmd($share->getName()))."  ".$typeArg."\"", $output, $retVal, false);
		if ($retVal !== 0) {
			throw new \Shares\Exception('"updateShareBindMntDir.sh" call failed. Returned with "' . $retVal . '"', 500);
		}
		exec_runtime("sudo daemon -U -X \"updateShareConfig.sh\"", $output, $retVal);
		if ($retVal !== 0) {
			throw new \Shares\Exception('"updateShareConfig.sh" call failed. Returned with "' . $retVal . '"', 500);
		}
		if ($share->isDynamicVolume() && (strcasecmp(getenv("INTERNAL_REQUEST"), 'true') != 0)) {
			$output = $retVal = null;
			exec_runtime("sudo /usr/local/sbin/wdAutoMountAdm.pm updateShareAccess ".escapeshellarg(escapeshellcmd($share->getName()))."   ".escapeshellarg(escapeshellcmd($username))."  ".$access, $output, $retVal, false);
			if ($retVal !== 0) {
				throw new \Shares\Exception('"wdAutoMountAdm.pm updateShareAccess" call failed. Returned with "' . $retVal . '"', 500);
			}
		}

        UpdateCounts::increment('share');
	}
}
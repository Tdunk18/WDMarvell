<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Shares\Model\Share;

use Util\Lock;
use Auth\User\UserSecurity;
use Filesystem\Model\Link;

/**
 * Description of AccessDaoTrait
 *
 * @author sapsford_j
 */


trait AccessDaoTrait  {

	static $LOCK_TIMEOUT = 5000; //milliseconds


    /**
     * Gets a full list of all access on a specified share, or for just the one user
     *   if username is supplied.
     *
     * @param  string $shareName      Share name or Share object
     * @param  string $username   Optional username for a specific ACL.
     * @return mixed if no username supplied: \Shares\Model\Share\AccessList|array  Returns an AccessList of all returned results, or an empty array if none.
     * if username is supplied, returns a \Shares\Model\Share\Access instance containing the access rights for that user
     */
    private function _getShareAccess( $shareName, $username = null ) {
    	$smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath());
    	$shareAccessList = $smbConf->getAccessListForShare($shareName);
    	if (isset($username)) {
            if (isset($shareAccessList[$username])) {
                return $shareAccessList[$username];
            }
    		return null;
    	}
		return $shareAccessList;
    }

    /**
     * Add access levels for users to a share.
     *
     * @param string $shareName the share name to add accesses to.
     * @param array $accesses array with the username keys and values as access levels. Both strings. See SmbConf::addAccessesToShare()
     * @return boolean true on success, false otherwise.
     */
    private function _addAccesses($shareName, array $accesses) {
		$smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath(), \getSmbCopyFilePath());
        $smbConf->addAccessesToShare($shareName, $accesses);
		return true;
    }

    /**
     * Add share access to smb.conf for the user and share contained in the given access object
     * @param Shares\Model\Share\Access $access access object
     * @throws \Shares\Exception
     * @return \Shares\Model\Share\Access
     */
    private function _addAccess(\Shares\Model\Share\Access $addAccess) {
		$smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath(), \getSmbCopyFilePath());
        $smbConf->addAccessesToShare($addAccess->getShareName(), [$addAccess->getUsername() => $addAccess->getAccess()]);
		return true;
    }

    /**
	 * Update the access level to a share for the given share and username in the Access object
	 * @return \Shares\Model\Share\Access access to a share for a given user
     */

    private function _updateAccess(\Shares\Model\Share\Access $access) {
		$username = $access->getUsername();
		$shareName = $access->getShareName();
		$smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath());

		$accessLevel = $access->getAccess();
		$smbConf->modifyAccessToShare($shareName,
									  $username,
									  $accessLevel);
		return true;
    }

    /**
     * delete access to a share for the given share and username in the Access object
     * @return true if successful, else false
     */

    private function _deleteAccess(\Shares\Model\Share\Access $access) {
		$username = $access->getUsername();
		$shareName = $access->getShareName();
		$smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath());
		$smbConf->deleteAccessToShare($shareName, $username);
    	return true;
    }

    /**
     * delete access to all shares for the given username
     * @return \Shares\Model\Share\Access access to a share for a given user
     */

    private function _deleteAllAccessForUser($username) {
		$smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath());
		$allShareAccessList = $smbConf->getAccessListForAllShares();
		foreach($allShareAccessList as $shareName => $shareAccessList) {
			foreach($shareAccessList as $shareAccess) {
				if ($shareAccess->getUsername() == $username) {
					$smbConf->deleteAccessToShare($shareAccess->getShareName(),
														  $shareAccess->getUsername());
				}
			}
		}
		return true;
    }

    /**
     * Rename a user - change username for each access to each share for a single user
     */
    private function _renameUser($oldusername, $newusername) {
		$smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath());
		$allShareAccessList = $smbConf->getAccessListForAllShares();

		foreach($allShareAccessList as $shareName => $shareAccessList) {
			foreach($shareAccessList as $shareAccess) {
				if ($shareAccess->getUsername() == $oldusername) {
					$smbConf->deleteAccessToShare($shareAccess->getShareName(), $oldusername);
					$smbConf->addAccessesToShare($shareAccess->getShareName(), [$newusername => $shareAccess->getAccess()]);
				}
			}
		}
		return true;
    }

}

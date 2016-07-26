<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */


namespace Shares\Model\Share;


/**
 * Description of SharesDao
 *
 * DAO trait for shares
 *
 * @author sapsford_j
 */


trait SharesDaoTrait  {

    /**
     * Returns a list of all shares defined in the smb.conf file as a Model\ShareList object of Model\Share objects.
     *
     * @return \Shares\Model\ShareList|array Returns an ShareList of all returned results, or an empty array if none
     */
    private function _getShares() {
        $smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath(), \getSmbCopyFilePath());
        $shares = $smbConf->getShares();
    	if (!empty($shares)) {
	        return $shares;
    	}
    	return null;
    }

    /**
     * Returns a specific share as a Model\Share object.
     *
     * @param string $shareName
     * @return \Shares\Model\Share|null
     */
    private function _getShareByName($shareName) {
        $smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath(), \getSmbCopyFilePath());
        $share = $smbConf->getShare($shareName);
		return $share;
    }

    /**
     * Adds a new Model\Share to the cached share list and to the samba smb.conf file.
     *
     * @param \Shares\Model\Share $share
     * @return \Shares\Model\Share
     */
    private function _add(Share $share) {
		require_once(COMMON_ROOT . '/includes/globalconfig.inc');
		$smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath(), \getSmbCopyFilePath());
		$smbConf->addShare($share);
		return true;
    }

    /**
     * Updates share details within the cached share list and the samba smb.conf file
     *
     * @param $shareName - name of share.
     * @param \Shares\Model\Share $share
     * @return \Shares\Model\Share
     */
    private function _update($oldShareName, Share $share) {
   	 	require_once(COMMON_ROOT . '/includes/globalconfig.inc');
		$smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath(), \getSmbCopyFilePath());
		$smbConf->modifyShare($oldShareName, $share);
		return $share;
    }

    /**
     * Refreshes the cached share list from smb.conf to reflect the deletion
     *
     * @param  shareName name of share to delete.
     * @return true if successful, else false
     */
    private function _delete($shareName) {
		$smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath(), \getSmbCopyFilePath());
		$smbConf->deleteShare($shareName);
		return true;
    }

    /**
	 * Get the Share Names
	 *
	 * @return a one-dimensional array of share names,
	 * false if no shares
	 *
	 */

	private function _getShareNames() {
        $smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath(), \getSmbCopyFilePath());
        return array_keys($smbConf->getShareNames());
	}

	/**
	 * Check if share exists
	 */

	private function _shareExists($shareName) {
        $smbConf = new \Shares\Model\Smb\SmbConf(\getSmbFilePath(), \getSmbCopyFilePath());
        return isset($smbConf->getShareNames()[$shareName]);
	}
}

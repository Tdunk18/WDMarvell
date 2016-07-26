<?php
namespace Shares\Model\Share\Listener\Windows;

class ShareListener implements \Shares\Model\Share\Listener\ShareListenerInterface {
	
	public function shareAdded(\Shares\Model\Share\Share $share ) {
		throw new Exception(__FUNCTION__ . ' not supported on current Windows platform');
	}

	public function shareModified( $shareName, $oldShare) {
		throw new Exception(__FUNCTION__ . ' not supported on current Windows platform');
	}

	public function shareDeleted(\Shares\Model\Share\Share $share) {
		throw new Exception(__FUNCTION__ . ' not supported on current Windows platform');
	}

	public function accessAdded(\Shares\Model\Share\Share $share, $userName, $access) {
		throw new Exception(__FUNCTION__ . ' not supported on current Windows platform');
	}

	public function accessModified(\Shares\Model\Share\Share $share, $userName, $access) {
		throw new Exception(__FUNCTION__ . ' not supported on current Windows platform');
	}

	public function accessDeleted(\Shares\Model\Share\Share $share, $username) {
		throw new Exception(__FUNCTION__ . ' not supported on current Windows platform');
	}


}
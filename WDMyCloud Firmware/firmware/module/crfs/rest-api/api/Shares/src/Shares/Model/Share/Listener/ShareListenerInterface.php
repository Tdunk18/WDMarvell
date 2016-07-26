<?php

	namespace Shares\Model\Share\Listener;
	
	/**
	 * ShareListenerInterface
	 * 
	 * @author sapsford_j
	 *
	 */
	
	interface ShareListenerInterface {
		
		public function shareAdded(\Shares\Model\Share\Share $share );
		
		public function shareModified( $shareName, $oldShare);
		
		public function shareDeleted(\Shares\Model\Share\Share $share);
		
		public function accessAdded(\Shares\Model\Share\Share $share, $username, $access);
		
		public function accessModified(\Shares\Model\Share\Share $share, $username, $access);
		
		public function accessDeleted(\Shares\Model\Share\Share $share, $username);
		
		
	}

//tests faster than doing a recursive delete within php
function deleteDirRecursively($dirPath) {
    $output = $returnVal = null;
    exec_runtime("rm -rf '$dirPath'", $output, $returnVal);
    return $returnVal === 0;
}

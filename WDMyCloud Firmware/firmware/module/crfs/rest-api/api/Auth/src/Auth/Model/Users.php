<?php
namespace Auth\Model;

class Users
{
	public static function getColabSpacesAndPLSForUser($username, $findPLSs=false, $shareNameOfTargetPaths="") {
		$colaborativeSpacesAndPLSsOwned = array();
		$sharesPath = getSharePath();
		$sharesDao = new \Shares\Model\Share\SharesDao();
		$shareDetails = $sharesDao->getAll();
		foreach ($shareDetails as $share) {
			$shareNameInLoop = $share->getName();
			
			//check for collaborative spaces owned
			$targetPath = $share->getTargetPath();
			if(!empty($targetPath)){
				//we have to look up the owner of the share on the filesystem for ColSpaces
				$ownerOfShareLink = posix_getpwuid(lstat($sharesPath . DS . $shareNameInLoop)['uid'])['name'];
				
				//if $shareNameOfTargetPaths was passed we only want ColSpace shares owned by this user with target paths in the share passed (for share access clean up)
				//otherwise we want all ColSpace shares
				if(!empty($shareNameOfTargetPaths)){
					$targetPathParts = explode(DS, $targetPath);
				}
				if($ownerOfShareLink == $username && (empty($shareNameOfTargetPaths) || $targetPathParts[1]==$shareNameOfTargetPaths)){
					$colaborativeSpacesAndPLSsOwned[] = $shareNameInLoop;
				}
			}
			
			//if we are required to ind PLS too look them up by share access locked flag and the only user who has access to them
			if($findPLSs){
				if($share->getShareAccessLocked()){
					$shareAccessList = $sharesDao->getAccessToShare($shareNameInLoop);
					$access = current($shareAccessList);
					if(is_object($access) && $access->getUsername() == $username){
						$colaborativeSpacesAndPLSsOwned[] = $shareNameInLoop;
					}
				}
			}
		}
		return $colaborativeSpacesAndPLSsOwned;
	}

}

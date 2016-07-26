<?php
/**
 * The Filesystem\Model\Link class file.
 */

namespace Filesystem\Model;

setlocale(LC_ALL, 'en_US.utf8');

/**
 * The Link model is responsible for managing links in the share path.
 */
class Link
{
    private static $_cache = FALSE;

    /**
     * Creates symbolic links in the filesystem.
     *
     * @param array $map arrays with target_path and link_path keys, each are paths starting with a share (eg. Public/theLink).
     * @param string $username user to use for the link owner
     * @param bool $allowAtShareRoot True to allow a link name that is at the same level as a share (eg. {share_root}/theLink), not under a share.
     *                               Also bypasses the requirment that a link name cannot be within a share that has a target path.
     * @throws LinkException Creating a link is not possible.
     * @return void
     */
    public static function createLinks(array $map, $username, $allowAtShareRoot = FALSE)
    {
        clearstatcache(TRUE);

        foreach ($map as &$entry) {
            list($entry['target_path'], $entry['target_abs_path'], $targetShare) = self::_validateTarget($entry['target_path']);
            list($entry['link_path'], $entry['link_abs_path'], $linkShare) = self::_validatePotentialLink($entry['link_path'], $allowAtShareRoot);

            if ($targetShare->getVolumeId() !== $linkShare->getVolumeId()) {
                throw new LinkException('LINK_AND_TARGET_VOLUME_MISMATCH', 400);
            }
        }
        unset($entry);//to prevent next loop iterating wrong

        $chown = function($paths, $username) {
            $returnVal = NULL;
            system("sudo chown -h {$username} {$paths}", $returnVal);
            if ($returnVal !== 0) {
                throw new LinkException('ERROR_CREATING_LINK', 500);
            }
        };

        self::_initCache();

        $linkPaths = '';
        $escapedUsername = escapeshellarg($username);
        foreach ($map as $entry) {
            unlink($entry['link_abs_path']);
            if (!symlink($entry['target_abs_path'], $entry['link_abs_path'])) {
                throw new LinkException('ERROR_CREATING_LINK', 500);
            }

            $linkPaths .= escapeshellarg($entry['link_abs_path']) . ' ';
            if (strlen($linkPaths) > 3000) {
                $chown($linkPaths, $escapedUsername);
                $linkPaths = '';
            }

            //if target path is changing, unset a possible cached existing link_path
            foreach (self::$_cache['maps'] as &$cachedLinks) {
                unset($cachedLinks[$entry['link_path']]);
            }

            if (!isset(self::$_cache['maps'][$entry['target_path']])) {
                self::$_cache['maps'][$entry['target_path']] = [];
            }

            self::$_cache['maps'][$entry['target_path']][$entry['link_path']] = $username;
        }

        apc_store('links', self::$_cache);

        if (!empty($linkPaths)) {
            $chown($linkPaths, $username);
        }
    }

    /**
     * Get link/target mapping from a link path.
     *
     * @param string $linkPath a path starting with a share to a link to get the mapping for (eg. Public/theLink).
     * @param boolean $skipValidatingLinkPath a boolean to indicate whether validation (and throwing) should be done on $linkPath beyond path cleaning.
     * @param bool $skipTargetAccessibilityCheck Whether or not to skip the target share permissions check.
     * @return array arrays with link_path, target_path and username.
     */
    public static function getMapFromLink($linkPath, $skipValidatingLinkPath = TRUE, $skipTargetAccessibilityCheck = FALSE)
    {
        clearstatcache(TRUE);

        if ($skipValidatingLinkPath) {
            $linkPath = self::_cleanPath($linkPath);
        } else {
            list($linkPath, ) = self::_validateExistingLink($linkPath);
        }

        self::_initCache();

        //find link path in cached links
        $targetPath = NULL;
        $owner = NULL;
        foreach (self::$_cache['maps'] as $cachedTargetPath => $cachedLinks) {
            if (isset($cachedLinks[$linkPath])) {
                $targetPath = $cachedTargetPath;
                $owner = $cachedLinks[$linkPath];
                break;
            }
        }

        if ($targetPath === NULL || (!$skipTargetAccessibilityCheck && !(new \Shares\Model\Share\SharesDao())->isShareAccessible(explode(DS, $targetPath)[1], TRUE, FALSE))) {
            return [];
        }

        return [
            ['link_path' => $linkPath, 'target_path' => $targetPath, 'owner' => $owner],
        ];
    }

    /**
     * Get link/target mapping from a target path.
     * Shares that are links(Collaborative spaces) do not get included
     *
     * @param string $targetPath target path starting with a share to search for links in (eg. Public/dir).
     * @param boolean $skipValidatingTargetPath a boolean to indicate whether validation (and throwing) should be done on $targetPath beyond path cleaning.
     * @param boolean $excludeShareWithTarget true to exclude shares with a target path (Collaborative shares), false to include.
     * @param boolean $skipLinkAccessibilityCheck Whether or not to skip the link share permissions check.
     * @return array arrays with link_path, target_path and username
     */
    public static function getMapFromTarget($targetPath, $skipValidatingTargetPath = TRUE, $excludeShareWithTarget = TRUE, $skipLinkAccessibilityCheck = FALSE)
    {
        clearstatcache(TRUE);

        if ($skipValidatingTargetPath) {
            $targetPath = self::_cleanPath($targetPath);
        } else {
            list($targetPath, ) = self::_validateTarget($targetPath);
        }

        self::_initCache();

        if (!isset(self::$_cache['maps'][$targetPath])) {
            return [];
        }

        $results = [];
        $sharesDao = new \Shares\Model\Share\SharesDao();
        foreach (self::$_cache['maps'][$targetPath] as $linkPath => $owner) {
            $linkPathExploded = explode(DS, $linkPath);
            //exclude Collaborative spaces in this step
            if (($excludeShareWithTarget && count($linkPathExploded)<3) || (!$skipLinkAccessibilityCheck && !$sharesDao->isShareAccessible($linkPathExploded[1], TRUE, FALSE))) {
                continue;
            }

            $results[] = [
                'link_path' => $linkPath,
                'target_path' => $targetPath,
                'owner' => $owner,
            ];
        }

        return $results;
    }

	/**
	 * Get link/target mapping from a target path prefix.
	 * Shares that are links(Collaborative spaces) do not get included.
	 *
	 * @param string $targetPathPrefix A prefix to a target_path. Example: "/ , "/Public" or "/Public/testDir" but "/Publ" or "/Public/dir/sharedFile.txt" would match nothing.
	 * @param boolean $skipAccessibilityCheck Whether or not to skip the share permissions check.
	 * @param boolean $excludeShareWithTarget true to exclude shares with a target path (Collaborative shares), false to include.
	 * @return array array with target paths as [0 => '/Public/testDir/file', 1 => '/Public/myPics']
	 */
	public static function getTargetsFromTargetPrefix($targetPathPrefix, $skipAccessibilityCheck = FALSE, $excludeShareWithTarget=TRUE){
		clearstatcache(TRUE);

		$targetPathPrefix = self::_cleanPath($targetPathPrefix);

		self::_initCache();

		$sharesDao = new \Shares\Model\Share\SharesDao();

		$results = [];
		foreach (self::$_cache['maps'] as $targetPath => $cachedLinks) {
			if (strpos($targetPath, $targetPathPrefix. DS) !== 0 && $targetPathPrefix !== DS) {
				continue;
			}

			if (!$skipAccessibilityCheck && !$sharesDao->isShareAccessible(explode(DS, $targetPath, 3)[1], TRUE, FALSE)) {
				continue;
			}

			foreach ($cachedLinks as $linkPath => $owner) {
				$linkPathExploded = explode(DS, $linkPath);
				//exclude Collaborative spaces in this step
				if ($excludeShareWithTarget && count($linkPathExploded)< 3 || (!$skipAccessibilityCheck && !$sharesDao->isShareAccessible($linkPathExploded[1], TRUE, FALSE))) {
					continue;
				}

				$results[] = $targetPath;
			}
		}

		return $results;

	}

    /**
     * Get link/target mapping from a link path prefix.
     * Shares that are links(Collaborative spaces) do not get included.
     *
     * @param string $linkPathPrefix A prefix to a link_path. Example, "/ , "/PublicLS" or "/PublicLS/linkOne" but "/Publ" would match nothing.
     * @param boolean $skipAccessibilityCheck Whether or not to skip the share permissions check.
     * @return array arrays with link_path, target_path and username
     */
    public static function getMapFromLinkPrefix($linkPathPrefix, $skipAccessibilityCheck = FALSE)
    {
        clearstatcache(TRUE);

        $linkPathPrefix = self::_cleanPath($linkPathPrefix);

        self::_initCache();

        $sharesDao = new \Shares\Model\Share\SharesDao();

        $results = [];
        foreach (self::$_cache['maps'] as $targetPath => $cachedLinks) {
            if (!$skipAccessibilityCheck && !$sharesDao->isShareAccessible(explode(DS, $targetPath, 3)[1], TRUE, FALSE)) {
                continue;
            }

            foreach ($cachedLinks as $linkPath => $owner) {
                if (strpos($linkPath . DS, $linkPathPrefix . DS) !== 0 && $linkPathPrefix !== DS) {
                    continue;
                }

                $linkPathExploded = explode(DS, $linkPath);
                //exclude Collaborative spaces in this step
                if (count($linkPathExploded)< 3 || (!$skipAccessibilityCheck && !$sharesDao->isShareAccessible($linkPathExploded[1], TRUE, FALSE))) {
                    continue;
                }

                $results[] = [
                    'link_path' => $linkPath,
                    'target_path' => $targetPath,
                    'owner' => $owner,
                ];
            }
        }

        return $results;
    }

    /**
     * Delete links by owner and/or link/target share name. Shares that are links(Collaborative spaces) do not get deleted.
     *
     * @param string $owner the owner's username. If empty() go through all links.
     * @param string $shareName share name for the link OR target. If empty() go through all links
     * @param bool $skipAccessibilityCheck Whether or not to skip the share permissions check.
     * @throws LinkException Thrown when unable to delete the link.
     * @return void
     */
    public static function deleteLinksBy($owner = NULL, $shareName = NULL, $skipAccessibilityCheck = FALSE)
    {
        clearstatcache(TRUE);

        self::_initCache();

        $sharesDao = new \Shares\Model\Share\SharesDao();

        $toUnlink = [];//key is link path, value is target path
        foreach (self::$_cache['maps'] as $targetPath => $cachedLinks) {
            $targetPathParts = explode(DS, $targetPath);
            foreach ($cachedLinks as $linkPath => $linkOwner) {
                if (!empty($owner) && $linkOwner !== $owner) {
                    continue;
                }
                //exclude Collaborative space shares, the link paths that are in shares root location
                $linkPathParts = explode(DS, $linkPath);
                if(count($linkPathParts)<=2){
                    continue;
                }

                if (!empty($shareName) && $linkPathParts[1] !== $shareName && $targetPathParts[1] !== $shareName) {
                    continue;
                }

                if (!$skipAccessibilityCheck && !$sharesDao->isShareAccessible($linkPathParts[1], TRUE, FALSE)) {
                    throw new LinkException('SHARE_INACCESSIBLE', 401);
                }

                $toUnlink[$linkPath] = $targetPath;
            }
        }
        $sharePath = getSharePath();
        foreach ($toUnlink as $linkPath => $targetPath) {
            if (!unlink($sharePath . $linkPath)) {
                throw new LinkException('ERROR_DELETING_LINK', 500);
            }

            unset(self::$_cache['maps'][$targetPath][$linkPath]);
        }

        apc_store('links', self::$_cache);
    }

    /**
     * Delete links from the share path.
     *
     * @param array $linkPaths values are paths starting with a share of links to delete (eg. Public/theLink).
     * @param bool $skipAccessibilityCheck Whether or not to skip the share permission check.
     * @param bool $allowSharesDeletion Whether or not to allow shares that are links to be deleted.
     * @throws LinkException Thrown when unable to delete the link.
     * @return void
     */
    public static function deleteLinks(array $linkPaths, $skipAccessibilityCheck = FALSE, $allowSharesDeletion = FALSE)
    {
        clearstatcache(TRUE);

        $toUnlink = [];//key is original path, value is absolute
        foreach ($linkPaths as $linkPath) {
            list($linkPath, $linkAbsPath) = self::_validateExistingLink($linkPath, $skipAccessibilityCheck, $allowSharesDeletion);
            $toUnlink[$linkPath] = $linkAbsPath;
        }

        self::_initCache();

        foreach ($toUnlink as $linkPath => $linkAbsPath) {
            if (!unlink($linkAbsPath)) {
                throw new LinkException('ERROR_DELETING_LINK', 500);
            }

            foreach (self::$_cache['maps'] as $cachedTargetPath => &$cachedLinks) {
                unset($cachedLinks[$linkPath]);
            }
        }

        apc_store('links', self::$_cache);
    }

    /**
     * Update link paths in the cache that have the $oldShareName, changing to the $newShareName.
     * NOTE: NOT TO BE CALLED FROM A CONTROLLER AS IT DOES NO PERMISSION CHECKS.
     *
     * @param string $oldShareName a share name to search for within the cache
     * @param string $newShareName a share name to set when $oldShareName is found
     */
    public static function updateLinkPathsInCache($oldShareName, $newShareName) {
        self::_initCache();

        $oldShareName = DS . $oldShareName . DS;
        $newShareName = DS . $newShareName . DS;

        $changed = FALSE;
        foreach (self::$_cache['maps'] as $targetPath => &$cachedLinks) {
            foreach ($cachedLinks as $linkPath => $linkOwner) {
                if (strpos($linkPath, $oldShareName) !== 0) {
                    continue;
                }

                $newLinkPath = $newShareName . explode($oldShareName, $linkPath, 2)[1];

                unset($cachedLinks[$linkPath]);
                $cachedLinks[$newLinkPath] = $linkOwner;
                $changed = TRUE;
            }
        }

        if ($changed) {
            apc_store('links', self::$_cache);
        }
    }

    /**
     * Resolves the $path given (without checking it against the filesystem), getting (assuming shares path is /shares in examples):
     *     1. share name (eg. Public)
     *     2. path at or under shares path (eg. /Public/boo.jpg or /SomeShare)
     *     3. an abs path using shares path (eg. /shares/Public/boo.jpg or /shares/SomeShare)
     *
     * @param string $path
     * @return array first value share name, second value is path under the shares path, third is a full abs path.
     *     If not found at or under a share then an array of three nulls is returned. Result safe to use with list().
     */
    public static function resolveInShares($path)
    {
        $sharesPath = getSharesPath();
        foreach ((new \Shares\Model\Share\SharesDao())->getAllNames() as $shareName) {
            $realPathOfShare = realpath($sharesPath . DS . $shareName);
            if (strpos($path, $realPathOfShare) !== 0) {
                continue;
            }

            $pathUnderShare = explode($realPathOfShare, $path, 2)[1];

            $pathInShares = DS . $shareName . $pathUnderShare;
            $fullPath = $sharesPath . $pathInShares;
            return [$shareName, $pathInShares, $fullPath];
        }

        return [NULL, NULL, NULL];
    }

    /**
     * Resolve as much of the path that exists, keeping the portion that does not.
     *
     * @param string $path the path to resolve
     * @return string the partial resolved path
     */
    public static function partialRealPath($path)
    {
        for ($dir = $path; $dir !== '.'; $dir = dirname($dir)) {
            $realPath = realpath($dir);
            if ($realPath !== FALSE) {
                //if $dir = $path then the explode returns two empty strings, and this just returns $realPath.
                return $realPath . explode($dir, $path, 2)[1];
            }
        }

        return $path;
    }

    /**
     * Validate the target of a link.
     *
     * @param string $targetPath A path starting with a share that should be a valid target (eg. Public/dir).
     * @return array two strings, one a cleaned target path and the other an absolute filesystem path to the target, and the target share object
     */
    protected static function _validateTarget($targetPath)
    {
        $targetPath = self::_cleanPath($targetPath);
        self::_errorOnPathMetaChars($targetPath);
        $targetPathParts = explode(DS, $targetPath);

        $sharesDao = new \Shares\Model\Share\SharesDao();
        if (!$sharesDao->isShareAccessible($targetPathParts[1], TRUE, FALSE)) {
            throw new LinkException('SHARE_INACCESSIBLE', 401);
        }

        $targetAbsPath = getSharePath() . $targetPath;
        if (!file_exists($targetAbsPath)) {
            throw new LinkException('TARGET_DOES_NOT_EXIST', 400);
        }

        if (is_link($targetAbsPath) || (!is_file($targetAbsPath) && !is_dir($targetAbsPath))) {
            throw new LinkException('TARGET_IS_NOT_FILE_OR_DIR', 400);
        }

        if (count($targetPathParts) < 3) {
            throw new LinkException('TARGET_NOT_WITHIN_SHARE', 400);
        }

        $share = $sharesDao->get($targetPathParts[1]);
        if (!$share) {
            throw new LinkException('SHARE_NOT_FOUND', 404);
        }

        if ($share->isDynamicVolume()) {
            throw new LinkException('TARGET_WITHIN_DYNAMIC_VOLUME', 400);
        }

        if ($share->getTargetPath()) {
            throw new LinkException('TARGET_WITHIN_SHARE_WITH_TARGET', 400);
        }

        return [$targetPath, $targetAbsPath, $share];
    }

    /**
     * Validate whether an existing link is valid.
     *
     * @param string $linkPath A path starting with a share where a link should exist (eg. Public/theLink).
     * @param bool $skipAccessibilityCheck Whether or not to skip the share permission check.
     * @return array two strings, one a cleaned link path and the other an absolute filesystem path to the link
     */
    protected static function _validateExistingLink($linkPath, $skipAccessibilityCheck = FALSE, $allowShares = FALSE)
    {
        $linkPath = self::_cleanPath($linkPath);
        self::_errorOnPathMetaChars($linkPath);
        $linkPathParts = explode(DS, $linkPath);
        
        if(!$allowShares && count($linkPathParts)<=2){
            throw new LinkException('LINK_IS_A_SHARE', 400);
        }
        
        if (!$skipAccessibilityCheck && !(new \Shares\Model\Share\SharesDao())->isShareAccessible($linkPathParts[1], TRUE, FALSE)) {
            throw new LinkException('SHARE_INACCESSIBLE', 401);
        }

        $linkAbsPath = getSharePath() . $linkPath;
        if (!is_link($linkAbsPath)) {
            if (file_exists($linkAbsPath)) {
                throw new LinkException('PATH_IS_NOT_A_LINK', 400);
            }

            throw new LinkException('LINK_DOES_NOT_EXIST', 400);
        }

        return [$linkPath, $linkAbsPath];
    }

    /**
     * Validate whether a filepath is a candidate to create a link.
     *
     * @param string $linkPath A path starting with a share where a link is to be created (eg. Public/theLink).
     * @param bool $allowAtShareRoot True to allow a link name that is at the same level as a share (eg. {share_root}/theLink), not under a share.
     *                               Also bypasses the requirment that a link name cannot be within a share that has a target path.
     * @return array two strings, one a cleaned link path and the other an absolute filesystem path to the potential link, and the link share object
     */
    protected static function _validatePotentialLink($linkPath, $allowAtShareRoot = FALSE)
    {
        $linkPath = self::_cleanPath($linkPath);
        self::_errorOnPathMetaChars($linkPath);
        $linkPathParts = explode(DS, $linkPath);

        $sharesDao = new \Shares\Model\Share\SharesDao();

        $share = $sharesDao->get($linkPathParts[1]);
        if (!$share) {
            throw new LinkException('SHARE_NOT_FOUND', 404);
        }

        if (!$sharesDao->isShareAccessible($linkPathParts[1], TRUE, FALSE)) {
            throw new LinkException('SHARE_INACCESSIBLE', 401);
        }

        $linkAbsPath = getSharePath() . $linkPath;
        if (file_exists($linkAbsPath) && !is_link($linkAbsPath)) {
            throw new LinkException('FILE_EXISTS_AND_NOT_A_LINK', 400);
        }

        $linkPathPartCount = count($linkPathParts);
        if ($allowAtShareRoot) {
            if ($linkPathPartCount !== 2 && $linkPathPartCount !== 3) {
                throw new LinkException('LINK_NAME_NOT_SHARE_ROOT_OR_CHILD', 400);
            }
        } else {
            if ($share->getTargetPath()) {
                throw new LinkException('LINK_CANNOT_BE_WITHIN_SHARE_WITH_TARGET', 400);
            }

            if ($linkPathPartCount !== 3) {
                throw new LinkException('LINK_NAME_NOT_CHILD_OF_SHARE_ROOT', 400);
            }
        }

        if ($share->isDynamicVolume()) {
            throw new LinkException('LINK_WITHIN_DYNAMIC_VOLUME', 400);
        }

        return [$linkPath, $linkAbsPath, $share];
    }

    /**
     * Clean a target or link path. Trims white space and then directory seperator off both ends.
     *
     * @param string $path the path to be cleaned
     * @return string a cleaned path
     */
    protected static function _cleanPath($path)
    {
        return DS . trim(trim($path), DS);
    }

    /**
     * Error if path meta chars '..' or '.' are in a cleaned path.
     *
     * @param string $cleanedPath a path that has been run through _cleanPath().
     *
     * @throws LinkException throws INVALID_PATH with code 400.
     */
    protected static function _errorOnPathMetaChars($cleanedPath)
    {
        //cleaned paths start with a DS but don't end with one, and file/dir names can have '..' within them such as '..boo' so we don't want to accidently match that.
        $cleanedPath .= DS;
        if (strpos($cleanedPath, DS . '..' . DS) !== FALSE || strpos($cleanedPath, DS . '.' . DS) !== FALSE) {
            throw new LinkException('INVALID_PATH', 400);
        }
    }

    /**
     * If static var is not null and cache is not in APC, build cache and store in static var and apc.
     *
     * This inlcudes shares that are links (Collaborative Spaces).
     */
    protected static function _initCache()
    {
        if (self::$_cache !== FALSE) {
            return;
        }

        self::$_cache = apc_fetch('links');
        if (self::$_cache !== FALSE) {
            return;
        }

        $cachedMaps = [];
        $sharesPath = getSharePath();
        $shares = (new \Shares\Model\Share\SharesDao())->getAll();
        
        foreach ($shares as $share) {
            $shareName = $share->getName();
            $targetPath = $share->getTargetPath();
            if(!empty($targetPath)){
                $linkPath = DS  . $shareName;
                $cachedMaps[$targetPath][$linkPath] = posix_getpwuid(lstat($sharesPath . $linkPath)['uid'])['name'];
                continue;
            }
            $sharePath = $sharesPath . DS  . $shareName;
            foreach (scandir($sharePath, SCANDIR_SORT_NONE) as $name) {
                if ($name === '.' || $name === '..') {
                    continue;
                }

                $pathToResolve = $sharePath . DS . $name;
                if (!is_link($pathToResolve)) {
                    continue;
                }

                $pathWithinLink = readlink($pathToResolve);
                if ($pathWithinLink[0] !== DS) {//to check if the target is relative or absolute
                    $pathWithinLink = dirname($pathToResolve) . DS . $pathWithinLink;
                }
                $partialRealPath = self::partialRealPath($pathWithinLink);

                list(, $targetPath, ) = self::resolveInShares($partialRealPath);

                if ($targetPath === NULL) {
                    continue;
                }

                if (!isset($cachedMaps[$targetPath])) {
                    $cachedMaps[$targetPath] = [];
                }
    
                $linkPath = DS . $shareName . DS . $name;
                $cachedMaps[$targetPath][$linkPath] = posix_getpwuid(lstat($sharesPath . $linkPath)['uid'])['name'];
            }
        }

        self::$_cache = ['maps' => $cachedMaps];
        apc_store('links', self::$_cache);
    }
}

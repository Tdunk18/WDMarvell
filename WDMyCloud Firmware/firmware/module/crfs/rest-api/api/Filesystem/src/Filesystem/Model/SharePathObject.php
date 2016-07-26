<?php

namespace Filesystem\Model;

require_once implode(DS, [COMMON_ROOT, 'includes', 'security.inc']); // isShareAccessible()
require_once implode(DS, [COMMON_ROOT, 'includes', 'util.inc']); // isPathLegal(), isFileLfs()
require_once implode(DS, [COMMON_ROOT, 'includes', 'requestscope.inc']); // \RequestScope
require_once implode(DS, [FILESYSTEM_ROOT, 'includes', 'db', 'multidb.inc']); // getShareCrawlerDbPath()

use \Shares\Model\Share\SharesDao;

/**
 * An object for encapsulating the logic pertaining to share paths.
 */
class SharePathObject
{
    /**
     * The name of the share this path is in. (ie: "Bob")
     *
     * @var string
     */
    protected $_shareName;
    /**
     * The root of the share the path is within. (ie: "/shares/Bob")
     *
     * @var string
     */
    protected $_shareRoot;
    /**
     * The path relative to the share root (ie: "someFile.txt" in "/shares/Bob/someFile.txt")
     *
     * @var string
     */
    protected $_relativePath;
    /**
     * A VolumePathObject for this SharePathObject
     *
     * @var VolumePathObject
     */
    protected $_volumePath;

    /**
     * An internal reference to a Share Manager.
     *
     * @var \Shares\Manager\CrudInterface
     */
    protected static $_shareManager;
    /**
     * An array of share root directories.
     *
     * @var array
     */
    protected static $_shareRoots;

    protected function __construct($shareName, $shareRoot, $relativePath = '')
    {
        $this->_shareName    = $shareName;
        $this->_shareRoot    = $shareRoot;
        $this->_relativePath = $relativePath;
    }

    /**
     * Returns the name of the share the share path belongs to.
     *
     * @return string
     */
    public function getShareName()
    {
       return $this->_shareName;
    }

    /**
     * Returns the root path of the share.
     *
     * @return string
     */
    public function getShareRoot()
    {
        return $this->_shareRoot;
    }

    /**
     * Returns the Crawler DB path for the share.
     *
     * @return string
     */
    public function getCrawlerDbPath()
    {
        return getShareCrawlerDbPath($this->getShareName());
    }

    /**
     * Returns the path relative to the root of the share.
     *
     * @return string
     */
    public function getRelativePath()
    {
        return $this->_relativePath;
    }

    /**
     * Returns the absolute share path.
     *
     * @return string
     */
    public function getAbsolutePath()
    {
        return rtrim($this->_shareRoot . DS . $this->_relativePath, DS);
    }

    /**
     * Returns the VolumePathObject for this SharePathObject.
     *
     * @return VolumePathObject
     */
    public function getVolumePath()
    {
        if (!isset($this->_volumePath))
        {
            $this->_volumePath = VolumePathObject::createFromSharePath($this);
        }

        return $this->_volumePath;
    }

    /**
     * Converts a Share Path to a URL Path array.
     *
     * @return array
     */
    public function toUrlPath()
    {
        $pieces = explode(DS, $this->getRelativePath());

        array_unshift($pieces, $this->getShareName());

        return $pieces;
    }

    /**
     * A helper function which returns the absolute share path.
     *
     * @return string
     */
    public function __toString()
    {
        return $this->getAbsolutePath();
    }

    /**
     * Whether or not the path exists in the filesystem.
     *
     * @return boolean
     */
    public function exists()
    {
        return file_exists($this->getAbsolutePath());
    }

    /**
     * Whether or not the path is a directory.
     *
     * @return boolean
     */
    public function isDir()
    {
        return is_dir($this->getAbsolutePath());
    }

    /**
     * Whether or not the path is a directory.
     *
     * @return boolean
     */
    public function isFile()
    {
        $absPath = $this->getAbsolutePath();

        return is_file($absPath) || isFileLfs($absPath);
    }

    /**
     * Whether or not the path is a directory.
     *
     * @return boolean
     */
    public function isLink()
    {
        return is_link($this->getAbsolutePath());
    }

    /**
     * Returns the real path if the SharePathObject is a link.
     *
     * @throws SharePathException Thrown if the SharePath is not a link.
     * @return string
     */
    public function readLink()
    {
        if (!$this->isLink())
        {
            throw new SharePathException('INVALID_PATH', 400);
        }

        return readlink($this->getAbsolutePath());
    }

    /**
     * Removes a file if it is accessible and it exists.
     *
     * @throws SharePathException Thrown if the path is not accessible, doesn't exist, or the delete fails.
     * @return boolean
     */
    public function delete()
    {
        if (!$this->isAccessible(TRUE, FALSE))
        {
            throw new SharePathException('USER_NOT_AUTHORIZED', 401);
        }

        if (!$this->exists())
        {
            throw new SharePathException('FILE_NOT_FOUND', 404);
        }

    	if (!@unlink($this->getAbsolutePath()))
    	{
    		throw new SharePathException('FILE_DELETE_FAILED', 500);
    	}

    	return TRUE;
    }

    /**
     * Whether or not the path is accessible for the currently logged in user.
     *
     * @param bool $isWriteRequested Whether or not modification is required.
     * @param bool $allowAdminOverride Whether or not the admin user's can override ownership requirements
     * @return boolean
     */
    public function isAccessible($isWriteRequested, $allowAdminOverride = TRUE)
    {
        return (new SharesDao())->isShareAccessible($this->getShareName(), $isWriteRequested, $allowAdminOverride);
    }

    /**
     * A UTF-8 safe way of determining the dirname() equivalent of a share path object.
     *
     * @return string
     * @see http://www.php.net/dirname
     */
    public function getDirname()
    {
        $absolutePath = $this->getAbsolutePath();
        $lastDsPos    = mb_strrpos($absolutePath, DS);

        return mb_substr($absolutePath, 0, $lastDsPos);
    }

    /**
     * A UTF-8 safe way of determining the basename() equivalent of a share path object.
     *
     * @return string
     * @see http://www.php.net/basename
     */
    public function getBasename()
    {
        $absolutePath = $this->getAbsolutePath();
        $lastDsPos    = mb_strrpos($absolutePath, DS);

        return mb_substr($absolutePath, $lastDsPos + 1);
    }


    /**
     * Returns the an array of share roots.
     *
     * @return array
     */
    protected static function _getShareRoots()
    {
        if (!isset(static::$_shareRoots))
        {
            static::$_shareRoots = [];

            foreach ((new SharesDao())->getAll() as $share)
            {
                static::_setShareRoot($share);
            }
        }
        return static::$_shareRoots;
    }

    /**
     * Adds a share root to the protected static $_sharRoots array using a \Shares\Model\Share object.
     *
     * @param \Shares\Model\Share $share
     */
    protected static function _setShareRoot(\Shares\Model\Share\Share $share)
    {
        //remove any trailing directory seperator
        
        $sharePath = rtrim($share->getSymbolicPath(), DS);
        if (strpos($sharePath, DS) !== 0) {
        		//add leading directory seperator
                $sharePath = DS . $sharePath;
        }
        static::$_shareRoots[$share->getName()] = $sharePath;
    	
    }

    /**
     * Returns the share root for a given share name.
     *
     * @param string $shareName The name of the share to get the root for.
     * @return string
     */
    protected static function _getShareRoot($shareName)
    {
        $shareRoots = static::_getShareRoots();

        if (!array_key_exists($shareName, $shareRoots))
        {
            throw new SharePathException('SHARE_NOT_FOUND', 404);
        }
        return $shareRoots[$shareName];
    }

    /**
     * Determines the share name, share root, and relative path components of a given share path.
     *
     * @param string $path
     * @return array An array as 0 => share name, 1 => share root, and 2 => realative path (relative to the share root)
     */
    protected static function _getComponentsFromPath($path)
    {
        foreach (static::_getShareRoots() as $shareName => $shareRoot)
        {
            if (static::_pathContainsShareRoot($shareRoot, $path))
            {
                return [$shareName, $shareRoot, static::_getRelativePath($shareRoot, $path)];
            }
        }

        throw new SharePathException('PATH_NOT_VALID', 400);
    }

    protected static function _pathContainsShareRoot($shareRoot, $path)
    {
        if(substr($path, 0, strlen($shareRoot)) === $shareRoot){
            return ((strcmp($shareRoot, $path) == 0) ||
                ( mb_strpos($path, DS, (mb_strlen($shareRoot) - 1) ) === ( mb_strlen($shareRoot) ) ) );
        }
    }

    protected static function _getRelativePath($shareRoot, $path)
    {
        return rtrim(mb_substr($path, mb_strlen($shareRoot, 'UTF-8') + 1, NULL, 'UTF-8'), DS);
    }

    protected static function _resolvePath($pathPieces)
    {
        $resolvedPieces = [];

        foreach ($pathPieces as $piece)
        {
            if ($piece == '..')
            {
                if (empty($resolvedPieces))
                {
                    throw new SharePathException('PATH_NOT_VALID', 400);
                }
                else
                {
                    array_pop($resolvedPieces);
                }
            }
            elseif ($piece == '.')
            {
                continue;
            }
            else
            {
                array_push($resolvedPieces, $piece);
            }
        }

        return implode(DS, $resolvedPieces);
    }

    /**
     * Creates a share path object from an absolute path.
     *
     * @param string $absPath A path in the filesystem which should be in a share.
     * @return SharePathObject
     */
    public static function createFromAbsolutePath($absPath)
    {
        $resolvedPath                               = static::_resolvePath(explode(DS, $absPath));
        list($shareName, $shareRoot, $relativePath) = static::_getComponentsFromPath($resolvedPath);

        return new static($shareName, $shareRoot, $relativePath);
    }

    /**
     * Creates a share path object from a path array starting with the share name.
     *
     * @param array $pathArr
     * @return SharePathObject
     */
    public static function createFromPathArray(array $pathArr)
    {
        $shareName = array_shift($pathArr);

        if (trim($shareName) == '')
        {
            throw new SharePathException('SHARE_NAME_MISSING', 400);
        }

        $shareRoot    = static::_getShareRoot($shareName);
        $relativePath = static::_resolvePath($pathArr);

        return new static($shareName, $shareRoot, $relativePath);
    }

    /**
     * Creates a share path object from a path where the first directory is the share name.
     *
     * @param string $sharePath A path starting with the share name (ie: Public/Music)
     * @return SharePathObject
     */
    public static function createFromSharePath($sharePath)
    {
        return static::createFromPathArray(explode(DS, trim($sharePath, DS)));
    }
}
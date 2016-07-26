<?php

namespace Filesystem\Model;

require_once implode(DS, [COMMON_ROOT, 'includes', 'requestscope.inc']); // \RequestScope
require_once implode(DS, [FILESYSTEM_ROOT, 'includes', 'db', 'volumesdb.inc']); // \VolumesDB

class VolumePathObject
{
    /**
     * The root of a volume path for a share
     *
     * @var string
     */
    protected $_volumeRoot;
    /**
     * A path relative to the volume root.
     *
     * @var string
     */
    protected $_relativePath;

    /**
     * An array of volume records
     *
     * @var array
     */
    protected static $_volumes;

    protected function __construct($volumeRoot, $relativePath = '')
    {
        $this->_volumeRoot   = $volumeRoot;
        $this->_relativePath = $relativePath;
    }

    public function getVolumeRoot()
    {
        return $this->_volumeRoot;
    }

    public function getRelativePath()
    {
        return $this->_relativePath;
    }

    public function getAbsolutePath()
    {
        return rtrim($this->getVolumeRoot() . DS . $this->getRelativePath(), DS);
    }

    protected static function _getShareVolumeRootFromName($shareName)
    {
        return \RequestScope::getMediaVolMgr()->getShareBasePath($shareName);
    }

    protected static function _getShareVolumeRelativePathFromName($shareName)
    {
        if (getDeviceTypeName() == 'avatar' && $shareName == 'Public')
        {
            return '';
        }
        else
        {
            return \RequestScope::getMediaVolMgr()->getShareRelPath($shareName);
        }
    }

    /**
     * Creates a VolumePathObject for a SharePathObject.
     *
     * @param SharePathObject $sharePath
     * @return VolumePathObject
     */
    public static function createFromSharePath(SharePathObject $sharePath)
    {
        $shareName    = $sharePath->getShareName();
        $volumeRoot   = static::_getShareVolumeRootFromName($shareName);
        $relativePath = static::_getShareVolumeRelativePathFromName($shareName);
        $shareRelPath = $sharePath->getRelativePath();

        if ($shareRelPath != '')
        {
            $relativePath .= DS . $shareRelPath;
        }

        return new static($volumeRoot, $relativePath);
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
                    throw new VolumePathException('PATH_NOT_VALID', 400);
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

    protected static function _getVolumes()
    {
        if (!isset(static::$_volumes))
        {
            foreach ((new \VolumesDB())->getActiveVolumes() as $key => $vol)
            {
                if ($vol['is_connected'] === 'true')
				{
				    static::$_volumes[$vol['volume_id']] = $vol;
				}
            }
        }

        return static::$_volumes;
    }

    protected static function _getComponentsFromPath($path)
    {
        foreach (static::_getVolumes() as $volume)
        {
            $volumeRoot = $volume['base_path'];

            if (static::_pathContainsVolumeRoot($volumeRoot, $path))
            {
                return [$volumeRoot, static::_getRelativePath($volumeRoot, $path)];
            }
        }

        throw new VolumePathException('PATH_NOT_VALID', 400);
    }

    protected static function _getRelativePath($volumeRoot, $path)
    {
        return rtrim(mb_substr($path, mb_strlen($volumeRoot, 'UTF-8') + 1, NULL, 'UTF-8'), DS);
    }

    protected static function _pathContainsVolumeRoot($volumeRoot, $path)
    {
        return substr($path, 0, strlen($volumeRoot)) === $volumeRoot;
    }

    /**
     * Creates a VolumePathObject from a path in the filesystem.
     *
     * @param string $absPath A path in the filesystem
     * @return VolumePathObject
     */
    public static function createFromAbsolutePath($absPath)
    {
        $resolvedPath                    = static::_resolvePath(explode(DS, $absPath));
        list($volumeRoot, $relativePath) = static::_getComponentsFromPath($resolvedPath);

        return new static($volumeRoot, $relativePath);
    }
}
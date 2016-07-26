<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Shares\Model\Share;

require_once(COMMON_ROOT . '/includes/globalconfig.inc');

use Core\Config;

/**
 * Base model class for a Share
 *
 * @author gabbert_p, refactored by sapsford_j
 */
class Share extends \Core\Model\AbstractModel {

	const PUBLIC_SHARE_NAME = "public";

	/**
	 * Name of share
	 * @var string
	 */
	protected $name;

	/**
	 * Username for owner of share (usually the user who created it)
	 * @var string
	 */
	protected $username;

	/**
	 * File system path to share
	 * @var string
	 */
	protected $sharePath;

	 /**
     * Absolute path of share (from root, includes volume mount path on multi-volume systems)
     * @var string
     */
	protected $absolutePath;

	/**
	 * Relative path of share (path relative to volume mount path on multi-volume systems)
	 */
	protected $relPath;

	/**
	 * Description of share
	 * @var string
	 */
	protected $description;

	/**
	 * Date and time share was created
	 * @var \DateTime
	 */
	protected $createdDate;

	/**
	 * Volume ID for the volume where the share is
	 * @var string
	 */
	protected $volumeId;

	/**
	 * Total disk space available for share
	 * @var float
	 */
	protected $capacity;

	/**
	 * Read-onlhy flag - if true, share is read only
	 * @var boolean
	 */
	protected $readOnly;

	/**
	 * Public-access flag - if true, share is public
	 * @var boolean
	 */
	protected $publicAccess;

	/**
	 * Media-serving setting - if "any", shar eis enabled for media-serving via DLNA, if "none", it is not.
	 * @var string
	 */
	protected $mediaServing;

	/**
	 * Remote-access flag. If true, share is enabled for remote access
	 * @var boolean
	 */
	protected $remoteAccess;

	/**
	 * Dynamic volume flag. if true, share is on removable media
	 * @var boolean
	 */
	protected $dynamicVolume;

	/**
	 * Amount fo disk space (in bytes) used by the share's contents
	 * @var int
	 */
	protected $size;

	/**
	 * File system type of share volume
	 * @var string
	 */
	protected $fileSystemType;

	/**
	 * handle (for shares on removable media only), removable storage can be usb or sd card
	 * @var int
	 */
	protected $handle;

    /**
     * @var boolean
     */
    protected $sambaAvailable;

    /**
     * @var boolean
     */
    protected $shareAccessLocked;

    /**
     * @var string
     */
    protected $targetPath;

	/**
	 * List of users that have access to the share and their access level (RO = Read-Only, RW = Read-Write ).
	 * @var AccessList
	 */
	protected $accessList = [];

	/**
	 * @var boolean
	 */
	protected $recycleBin;

	/**
	 * Recyle deleted share files
	 * @var string
	 */
	protected $vfsObject;

	/**
	 * @var boolean
	 */
	protected $recycleKeeptree;

	/**
	 * @var boolean
	 */
	protected $recycleVersions;

	/**
	 * @var string
	 */
	protected $recycleSubDirMode;
	
	/**
	 * @var string
	 */
	protected $recycleRepository;
	
	/**
	 * Array representation of share
	 * @var unknown
	 */
	protected $shareValues = array();

	protected static $mapper = null;

	protected static $reverseMapper = null;

    public function __construct($options = []) {

        if (is_array($options)) {
            foreach ($options as $k => $v) {
                $method = 'set' . ucfirst($k);
                if (method_exists($this, $method)) {
                    $this->{$method}($v);
                }
            }
        }
    }

    /**
     * Optional override for child classes that manage their own array representation for efficiency
     * @return NULL
     */
    protected function getArray() {
    	return $this->shareValues;
    }

    public function getName() {
        return $this->name;
    }

    public function setName($name) {
    	$this->__setInArray(__FUNCTION__, $name);
        $this->name = $name;
        return $this;
    }

    public function getUsername() {
    	return $this->username;
    }

    public function setUsername($username) {
    	$this->__setInArray(__FUNCTION__, $username);
    	$this->username = $username;
    }

    /**
	 * Get the Absolute path of the share. This is the true file system path, without any symlinks and usually iuncludes the
	 * volume mount path
     */
    public function getAbsolutePath() {
        return $this->absolutePath;
    }

    /**
     * Set the absolute path of the share
     */
    public function setAbsolutePath($absolutePath) {
    	$this->__setInArray(__FUNCTION__, $absolutePath);
        $this->absolutePath = $absolutePath;
    }

    /**
     * Get the symbolic link path to the share. The symbolic link path includes the symlink for the shares root dir on the
     * system and the relative path of the share.
     *
     * Examples;
     * 		If the shares root symbolic link is: /shares and the relative path is: /public, the symbolic path would be: /shares/public
     */

    public function getSymbolicPath() {
        return getSharesPath() . DS . $this->getName();
    }

    /**
     * Share bean support
     */
    public function getSharePath() {
    	return $this->getAbsolutePath();
    }

    public function setSharePath($sharePath) {
    	$this->__setInArray(__FUNCTION__, $sharePath);
    	$this->setAbsolutePath($sharePath);
    }

    public function getDescription() {
        return $this->description;
    }

    public function setDescription($description) {
    	$this->__setInArray(__FUNCTION__, $description);
        $this->description = $description;
        return $this;
    }

    public function getCreatedDate($format = 'r') {
    	if (!empty($this->createdDate)) {
	        return $this->createdDate->format($format);
    	}
	    return "";
    }

    public function setCreatedDate($createdDate) {

        if (is_numeric($createdDate)) {
            $createdDate = new \DateTime(date('r', $createdDate));
        } elseif (is_string($createdDate)) {
            $createdDate = new \DateTime($createdDate);
        }
        $this->__setInArray(__FUNCTION__, $createdDate);

        $this->createdDate = $createdDate;
        return $this;
    }

    public function getVolumeId() {
        return $this->volumeId;
    }

    public function setVolumeId($volumeId) {
    	$this->__setInArray(__FUNCTION__, $volumeId);
        $this->volumeId = $volumeId;
        return $this;
    }

    public function getCapacity() {
    	return $this->capacity;
    }

    public function setCapacity($capacity) {
    	$this->__setInArray(__FUNCTION__, $capacity);
    	$this->capacity = $capacity;
    	return $this;
    }

    public function isReadOnly() {
        return $this->readOnly;
    }

    /*
     * Alias method to address AbstractModel toArray() automation method.
     */

    public function getReadOnly() {
        return $this->readOnly;
    }

    public function setReadOnly($readOnly) {
        $this->readOnly = Config::stringToBoolean($readOnly);
        $this->__setInArray(__FUNCTION__, $readOnly);
    }

    public function hasPublicAccess() {
        return $this->publicAccess;
    }

    /*
     * Alias method to address AbstractModel toArray() automation method.
     */

    public function getPublicAccess() {
        return $this->publicAccess;
    }

    public function setPublicAccess($publicAccess) {
    	$this->__setInArray(__FUNCTION__, $publicAccess);
        $this->publicAccess = Config::stringToBoolean($publicAccess);
        return $this;
    }

    public function getAccessList() {
    	if (!isset($this->accessList)) {
    		$this->accessList = new AccessList();
    	}
    	return $this->accessList;
    }

    public function getRecycleBin() {
        return $this->recycleBin;
    }

    public function setRecycleBin($recycleBin) {
        $this->recycleBin = $recycleBin;
    }

    public function getVfsObject() {
        return $this->vfsObject;
    }

    public function setVfsObject($vfsObject) {
        $this->vfsObject = $vfsObject;
    }

    public function getRecycleKeeptree()
    {
        return $this->recycleKeeptree;
    }

    public function setRecycleKeeptree($recycleKeeptree)
    {
        $this->recycleKeeptree = $recycleKeeptree;
    }

    public function getRecycleVersions()
    {
        return $this->recycleVersions;
    }

    public function setRecycleVersions($recycleVersions)
    {
        $this->recycleVersions = $recycleVersions;
    }

    public function getRecycleSubDirMode()
    {
        return $this->recycleSubDirMode;
    }

    public function setRecycleSubDirMode($recycleSubDirMode)
    {
        $this->recycleSubDirMode = $recycleSubDirMode;
    }

    public function getRecycleRepository()
    {
        return $this->recycleRepository;
    }

    public function setRecycleRepository($recycleRepository)
    {
        $this->recycleRepository = $recycleRepository;
    }

	public function getMediaServing() {
        return $this->mediaServing;
    }

    public function setMediaServing($mediaServing) {
    	$this->__setInArray(__FUNCTION__, $mediaServing);
    	if (is_bool($mediaServing)) {
	        $this->mediaServing = $mediaServing;
    	}
    	else {
    		$this->mediaServing = $mediaServing == 'any' ?  true : false;
    	}
    }

    public function hasRemoteAccess() {
        return $this->remoteAccess;
    }

    /*
     * Alias method to address AbstractModel toArray() automation method.
     */

    public function getRemoteAccess() {
        return $this->remoteAccess;
    }

    public function setRemoteAccess($remoteAccess) {
    	$this->__setInArray(__FUNCTION__, $remoteAccess);
    	$this->remoteAccess = $remoteAccess;
    }

    public function isDynamicVolume() {
        return $this->dynamicVolume;
    }

    public function isCloudShare() {
    	return $this->isCloudShare;
    }

    /*
     * Alias method to address AbstractModel toArray() automation method.
     */

    public function getDynamicVolume() {
        return $this->dynamicVolume;
    }

    public function setDynamicVolume($dynamicVolume) {
    	$this->__setInArray(__FUNCTION__, $dynamicVolume);

        $this->dynamicVolume = Config::stringToBoolean($dynamicVolume);
        return $this;
    }

    public function __toString() {
        return $this->getName();
    }

    public function getSize() {
        if (!isset($this->size)){
            $shareSizesObj = ShareSizes::getInstance();
            $this->size = $shareSizesObj->getShareSize($this->name);
        }
        return $this->size;
    }

    public function setSize($size) {
    	$this->__setInArray(__FUNCTION__, $size);
        $this->size = $size;
        return $this;
    }

    public function getHandle() {
        return $this->handle;
    }

    public function setHandle($handle) {
    	$this->__setInArray(__FUNCTION__, $handle);
        $this->handle = $handle;
        return $this;
    }

    public function getFileSystemType() {
        return $this->fileSystemType;
    }

    public function setFileSystemType($fileSystemType) {
    	$this->__setInArray(__FUNCTION__, $fileSystemType);
        $this->fileSystemType = $fileSystemType;
        return $this;
    }

    /**
     * @return boolean
     */
    public function isSambaAvailable()
    {
        return $this->sambaAvailable;
    }

    /**
     * @param boolean $sambaAvailable
     */
    public function setSambaAvailable($sambaAvailable)
    {
        $this->sambaAvailable = $sambaAvailable;
    }

    /**
     * @return boolean
     */
    public function getSambaAvailable()
    {
        return $this->sambaAvailable;
    }

    /**
     * @return boolean
     */
    public function isShareAccessLocked()
    {
        return $this->shareAccessLocked;
    }

    /**
     * @param boolean $shareAccessLocked
     */
    public function setShareAccessLocked($shareAccessLocked)
    {
        $this->shareAccessLocked = $shareAccessLocked;
    }

    /**
     * @return boolean
     */
    public function getShareAccessLocked()
    {
        return $this->shareAccessLocked;
    }


    /**
     * Target path of a Share if its root is a symLink referring to a folder from a different share.
     *
     * For a regular share, the target path should be null as it's an actual folder on the disk and represented as
     * a Share via Samba conf. However, a share with a target path is a symLink @ shares root but referring to a folder
     * on the filesystem, and is represented as a Share in Samba conf.
     *
     * Usually, this share should not have contents of its own rather referring to contents that the symLink referring to.
     *
     *
     * @return string
     */
    public function getTargetPath()
    {
        return $this->targetPath;
    }

    /**
     * @param string $targetPath
     */
    public function setTargetPath($targetPath)
    {
        $this->targetPath = $targetPath;
    }



    public function addAccess(Access $access) {
        $this->accessList = $this->accessList ? : new AccessList();
        $this->accessList[$access->getUsername()] = $access;
    }

    public function deleteAccess(Access $access) {
    	if (isset($access)) {
	    	$this->accessList[$access->getUsername()] = new Access($access->getShareName(), $access->getUsername(), AccessLevel::NOT_AUTHORIZED);
    	}
    }

    public function updateAccess(Access $access) {
    	if (!isset($this->accessList[$access->getUsername()])) {
    		return false;
    	}
    	$this->accessList[$access->getUsername()] = $access;
    }

    public function fromArray(array $values) {
        if (isset($values['share_access'])) {
            $this->accessList = $this->accessList ? : new Share\AccessList();
            foreach ($values['share_access'] as $access) {
                $this->accessList[$access['username']] = (new Share\Access())->fromArray($access);
            }
        }

        return parent::fromArray($values);
    }

    public function toArray() {
        $return = parent::toArray();
        foreach ($this->accessList as $access) {
            $return['share_access'][] = $access->toArray();
        }
        return $return;
    }

    public function getMapper() {
    	if (self::$mapper == null)  {
        	self::$mapper = array (
            'share_name' => 'name',
            'username' => 'username',
            'description' => 'description',
            'size' => 'size',
            'remote_access' => 'remoteAccess',
            'public_access' => 'publicAccess',
            'media_serving' => 'mediaServing',
            'dynamic_volume' => 'dynamicVolume',
            'capacity' => 'capacity',
            'read_only' => 'readOnly',
            'handle' => 'handle',
            'created_date' => 'createdDate',
            'volume_id' => 'volumeId',
            'file_system_type' => 'fileSystemType',
            'rel_path' => 'sharePath',
            'abs_path' => 'absolutePath',
            'samba_available' => 'sambaAvailable',
            'share_access_locked' => 'shareAccessLocked',
            'target_path' => 'targetPath',
            'rowid' => 'rowId',
        );
    	}
    	return self::$mapper;
    }

    public function getReverseMapper() {
    	if (self::$reverseMapper == null) {
    		self::$reverseMapper = array ();

    		foreach($this->getMapper() as $key => $value) {
    			self::$reverseMapper[$value] = $key;
    		}
    	}
    	return self::$reverseMapper;
    }

    public function getRealpath() {
    	require_once(FILESYSTEM_ROOT . '/includes/db/multidb.inc');
    	return realpath(getSharePath($this->name) . DS . $this->name);
    }

}


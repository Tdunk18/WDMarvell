<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Albums\Model;

/**
 * Description of Album
 *
 * @author gabbert_p
 */
class Album extends \Core\Model\AbstractModel {

    /**
     * @var int
     */
    protected $id;

    /**
     * @var int
     */
    protected $owner;

    /**
     * @var string
     */
    protected $name;

    /**
     * @var string
     */
    protected $description;

    /**
     * @var string
     */
    protected $backgroundColor;

    /**
     * @var string
     */
    protected $backgroundImage;

    /**
     * @var string ??
     */
    protected $previewImage;

    /**
     * @var int
     */
    protected $slideShowDuration;

    /**
     * @var boolean
     */
    protected $slideShowTransition;

    /**
     * @var string
     */
    protected $mediaType;

    /**
     * @var \DateTime
     */
    protected $createdDate;

    /**
     * @var \DateTime
     */
    protected $expiredDate;

    /**
     *
     * @var int
     */
    protected $albumsItemCount;

    /**
     *
     * @var Album\ItemList
     */
    protected $albumItems;

    public static function withId($id) {
        return AlbumMapper::loadById($id);
    }

    public static function withName($name, $owner = null, $mediaType = null) {
        return AlbumMapper::loadByName($name, $owner, $mediaType);
    }

    public function save() {
        return $this;
    }

    /**
     * Returns the Album ID.
     *
     * @return int
     */
    public function getId() {
        return $this->id;
    }

    /**
     *
     * @param int $id
     * @return Album
     */
    public function setId($id) {
        $this->id = $id;
        return $this;
    }

    /**
     *
     * @return string
     */
    public function getOwner() {
        return $this->owner;
    }

    /**
     *
     * @param string $owner
     * @return Album
     */
    public function setOwner($owner) {
        $this->owner = $owner;
        return $this;
    }

    /**
     *
     * @return string
     */
    public function getName() {
        return $this->name;
    }

    /**
     *
     * @param string $name
     * @return Album
     */
    public function setName($name) {
        $this->name = $name;
        return $this;
    }

    /**
     *
     * @return string
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     *
     * @param string $description
     * @return Album
     */
    public function setDescription($description) {
        $this->description = $description;
        return $this;
    }

    /**
     *
     * @return string
     */
    public function getBackgroundColor() {
        return $this->backgroundColor;
    }

    /**
     *
     * @param string $backgroundColor
     * @return Album
     */
    public function setBackgroundColor($backgroundColor) {
        $this->backgroundColor = $backgroundColor;
        return $this;
    }

    /**
     *
     * @return string
     */
    public function getBackgroundImage() {
        return $this->backgroundImage;
    }

    /**
     *
     * @param string $backgroundImage
     * @return Album
     */
    public function setBackgroundImage($backgroundImage) {
        $this->backgroundImage = $backgroundImage;
        return $this;
    }

    /**
     *
     * @return string
     */
    public function getPreviewImage() {
        return $this->previewImage;
    }

    /**
     *
     * @param string $previewImage
     * @return Album
     */
    public function setPreviewImage($previewImage) {
        $this->previewImage = $previewImage;
        return $this;
    }

    /**
     *
     * @return int
     */
    public function getSlideShowDuration() {
        return $this->slideShowDuration;
    }

    /**
     *
     * @param int $slideShowDuration
     * @return Album
     */
    public function setSlideShowDuration($slideShowDuration) {
        $this->slideShowDuration = $slideShowDuration;
        return $this;
    }

    /**
     *
     * @return boolean
     */
    public function getSlideShowTransition() {
        return $this->slideShowTransition;
    }

    /**
     *
     * @param boolean $slideShowTransition
     * @return Album
     */
    public function setSlideShowTransition($slideShowTransition) {
        $this->slideShowTransition = $slideShowTransition;
        return $this;
    }

    /**
     *
     * @return string
     */
    public function getMediaType() {
        return $this->mediaType;
    }

    /**
     *
     * @param string $mediaType
     * @return Album
     */
    public function setMediaType($mediaType) {
        $this->mediaType = $mediaType;
        return $this;
    }

    /**
     *
     * @param string $format
     * @return string
     */
    public function getCreatedDate($format = 'r') {
        return $this->createdDate ? $this->createdDate->format($format) : null;
    }

    /**
     *
     * @param \DateTime|string|int $createdDate
     * @return Album
     */
    public function setCreatedDate($createdDate) {

        if (is_numeric($createdDate)) {
            $createdDate = new \DateTime(date('r', $createdDate));
        } elseif (is_string($createdDate)) {
            $createdDate = new \DateTime($createdDate);
        }

        $this->createdDate = $createdDate;
        return $this;
    }

    /**
     *
     * @param string $format
     * @return string
     */
    public function getExpiredDate($format = 'r') {
        return $this->expiredDate ? $this->expiredDate->format($format) : null;
    }

    /**
     *
     * @param \DateTime|string|int $expiredDate
     * @return Album
     */
    public function setExpiredDate($expiredDate) {

        if (is_numeric($expiredDate)) {
            $expiredDate = new \DateTime(date('r', $expiredDate));
        } elseif (is_string($expiredDate)) {
            $expiredDate = new \DateTime($expiredDate);
        }

        $this->expiredDate = $expiredDate;
        return $this;
    }

    /**
     * Returns the total number of album items
     *
     * @return int
     */
    public function getAlbumsItemCount() {
        if (is_null($this->albumsItemCount)) {
            $this->getAlbumItems();
            $this->albumsItemCount = count($this->albumItems);
        }
        return $this->albumsItemCount;
    }

    /**
     *
     * @param int $expiredDate
     * @return Album
     */
    public function setAlbumsItemCount($totalItems) {
        $this->albumsItemCount = $totalItems;
    }

    /**
     *
     * @return Album\ItemList
     */
    public function getAlbumItems() {
        if (empty($this->albumItems)) {
            $this->albumItems = \Albums\Model\Db\Album\ItemMapper::getItems($this->id);
        }
    }

    public function __toString() {
        return $this->getName();
    }

    public function getMapper() {
        return array(
            'album_id' => 'id',
            'owner' => 'owner',
            'name' => 'name',
            'description' => 'description',
            'background_color' => 'backgroundColor',
            'background_image' => 'backgroundImage',
            'preview_image' => 'previewImage',
            'slide_show_duration' => 'slideShowDuration',
            'slide_show_transition' => 'slideShowTransition',
            'media_type' => 'mediaType',
            'created_date' => 'createdDate',
            'expired_date' => 'expiredDate',
            'albums_item_count' => 'albumsItemCount',
        );
    }

}


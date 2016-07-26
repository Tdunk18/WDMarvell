<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Albums\Model\Album;

/**
 * Description of Item
 *
 * @author gabbert_p
 */
class Item extends \Core\Model\AbstractModel {

    /**
     *
     * @var int
     */
    protected $id;

    /**
     *
     * @var string
     */
    protected $path;

    /**
     *
     * @var int
     */
    protected $albumId;

    /**
     *
     * @var int
     */
    protected $itemOrder;

    /**
     *
     * @var string
     */
    protected $shareName;

    /**
     *
     * @return int
     */
    public function getId() {
        return $this->id;
    }

    /**
     *
     * @param int $id
     * @return \Albums\Model\Album\Item
     */
    public function setId($id) {
        $this->id = $id;
        return $this;
    }

    /**
     *
     * @return int
     */
    public function getPath() {
        return $this->path;
    }

    /**
     *
     * @param string $path
     * @return \Albums\Model\Album\Item
     */
    public function setPath($path) {
        $this->path = $path;
    }

    /**
     *
     * @return int
     */
    public function getAlbumId() {
        return $this->albumId;
    }

    /**
     *
     * @param int $albumId
     * @return \Albums\Model\Album\Item
     */
    public function setAlbumId($albumId) {
        $this->albumId = $albumId;
    }

    /**
     *
     * @return int
     */
    public function getItemOrder() {
        return $this->itemOrder;
    }

    /**
     *
     * @param int $itemOrder
     * @return \Albums\Model\Album\Item
     */
    public function setItemOrder($itemOrder) {
        $this->itemOrder = $itemOrder;
    }

    /**
     *
     * @return int
     */
    public function getShareName() {
        return $this->shareName;
    }

    /**
     *
     * @param string $shareName
     * @return \Albums\Model\Album\Item
     */
    public function setShareName($shareName) {
        $this->shareName = $shareName;
    }

    public function __toString() {
        return $this->getPath();
    }

    public function getMapper() {
        return array(
            'album_item_id' => 'id',
            'path' => 'path',
            'album_id' => 'albumId',
            'item_order' => 'itemOrder',
            'share_name' => 'shareName',
        );
    }

}


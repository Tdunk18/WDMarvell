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
class Access extends \Core\Model\AbstractModel {

    /**
     *
     * @var int
     */
    protected $albumId;

    /**
     *
     * @var string
     */
    protected $username;

    /**
     *
     * @var string
     */
    protected $accessLevel;

    /**
     *
     * @var DateTime
     */
    protected $createdDate;

    /**
     *
     * @param string $format
     * @return string
     */
    public function getAlbumId() {
        return $this->albumId;
    }

    /**
     *
     * @param int $albumId
     * @return \Albums\Model\Album\Access
     */
    public function setAlbumId($albumId) {
        $this->albumId = $albumId;
        return $this;
    }

    /**
     *
     * @param string $format
     * @return string
     */
    public function getUsername() {
        return $this->username;
    }

    /**
     *
     * @param string $accessLevel
     * @return \Albums\Model\Album\Access
     */
    public function setUsername($username) {
        $this->username = $username;
        return $this;
    }

    /**
     *
     * @param string $format
     * @return string
     */
    public function getAccessLevel() {
        return $this->accessLevel;
    }

    /**
     *
     * @param string $accessLevel
     * @return \Albums\Model\Album\Access
     */
    public function setAccessLevel($accessLevel) {
        $this->accessLevel = $accessLevel;
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

    public function __toString() {
        return join(':', $this->getUsername(), $this->getAccessLevel());
    }

    public function getMapper() {
        return array(
            'album_id' => 'albumId',
            'username' => 'username',
            'access_level' => 'accessLevel',
            'created_date' => 'createdDate',
        );
    }

}


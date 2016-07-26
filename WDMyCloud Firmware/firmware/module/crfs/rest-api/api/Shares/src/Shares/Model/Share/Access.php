<?php

namespace Shares\Model\Share;

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * Description of Access
 *
 * @author gabbert_p, sapsford_j
 */

use \Shares\Model\Share\AccessLevel;

class Access extends \Core\Model\AbstractModel {


	static public $accessLabels = [
        AccessLevel::READ_WRITE => 'Read/Write',
        AccessLevel::READ_ONLY => 'Read Only',
        AccessLevel::NOT_AUTHORIZED => 'Not Authorized',
    ];

    /**
     * @var string
     */
    protected $username;

    /**
     * Access Level: RW, RO, or NA
     *
     * @var string
     */
    protected $access;

    /**
     * @var \DateTime
     */
    protected $createdDate;

    /**
     * @var string
     */
    protected $shareName;
    
    public function __construct($shareName = null, $username = null, $access = null, $createdDate = null){
    	if (!empty($access) && $access != AccessLevel::READ_WRITE && $access != AccessLevel::READ_ONLY && $access != AccessLevel::NOT_AUTHORIZED) {
    		throw new \Shares\Exception("Access constructor: access parameter is wrong type");
    	}
    	$this->shareName = $shareName;
    	$this->username = $username;
    	$this->access = $access;
    	$this->createdDate = $createdDate;
    }

    public function getUsername() {
        return $this->username;
    }

    public function setUsername($username) {
        $this->username = $username;
    }

    public function getShareName() {
        return $this->shareName;
    }

    public function setShareName($shareName) {
        $this->shareName = $shareName;
    }

    public function getAccess() {
        return $this->access;
    }

    public function setAccess($access) {
    	$access = strtoupper($access);
        if (!isset(self::$accessLabels[$access])) {
            throw new \Shares\Exception(sprintf('Unknown access type "%s" given.', $access));
        }
        $this->access = $access;
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

        $this->createdDate = $createdDate;
    }

    public function __toString() {
        return join(':', [$this->shareName, $this->username, $this->access]);
    }

    public function getMapper() {
        return [
            'username' => 'username',
            'share_name' => 'shareName',
            'access_level' => 'access',
            'created_date' => 'createdDate',
        ];
    }
    
    public function getReverseMapper() {
    	return [
    	'username' => 'username',
    	'shareName' => 'share_name',
    	'access' => 'access_level',
    	'createdDate' => 'created_date',
    	];
    }

}


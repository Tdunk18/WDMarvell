<?php

namespace Core\Model;

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * Description of AbstractModel
 *
 * @author gabbert_p
 */
abstract class AbstractModel {
    //put your code here

	const SETTER_PREFIX_LEN = 3;
	
    /**
     * @var int
     * Every row of every table has an 64-bit signed integer as rowid
     *
     */
    protected $rowId = NULL;

    public function getRowId() {
        return $this->rowId;
    }

    public function setRowId($rowId) {
        $this->rowId = $rowId;
        return $this;
    }

    /**
     * Returns an class mapper array that effectively maps array keys to class properties.
     */
    abstract public function getMapper();

    /**
     * Returns a class mapper array that  maps class properties to array columns.
     */
    abstract public function getReverseMapper();
    
    /**
     * Enforcing AbstractModels to overload the __toString() magic method.
     */
    abstract public function __toString();
    
    /**
     * Optional override for child classes that manage their own array representation for efficiency
     * @return NULL
     */
    protected function getArray() {
    	return null;
    }

    /**
     * Populates an AbstractModel.
     *
     * @param array $values
     * @return \AbstractModel
     */
    public function fromArray(array $values) {
        $mapper = $this->getMapper();

        foreach ($values as $name => $v) {
            if (!isset($mapper[$name])) {
                continue;
            }
            $method = 'set' . ucfirst($mapper[$name]);
            if (method_exists($this, $method)) {
                $this->{$method}($v);
            }
        }

        return $this;
    }

    /**
     * Converts an AbstractModel into an array.
     *
     * TODO: possibly use getter methods.
     *   -- One caveat: handling "isReadOnly" and "hasPublicAccess" calls.
     *
     * @return array
     */
    public function toArray() {
    	$array = $this->getArray();
    	if ($array == null) {
    		//construct array the expensive way,
	        $mapper = $this->getMapper();
	
	        $array = array();
	        foreach ($mapper as $name => $property) {
	            $method = 'get' . ucfirst($mapper[$name]);
	            $array[$name] = $this->$method();
	        }
    	}
        return $array;
    }

    /**
     * PDO Mapper allows direct translation of PDO statement queries to their associated
     *  object model.
     *
     * Usage: $stmnt->fetchObject('\Module\Model\MyModel');
     *
     * @param string $name
     * @param string $value
     */
    public function __set($name, $value) {
        $mapper = $this->getMapper();
        if (isset($mapper[$name])) {
            $method = 'set' . ucfirst($mapper[$name]);
            if (method_exists($this, $method)) {
                $this->{$method}($value);
            }
        }

        return $this;
    }
    
    /**
     * Function allows lazy setting of array backing the object. Calling this function in
     * each setter allows the array to be kept in synch and removes the need to construct the
     * array in toArray(), so faster by many factors 
     * @param unknown $function
     * @param unknown $value
     */
    
    protected function __setInArray($function, $value) {
    	$array = $this->getArray();
    	if ($array !== null) { 
	    	$reverseMapper = $this->getReverseMapper(); //get map from member variable name to array key
    		$name = substr($function, self::SETTER_PREFIX_LEN); //extract name of member variable from function name of setter
    		$key = $reverseMapper[$name];
    		if ($key) {
	    		$array[$key] = $value;
    		}
    	}
    }

}


<?php

namespace Core\ClassFactory;

class Implementation {

    protected $className;
    protected $attributes;
    protected $object;

    /**
     * Creates a new instance of Core\ClassFactory\Implementation
     *
     * @param string $className
     * @param array $attributes
     */
    public function __construct($className, array $attributes = array()) {
        $this->className = $className;
        $this->attributes = $attributes;
    }

    /**
     * Seralize identifier for the class.
     */
    public function __toString() {
        self::generateKey($this->attributes);
    }
    
    public function __sleep(){
    	return array('className', 'attributes');
    }

    /**
     * Converts class implementation into object.
     *
     * @return mixed
     */
    public function toObject() {
        if (empty($this->object)) {
            $this->object = new $this->className();
        }

        return $this->object;
    }

    /**
     * Creates a key based on supplied attributes
     *
     * @param array $attributes
     * @return string
     */
    static public function generateKey(array $attributes = array()) {
        $attributes = array_change_key_case($attributes, CASE_LOWER);
        ksort($attributes);
        return serialize($attributes);
    }

}

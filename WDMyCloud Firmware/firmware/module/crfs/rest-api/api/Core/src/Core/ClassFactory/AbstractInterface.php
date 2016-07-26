<?php

namespace Core\ClassFactory;

use Core\ClassFactory;

class AbstractInterface {

    protected $interfaceName;
    protected $implementations = array();

    /**
     * Creates a new ClassFactory\AbstractInterface instance.
     *
     * @param string $interface
     */
    public function __construct($interface) {
        $this->interfaceName = $interface;
    }

    /**
     * Adds a new implementation class to the parent.
     *
     * @param string $className
     * @param array $attributes
     * @return ClassFactory\Implementation
     */
    public function addImplementation($className, array $attributes = array()) {
        $key = ClassFactory\Implementation::generateKey($attributes);
        if (!isset($this->implementations[$key])) {
            $this->implementations[$key] = new ClassFactory\Implementation($className, $attributes);
        }

        return $this->implementations[$key];
    }

    /**
     * Class seralizer
     *
     * @return string
     */
    public function __toString() {
        return $this->interfaceName;
    }

    /**
     * Returns a new instance of the implementation class matching provided attributes.
     *
     * @param array $attributes
     * @return mixed
     */
    public function getImplementation(array $attributes = array()) {
        $key = ClassFactory\Implementation::generateKey($attributes);

        if (!isset($this->implementations[$key])) {
            throw new Exception(sprintf('Unknown Implementation "%s" for AbstractInterface "%s"',
                    $key, $this->interfaceName));
        }

        return $this->implementations[$key]->toObject();
    }

}


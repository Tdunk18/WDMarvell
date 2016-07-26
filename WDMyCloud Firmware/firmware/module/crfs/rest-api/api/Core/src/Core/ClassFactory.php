<?php

/**
 * \file ClassFactory.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace Core;

class ClassFactory {

    protected $interfaces = array();
    protected $cache;

    /**
     *
     * @var Core\ClassFactory
     */
    protected static $self;

    /**
     * Reads in existing cache from APC under _CLASSFACTORIES
     */
    public function __construct() {
        $this->cache = apc_fetch('_CLASSFACTORIES') ? : array();
    }

    /**
     * Adds a new interface factory class to the hash stack.
     *
     * @param string $interface
     * @return ClassFactory\AbstractInterface
     */
    public function addInterface($interface) {
        if (!isset($this->cache[$interface])) {
            $this->cache[$interface] = new ClassFactory\AbstractInterface($interface);
        }
        return $this->cache[$interface];
    }

    /**
     * Returns an implementation of supplied interface (parent) class, based on
     *    supplied attributes.
     *
     * @param string $interface
     * @param array $attributes
     * @return mixed
     */
    static public function getImplementation($interface, $attributes = array()) {
        return self::getInstance()->getInterface($interface)->getImplementation($attributes);
    }

    /**
     * Returns a class factory interface parent class for the supplied interface
     *
     * @param string $interface
     * @return ClassFactory\AbstractInterface
     */
    public function getInterface($interface) {
        if (!isset($this->cache[$interface])) {
            throw new ClassFactory\Exception(sprintf('Unknown interface "%s" class.', $interface));
        }

        return $this->cache[$interface];
    }

    public function getCache() {
        return $this->cache;
    }

    /**
     *  Singleton pattern: returns new or existing instance of self
     *
     * @return ClassFactory
     */
    static public function getInstance() {
        if (empty(self::$self)) { self::$self = new self(); }
        return self::$self;
    }

/// Old code below. Playing around with the above ^^.
    /*

      protected static function genClassID($className) {
      return ('_CLASSFACTORY_CLSID_' . $className );
      }

      protected static function genAttributeId($abstractClass, $attrName, $attrValue) {
      return ('_CLASSFACTORY_ATTRID_' . crc32($abstractClass . $attrName . $attrValue) );
      }

      protected static function getAbstractParentClass($className) {
      $parentClass = null;
      while (true) {
      $class = new \ReflectionClass($className);
      if ($class->isAbstract()) {
      if (!empty($parentClass)) {
      return $className;
      } else {
      throw new \Exception("Factory class itself cannot be abstract");
      }
      }
      $parentClass = get_parent_class(new $className());
      if ($parentClass == false) {
      throw new \Exception("Factory class must have an abstract parent class");
      }
      $className = $parentClass;
      }
      }

      public static function exists($className) {
      //create class Id
      $classId = self::genClassID($className);

      //check if it exists already
      return apc_exists($classId);
      }

      public static function addClass($className, $attributes) {

      $abstractClass = self::getAbstractParentClass($className);

      if ($abstractClass == null) {
      throw new \Exception("Class does not have an abstract parent class: " . $className);
      }

      //create class Id
      $classId = self::genClassID($className);

      //check if it exists already
      if (apc_exists($classId)) {
      throw new \Exception("Class already exists in factory cache");
      }

      try {
      $classInstance = new $className();
      } catch (\Exception $ex) {
      throw new \Exception("Failed to create instance of class: " . $className . " path: " . $classPath, null, $ex);
      }

      //add to cache
      apc_store($classId, $classInstance);
      $attrId = self::genAttributeId($abstractClass, $attributes['name'], $attributes['value']);
      if (apc_exists($attrId)) {
      throw new \Exception("Attribute and value pair already exists - attrName: " . $attrName . " attrValue: " . $attrValue);
      }
      //DEBUG
      //var_dump($attrId);
      //END DEBUG
      apc_store($attrId, $classId);
      }

      public static function deleteClass($className, $attributes) {

      $abstractClass = self::getAbstractParentClass($className);

      if ($abstractClass == null) {
      throw new \Exception("Class does not have an abstract parent class: " . $className);
      }

      //create class Id
      $classId = self::genClassID($className, $abstractClass);

      //check if it exists already
      if (!apc_exists($classId)) {
      throw new \Exception("Class not found");
      }

      //delete class instance from cache
      apc_delete($classId);

      //delete cached attributes
      foreach ($attributes as $attrName => $attrValue) {
      $attrId = self::genAttributeId($abstractClass, $attrName, $attrValue);
      if (!apc_exists($attrId)) {
      throw new \Exception("Attribute and value pair not found - attrName: " . $attrName . " attrValue: " . $attrValue);
      }
      apc_delete($attrId);
      }
      }

      public static function getInstanceOf($abstractClass, $attributes) {

      //print_r(apc_cache_info());
      //var_dump($attributes);
      foreach ($attributes as $attrName => $attrValue) {
      $attrId = self::genAttributeId($abstractClass, $attrName, $attrValue);
      //DEBUG
      //var_dump($attrId);
      //END DEBUG

      if (!apc_exists($attrId)) {
      throw new \Exception("Class not found: unmatched attribute - attrName:  " . $attrName . " attrValue: " . $attrValue);
      }
      $fetchClassID = apc_fetch($attrId);
      if (isset($prevClassID) &&
      (empty($fetchClassID) || $fetchClassID != $prevClassID)) {
      //attribute value pair belongs to a different class instance
      throw new \Exception("Class not found: unmatched attribute - attrName:  " . $attrName . " attrValue: " . $attrValue);
      }
      $prevClassID = $fetchClassID;
      }

      //check if class exists
      if (!apc_exists($fetchClassID)) {
      throw new \Exception("Class Not found: no match with attributes");
      }

      $classInstance = apc_fetch($fetchClassID);
      return clone $classInstance;
      }
     */
}

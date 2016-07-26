<?php
/**
 * \file common\testing.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

/**
 * Use this to call private and protected methods
 */
function callProtectedMethod($object, $method, array $args=array()) {
    $class = new \ReflectionClass(get_class($object));
    $method = $class->getMethod($method);
    $method->setAccessible(true);
    return $method->invokeArgs($object, $args);
}
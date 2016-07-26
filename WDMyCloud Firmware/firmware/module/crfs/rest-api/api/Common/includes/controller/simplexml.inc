<?php
/**
 * \file simplexml.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

// Function copied from sample at
// http://www.php.net/manual/en/book.simplexml.php
function simpleXMLToArray($xml,$attributesKey=null,$childrenKey=null,$valueKey=null) {

    if($childrenKey && !is_string($childrenKey)) {$childrenKey = '@children';}
    if($attributesKey && !is_string($attributesKey)) {$attributesKey = '@attributes';}
    if($valueKey && !is_string($valueKey)) {$valueKey = '@values';}

    $return = array();
    $name = $xml->getName();
    $_value = trim((string)$xml);
    if(!strlen($_value)) {$_value = null;};

    if($_value!==null) {
        if($valueKey) {$return[$valueKey] = $_value;}  else{$return = $_value;}
    }

    $children = array();
    $first = true;
    foreach($xml->children() as $elementName => $child) {
        $value = simpleXMLToArray($child,$attributesKey, $childrenKey,$valueKey);
        if(isset($children[$elementName])) {
            if(is_array($children[$elementName])) {
                if($first) {
                    $temp = $children[$elementName];
                    unset($children[$elementName]);
                    $children[$elementName][] = $temp;
                    $first=false;
                }
                $children[$elementName][] = $value;
            }else{
                $children[$elementName] = array($children[$elementName],$value);
            }
        }  else{
            $children[$elementName] = $value;
        }
    }
    if($children) {
        if($childrenKey) {$return[$childrenKey] = $children;}  else{$return = array_merge($return,$children);}
    }

    $attributes = array();
    foreach($xml->attributes() as $name=>$value) {
        $attributes[$name] = trim($value);
    }
    if($attributes) {
        if($attributesKey) {$return[$attributesKey] = $attributes;}  else{$return = array_merge($return, $attributes);}
    }

    return $return;
}
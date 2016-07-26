<?php

/**
 * PropertyBean <p/>
 *
 * Abstract class for containing properties. Allows for on-the-fly creation of getters and setters for
 * pre-defined properties
 *
 * @author joesapsford
 *
 */

namespace Util;

abstract class PropertyBean {

	public function __call($name, $value) {
		if (in_array($name, $this->getMethods())) {
			if(!isset($value[0])) $value[0] = null;
			if (!$this->_handleSetter($name, $value[0])) {
				return $this->_handleGetter($name);
			}
		}
	}

	abstract protected function getMethods();

	protected function _handleSetter($name, $value) {
		//if (preg_match_all('/(.*) {(.*)}(.*)/s', $sql, $matches, PREG_SET_ORDER)) {
		//$prependSql = $matches[0][1];

		if(preg_match_all( '/^set(.*)/', $name, $matches, PREG_SET_ORDER) || preg_match_all( '/^is(.*)/', $name, $matches, PREG_SET_ORDER)) {
			$attrName = $matches[0][1];
			$this->{$attrName} = $value;
			return true;
		}
		return false;
	}

	protected function _handleGetter($name) {
		if(preg_match_all( '/^get(.*)/', $name, $matches, PREG_SET_ORDER)) {
			$attrName = $matches[0][1];
			return $this->{$attrName};
		}
		return false;
	}
}
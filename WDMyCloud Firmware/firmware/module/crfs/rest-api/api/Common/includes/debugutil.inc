<?php
/**
 * \file common\debugutil.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

function _get_dbg_trace_arg(&$arg) {
	if (is_object($arg)) {
		$arr = (array)$arg;
		$args = array();
		foreach($arr as $key => $value) {
			if (strpos($key, chr(0)) !== false) {
				$key = '';    // Private variable found
			}
			$args[] =  '['.$key.'] => '._get_dbg_trace_arg($value);
		}

		$arg = get_class($arg) . ' Object ('.implode(',', $args).')';
	}
}

function getDebugStackTrace($traces_to_ignore = 1){
	$traces = debug_backtrace();
	$ret = array();
	foreach($traces as $i => $call){
		if ($i < $traces_to_ignore ) {
			continue;
		}

		$object = '';
		if (isset($call['class'])) {
			$object = $call['class'].$call['type'];
			if (is_array($call['args'])) {
				foreach ($call['args'] as &$arg) {
					_get_dbg_trace_arg($arg);
				}
			}
		}

		$ret[] = '#'.str_pad($i - $traces_to_ignore, 3, ' ')
		.$object.$call['function'].'('.implode(', ', $call['args'])
		.') called at ['.$call['file'].':'.$call['line'].']';
	}

	return implode("\n",$ret);
}
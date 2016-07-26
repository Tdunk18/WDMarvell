<?php

/*
 * @author WDMV - Mountain View - Software Engineering
 * @copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

namespace SafePoint\Controller;

/**
 * Description of SafePointTraitController
 *
 * @author gabbert_p
 */
define("NSPT_BASE_ERROR", 2000); // Base number return codes are added to for client status codes.
define("NSPT_INPROGRESS", 1);;

trait SafePointTraitController {

    function parseNSPTResponse($response) {
        $arrayOfarrayOfkeyValuePairs = array();
        $kv = array();

        foreach ($response as $line) {
            // Strip out lines that don't contain expected format
            // Expected format +;key=value;- where ;key=value maybe repeated
            // example +;minute=0;hour=0;dom=1-;
            if (preg_match('/\+;(.+);-/', $line, $record)) {
                $arrayOfarrayOfkeyValuePairs[] = explode(';', $record[1]);
            }
        }

        foreach ($arrayOfarrayOfkeyValuePairs as $rec => $arrayOfKeyEqualValue) {
            foreach ($arrayOfKeyEqualValue as $keyValue) {
                list($key, $value) = explode('=', $keyValue);
                $kv[$rec][$key] = "$value";
            }
        }
        return $kv;
    }

    function getStatusCode($errorNumber) {

        $NSPT_error = array(
            0 => array('status_code' => 2000, 'status_name' => 'OK', 'status_desc' => ''),
            1 => array('status_code' => 2001, 'status_name' => 'INPROGRESS', 'status_desc' => ''),
            2 => array('status_code' => 2002, 'status_name' => 'FAILED', 'status_desc' => ''),
            3 => array('status_code' => 2003, 'status_name' => 'NOTFOUND', 'status_desc' => ''),
            4 => array('status_code' => 2004, 'status_name' => 'UNAUTHORIZED', 'status_desc' => ''),
            5 => array('status_code' => 2005, 'status_name' => 'BUSY', 'status_desc' => ''),
            6 => array('status_code' => 2006, 'status_name' => 'NOSPACE', 'status_desc' => ''),
            7 => array('status_code' => 2007, 'status_name' => 'INVALID', 'status_desc' => ''),
            8 => array('status_code' => 2008, 'status_name' => 'INCOMPATIBLE', 'status_desc' => ''),
            9 => array('status_code' => 2009, 'status_name' => 'UNREACHABLE', 'status_desc' => ''),
            10 => array('status_code' => 2010, 'status_name' => 'NOTSUPPORTED', 'status_desc' => ''),
            11 => array('status_code' => 2011, 'status_name' => 'DUPLICATE', 'status_desc' => ''),
            12 => array('status_code' => 2012, 'status_name' => 'NOTSTARTED', 'status_desc' => ''),
            13 => array('status_code' => 2013, 'status_name' => 'NOTCREATED', 'status_desc' => ''),
            14 => array('status_code' => 2014, 'status_name' => 'UNAVAILABLE', 'status_desc' => ''),
            15 => array('status_code' => 2015, 'status_name' => 'CORRUPTED', 'status_desc' => ''),
            16 => array('status_code' => 2016, 'status_name' => 'ABORTED', 'status_desc' => ''),
            17 => array('status_code' => 2017, 'status_name' => 'IGNORE', 'status_desc' => ''),
            18 => array('status_code' => 2018, 'status_name' => 'NOTALLOWED', 'status_desc' => ''),
            141 => array('status_code' => 2141, 'status_name' => 'TIMEOUT', 'status_desc' => ''),
            'UNDEFINED' => array('status_code' => '', 'status_name' => 'UNDEFINED', 'status_desc' => 'UNDEFINED ERROR CODE'),
        );

        return isset($NSPT_error[$errorNumber]) ? $NSPT_error[$errorNumber] : $NSPT_error['UNDEFINED'];
    }

    function getConfigFileValue($tag) {

        $output = $retVal = null;

        // Parameters hardcoded by the caller of this function.
        exec_runtime("sed -n -e \"/{$tag}/s/\\({$tag}[ ]*=[ ]*\\)\\(.*\\)/\\2/p\" /etc/nas/NSPT/admin", $output, $retVal, false);

        if ($retVal != 0) {
            return null;
        }

        return $output[0];
    }

    protected function _getOpts($option, $params) {

        $opts = '--operation=' . escapeshellarg($option);

        foreach ( $params as $key => $v ) {
            if ( !is_null($v) ) {
                $opts .= " --{$key}=" . escapeshellarg($v);
            }
        }

        return $opts;
    }

}
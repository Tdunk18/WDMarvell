<?php
/**
 * \file common\util.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */

require_once(COMMON_ROOT . '/includes/requestscope.inc');

function validUrl($str) {
	return ( ! preg_match('/^(http|https|ftp):\/\/([A-Z0-9][A-Z0-9_-]*(?:\.[A-Z0-9][A-Z0-9_-]*)+):?(\d+)?\/?/i', $str)) ? FALSE : TRUE;
}

function urlReplaceQueryParams($url, $queryParams) {
	foreach ( $queryParams as $paramName=>$paramVal ) {
		$match = "%" . $paramName . "%";
		$url = str_replace( $match, urlencode($paramVal), $url );
	}
	return $url;
}

/**
 * Sets the HTTP status in response
 *
 * @param int $statusCode
 */

function setHttpStatusCode($status_code, $msg=null, $comp_code=null, $error_code=null) {
	$hdrMsg = 'HTTP/1.1 '.$status_code.' ';
	if (!empty($msg)) {
		$hdrMsg = $hdrMsg.$msg;
	} else {
		$hdrMsg .= getDefaultHttpStatusMsg($status_code);
	}

	//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'hdrMsg', $hdrMsg);
	if ($_SERVER['APPLICATION_ENV'] != 'testing') {
		header($hdrMsg);
		if (!empty($comp_code) && !empty($error_code)) {
			header('X-Comp-Code: '.$comp_code);
			header('X-Error-Code: '.$error_code);
			header('X-Error-Id: ' . $error_code);  //for backwards compatability?
		}
	}
	else {
		//don't output headers if running unit tests, just echo them so they can be tested.
		$hdrMsg .= "\nX-Comp-Code: ". $comp_code;
		$hdrMsg .= "\nX-Error-Code: ".$error_code . "\n";
	// now that app env recognizes testing, headers returned to unit tests needs to separate
	// the header and content information for asserts.
	// comment out for now til a fix is in place.
	//	echo ($hdrMsg);
	}
}

function getDefaultHttpStatusMsg($status_code){
	switch ($status_code){
		case 200: $statusMsg = 'OK';
				break;
		case 400: $statusMsg = 'Bad Request';
				break;
		case 500: $statusMsg = 'Internal Server Error';
				break;
		case 401: $statusMsg = 'Unauthorized';
				break;
		case 403: $statusMsg = 'Forbidden';
				break;
		case 201: $statusMsg = 'Created';
				break;
		case 202: $statusMsg = 'Accepted';
				break;
		case 100: $statusMsg = 'Continue';
				break;
		case 101: $statusMsg = 'Switching Protocols';
				break;
		case 203: $statusMsg = 'Non-Authoritative Information';
				break;
		case 204: $statusMsg = 'No Content';
				break;
		case 205: $statusMsg = '205 Reset Content';
				break;
		case 206: $statusMsg = 'Partial Content';
				break;
		case 300: $statusMsg = 'Multiple Choices';
				break;
		case 301: $statusMsg = 'Moved Permanently';
				break;
		case 302: $statusMsg = 'Found';
				break;
		case 303: $statusMsg = 'See Other';
				break;
		case 304: $statusMsg = 'Not Modified';
				break;
		case 305: $statusMsg = 'Use Proxy';
				break;
		case 307: $statusMsg = 'Temporary Redirect';
				break;
		case 402: $statusMsg = 'Payment Required';
				break;
		case 404: $statusMsg = 'Not Found';
				break;
		case 405: $statusMsg = 'Method Not Allowed';
				break;
		case 406: $statusMsg = 'Not Acceptable';
				break;
		case 407: $statusMsg = 'Proxy Authentication Required';
				break;
		case 408: $statusMsg = 'Request Time-out';
				break;
		case 409: $statusMsg = 'Conflict';
				break;
		case 410: $statusMsg = 'Gone';
				break;
		case 411: $statusMsg = 'Length Required';
				break;
		case 412: $statusMsg = 'Precondition Failed';
				break;
		case 413: $statusMsg = 'Request Entity Too Large';
				break;
		case 414: $statusMsg = 'Request-URI Too Large';
				break;
		case 415: $statusMsg = 'Unsupported Media Type';
				break;
		case 416: $statusMsg = 'Requested range not satisfiable';
				break;
		case 417: $statusMsg = 'Expectation Failed';
				break;
		case 501: $statusMsg = 'Not Implemented';
				break;
		case 502: $statusMsg = 'Bad Gateway';
				break;
		case 503: $statusMsg = 'Service Unavailable';
				break;
		case 504: $statusMsg = 'Gateway Time-out';
				break;
		case 505: $statusMsg = 'HTTP Version not supported';
				break;
		default:  $statusMsg = 'UNSET CODE';
	}//switch
	return $statusMsg;
}//getDefaultHttpStatusMsg

/**
 * Gets the full path to the webapp directory
 */

function getWebAppPath() {
    return ADMIN_API_ROOT;
}

/**
 * Get the component information from the component config array.
 *
 * @param string $comp_name
 * @param integer $comp_code
 * @return array $comp
 */
function getComponentCodes($comp_name=null, $comp_code=null){
	global $componentConfig;

	$componentConfig = $componentConfig ?: array(); // Kills notices: appears this isn't used anymore.
	$code = 0;
	$comps = array();
	foreach ($componentConfig as $name => $info) {
		$comp = array(
			'code'  => $code,
			'name'  => $name,
			'file'  => $info[0],
			'title' => $info[1],
			'auth'  => $info[2],
		);
		if ($name == $comp_name || ($code == $comp_code && $comp_code !== null && $comp_code !== '')) {
			return $comp;
		}
		$comps[] = $comp;
		$code++;
	}
	if (!empty($comp_name)) {
		return false;
	} else {
		return $comps;
	}
}

/**
 * Get the error codes information from the error codes array.
 *
 * @param string $error_name
 * @param interger $error_code
 * @return array $error
 * @return array $errors
 */
function getErrorCodes($error_name=null, $error_code=null){
	include(COMMON_ROOT . '/includes/errorcodes.inc');

	//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'error_name', print_r($error_name,true));
	//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'error_code', print_r($error_code,true));
	$errors = array();
	foreach ($errorCodes as $name => $desc) {

		//printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'desc', print_r($desc,true));

		$error = array(
			'error_sub_code' => $desc[0],
			'error_name' => $name,
			'error_message' => $desc[1],
		);
		if ($name == $error_name || ($desc[0] == $error_code && $error_code !== null && $error_code !== '')) {
			//printf("<PRE>getErrorCodes.error=[%s]<PRE>\n",print_r($error,true));
			return $error;
		}
		$errors[] = $error;

	}
	if (!empty($error_name) || !empty($error_code)) {
		return false;
	} else {
		return $errors;
	}
}

/**
* Retrieve query string parameters as list of types
* @param: $queryParams - Query String from get request
* @param: $paramKey - paramater name input query string (delimiter '|')
* @param: $paramType type - PARAM_STR/PARAM_INT/PARAM_BOOL
* @param: $defaultVal - defalut value
* @param: isRequired - true/false
* @return value of query key
*/
function getParameter($queryParams, $paramKey, $paramType=PDO::PARAM_STR, $defaultVal=null, $isRequired=false) {

	$paramKey = explode('|', $paramKey); //seperate alias of query parameter

	$idx = 0;
	foreach($paramKey as $key) {

		if(isset($queryParams)) {
			$value = isset($queryParams[$key]) ? $queryParams[$key] : $defaultVal;
		} else {
			//GEPS
			$value = ( ( isset( $_GET[$key] ) ) ? ( $_GET[$key] ) :
						( ( isset( $_ENV[$key] ) ) ? ( $_ENV[$key] ) :
							( ( isset( $_POST[$key] ) ) ? ( $_POST[$key] ) :
								( ( isset( $_SERVER[$key] )  ) ?( $_SERVER[$key] ) : ( null ) )
							)
						)
					);
		}

		if(is_array($paramKey) && !isset($value) && $idx<count($paramKey)-1) {
			$idx++;
			continue;
		}

		//check up required value
		if($isRequired === true && !isset($value)) {
			return setHttpStatusCode(401, "Invalid Parameter");
		}
		if($isRequired === false && !isset($value)) {
			$value = $defaultVal; // setting up default value
			break;
		}

		//check up type of parameter
		switch($paramType) {
			case PDO::PARAM_STR:
				if(!is_string($value)) {
					return setHttpStatusCode(401, "Invalid Parameter string type");
				}
				if(is_null($value)) {
					$value = null;
				}
				break;
			case PDO::PARAM_INT:
				if(!is_numeric($value)) {
					return setHttpStatusCode(401, "Invalid Parameter integer type");
				}
				if(is_null($value))	{
					$value = 0;
				}
				break;
			case PDO::PARAM_BOOL:
				if (is_bool($value)) {
					return $value;
				}
				$value = strtolower(trim($value));
				if(!empty($value) && !preg_match('/true|false|0|1/', $value)) {
					return setHttpStatusCode(401, "Invalid Parameter boolean type");
				}
				if(is_null($value))	{
					$value = false;
				}
				$value = ($value === "true" || $value == "1")? true: false;
				break;
			default:
				return setHttpStatusCode(401, "Unknown parameter type");
				break;
		}
		break;

	} //end of foreach
	return $value;

}

/**
 * Verifies that the provided path has only legal patterns (e.g. no reference to parent such as '..')
 * @param String $pathStr the path to be verified
 * @return boolean Is the path legal
 */
function isPathLegal($path) {
	//Paths are not allowed to refer to parent directory
	$pattern = '/^\.\.\/|\/\.\.\//';
	if(preg_match_all($pattern, $path, $out) > 0)
		return false;

	//Paths are not allowed to include piping
	if(strpos($path, '|') !== false)
		return false;
	
	return true;
}
/**
 * Verifies that the provided path is FAT32 compatible if the volume is FAT32 formatted
 * @param String $filePath the path to be verified
 * @param String $shareName the share of the to be verified
 * @return boolean Is the path legal
 */
function invalidFat32Path($filePath, $shareName)
{
	$vol = \RequestScope::getMediaVolMgr()->getVolumeByShareName($shareName);
	if (isset($vol['FsType']) && strcasecmp("vfat", $vol['FsType']) == 0){
		foreach ([':', '<', '>', '\\', '?', '*', '"'] as $check){
			if (strpos($filePath, $check) !== FALSE){
				return TRUE;
			}
		}
	}
	return FALSE;
}

function getSafeDatabaseText($dbText) {
	//need to remove slashes for sqlite
	$dbText = stripslashes($dbText);
	return $dbText;
}


function startsWith($string, $prefix) {
	if ( strpos($string, $prefix) === 0 ){
		return true;
	}
	return false;
}

function startsWithIgnoreCase($string, $prefix) {
	return startsWith(strtolower($string), strtolower($prefix));
}

function removeDuplicateForwardSlashes($string) {
	return preg_replace('/\/{2,}/', '/', $string);
}

function getQueryParamValue($queryParams, $key) {
	$value = isset($queryParams[$key])  ? trim($queryParams[$key])  : false;
	$value = ($value === 'true' || $value === '1'  || $value === 1) ? true : false;
	return $value;
}

function addForwardSlashIfNotAtFront($pathStr) {
	if(!startsWith($pathStr, '/')){
		return '/'.$pathStr;
	}
	return $pathStr;
}//addForwardSlashIfNotAtFront($requestPath)

function filterQueryParams($paramSubString, $queryParams) {
	$params = array();
	foreach ($queryParams as $key=>$value) {
		if(startsWithIgnoreCase($key, $paramSubString)) {
			$params[substr($key, strlen($paramSubString))] = $value;
		}//if
	}//foreach
	unset($params['path']);// remove dest_path
	return $params;
}//filterQueryParams

function buildQueryParamsUnencoded($dropboxFileParams) {
	$params = array();
	foreach ( $dropboxFileParams as $paramKey => $paramValue){
		$params[] = "$paramKey=$paramValue";
	}
	return implode('&', $params);
}//buildQueryParamsUnencoded

function isLocalFile($fileManagerDescriptorStr) {
	return ( strcasecmp('@LOCAL', $fileManagerDescriptorStr) === 0 );
}

function isLocalDir($fileManagerDescriptorStr) {
	return isLocalFile($fileManagerDescriptorStr);
}

function getHTTPStatusCode($httpResponse){
	$length = strpos($httpResponse, "\r\n");
	$responseFirstLine = substr($httpResponse, 0, $length);
	$responseFirstLineArr = explode(' ', $responseFirstLine);
	return $responseFirstLineArr[1];
}

function getShareNameFromRequest() {
	$pathArr = RequestScope::getInstance()->getUrlPaths();

	if (isset($pathArr[0])) {
		return $pathArr[0];
	}

	return false;
}

function getFilePathFromRequest() {
	$pathArr = RequestScope::getInstance()->getUrlPaths();

	if (isset($pathArr[0])) {
		return implode('/', $pathArr);
	}

	return false;
}


/**
 * On 32 bit systems, files greater then 2GB return false for is_file(). This is a work around for that.
 *
 * @param string $path A path in the filesystem.
 * @return boolean
 */
function isFileLfs($path){
	$file = escapeshellarg($path);
	exec_runtime(sprintf('[ -f %s ]', $file), $tmp, $ret,false);
	\Core\Logger::getInstance()->info("Ret :: $ret");
	if(!$ret){
		return true;
	}
	else{
		return 	false;
	}
}

//we need this function to get statistical values when php stat is not working (over 2Gb files)
function fstatLfs($file, $includePermissions=null){
	$result = array();
	$fstat = @stat($file);
	if(is_array($fstat)){
        $size = $fstat['size'];
        $blockCount512 = $fstat['blocks'];
		$result = array('size' => $size,
					'mtime' => $fstat['mtime'],
					'mode' => $fstat['mode'],
					'owner_id' => $fstat['uid'],
					'group_id' => $fstat['gid']);
		if($includePermissions){
			$result = $result + getPermissions($fstat);
		}
		//For over 2Gb files (31 bits) we can not trust fstat size. The size is measured in 512byte blocks (9 bits).  For fast math we use downshift of 22 bits = 31 bit - 9 bit.
		if( $blockCount512 >> 22 !=0 ){
            $blockCount64k = $blockCount512>>7; //To convert from 512byte (9 bits) to 64k (16 bits) we shift by 7 bits.
            $blockCount64k -= 1 & ($blockCount64k ^ ($size>>16));
            $leastSignificant16Bits = $fstat['size'] & 0xFFFF;

            $result['size'] = bcadd(bcmul($blockCount64k, 0x10000), $leastSignificant16Bits);
		}
	}else{
		$largeMap = array(	'size' => '%s',
						'mtime' => '%Y',
						'permissions' => '%A',
						'owner_name' => '%U',
						'group_name' => '%G',
						'owner_id' => '%u',
						'group_id' => '%g');
		foreach($largeMap as $largeMapK => $largeMapV){
			$shellArg = escapeshellarg($file);
			exec_runtime("stat -c $largeMapV $shellArg", $output, $status, false);
			$result[$largeMapK] = trim(implode("\n", $output));
		}
		$result['mode'] = '';
	}
	return $result;
}

//function specifically for Lighitng to get mimeType of large files
function mimeTypeHack($filename) {
	$mime_types = array();
	$path = '/etc/lighttpd/mimetypes';
	if(!file_exists($path))
		return false;
	$file = fopen($path, 'r');
	while(($line = fgets($file)) !== false) {
		$line = preg_replace('/\"/', '', $line);
		$line = preg_replace('/\./', '', $line);
		if(!$line)
			continue;
		$parts = explode('=>', $line);
		if(count($parts) == 1)
			continue;
		$type = trim(array_shift($parts));
		if(!isset($mime_types[$type]))
			$mime_types[$type] = trim(array_shift($parts));
	}
	fclose($file);

	$ext = strtolower(array_pop(explode('.',$filename)));
	if (array_key_exists($ext, $mime_types)) {
		return $mime_types[$ext];
	}

	else {
		return 'application/octet-stream';
	}
}

function languageMap($languageToTranslate){
	$languageMap = array(
			'zh_CN'	=> array('CHS'), //Chinese Simplified
			'zh_TW'	=> array('CHT'), //Chinese Traditional
			'cs_CZ'	=> array('CZE', 'CES'), //Czech
			'nl_NL'	=> array('DUT', 'NLD'), //Dutch
			'en_US'	=> array('ENG2', 'ENG'), //English
			'fr_FR'	=> array('FRA'), //French
			'de_DE'	=> array('DEU'), //German
			'hu_HU'	=> array('HUN'), //Hungarian
			'it_IT'	=> array('ITA'), //Italian
			'ja_JP'	=> array('JPN'), //Japanese
			'ko_KR'	=> array('KOR'), //Korean
			'nb_NO'	=> array('NOR'), //Norwegian
			'pl_PL'	=> array('PLK', 'POL'), //Polish
			'pt_BR'	=> array('PBR'), //Portuguese Brazil
			'ru_RU'	=> array('RUS'), //Russian
			'es_ES'	=> array('ESN'), //Spanish
			'sv_SE'	=> array('SWE'), //Swedish
			'tr_TR'	=> array('TUR', 'TRK'), //Turkish
			);
	if(isset($languageMap[$languageToTranslate])){
		return $languageMap[$languageToTranslate];
	}else{
		return false;
	}

}
//bringin back this function, since so far there is no better way to get permissions for a file without
//unneccessary "exec" calls
function getPermissions($fstat) {
	//Code sinppet copied form http://www.php.net/manual/en/function.stat.php
	$ts=array(
		0140000=>'ssocket',
		0120000=>'llink',
		0100000=>'-file',
		0060000=>'bblock',
		0040000=>'ddir',
		0020000=>'cchar',
		0010000=>'pfifo'
	);
	$mode = $fstat['mode'];
	$t=decoct($mode & 0170000); // File Encoding Bit

	$permissions =(array_key_exists(octdec($t),$ts))?$ts[octdec($t)]{0}:'u';
	$permissions.=(($mode&0x0100)?'r':'-').(($mode&0x0080)?'w':'-');
	$permissions.=(($mode&0x0040)?(($mode&0x0800)?'s':'x'):(($mode&0x0800)?'S':'-'));
	$permissions.=(($mode&0x0020)?'r':'-').(($mode&0x0010)?'w':'-');
	$permissions.=(($mode&0x0008)?(($mode&0x0400)?'s':'x'):(($mode&0x0400)?'S':'-'));
	$permissions.=(($mode&0x0004)?'r':'-').(($mode&0x0002)?'w':'-');
	$permissions.=(($mode&0x0001)?(($mode&0x0200)?'t':'x'):(($mode&0x0200)?'T':'-'));

	$owner = (function_exists('posix_getpwuid'))?@posix_getpwuid($fstat['uid']):'';
	$owner_name = '';
	if(isset($owner['name']))
        $owner_name = $owner['name'];

	$group = (function_exists('posix_getgrgid'))?@posix_getgrgid($fstat['gid']):'';
	$group_name = '';
	if(isset($group['name']))
        $group_name = $group['name'];

	return array("permissions" => $permissions, "owner_name" => $owner_name, "group_name" => $group_name);
}
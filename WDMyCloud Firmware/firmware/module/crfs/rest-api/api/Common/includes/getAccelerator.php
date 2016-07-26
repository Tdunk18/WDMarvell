<?php
//  This set of functions has the purpose of re-using previous authentication information that is APC-cached so it can quickly
//     handle GET file_contents for some of the simplest cases.
//  For performance, this code is completely independent: It has NO require_once and does NOT use the class loader.
//  If this new logic can't handle the request, then the previous logic operates just as it did before.
//  The logic is: If the same credentials (e.g. cookie) are used to read a file from the same share and the previous request recently succeeded,
//                then immediately use x-send to serve this file.
//----------------------------------------------------------------------------------------------------------------------


// This is called by the GET file_contents API when it is almost done.  It uses APC to store the basePath of this share for use to accelerate the next similar request
function updatePendingAccelInfo($transcodedBasePath) {
    $key = generateSecurityKey();
    $value = array('transcodedBasePath' => $transcodedBasePath);
    apc_store('FAST_GET_'.$key, $value, 60);
}

// Find the identifying set of credentials that are part of this request: cookie, duid/duac, or username/pswd
function generateSecurityKey(){
    // Find the identifying set of credentials that are part of this request: cookie, duid/duac, or username/pswd
    $transcoded = isset($_REQUEST['tn_type']) ? 't' : 'r';
    $securityIdentifier = NULL;
    if (isset($_SERVER["HTTP_COOKIE"])) {
        $securityIdentifier = 'C'.$transcoded.$_SERVER["HTTP_COOKIE"];
    } else
    if(isset($_REQUEST['device_user_id']) && isset($_REQUEST['device_user_auth_code'])) {
        $securityIdentifier = 'D'.$transcoded.$_REQUEST['device_user_id'] . '#' . $_REQUEST['device_user_auth_code'];
    } else
    if(isset($_REQUEST['auth_username']) && isset($_REQUEST['auth_password'])) {
        $securityIdentifier = 'U'.$transcoded.$_REQUEST['auth_username'] . '#' . $_REQUEST['auth_password'];
    }
    if(isset($_REQUEST['hmac'])) {
        $securityIdentifier = 'H'.$transcoded.$_REQUEST['hmac'];
    }
    //If there are no credentials for this request, then we are done
    if($securityIdentifier == NULL){
        return false;
    }
    $urlParts = explode('/', rawurldecode(trim(parse_url($_SERVER['REQUEST_URI'])['path'])));

    $shareName = $urlParts[5];
    $subPath = implode(DIRECTORY_SEPARATOR, array_slice($urlParts, 6));
    if(isset($_REQUEST['hmac'])) {
        $key = $securityIdentifier . '#' . $shareName. DIRECTORY_SEPARATOR . $subPath;
    }else{
        $key = $securityIdentifier . '#' . $shareName;
    }

    return $key;
}

//If fastGet can be performed, it returns true (request is done).  If not, it returns false (request should proceed as usual)
function handleAcceleratedRequest() {
    // Only supports GET
    if ( strtolower( isset($_REQUEST['rest_method']) ? $_REQUEST['rest_method'] : strtolower($_SERVER['REQUEST_METHOD']) ) != 'get' )
        return false;

    $urlParts = explode('/', rawurldecode(trim(parse_url($_SERVER['REQUEST_URI'])['path'])));
    $compName = $urlParts[4];
    // Only supports file_contents
    if($compName!='file_contents')
        return false;
    // If any special logic is needed for HTTP_RANGE, then we may need to disable support for HTTP_RANGE
    if (isset($_SERVER['HTTP_RANGE']) || isset($_REQUEST['HTTP_RANGE']) || isset($_REQUEST['http_range']))
        return false;
    
    //Parse path information on the requested file
    if (count($urlParts) <= 5)
        return false;
    $shareName = $urlParts[5];
    $subPath = implode(DIRECTORY_SEPARATOR, array_slice($urlParts, 6));
    $extension = strtolower(pathinfo($subPath, PATHINFO_EXTENSION));

    // Only supports certain mime types (we may also test performance and compatibility of using finfo_open()).
    switch ($extension) {
        case 'jpg' :
        case 'jpeg': $contentType = 'image/jpeg' ; break;
        case 'gif' : $contentType = 'image/gif'  ; break;
        case 'png' : $contentType = 'image/png'  ; break;
        case 'mp3' : $contentType = 'audio/mpeg' ; break;
        case 'aac' : $contentType = 'audio/x-aac'; break;
        case 'wma' : $contentType = 'audio/x-ms-wma' ; break;
        case 'avi' : $contentType = 'video/avi'  ; break;
        case 'mov' : $contentType = 'video/quicktime' ; break;
        case 'mpeg': $contentType = 'video/mpeg' ; break;
        case 'mp4' : $contentType = 'video/mp4'  ; break;
        case 'wmv' : $contentType = 'video/x-ms-wmv' ; break;
        case 'flv' : $contentType = 'video/x-flv'; break;
        case 'txt' : $contentType = 'text/plain' ; break;
        case 'ppt' : $contentType = 'application/vnd.ms-powerpoint'; break;
        case 'doc' : $contentType = 'application/vnd.ms-word'      ; break;
        case 'xls' : $contentType = 'application/vnd.ms-excel'     ; break;
        default: return false;
    }

    // Find the identifying set of credentials that are part of this request: cookie, duid/duac, or username/pswd
    $key = generateSecurityKey();
    
    //If there are no credentials for this request, then we are done
    if($key == NULL){
        return false;
    }

    $accelInfo = apc_fetch('FAST_GET_'.$key);

    //If no record was found or it was too old, then we can't process this request
    if($accelInfo == NULL)  {
        return false;
    }

    //Generate the actual linux path to the file
    $transcodingType = isset($_REQUEST['tn_type']) ? $_REQUEST['tn_type'] : 'none';

    if($transcodingType == 'none') {
        $fullPath = DIRECTORY_SEPARATOR. "shares". DIRECTORY_SEPARATOR. $shareName.DIRECTORY_SEPARATOR.$subPath;
    } else {
        $dirName  = pathinfo($subPath, PATHINFO_DIRNAME);
        //to get coverart for mp3 we need to query the database 
        if($extension=="mp3") 
           return false;
        
        if($extension=="jpg" || $extension=="jpeg"){
            $fileNameToUse = pathinfo($subPath, PATHINFO_FILENAME);
        }else{
            $fileNameToUse = pathinfo($subPath, PATHINFO_BASENAME);
        }

        switch($transcodingType) {
            case 'tn96s1' : $transGUID = 'cb62bbdd389b48898f2e5244977cb2c5'; break;
            case 'i1024s1': $transGUID = 'a76ef047d8d24c03823acdf41c4ee7c8'; break;
            default: return false;
        }
        
        $fullPath = $accelInfo['transcodedBasePath']. $dirName . '/transcoded_files/' .  $fileNameToUse . '.' . $transGUID . ".jpg";
        $contentType = 'image/jpeg';
    }
    //We can't serve a file unless it exists
    if (!file_exists($fullPath))
        return false;

    //$isDownload will default to true unless the parameter is set and the parameter has a value of false
    $isDownload = ! ( isset($_REQUEST['is_download']) && (strtolower($_REQUEST['is_download']) == 'false' ) );
    $dispositionType = $isDownload ? 'attachment' : 'inline';
    
    //Add the standard headers and use x-send to send the file
    header('Pragma: public');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Cache-Control: private', FALSE);
    header('Content-Disposition: '. $dispositionType. "; filename*=UTF-8''".rawurlencode(basename($fullPath)));
    header('Content-Type: ' . $contentType . '; charset=UTF-8');
    header('Content-Transfer-Encoding: binary');
    header('X-Sendfile: ' . $fullPath);
    header('Expires: 0');
    return true;
}

<?php

include ("../lib/login_checker.php");

/* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
/*

  *** Commenting out for development.  TODO: Uncomment this before production build. ***

if (login_check() != 1) {
    header('Content-Type: application/json');
    http_response_code(401);
    goto __exit;
}
*/
$model_id = str_replace("\n", "", file_get_contents("/etc/model"));

/* GrandTeton and Zion have the same model id, but App URLs are different */
if ($model_id == "WDMyCloudMirror") {
    $model_number = shell_exec('echo $(source /etc/system.conf 2>/dev/null; echo $modelNumber)');
    $model_number = rtrim($model_number);
    if ($model_number == "BWVZ") {           /* Check for GrandTeton model number */
        $model_id = "WDMyCloudMirrorG2";
    }
}

/* Server override */
$download_server = "http://download.wdc.com";
if (file_exists("/tmp/docker_apps_server")) {
    $docker_apps_server = file_get_contents("/tmp/docker_apps_server");
    $docker_apps_server = trim($docker_apps_server);
    if (!empty($docker_apps_server)) {
        $download_server = $docker_apps_server;
    }
}

$curlCommand = 'sudo curl ' . $download_server . '/docker_apps/';
$curlCommand .= $model_id;
$curlCommand .= '/apps.json';

$body = shell_exec($curlCommand);

header('Content-Type: application/json');
echo $body;
__exit:
?>

<?php
$docker_support = shell_exec('sudo /bin/echo $(source /usr/local/modules/files/project_features &>/dev/null && echo ${PROJECT_FEATURE_DOCKER})');
$docker_support = rtrim($docker_support);
/* $docker_support should be 1 if docker is supported */
$body = "{\"docker_support\":\"" . $docker_support . "\"}";

header('Content-Type: application/json');
http_response_code(200);
echo $body;
__exit:
?>

<?php
$filename = str_replace('\\','',$_REQUEST['name']);

//$target = $_REQUEST['upload_folder'] . $_REQUEST['name'];
//$target_new = $_REQUEST['folder'] . $_REQUEST['name'];

$target = $_REQUEST['upload_folder'] . $filename;
$target_new = $_REQUEST['folder'] . $filename;
$dst = fopen($target, 'wb');

for($i = 0; $i < $_REQUEST['index']; $i++) {
    $slice = $target . '-' . $i;
    $src = fopen($slice, 'rb');
    stream_copy_to_stream($src, $dst);
    fclose($src);
    unlink($slice);
}

fclose($dst);

sleep(1);
rename($target, $target_new);
chmod($target_new,0777);
?>
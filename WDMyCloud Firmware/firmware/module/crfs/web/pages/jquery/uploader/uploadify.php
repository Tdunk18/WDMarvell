<?php
session_id($_POST['PHPSESSID']);	
session_start();
/*
Uploadify v2.1.4
Release Date: November 8, 2010

Copyright (c) 2010 Ronnie Garcia, Travis Nickels

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
// $fileTypes  = str_replace('*.','',$_REQUEST['fileext']);
	// $fileTypes  = str_replace(';','|',$fileTypes);
	// $typesArray = split('\|',$fileTypes);
	// $fileParts  = pathinfo($_FILES['Filedata']['name']);
	
	// if (in_array($fileParts['extension'],$typesArray)) {
		// Uncomment the following line if you want to make the directory if it doesn't exist
		// mkdir(str_replace('//','/',$targetPath), 0755, true);
		
		
$r = new stdClass();
$r->success = false;

include ("../../lib/login_checker.php");

/* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
if (login_check() != 1)
{
	echo json_encode($r);
	exit;
}


if (!empty($_FILES)) {
	$tempFile = $_FILES['Filedata']['tmp_name'];
//	$targetPath = $_SERVER['DOCUMENT_ROOT'] . $_REQUEST['folder'] . '/';
	$targetPath =  $_REQUEST['folder'] . '/';
	
	$new_file_name =  str_replace('\\','',$_FILES['Filedata']['name']);  //amy++
	$targetFile =  str_replace('//','/',$targetPath) . $new_file_name; //amy++
	
	
	//$targetFile =  str_replace('//','/',$targetPath) . $_FILES['Filedata']['name'];
	
//	echo $tempFile;
//	echo $targetFile;
		
		move_uploaded_file($tempFile,$targetFile);
		chmod($targetFile,0777);
		
		//fish 20120824+ change owner for Quota
		$username = $_REQUEST['username'];
		if(!empty($username))
		{
			chown($targetFile, $username);
			$userinfo = posix_getpwnam($username);
			chgrp($targetFile, (int)$userinfo['gid']);
		}
		system("sync");
		//end
		
		system("wto -r");// fish20120711+ timeout reset
		echo str_replace($_SERVER['DOCUMENT_ROOT'],'',$targetFile);
		
	// } else {
	// 	echo 'Invalid file type.';
	// }
}


// $fileTypes  = str_replace('*.','',$_REQUEST['fileext']);
	// $fileTypes  = str_replace(';','|',$fileTypes);
	// $typesArray = split('\|',$fileTypes);
	// $fileParts  = pathinfo($_FILES['Filedata']['name']);
	
	// if (in_array($fileParts['extension'],$typesArray)) {
		// Uncomment the following line if you want to make the directory if it doesn't exist
		// mkdir(str_replace('//','/',$targetPath), 0755, true);
?>
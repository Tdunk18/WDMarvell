<?php
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


$ip = gethostbyaddr($_SERVER['HTTP_HOST']);
$name = $_REQUEST['name'];
$pwd = $_REQUEST['pwd'];
$redirect_uri =  $_REQUEST['redirect_uri'];	

//echo $name ."<br>".$pwd."<br>".$ip;


$result = @stripslashes( @join( @file( "http://".$ip."/mydlink/mydlink.cgi?cmd=1&name=".$name."=&pwd=".$pwd ),"" ));

$result_1 = strstr($result,"<auth_status>0</auth_status>");
$result_1 = substr ($result_1, 0,28);  

if (strncmp ($result_1,"<auth_status>0</auth_status>",28) == 0 )
//if (strstr($result,"<auth_status>0</auth_status>")== 0 )
{
	header("HTTP/1.1 302 Found");
  header("Location: ".$redirect_uri."?status=0");
  exit();	
}
 
 
if (!empty($_FILES)) {
		
		$targetPath =  $_REQUEST['folder'] . '/';	
		$count = (count($_FILES["Filedata"])-2);	

 			
		for ( $I=0; $I < $count; $I++ ) 
		{
			$tempFile = $_FILES['Filedata']['tmp_name'][$I];

			if ($tempFile == "")
			{					
					continue;
			}			
			$new_file_name =  str_replace('\\','',$_FILES['Filedata']['name'][$I]);  //amy++
			$targetFile =  str_replace('//','/',$targetPath) . $new_file_name; 	
			
			$status = move_uploaded_file($tempFile,$targetFile);
			
			if(!file_exists($targetFile))
			{									
					header("HTTP/1.1 302 Found");
    			header("Location: ".$redirect_uri."?status=0");
					exit();
			}
			else
			{
					chmod($targetFile,0777);
			}															
		}
	}		
	
		header("HTTP/1.1 302 Found");
    header("Location: ".$redirect_uri."?status=1");

				
?>
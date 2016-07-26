<?php
//
// jQuery File Tree PHP Connector
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// Output a list of files for jQuery File Tree
//
//$dir = $_POST['dir'];
//$host = $_POST['host'];
//$pwd = $_POST['pwd'];
//$user = $_POST['user'];

$host = ($_POST['host'] == "")? $_GET['host']:$_POST['host'];
$pwd = ($_POST['pwd'] == "")? $_GET['pwd']:$_POST['pwd'];
$user = ($_POST['user'] == "")? $_GET['user']:$_POST['user'];
$dir = ($_POST['dir'] == "")? $_GET['dir']:$_POST['dir'];
$lang = ($_POST['lang'] == "")? $_GET['lang']:$_POST['lang'];
//echo $dir."dir1=".dir1;
error_reporting(0);
		
		@unlink("/tmp/ftp-folder.txt");
		@unlink("/tmp/ftp-file.txt");
	
		$cmd = sprintf("ftp_download -c gettree -i \"%s\" -u \"%s\" -p \"%s\" -t \"%s\" -l \"%s\"", $host, $user, $pwd ,$dir ,$lang);
	
		$handle = popen($cmd, 'r');		
		$read = fread($handle, 2096);		
		pclose($handle);			
			
		$read = trim($read, "\n"); 
		if ((strcmp($read,"430") == 0) ||
		 		(strcmp($read,"10061") == 0) ||
		 		(strcmp($read,"10064") == 0) ||
		 		(strcmp($read,"11001") == 0) ||
		 		(strcmp($read,"10060") == 0) ||
		 		(strcmp($read,"10057") == 0))
		{
			echo "<ul class=\"jqueryFileTree\" style=\"display:\">";	
			echo $read;
			echo "</ul>";				
			exit(1);
		}

		$fp = fopen("/tmp/ftp-folder.txt", "r");
		$fp_file = fopen("/tmp/ftp-file.txt", "r");
		
		if ($fp || $fp_file)
				echo "<ul class=\"jqueryFileTree\" style=\"display:\">";	
		if($fp)
		{			
		    while (($line = fgets($fp, 512)) !== false) {				    	
		    	$line = trim($line, "\n");
		    	$fullpath = htmlentities($dir.$line);
		    	$rel = htmlentities($line);
		    	echo "<li class='directory collapsed'><input class='directory' type='checkbox' rel=\"$line\" src=\"$line\" value=\"$fullpath\" name='folder_name'></input><a href='#' rel=\"$rel\"> $rel</a></li>";
		    }		 
			fclose($fp);			
		}
		if($fp_file)
		{					
		    while (($line = fgets($fp_file, 512)) !== false) {				    	
		    	$line = trim($line, "\n");
		    	$fullpath = htmlentities($dir.$line);
		    	$rel = htmlentities($line);
		    	echo "<li class='file ext_$ext'><input class='file' type='checkbox' rel=\"$line\" src=\"$line\" value=\"$fullpath\" name='folder_name'></input><a href='#' rel=\"$rel\"> $rel</a></li>";
		    }		 
		    
			fclose($fp_file);			
		}

		if ($fp || $fp_file)
				echo "</ul>";	

?>
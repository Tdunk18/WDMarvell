<?php
	parse_str( $_SERVER['QUERY_STRING'] , $queryParams);
	
	$ctype    = mime_content_type($queryParams['file']);
	$fsize    = filesize($queryParams['file']); 
	var_dump($fsize);
	
	$filename = basename($queryParams['file']);
	$names    = explode('.', $filename);
	$filename = current($names) . '.' . end($names);
	
	header('X-Sendfile: ' . $queryParams['file']);
	header('Content-Type: ' . $ctype);
	header('Content-Disposition: '. 'inline'. '; filename="' . $filename . '"');
	
?>
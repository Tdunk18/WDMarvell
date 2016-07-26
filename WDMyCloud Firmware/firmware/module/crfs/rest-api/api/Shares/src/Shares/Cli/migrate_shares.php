#!/usr/bin/php
<?php
if ($argc < 2) {
	echo "Usage: migrate_shares.sh  <path to smb.conf file> \n";
	exit(1);
}
$smbConfPath = strtolower($argv[1]);
$dbFileLocation = "/usr/local/nas/orion/orion.db";

if(!file_exists($dbFileLocation)){
	echo "dbFile is not found in specified location: ".$dbFileLocation."\n";
	exit(2);
}
if(!file_exists($smbConfPath)){
	echo "smbConf is not found in specified location: ".$smbConfPath."\n";
	exit(3);
}

$dbConnection = new SQLite3($dbFileLocation);
$mediaServingData = readMediaServingFromDb($dbConnection);
$smbConfArray = readSmbConf($smbConfPath);

foreach($smbConfArray as $smbConfArrayShare => $smbConfArrayValues){
	if(!isset($smbConfArrayValues["properties"])){
		$smbConfArray[$smbConfArrayShare]["properties"] = "";
	}
	//if media serving is enabled in the db but not present in the properties of the share
	if(isset($mediaServingData[$smbConfArrayShare]) && $mediaServingData[$smbConfArrayShare]=="any" &&
		strpos($smbConfArray[$smbConfArrayShare]["properties"] ,"media_serving") === false){
		$smbConfArray[$smbConfArrayShare]["properties"] .= empty($smbConfArray[$smbConfArrayShare]["properties"]) ? "\"media_serving\"" : ", \"media_serving\"";
	}
}

writeSmbConf($smbConfArray, $smbConfPath);
cleanUpTheDb($dbConnection);

//get the information about media serving from the database
function readMediaServingFromDb($dbConnection){

	//retrieve the create statement query for the source table; 
	$tableExists = $dbConnection->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='SELECT share_name, media_serving FROM UserShares;';"); 
	if ($tableExists===false){
		echo "table userShares does not exist in the database.";
		exit(); 
	}

	$result = $dbConnection->query("SELECT share_name, media_serving FROM UserShares;"); 
	
	$mediaServingData = array(); 
	
	while($res = $result->fetchArray(SQLITE3_ASSOC)){ 
		$mediaServingData[$res['share_name']] = $res['media_serving']; 
	} 
	
	//condition under which we do not perform the migration
	if (empty($mediaServingData)){
		exit(); 
	}
	return $mediaServingData;
}


function readSmbConf($smbConfPath){ 
	$smbConfArray = file($smbConfPath);
	$smbConf = [];
	$sectionName = null;
	foreach($smbConfArray as $confLine) {
		//ignore comments, except when it is something we are interested in
		if (strpos(trim($confLine),"#") === 0) {
			if (  (strpos($confLine, "!!properties") !== false) &&
				  $sectionName != null  ) {
				$propertiesStr = substr($confLine, strpos($confLine, '=') + 2);
				$smbConf[$sectionName]["properties"] = trim($propertiesStr);
			}
			continue;
		}
		$keyVal = explode("=", $confLine);
		$key = trim($keyVal[0]);
		if (sizeof($keyVal) > 1) {
			$val = trim($keyVal[1]);
		}
		$openBrackPos = strpos($key, '[');
		$closeBrackPos = strpos($key, ']');

		if (($openBrackPos === 0) && ($closeBrackPos !== false)) {
			$sectionName = trim(substr($key, $openBrackPos+1, $closeBrackPos-1));
			$smbConf[$sectionName] = [];
		}
		elseif($key!="") {
			if (!empty($sectionName)) {
				$smbConf[$sectionName][$key] = $val;
			}
			else {
				$smbConf[$key] = $val;
			}
		}
	}
	return $smbConf;
}


function writeSmbConf($smbConf, $smbConfPath){
	$cr = PHP_EOL;
	$content = "";

	//write the entire smbConf array into the temp file
	foreach ($smbConf as $section=>$sectionContents) {
		$content .= "[". $section . "]" . $cr;
		foreach ($sectionContents as $name=>$value) {
			if ($name == "properties") {
				$content .= "# !!properties = " . $value . $cr;
			}
			else {
				$content .= $name . " = " . $value . $cr;
			}
		}
		$content .= $cr;
	}

	//write the contents into the temp file
	if(!file_put_contents($smbConfPath, $content)){
		echo 'Could not write into samba file ';
		exit(4);
	}
	return true;
}

//empty the table in the database
function cleanUpTheDb($dbConnection){
	$result = $dbConnection->query("DELETE FROM UserShares;");
	if ($result===false){
		echo "failed to empty the database table";
		exit(5);
	}
}

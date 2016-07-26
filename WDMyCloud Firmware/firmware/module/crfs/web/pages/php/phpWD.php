<?php

session_start();
$r = new stdClass();
$r->success = false;

include ("../lib/login_checker.php");

/* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
if (login_check() != 1)
{
	echo json_encode($r);
	exit;
}

if (function_exists('curl_init')) {
	
	$email =  $_GET ['email'];
	$password =  $_GET ['password'];

	//echo $email.'<br>';
	//echo $password.'<br>';
		
	$phpWD = new phpWD;
	$info = $phpWD->getDeviceList($email,$password);

	echo $info;
}
else
{
	throw new Exception('WD REST API needs the CURL PHP extension.');
}
class phpWD{
	
 	//http://www.wd2go.com/api/1.0/rest/device_users?format=xml&email={user_email}&password={user_password}
	
	public function getDeviceList( $email, $password ){
		
		$rest_endpoint = 'http://www.wd2go.com/api/1.0/rest/device_users';
		
		$params = $rest_endpoint."?format=xml&email=" .$email."&password=".$password;
		
		//echo "params=".$params.'<br>';
		
		$options = array(
			CURLOPT_URL => $params,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_POST => false,
			CURLOPT_TIMEOUT => 30,
			CURLOPT_SSL_VERIFYPEER => false,
			CURLOPT_SSL_VERIFYHOST => false
		);
		
		$curl = curl_init();
		curl_setopt_array($curl, $options);
		$resp = curl_exec($curl);
		$info = curl_getinfo($curl);		

		//echo "code=".$info['http_code']."<br>";

		if ($resp === false || $info['http_code'] != 200)
		{
			//$output = "No cURL data returned for $url [". $info['http_code']. "]";
			//if (curl_error($ch))
			//$output .= "\n". curl_error($ch);
			//echo "<br>output=".$output;
			$resp = "<info><status>ng</status></info>";
		}
		else 
		{
			// 'OK' status; format $output data if necessary here:
			//echo "<br>resp=".$resp;
		}

		curl_close($curl);
		return $resp;
	}
		
}

?>

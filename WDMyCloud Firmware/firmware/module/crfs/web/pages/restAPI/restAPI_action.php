<?php
session_start();
require("restAPI.php");

$action = $_GET['action'];
$SEND_TYPE = $_POST["send_type"];

function resTapi_send($toURL, $send_data)
{
	$REQUEST_METHOD = $_SERVER['REQUEST_METHOD'];
	switch($REQUEST_METHOD)
	{
		case "POST":
			return restAPI_POST($toURL, $send_data);
			break;

		case "PUT":
			return restAPI_PUT($toURL, $send_data);
			break;

		case "DELETE":
			return restAPI_DELETE($toURL, $send_data);
			break;

		default:
			return restAPI_GET($toURL, $send_data);
	}
}

switch($action)
{
	case "internet_access":
	{
		$toURL = sprintf("%s/internet_access", $REST_API_PATH);
		$send_data = array();
		echo restAPI_GET($toURL, $send_data);
	}
		break;

	case "device":
	{
		$toURL = sprintf("%s/device", $REST_API_PATH);
		$send_data = array();
		switch($SEND_TYPE)
		{
			case "PUT":
				$send_data = array(
					"remote_access" => $_GET['remote_access']
				);
				echo restAPI_PUT($toURL, $send_data);
				break;
	
			default: //GET
				echo restAPI_GET($toURL, $send_data);
		}
	}
		break;

	case "device_user":
	{
		$toURL = sprintf("%s/device_user", $REST_API_PATH);
		$send_data = array(
			"username" => $_GET['username']
		);

		switch($SEND_TYPE)
		{
			case "POST":
				echo restAPI_POST($toURL, $send_data);
				break;
	
			case "PUT":
				echo restAPI_PUT($toURL, $send_data);
				break;
	
			case "DELETE":
				$toURL .= "/" . $_POST['userID'];
				$send_data["device_user_auth_code"] = $_POST['device_user_auth_code'];

				echo restAPI_DELETE($toURL, $send_data);
				break;
	
			default: //GET
				echo restAPI_GET($toURL, $send_data);
		}
	}
		break;

	case "share_access":
	{
		$toURL = sprintf("%s/share_access/%s", $REST_API_PATH, $_POST['sharename']);
		$send_data = array(
			"username" => $_POST['username']
		);

		switch($SEND_TYPE)
		{
			case "POST":
				$send_data['access'] = $_GET['access'];
				echo restAPI_POST($toURL, $send_data);
				break;

			case "PUT":
				$send_data['access'] = $_GET['access'];
				echo restAPI_PUT($toURL, $send_data);
				break;

			case "DELETE":
				echo restAPI_DELETE($toURL, $send_data);
				break;

			default: //GET
				echo restAPI_GET($toURL, $send_data);
		}
	}
		break;

	case "users":
	{
		$toURL = sprintf("%s/users/%s", $REST_API_PATH, $_POST['username']);
		$send_data = array();

		switch($SEND_TYPE)
		{
			case "DELETE":
				echo restAPI_DELETE($toURL, $send_data);
				break;
	
			default: //GET
				echo restAPI_GET($toURL, $send_data);
		}
	}
		break;

	case "language_configuration":
	{
		$toURL = sprintf("%s/language_configuration", $REST_API_PATH);
		$send_data = array(
			"language" => $_POST['language']
		);

		echo restAPI_PUT($toURL, $send_data);
	}
		break;

	case "device_description":
	{
		$toURL = sprintf("%s/device_description", $REST_API_PATH);
		$send_data = array(
			"machine_name" => $_POST['machine_name'],
			"machine_desc" => $_POST['machine_desc']
		);

		echo restAPI_PUT($toURL, $send_data);
	}
		break;
}

?>

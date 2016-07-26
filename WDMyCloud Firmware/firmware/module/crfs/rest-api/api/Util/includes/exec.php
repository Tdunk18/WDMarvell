<?php

/**
 * Function to execute a shell command string.
 *
 * @param string $command the shell command string
 * @param string $output the output from running the command (returned)
 * @param string $return_var the shell exit code (returned)
 * @return unknown
 */

$metachars = array('#','*','?','~','<','>','^','(',')','[',']','{','}',chr(0x0A),chr(0xFF));

function exec_runtime( $command, &$output = null, &$return_var = null, $escapeCmd = true) {

	global $metachars;

	if ($escapeCmd) {
		//escape shell meta-characters to prevent command injection

		$command = escapeshellcmd($command);

		//escapeshellcmd escapes meta characters within single quotes, we need to remove the backslashes
		//in this case to preserve the original quoted text.

		$quoteCtr = 0;
		if (strpos($command, "'") !== FALSE) {

			$commandArr = str_split($command);
			$commandLen = sizeof($commandArr);
			for ($idx = 0; $idx < $commandLen;  $idx++) {
				$char = $commandArr[$idx];
				if ($char === '\'') {
					if (!$quoteCtr) {
						//start of quoted string
						++$quoteCtr;
					}
					else if ($quoteCtr) {
						//end of quoted string
						--$quoteCtr;
					}
					//remove escape before quote
					if ($idx > 0 && $commandArr[$idx-1] == '\\') {
						unset($commandArr[$idx-1]);
					}
				}
				if ($quoteCtr && $char == '\\') {
					//remove backslash within quotes only if it preceeds a meta-character
					if (($idx +1) < $commandLen) {
						//backslash is not at end of command string
						if (in_array($commandArr[$idx+1], $metachars)) {
							//char after back-slash is a meta-character. so remove the backslash
							unset($commandArr[$idx]);
						}
					}
				}
			}
			$command = implode($commandArr);
		}

		//close out single quotes to prevent command injection using an un-terminated quoted string
		if ($quoteCtr) {
			$command = $command . "'";
		}
	}

    $output = $return_var = null; // $output is getting concatenated.... $return_var for good measure.
    $start = microtime(true);
    $return = exec($command, $output, $return_var);
	$totalTime = microtime(true) - $start;

    \Core\Logger::getInstance()->addCommand($command, $output, $totalTime);

	return $return;
}

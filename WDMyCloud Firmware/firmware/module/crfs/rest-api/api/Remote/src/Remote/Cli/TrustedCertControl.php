<?php
/**
 * \file TrustedCertControl.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */
namespace Remote\Cli;
		
	require_once(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
	require_once(COMMON_ROOT .'/includes/globalconfig.inc');
	
	use \Remote\Model\X509Certificate;
	use \Remote\Device\DeviceControl;
	use \Core\Logger;
	
	// Constants
	
	define("RETURN_CODE_SUCCESS", 0);
	define("RETURN_CODE_FAILURE_INCORRECT_NUMBER_OF_ARGUMENTS", 1);
	define("RETURN_CODE_FAILURE_INCORRECT_LOGGING_LEVEL", 2);
	define("RETURN_CODE_INVALID_START_TIME", 3);
	define("RETURN_CODE_FAILED_TO_RUN_CRONTAB", 4);
	define("RETURN_CODE_FAILED_TO_ADD_CRON", 5);
	
	define("CRONTAB_TMP_OUT_FILE","/tmp/crontab.out");
	define("CRONTAB_TMP_IN_FILE","/tmp/crontab.in");
	define("CRONTAB_TMP_ERR_FILE","/tmp/crontab.err");
	
	Class TrustedCertControl {
		
		const SIGNED_CERT_FILENAME = "server.crt";
		const HOURS_24_IN_SECS = 86400;
		const MAX_RETRIES = 3;
		
		private static $instance = null;
		private static $certPath = null;
		private static $logger = null;
		
		private $savedDeviceId;
		private $savedServerDomain;
		
		private function __construct($logLevel = Logger::ERR) {
			if (self::$logger == null ) {
				self::$logger = Logger::getInstance($logLevel);
			}
		}
		
		private function getCertificatePath() {
			if (self::$certPath == null) {
				self::$certPath =  getSSLCertPath() . self::SIGNED_CERT_FILENAME;

			}
			return self::$certPath;
		}
		
		private function registerDeviceForRemoteAccess() {
			self::$logger->info("TrustedCertControl - registering device with Central Server and Generating SSL Cert.");
			$deviceControl = DeviceControl::getInstance();
			$status = $deviceControl->registerDeviceWithName($deviceControl->getDeviceName()['machine_name']);	
			if (!$status) {
				self::$logger->err("TrustedCertControl - FAILED to register device with Central Server");
			}
			return $status;
		}
		
		private function generateCertificate($waitTime=0) {
			$retries = 0;
			$success = false;
			$deviceControl = DeviceControl::getInstance();
			
			while ($retries < self::MAX_RETRIES) {
				if ($waitTime > 0) {
					//log sleeping
                    self::$logger->info("TrustedCertControl - sleeping for: " . $waitTime . " seconds (1)");
					sleep($waitTime);
				}
				try {
					self::$logger->info("TrustedCertControl - generating a new SSL Certificate");
					
					$serverDomain = getServerDomain();
					$deviceId = getDeviceId();
					
					$success = 
						$deviceControl->generateDeviceSSLCertificate($serverDomain, 
																	 $deviceId, 
																	 getDeviceAuthCode());
				}
				catch (\Remote\CertificateWaitException $ex) {
					//check if we were told to wait
					$waitTime = $ex->getWaitTime();
					if ($ex->getCode() == 202) {
						//cert is being generated asynchrnously, so wait and then get it from the server
						self::$logger->info("TrustedCertControl - SSL Cert. Generation is Asynchronous (2), wait time is: " . $waitTime . " seconds");
						$success = $this->fetchGeneratedCertificate($serverDomain, $deviceId, $waitTime);
						break;
					}
					else {
						//certificate could not be generated now, request again after wait
						self::$logger->info("TrustedCertControl - SSL Cert. received back-off response (2), retrying in: " . $waitTime . " seconds");						
					}
				}
				catch (Exception $ex) {
					//failed for some other reason, log error
					$success = false;
				}
				$retries++;
			}
			return $success;
		}
		
		private function fetchGeneratedCertificate($serverDomain, $deviceId, $waitTime=0) {
			$retries = 0;
			$success = false;
			$deviceControl = DeviceControl::getInstance();
			
			while ($retries < self::MAX_RETRIES) {
				if ($waitTime > 0) {
					//log sleeping   
					self::$logger->info("TrustedCertControl - sleeping for: " . $waitTime . " seconds (2)");
					sleep($waitTime);
					
					//check to see if device Id and auth code have changed since we went to sleep
					//if they have, then we need to discard this certificate.
					if ( ($serverDomain != getServerDomain()) || ($deviceId != getDeviceId())) {
						//abandon this certificate request
						self::$logger->err("TrustedCertControl - server domain and/or device id have changed, abandon this cert. request");
						break;
					}
				}
				try {
					self::$logger->info("TrustedCertControl - attempting generate and download signed SSL Cert. from Central Server");
					$success = 
						$deviceControl->generateDeviceSSLCertificate($serverDomain, 
																	 $deviceId, 
																	 getDeviceAuthCode(),
																	 true);
					if ($success) {
						break;
					}
				}
				catch (\Remote\CertificateWaitException $ex) {
					//check if we were told to wait						
					$waitTime = $ex->getWaitTime();
					self::$logger->info("TrustedCertControl - SSL Cert. received back-off response (3), retrying in: " . $waitTime . " seconds");
				}
				catch (Exception $ex) {
					//failed for some other reason, log error
					self::$logger->err("TrustedCertControl - Exception during SSL Cert. generation and download: " . $ex->getMessage());
					$success = false;
				}
				$retries++;
			}
			if ($success) {
				self::$logger->info("TrustedCertControl - success: generate and download signed SSL Cert. from Central Server");
			}
			else {
				self::$logger->err("TrustedCertControl - failed: generate and download signed SSL Cert. from Central Server");
			}
			return $success;
		}
		
		private function updateCronTab($install, $startHour24 = null, $startMins = null) {

			self::$logger->info("TrustedCertControl - attempting to add cron job");
			
			//read current crontab
			$output = $retVal = null;
			exec_runtime("sudo crontab -l > " . CRONTAB_TMP_OUT_FILE . " 2> " . CRONTAB_TMP_ERR_FILE , $output, $retVal, false);
			if (file_exists(CRONTAB_TMP_OUT_FILE)) {
				$crontabOut = file_get_contents(CRONTAB_TMP_OUT_FILE);
			}
			if ($retVal) {
				//check for no crontab
				$exitCode = RETURN_CODE_FAILED_TO_RUN_CRONTAB;
				if (file_exists(CRONTAB_TMP_ERR_FILE)) {
					$crontabErr = file_get_contents(CRONTAB_TMP_ERR_FILE);
				}
				if ($crontabErr) {
					if (strpos($crontabErr, "no crontab") !== false) {
						$crontabOut = null;
						$exitCode = null;
					}
				}
				if ($exitCode) {
					self::$logger->err("TrustedCertControl - failed to add cron job (1), crontab returned error code: " . $exitCode);
					return($exitCode);
				}
			}
				
			if ($crontabOut) {
				$crontab = explode(PHP_EOL, $crontabOut);
			}
			else {
				//no crontab entries for this user
				$crontab = array();
			}
				
			//check crontab start time and replace if different from given start time
			$found = false;
			$modified = false;
			for ($i= 0; $i < sizeof($crontab); $i++) {
				if (strpos($crontab[$i], "ssl_cert_job.sh") !== false) {
					$crontabArr = explode(" ", $crontab[$i]);
					if (!$install ||
							$crontabArr[0] != $startHour24 ||
							$crontabArr[1] != $startMins) {
						//either un-install the cron job, or install and the times do not match, so remove this entry
						self::$logger->info("TrustedCertControl - Uninstall, or cron start time has changed, removing old cron job");
						unset($crontab[$i]);
						$modified = true;
					}
					else {
						$found = true;
					}
					break;
				}
			}
				
			if ($install && !$found ) {
				//add crontab entry
				$cronLine = sprintf( "%02d %02d * * * /usr/local/sbin/ssl_cert_job.sh start > /var/log/ssl_cert_cron.out 2>&1", $startHour24, $startMins);
				$crontab[] = $cronLine;
				$modified = true;
			}
				
			if ($modified) {
				$cronFile = fopen(CRONTAB_TMP_IN_FILE, "w");
				$rowCount = 0;
				foreach($crontab as $cronRow) {
					if (!empty($cronRow)) {
						fwrite($cronFile, $cronRow . PHP_EOL);
						$rowCount++;
					}
				}
				fclose($cronFile);
				if ($rowCount > 0) {
					//set crontab from file
					exec_runtime("sudo crontab " . CRONTAB_TMP_IN_FILE . " > " . CRONTAB_TMP_OUT_FILE . " 2>&1" , $output, $retVal); //DEBUG - add back sudo //
					unlink(CRONTAB_TMP_IN_FILE);
					if ($retVal) {
						self::$logger->err("TrustedCertControl - failed to update cron jobs, crontab returned error code: " . $exitCode);
						return(RETURN_CODE_FAILED_TO_ADD_CRON);
					}
				}
				else {
					//no crontab jobs, so remove
					$output = $retVal = null;
					exec_runtime("sudo crontab -r > " . CRONTAB_TMP_OUT_FILE . " 2>&1", $output, $retVal);  //DEBUG - add back sudo //
					if ($retVal) {
						self::$logger->err("TrustedCertControl - failed to delete cron job, crontab returned error code: " . $exitCode);
						return(RETURN_CODE_FAILED_TO_RUN_CRONTAB);
					}
				}
			}
		}
		
		
		
		public static function getInstance($logLevel = LOGGER::ERR) {
			if (self::$instance == null) {
				self::$instance = new TrustedCertControl($logLevel);
			}
			return self::$instance;
		}
		
		public function install($startHour24, $startMins) {

			self::$logger->info("TrustedCertControl - installing cron job, start-time: " . $startHour24 . ":" .  $startMins);
				
			if ($startHour24 < 0 || $startHour24 > 23 || $startMins < 0 || $startMins > 59 ) {
				return false;
			}
			return $this->updateCronTab(true, $startHour24, $startMins);
		}
		
		public function uninstall() {
			self::$logger->info("TrustedCertControl - uninstalling cron job");
			return $this->updateCronTab(false);
		}
		
		public function run() {
			
			$deviceId = getDeviceId();
			$serverDomain = getServerDomain();
			
			if ( strlen($deviceId) == 0 || strlen(getDeviceAuthCode()) == 0 ) {
				try {
					//note this also generates the certificate
					$this->registerDeviceForRemoteAccess();
				}
				catch (\Remote\CertificateWaitException $ex) {
					//check if we were told to wait
					$waitTime = $ex->getWaitTime();
					if ($ex->getCode() == 202) {
						//cert is being generated asynchronously, so wait and then get it from the server
						self::$logger->info("TrustedCertControl - SSL Cert. Generation is Asynchronous (1), wait time is: " . $waitTime . " seconds");
						return $this->fetchGeneratedCertificate($serverDomain, $deviceId,  $waitTime);
					}
					else {
						//certificate could not be generated now, request again after wait
						self::$logger->info("TrustedCertControl - SSL Cert. received back-off response (1), retrying in: " . $waitTime . " seconds");
						return $this->generateCertificate($waitTime);
					}
				}
				catch (Exception $ex) {
					//failed to get and install device credentials, log error and exit
					return false;
				}
				return true;
			}
			
			try {
				self::$logger->info("TrustedCertControl - checking existing SSL Certificate");
				
				$certificate = new X509Certificate($this->getCertificatePath());
			} catch (\Remote\RemoteException $ex)  {				
				//if here, device appears to have been registered, but SSL cert is missing or bad
				self::$logger->err("TrustedCertControl - failure to read or parse existing SSL Certifcate, generating a new one");
				return $this->generateCertificate();
			}
			
			//if here, certificate exists, was parsed sucessfully, and device is registered.
			
			//check if cert is already expired or will expire in the next 24 hours
			$expiredCert = false;
			if ($certificate->isTrusted()) {
				 $expiredCert = ( ( $certificate->getValidTo() - time() ) < self::HOURS_24_IN_SECS );
				 if ($expiredCert) {
				 	self::$logger->err("TrustedCertControl - existing SSL Certifcate either expired, or will will expire in 24 hrs, generating a new one");
				 }
			}
			
			if (!$certificate->isTrusted() || $expiredCert) {
				return $this->generateCertificate();
			}			
		}
		
	}
	

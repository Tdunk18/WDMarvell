<?php
/**
 * \file TrustedCertControl.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2014, Western Digital Corp. All rights reserved.
 */
namespace Remote\Device;

	require_once(ADMIN_API_ROOT . '/api/Core/init_autoloader.php');
	require_once(COMMON_ROOT .'/includes/globalconfig.inc');

	use \Remote\Model\X509Certificate;
	use \Remote\Device\DeviceControl;
	use \Core\Logger;

	/**
	 * Trusted Certificate Control Job
	 *
	 * @author sapsford_j
	 *
	 */

	Class TrustedCertControl {

		//error codes
		const RETURN_CODE_SUCCESS = 0;
		const RETURN_CODE_FAILURE_INCORRECT_NUMBER_OF_ARGUMENTS = 1;
		const RETURN_CODE_FAILURE_INCORRECT_LOGGING_LEVEL = 2;
		const RETURN_CODE_INVALID_START_TIME = 3;
		const RETURN_CODE_FAILED_TO_RUN_CRONTAB = 4;
		const RETURN_CODE_FAILED_TO_ADD_CRON = 5;
		const RETURN_CODE_TRUSTED_CERT_NOT_ENABLED = 6;
		const RETURN_CODE_TRUSTED_CERT_ALREADY_RUNNING = 7;
		const RETURN_CODE_FAILURE_INVALID_REQUEST = 8;

		const SIGNED_CERT_FILENAME = "server.crt";
		const HOURS_240_IN_SECS = 864000;
		const HOURS_48_IN_SECS = 172800;
		const HOURS_24_IN_SECS = 86400;
		const HOURS_23_IN_SECS = 82800;
		const HOURS_1_IN_SECS = 3600;
		const MAX_RETRIES = 3;

		const CRONTAB_TMP_OUT_FILE = "/tmp/ssl_cert_crontab.out";
		const CRONTAB_TMP_IN_FILE = "/tmp/ssl_cert_crontab.in";
		const CRONTAB_TMP_ERR_FILE = "/tmp/ssl_cert_crontab.err";

		const CRONTAB_FILE = "/etc/cron.d/ssl_cert_update";
		const CRONTAB_FILE_TMP = "/tmp/ssl_cert_update";

		const CERT_EXPIRATION_FILE = "/tmp/ssl_cert_expire";


		private static $instance = null; //singleton instance

		private $certPath = null; //path to SSL certificates
		private $logger = null;

		private $savedDeviceId;
		private $savedServerDomain;

		private function __construct($logLevel = \Zend\Log\Logger::ERR) {
			$this->logger = Logger::getInstance(true, $logLevel);
			$this->certPath =  \getSSLCertPath() . self::SIGNED_CERT_FILENAME;
		}

		/**
		 * Regsiter the device or remote access. This gets the Device ID and Device Auth Code from the server
		 * @return boolean
		 */

		private function registerDeviceForRemoteAccess() {
			$this->logger->info("TrustedCertControl - registering device with Central Server and Generating SSL Cert.");
			$deviceControl = DeviceControl::getInstance();
			$status = $deviceControl->preRegisterDeviceRemote(\getDeviceName()['machine_name']);
			if (!$status) {
				$this->logger->err("TrustedCertControl - FAILED to register device with Central Server");
			}
			return $status;
		}

		/**
		 * Update an existing  device registration to get a 3-level domain
		 * @return Ambigous <boolean, \Remote\Device\Ambigous, \Remote\DeviceUser\an, multitype:NULL >
		 */
		private function updateDeviceRegistration() {
			$this->logger->info("TrustedCertControl - updating device registration.");
			$deviceControl = DeviceControl::getInstance();
			$status = $deviceControl->updateRemoteRegistration(\getDeviceName()['machine_name'], null, true);
			if (!$status) {
				$this->logger->err("TrustedCertControl - FAILED to register device with Central Server");
			}
			return $status;
		}

		/**
		 * Generate an SSL Certificate
		 * This function controls the creation of a Trusted Certificate in asynchronous mode with the server
		 * If a Trusted Certificate cannot be created, a Self-Signed certificate will be returned by the server.
		 *
		 * @param number $waitTime if waitTime > 0 then sleep $waitTIme seconds before each request.
		 * @return boolean
		 */

		private function generateCertificate($waitTime = 0, $fetchCertificate = false) {
			$retries = 0;
			$success = false;
			$deviceControl = DeviceControl::getInstance();
			$totalWaitTime = 0;

			while (!$success) {
                //save server host name and device ID before sleeping
                $serverDomain = \getCentralServerHost();
                $deviceId = \getDeviceId();

				if ($waitTime > 0) {
					$waitTime = ($waitTime > self::HOURS_1_IN_SECS) ? self::HOURS_1_IN_SECS : $waitTime; //don't wait for more than an hour at a time

					$totalWaitTime += $waitTime;
					if ($this->totalWaitTime > (self::HOURS_24_IN_SECS - self::HOURS_1_IN_SECS)) {
						//we can't wait more than 23 hours total as cron job runs every 24 hours)
						$this->logger->err("TrustedCertControl - exceeded max. total wait time, quitting" );
						break;
					}
                    $this->logger->info("TrustedCertControl - sleeping for: " . $waitTime . " seconds (1)");

                    sleep($waitTime);
				}

				try {
					$this->logger->info("TrustedCertControl - generating a new SSL Certificate");

					//if wait > 0 then process was asleep: check to see if device Id or server domain have changed since request was made
					//if they have, then we need to discard this certificate.

					if (  $waitTime > 0 && (  ($serverDomain != \getCentralServerHost()) || ($deviceId != \getDeviceId()) )  ) {
						//abandon this certificate request
						$this->logger->err("TrustedCertControl - server domain and/or device id have changed, abandon this cert. request");
						break;
					}

					$success =
						$deviceControl->generateDeviceSSLCertificate($serverDomain,
																	 $deviceId,
																	 getDeviceAuthCode(),
																	 $fetchCertificate, true);
				}
				catch (\Remote\CertificateWaitException $ex) {
					//check if we were told to wait
					$waitTime = $ex->getWaitTime();
					$fetchCertificate = true;
					//cert is being generated asynchronously, so wait and then get it from the server
					$this->logger->info("TrustedCertControl - SSL Cert. Generation is Asynchronous (2), wait time is: " . $waitTime . " seconds");
				}
				catch (\Exception $ex) {
					//failed for some other reason, log error
					$this->logger->err("TrustedCertControl - Exception: " . $ex->getMessage() );
					$success = false;
					if (++$retries > self::MAX_RETRIES) {
						//giv e up after 3 non-wait exceptions
						$this->logger->info("TrustedCertControl - Max. retries exceeded, quitting");
						break;
					}
				}
			}

			if (!$success) {
				//failed to generate a Trusted Cert, so get a self-signed cert.
				$this->logger->err("TrustedCertControl - failed to generate SSL Certificate, falling back to Self-Signed Certificate");
				$success =
					$deviceControl->generateDeviceSSLCertificate($serverDomain,
						$deviceId,
						getDeviceAuthCode());
			}
			return $success;
		}

		/**
		 * Update cron table to add, update or remove Trusted Cert Job
		 * If $install is true and the cron job does not exist it will be added,
		 * if it exists, it will be upated
		 *
		 * @param boolean $install set to true to install or update the cron job, false to remove it
		 * @param string $startHour24 start hour in (0-23)
		 * @param string $startMins start mins (0-59)
		 * @return boolean
		 */

		private function updateCronTab($install, $startHour24 = null, $startMins = null) {

			if ($install) {
				//add crontab entry
				$this->logger->info("TrustedCertControl - installing cron job, start-time: " . $startHour24 . ":" .  $startMins);

				$cronLine = sprintf( "%d %d * * * root /usr/bin/php5 /var/www/rest-api/api/Remote/src/Remote/Cli/ssl_cert_job.php start > /var/log/ssl_cert_cron.out 2>&1\n", $startMins, $startHour24);
				file_put_contents(self::CRONTAB_FILE_TMP, $cronLine);
				exec_runtime("sudo mv " . self::CRONTAB_FILE_TMP . " " . self::CRONTAB_FILE, $output, $retVal, false);
				if ($retVal) {
					$this->logger->err("TrustedCertControl - install, failed to create crontab file: " . self::CRONTAB_FILE);
					return false;
				}
				$output = $retVal = 0;
				exec_runtime("sudo chmod 755 " . self::CRONTAB_FILE , $output, $retVal, false);
				if ($retVal) {
					$this->logger->err("TrustedCertControl - install, failed to set permissions on: " . self::CRONTAB_FILE);
					return false;
				}

			}
			else {
				//remove crontab entry
				$this->logger->info("TrustedCertControl - deleting cron job");
				exec_runtime("sudo rm -f " . self::CRONTAB_FILE, $output, $retVal, false);
				if ($retVal) {
					$this->logger->err("TrustedCertControl - uninstall, failed to delete crontab file: " . self::CRONTAB_FILE);
					return false;
				}
			}

			//restart cron
			$output = $retVal = 0;
			exec_runtime("sudo service cron restart > /dev/null 2>&1", $output, $retVal, false);
			if ($retVal) {
				$this->logger->err("TrustedCertControl - failed to restart cron");
				return false;
			}
			return true;
		}

		/**
		 * Get the Singleton instance
		 *
		 * @param unknown $logLevel the minimum Zend Logger log level
		 * (one of: EMERG, ALERT, CRIT, ERR, WARN, NOTICE, INFO, DEBUG);
		 * @return NULL
		 */
		public static function getInstance($logLevel = \Zend\Log\Logger::ERR) {
			if (self::$instance == null) {
				self::$instance = new TrustedCertControl($logLevel);
			}
			return self::$instance;
		}

		/**
		 * Install the Trusted Cert Cron jobn to run at the given hour and minute
		 * @param int $startHour24 start hour (0-23)
		 * @param int $startMins start min (0-59)
		 * @return true, false or error code
		 */
		public function install($startHour24, $startMins) {
			$deviceType = getDeviceTypeName();
			if ($deviceType !== "sequioa") {
				return false;
			}
			if ($startHour24 < 0 || $startHour24 > 23 || $startMins < 0 || $startMins > 59 ) {
				return false;
			}
			return $this->updateCronTab(true, $startHour24, $startMins);
		}

		/**
		 * Un-install the Trusted Cert cron job
		 *
		 * @return true, false or error code
		 */
		public function uninstall() {
			$deviceType = getDeviceTypeName();
			if ($deviceType !== "avatar" &&  $deviceType !== "sequioa") {
				return false;
			}
			$this->logger->info("TrustedCertControl - uninstalling cron job");
			return $this->updateCronTab(false);
		}

		/**
		 * Runs the Trusted Cert job,
		 *
		 * @return boolean
		 */

		public function run() {
			$deviceId = getDeviceId();
			$status = false;
			$authCode = getDeviceAuthCode();
			if ( empty($deviceId) || empty($authCode) ) {
				//device is not registered for remote access
				try {
					//register device for remote access
					if ($this->registerDeviceForRemoteAccess()) {
						//create the SSL certificate
						if (!$this->generateCertificate()) {
							$this->logger->err("TrustedCertControl - Failed to generate SSL Certificate (signed or unsigned), reverted to original cert.");
							$status = false;
						}
						else {
							$status = true;
						}
					}
					else {
						$this->logger->err("TrustedCertControl - failed to register device" );
						$status = false;
					}
				}
				catch (Exception $ex) {
					// log exception
					$this->logger->err("TrustedCertControl - Exception: " . $ex->getMessage() );
					$status = false;
				}
				return $status;
			}

			//if here, device is registered, so check the current certificate.

			//if cert expire time exists, then we have a trusted cert and we can read expiraiton time from file
			//in ramdisk otherwise, we need to read the certificate - this is to oprevent waking the hard drive
			//every time ssl_cert_job is run.

			//intialize vars to prevent PHP N otice in logs
			$certExpiration = 0;
			$selfSigned = false;
			$domainMismatch = false;
			$expiredCert = false;

			//we must read the certificate to determine if it is self-signed or not
			//and to get the expiration date
			try {
				$this->logger->info("TrustedCertControl - checking existing SSL Certificate");
				if (!file_exists($this->certPath)) {
					throw new \Remote\RemoteException("Certificate file does not exist: " . $this->certPath);
				}
				$certificate = new X509Certificate(file_get_contents($this->certPath));
				$selfSigned = $certificate->isSelfSigned();
				if (!$selfSigned) {
					$certExpiration = $certificate->getValidTo();

					//check that certificate CN matches device domain in dynamicocnfig.ini
					$commonName = $certificate->getCommonName();
					$nasDomain =  \getDeviceSubDomain();
					$domainMismatch =  ($commonName	!= $nasDomain);
					if ($domainMismatch) {
						$this->logger->err("TrustedCertControl - existing SSL Certifcate CN does not match device domain, generating a new one");
					}
				}
				//check apache ssl conf and update if necessary
				$success = DeviceControl::getInstance()->updateApacheConf(!$selfSigned);
				if (!$success) {
					throw new \Remote\RemoteException("Failed to set rest-api Apache conf, trusted is: " . !$selfSigned);
				}
			}
			catch (\Remote\RemoteException $ex)  {
				//if here, device appears to have been registered, but SSL cert is missing or bad
				$this->logger->err("TrustedCertControl - Exception: " .$ex->getMessage() );
				return $this->generateCertificate();
			}

			//if here, certificate exists and device is registered.

			if ($selfSigned) {
				$this->logger->info("TrustedCertControl - self-signed certificate detected");

				//if there is no device domain in dynamicconfig.ini. we need to
				//update the device registration to get a 3-level domain for this NAS
				$currentNasDomain = \getDeviceSubDomain();
				if (empty($currentNasDomain)) {
					//update device registration, also sets device domain
					$this->logger->info("TrustedCertControl - updating device registration for 3-level domain");
					if (!$this->updateDeviceRegistration()) {
						$this->logger->err("TrustedCertControl - failed to update device registration");
						return false;
					}
				}
			}
			else {
				$randSecs = 0;

				$timeToExpiration =  $certExpiration - time();
				if ($timeToExpiration <= self::HOURS_240_IN_SECS ) {
					//if within 10 days of expiration
						//To even the load of renewed certificates (as all units that update to 2.0 will receive new certificates),
						//the probablity of expiration should be 1/(days left to expiration) so that the remaining number of devices
						//that need to be updated is spread evenly over the number of days remaining until the certificates expire.
						//
						//Example:
						//
						//if Texp = 864,000 seconds, this are 10 days before expiration, $randSecs is an evenly distributed random integer between 1 and 10, so
						//there is a 1/10 probability it will be 1.
						//
						//If Texp = 172,800 seconds, this are 2 days before expiration, $randSecs is an evenly distributed random integer between 1 and 2, so
						//there is a 1/2 (50%) probability it will be 1.

						//To account for time skew, we want to renew the cert if it is within 25 hours of expiration
						//(given that the cert job runs once every 24 hours). As we are rounding down to the nearest integer
						//below, we need to add 23 hours to the expiration time to achieve 1/1 probability if there are 25 hours
						//or less to go.

						$rand = mt_rand(1, (int)(($timeToExpiration + self::HOURS_23_IN_SECS)/self::HOURS_24_IN_SECS));
						$expiredCert = ($rand == false || $rand == 1);

					//check if certificate should be updated
					if ( $expiredCert ) {
						 $this->logger->err("TrustedCertControl - existing SSL Certifcate either expired, or will will expire within time window, generating a new one");
					}
				}
			}

			if ($selfSigned || $expiredCert || $domainMismatch ) {
				//the current certificate is self-signed or about to expire, so create a new Trusted Cert.
				return $this->generateCertificate();
			}
			return true;
		}

	}


<?php

namespace Remote\Device;

/**
 * \file sslcertificate.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012,2014 Western Digital Corp. All rights reserved.
 */
require_once(UTIL_ROOT . '/includes/httpclient.inc');
require_once(COMMON_ROOT .'/includes/globalconfig.inc');

use Remote\Model\X509Certificate;

class SslCertificate
{

    private $config;
    protected $keyFile;
    protected $csrFile;
    protected $backupDir;
    protected $signedFile;
    protected $csrFileBackup;
    protected $keyFileBackup;
    protected $signedFileBackup;
    protected $configBackupDir;

    protected static $opensslConf = null;
    protected static $certDN = null;

    protected static $certStart = "-----BEGIN";
    protected static $certEnd = "-----END CERTIFICATE-----";

    public function __construct()
    {
        $this->config = getGlobalConfig("openssl");

        $this->keyFile = $this->config['CERT_PATH'] . 'server.key';
        $this->csrFile = $this->config['CERT_PATH'] . 'server.csr';
        $this->signedFile = $this->config['CERT_PATH'] . 'server.crt';

        $this->keyFileBackup = $this->keyFile . '.bak';
        $this->csrFileBackup =$this->csrFile . '.bak';
        $this->signedFileBackup = $this->signedFile . '.bak';

        $this->configBackupDir = getConfigBackupPath();

        if (self::$opensslConf == null) {
        	self::$opensslConf = array(
        			'config' => $this->config['OPENSSL_CONF_PATH'],
        			'encrypt_key' => false,
        			'private_key_type' => OPENSSL_KEYTYPE_RSA,
        			'digest_alg' => 'sha256',
        			'private_key_bits' => 2048,
        	);
        }

        if (self::$certDN == null) {
        	self::$certDN = array(
        			"countryName" => 'US',
        			"stateOrProvinceName" => 'California',
        			"localityName" => 'Mountain View',
        			"organizationName" => 'Western Digital Corporation',
        			"organizationalUnitName" => 'Branded Products',
        			"commonName" => "",
        			"emailAddress" => 'admin@localhost.com'
        	);
        }

        // Create certificate backups in case signing fails.
        $deviceType = getDeviceTypeName();
        if (file_exists($this->keyFile)) {
        	copy($this->keyFile, $this->keyFileBackup);
        	if ( $deviceType == "sequioa") {
        		//need to do this on sequoia if this code is run from a CLI script as root
        		chgrp($this->keyFileBackup, "www-data");
        		chown($this->keyFileBackup, "www-data");
        	}
        }
        if (file_exists($this->csrFile)) {
        	copy($this->csrFile,$this->csrFileBackup);
            if ( $deviceType == "sequioa") {
        		chgrp($this->csrFileBackup, "www-data");
        		chown($this->csrFileBackup, "www-data");
        	}
        }
        if (file_exists($this->signedFile)) {
	        copy($this->signedFile, $this->signedFileBackup);
	        if ( $deviceType == "sequioa") {
	        	chgrp($this->signedFileBackup, "www-data");
	        	chown($this->signedFileBackup, "www-data");
	        }
        }
    }

    private function createPrivateKey() {

    	if (($key = openssl_pkey_new(self::$opensslConf)) != FALSE) {
    		if (openssl_pkey_export_to_file($key, $this->keyFile, NULL, self::$opensslConf) ) {
    			//make backup copy on Alpha NAS
    			if (file_exists($this->configBackupDir)) {
    				copy($this->keyFile, $this->configBackupDir . DS . 'server.key');
    			}
    			return $key;
    		}
    	}

    	return false;
    }

    private function getPrivateKey() {
    	$pkey = false;
    	if ( !file_exists($this->keyFile) ) {
    		$pkey = $this->createPrivateKey();
    	}
    	else {
    		//get private key
	    	$pkey = openssl_pkey_get_private("file://" . $this->keyFile);
    		//check for key length not 2048 bits and replace if it is
	    	$keyDetails = openssl_pkey_get_details ( $pkey );
	    	if ($keyDetails["bits"] != 2048) {
	    		$pkey = $this->createPrivateKey();
	    	}
    	}
    	return $pkey;
    }

    private function generateCsrFiles($deviceId, $serverDomain)
    {
    	$commonName = \getDeviceSubDomain();
    	if (!empty($commonName)) {
    		//new 3 level domain with DNS ID
    		self::$certDN["commonName"] = $commonName;
    	}
    	else { //create old style 4 level doomain
    		self::$certDN["commonName"] = "*.device$deviceId.$serverDomain";
    	}

    	$pkey = $this->getPrivateKey();
    	if ($pkey) {
	        $csr_res = openssl_csr_new(self::$certDN, $pkey, self::$opensslConf);
    	    if (openssl_csr_export($csr_res, $csr_str)) {
    	    	if (openssl_csr_export_to_file(
    	    		$csr_res,$this->csrFile )) {
    	    		return $csr_str;
    	    	}
    	    }
    	}
        return false;
    }

	/**
	 * Chop downloaded cert bundle into seperate CA-chain Bundle (all certs except the last one) and the server cert (the last cert).
	 * If only one cert is received it is *assumed* that only the server cert was received. This will be validated later,
	 * so it's OK to make this assumption here.
	 *
	 * @param unknown $certBundle the text block containing all of the certificates
	 * @return array element 'ca_bundle' contains the CA-chain certs in one block, 'server_cert' contains the server certificate
	 */

	protected function processCertBundle($certBundle) {
               //split certs into an array and combine ca root and intermediate certs
                //in ca-bundle and seperate server cert.

                $certs = [];
                while (true) {
                        $startCert = strpos($certBundle, self::$certStart);
                        $endCert = strpos($certBundle, self::$certEnd);
                        if ($startCert === false || $endCert === false) {
                        	break;
                        }
                        $endCert += strlen( self::$certEnd);  //skip to end of end cert string

                        $certs[] = substr($certBundle, $startCert, $endCert);
                        $certBundle = substr($certBundle, $endCert +1); //skip to next cert
                }
                $totalCerts = sizeof($certs);
                $bundledCerts = [];

                foreach($certs as $cert) {
                        if ($numCerts < $totalCerts -1) {
                                if ($numCerts == 0) {
                                        $caBundle = $cert;
                                }
                                else {
                                        $caBundle = $caBundle . PHP_EOL . $cert;
                                }
                        }
                        else {
                                $bundledCerts['server_cert'] = $cert;
                        }
                        $numCerts++;
                }

                if (isset($caBundle)) {
                        $bundledCerts['ca_bundle'] = $caBundle;
                }

                return $bundledCerts;
	}

	/**
	 * Save the CA-chain bundle to teh config directory
	 * @param string $caBundle
	 */
	protected function saveCaBundle($caBundle) {
		$sslConfig = getGlobalConfig('openssl');
		$crtFileName = $sslConfig['CERT_PATH'].'server.ca-bundle';
		$fp = fopen($crtFileName, 'w');
		if ($fp) {
			fwrite($fp, $caBundle);
			fclose($fp);
			if ( \getDeviceTypeName() == "sequioa") {
				//need to do this on sequoia if this code is run from a CLI script as root
				chgrp($crtFileName, "www-data");
				chown($crtFileName, "www-data");
			}
			//make backup copy on Alpha NAS
			if (file_exists($this->configBackupDir)) {
				copy($crtFileName, $this->configBackupDir . DS . 'server.ca-bundle');
			}
		}

	}

    /**
	 * Validate SSL Certificate in X509 format
	 * @param $certString - the certificate in text form
	 */

	protected function validateCertificate($crtString, &$isTrusted) {
		//first check cert was signed using local private key
		if (!openssl_x509_check_private_key($crtString, $this->getPrivateKey())) {
			throw new \Remote\RemoteException("SslCertificate - invalid certificate, certificate is not signed with local private key");
		}
		$cert = new X509Certificate($crtString);   //throws X509CertificateException if cannot parse cert

		//check certificate domain matches local sub domain
		$commonName = $cert->getCommonName();
		$nasDomain =  \getDeviceSubDomain();
		if ($commonName	!= $nasDomain) {
			throw new \Remote\RemoteException("SslCertificate -invalid certificate, CN: " . $commonName . " does not match NAS domain: " . $nasDomain);
		}

		//check certificate has not expired
		if ($cert->isExpired()) {
			throw new \Remote\RemoteException("SslCertificate -invalid certificate, certificate has expired");
		}
		$isTrusted = !($cert->isSelfSigned()); //if it is self-signed it is not trusted

		return true;

	}

    public function getSignedCert($serverDomain, $deviceId, $deviceAuth, $downloadOnly = false, $getTrustedCert = false, &$isTrusted = false)
    {
    	$deviceConfig = getGlobalConfig('device');

    	if ($getTrustedCert) {
    		$urlPath = $downloadOnly ?  $deviceConfig['DEVICECERTIFICATE_DOWNLOAD_PATH'] :
    		$deviceConfig['DEVICECERTIFICATE_REST_PATH_V2'];
    	}
    	else {
	    	$urlPath =  $deviceConfig['DEVICECERTIFICATE_REST_PATH'];
    	}

    	$url = getServerBaseUrl() . $urlPath;

    	$postData =  array('device_id' => $deviceId,
                           'auth' => $deviceAuth,
                           'format' => 'xml');

    	if (!$downloadOnly) {
             $csrString = $this->generateCsrFiles($deviceId, $serverDomain);
             if (!$csrString) {
             	throw new \Remote\RemoteException('Failed to generate csr file ',  500);
             }
	 		$postData['csr'] = $csrString;
		}

        $httpClient = new \HttpClient();
        if ($downloadOnly) {
			$url = $url . '&' . getUrlString($postData);
        	$response = $httpClient->get($url);
        }
        else {
    		$reqParams = array('requestUrl' => $url,
    							'data' => $postData);
        	$response = $httpClient->post($reqParams);
        }
        $xmlReturn = simplexml_load_string($response['response_text']);

        if ( $response['status_code'] == 200 ||
        	 $response['status_code'] == 201 ||
        	 $response['status_code'] == 203) {
           		if ($getTrustedCert) {
 				//get Cert Bundle
           			$certBundle = $this->processCertBundle($xmlReturn->signed_cert);
           			if (!empty($certBundle)) {
           				if (isset($certBundle['ca_bundle'])) {
           					//if we received a CA bundle, save it
	           				$this->saveCaBundle($certBundle['ca_bundle']);
           				}
	           			$cert = $certBundle['server_cert'];
           			}
           			else {
           				//no bundle
           				$cert = $xmlReturn->signed_cert;
           			}
           			//validate trusted certificate
           			$this->validateCertificate($cert, $isTrusted);  //this throws an exception if the cert is invalid
           		}
           		else {
           			$cert = $xmlReturn->signed_cert;
           		}
           		//if here, valid trusted cert of self-signed cert
    	       	return $cert;
        }
        else if ($response['status_code'] == 202) {
        	//get time to wait from response, if any
            if (isset($xmlReturn->wait_time)) {
				$waitTime = (string)$xmlReturn->wait_time;
        		throw new \Remote\CertificateWaitException("Wait time returned from server", $waitTime, $response['status_code']);
            }
        }

        //if here, server returned failure

        $deviceType = \getDeviceTypeName();
	    // Failed response and not told to wait and get certificate later, replace backups.
	    if (file_exists($this->keyFileBackup)) {
		    rename($this->keyFileBackup, $this->keyFile);
		    if ( $deviceType == "sequioa") {
		       	//need to do this on sequoia if this code is run from a CLI script as root
		        chgrp($this->keyFile, "www-data");
		        chown($this->keyFile, "www-data");
		    }
	    }
	    if (file_exists($this->csrFileBackup)) {
		   rename($this->csrFileBackup, $this->csrFile);
		   if ( $deviceType == "sequioa") {
		      //need to do this on sequoia if this code is run from a CLI script as root
		      chgrp($this->csrFile, "www-data");
		      chown($this->csrFile, "www-data");
		    }
	    }
	    if (file_exists($this->signedFileBackup)) {
		    rename($this->signedFileBackup, $this->signedFile);
		    if ( $deviceType == "sequioa") {
		       	//need to do this on sequoia if this code is run from a CLI script as root
		        chgrp($this->signedFile, "www-data");
		        chown($this->signedFile, "www-data");
		    }
	    }

        throw new \Remote\RemoteException('Failed to get signed certificate: '. print_r($response, true), $response['status_code']);
    }

}

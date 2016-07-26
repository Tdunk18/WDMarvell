<?php
/**
 * 
 * Container class for a signed SSL Certificate
 *
 * @author sapsford_j
 */


/**
 array(12) {
  ["name"]=>
  string(139) "/C=US/ST=California/L=Mountain View/O=Western Digital/OU=Branded Products/CN=*.device1997930.remotewd3.com/emailAddress=admin@localhost.com"
  ["subject"]=>
  array(7) {
    ["C"]=>
    string(2) "US"
    ["ST"]=>
    string(10) "California"
    ["L"]=>
    string(13) "Mountain View"
    ["O"]=>
    string(15) "Western Digital"
    ["OU"]=>
    string(16) "Branded Products"
    ["CN"]=>
    string(29) "*.device1997930.remotewd3.com"
    ["emailAddress"]=>
    string(19) "admin@localhost.com"
  }
  ["hash"]=>
  string(8) "5bff7456"
  ["issuer"]=>
  array(6) {
    ["C"]=>
    string(2) "US"
    ["ST"]=>
    string(2) "CS"
    ["L"]=>
    string(13) "Mountain View"
    ["O"]=>
    string(15) "Western Digital"
    ["OU"]=>
    string(16) "Branded Products"
    ["CN"]=>
    string(12) "remotewd.com"
  }
  ["version"]=>
  int(0)
  ["serialNumber"]=>
  string(13) "1412891441101"
  ["validFrom"]=>
  string(13) "141009215041Z"
  ["validTo"]=>
  string(13) "241009215041Z"
  ["validFrom_time_t"]=>
  int(1412891441)
  ["validTo_time_t"]=>
  int(1728510641)
  ["purposes"]=>
  array(9) {
    [1]=>
    array(3) {
      [0]=>
      bool(true)
      [1]=>
      bool(false)
      [2]=>
      string(9) "sslclient"
    }
    [2]=>
    array(3) {
      [0]=>
      bool(true)
      [1]=>
      bool(false)
      [2]=>
      string(9) "sslserver"
    }
    [3]=>
    array(3) {
      [0]=>
      bool(true)
      [1]=>
      bool(false)
      [2]=>
      string(11) "nssslserver"
    }
    [4]=>
    array(3) {
      [0]=>
      bool(true)
      [1]=>
      bool(false)
      [2]=>
      string(9) "smimesign"
    }
    [5]=>
    array(3) {
      [0]=>
      bool(true)
      [1]=>
      bool(false)
      [2]=>
      string(12) "smimeencrypt"
    }
    [6]=>
    array(3) {
      [0]=>
      bool(true)
      [1]=>
      bool(false)
      [2]=>
      string(7) "crlsign"
    }
    [7]=>
    array(3) {
      [0]=>
      bool(true)
      [1]=>
      bool(true)
      [2]=>
      string(3) "any"
    }
    [8]=>
    array(3) {
      [0]=>
      bool(true)
      [1]=>
      bool(false)
      [2]=>
      string(10) "ocsphelper"
    }
    [9]=>
    array(3) {
      [0]=>
      bool(false)
      [1]=>
      bool(false)
      [2]=>
      string(13) "timestampsign"
    }
  }
  ["extensions"]=>
  array(0) {
  }
}

 
 */

namespace Remote\Model;

class X509Certificate {
	
	private $certValues;
	
	public function __construct($crtPath) {
		if (!file_exists($crtPath)) {
			throw new Exception("X509Certificate::__construct() Certificate file does not exist: " . $crtPath);
		}
		$certValues = openssl_x509_parse(file_get_contents($crtPath));
		if (empty($certValues)) {
			throw new Exception("X509Certificate::__construct() Failed to parse Certificat File: " . $crtPath);				
		}
	}
	
	public function getCountryName ($issuer = false) {
		return $certValues[$issuer ? "issuer" : "subject"]["C"];
	}
	
	public function getStateOrProvinceName ($issuer = false) {
		return $certValues[$issuer ? "issuer" : "subject"]["ST"];
	}
	
	public function getLocalityName ($issuer = false) {
		return $certValues[$issuer ? "issuer" : "subject"]["L"];
	}
	
	public function getOrganizationName ($issuer = false) {
		return $certValues[$issuer ? "issuer" : "subject"]["O"];
	}
	
	public function getOrganizationalUnitName ($issuer = false) {
		return $certValues[$issuer ? "issuer" : "subject"]["OU"];
	}
	
	public function getCommonName ($issuer = false) {
		return $certValues[$issuer ? "issuer" : "subject"]["CN"];
		
	}
	
	public function getEmailAddress ($issuer = false) {
		return $certValues[$issuer ? "issuer" : "emailAddress"]["CN"];
	}
	
	public function getHash($issuer = false) {
		return $certValues["hash"];
	}
	
	public function getSerialNumber() {
		return $certValues["serialNumber"];
	}
	
	public function getVersion() {
		return $certValues["version"];
	}	
	
	public function getValidFrom($unixTime=true) {
		if ($unixTime) {
			return $certValues["validFrom_time_t"];
		}
		return $certValues["validFrom"];
	}
	
	public function getValidTo($unixTime=true) {
		if ($unixTime) {
			return $certValues["validTo_time_t"];
		}
		return  $certValues["validTo"];
	}
	
	public function isExpired() {
		return (time() > (int)$certValues["validTo_time_t"]);
	}
	
	public function isWDSigned() {
		//Check if cert was signed by WD Central Server.
		return ($certValues["issuer"]["CN"] == "remotewd.com");
	}
	
	public function isSelfSigned() {
		//if subject and issuer DNs are the same, certificate is self-signed
		return (empty(array_diff($certValues["issuer"], $certValues["subject"])));
	}
}
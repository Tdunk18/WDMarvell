<?php
/**
 *
 * Container class for a signed SSL Certificate
 *
 * @author sapsford_j
 */

namespace Remote\Model;


class X509Certificate {

	const ISSUER = "issuer";
	const SUBJECT = "subject";

	private static $countryName = "C";
	private static $stateName = "ST";
	private static $localityName = "L";
	private static $organizationName = "O";
	private static $organizationUnitName = "OU";
	private static $commonName = "CN";
	private static $emailAddress = "emailAddress";
	private static $hash = "hash";
	private static $serialNumber = "serialNumber";
	private static $version = "version";
	private static $validFrom = "validFrom";
	private static $validFromUnixTime = "validFrom_time_t";
	private static $validTo = "validTo";
	private static $validToUnixTime = "validTo_time_t";

	private static $isSelfSigned = true;
	private $certValues;

	public function __construct($crtString) {

		$this->certValues = openssl_x509_parse($crtString);
		if (empty($this->certValues)) {
			throw new \Remote\X509CertificateException("X509Certificate::__construct() Failed to parse Certificate Contents");
		}
	}

	public function getCountryName ($part = self::SUBJECT) {
		return $this->certValues[$part][self::$countryName];
	}

	public function getStateOrProvinceName ($part = self::SUBJECT) {
		return $this->certValues[$part][self::$stateName];
	}

	public function getLocalityName ($part = self::SUBJECT) {
		return $this->certValues[$part][self::$localityName];
	}

	public function getOrganizationName ($part = self::SUBJECT) {
		return $this->certValues[$part][self::$organizationName];
	}

	public function getOrganizationalUnitName ($part = self::SUBJECT) {
		return $this->certValues[$part][self::$organizationUnitName];
	}

	public function getCommonName ($part = self::SUBJECT) {
		return $this->certValues[$part][self::$commonName];
	}

	public function getEmailAddress ($part = self::SUBJECT) {
		return $this->certValues[$part][self::$emailAddress];
	}

	public function getHash() {
		return $this->certValues[self::$hash];
	}

	public function getSerialNumber() {
		return $this->certValues[self::$serialNumber];
	}

	public function getVersion() {
		return $this->certValues[self::$version];
	}

	public function getValidFrom($unixTime=true) {
		if ($unixTime) {
			return $this->certValues[self::$validFromUnixTime];
		}
		return $this->certValues[self::$validFrom];
	}

	public function getValidTo($unixTime=true) {
		if ($unixTime) {
			return $this->certValues[self::$validToUnixTime];
		}
		return  $this->certValues[self::$validTo];
	}

	public function isExpired() {
		return (time() > (int)$this->certValues[self::$validToUnixTime]);
	}

	public function isWDSigned() {
		//if issuer Organization Name is "Western Digital", it's self-signed
		return ($this->certValues[self::ISSUER][self::$organizationName] == "Western Digital");
	}

	public function isDefaultCert() {
		return ($this->certValues[self::ISSUER][self::$commonName] == "debian_lenny");
	}

	public function isSelfSigned() {
		return ($this->isWDSigned() || $this->isDefaultCert());
	}


}
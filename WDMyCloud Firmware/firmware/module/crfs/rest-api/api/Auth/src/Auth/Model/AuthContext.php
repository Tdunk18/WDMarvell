<?php

namespace Auth\Model;

/**
 * The \Auth\Model\AuthContext class.
 *
 * Encausulates the data needed for various authentication methods allowing for simpler method calls.
 */
class AuthContext
{
    /**
     * The parts of the url path.
     *
     * @var array
     */
    protected $_urlPath;

    /**
     * A combination of $_GET, $_POST, and sometimes decoded PUT params (like a JSON encoded string in a PUT body).
     *
     * @var array
     */
    protected $_queryParams;

    /**
     * The URI of the request.
     *
     * @var string
     */
    protected $_requestUri;

    /**
     * Usually a copy of the $_REQUEST superglobal.
     *
     * @var array
     */
    protected $_requestObject;

    /**
     * Whether or not an admin account is required for authentication.
     *
     * @var bool
     */
    protected $_adminRequired;

    /**
     * Whether or not an cloudholder account is required for authentication.
     *
     * @var bool
     */
    protected $_cloudholderRequired;

    /**
     * Whether or not an hmac is allowed for authentication.
     *
     * @var bool
     */
    protected $_hmacAllowed;

    /**
     * Encausulates the data needed for various authentication methods allowing for simpler method calls.
     *
     * @param array $urlPath the parts of the url path.
     * @param array $queryParams A combination of $_GET, $_POST, and sometimes decoded PUT params
     *                           (like a JSON encoded string in a PUT body).
     * @param string  $requestUri The URI of the request.
     * @param array $requestObject Usually a copy of the $_REQUEST superglobal.
     * @param bool $adminRequired Whether or not an admin account is required for authentication.
     * @param bool $cloudholderRequired Whether or not a cloudholder account is required for authentication.
     * @param bool $hmacAllowed Whether or not an hmac is allowed for authentication.
     */
    public function __construct(array $urlPath, array $queryParams, $requestUri, array $requestObject, $adminRequired, $cloudholderRequired, $hmacAllowed)
    {
        $this->_urlPath = $urlPath;
        $this->_queryParams   = $queryParams;
        $this->_requestUri    = $requestUri;
        $this->_requestObject = $requestObject;
        $this->_adminRequired = $adminRequired;
        $this->_cloudholderRequired = $cloudholderRequired;
        $this->_hmacAllowed = $hmacAllowed;
    }

    /**
     * Returns the url path.
     *
     * @return array
     */
    public function getUrlPath()
    {
        return $this->_urlPath;
    }

    /**
     * Returns the query params.
     *
     * @return array
     */
    public function getQueryParams()
    {
        return $this->_queryParams;
    }

    /**
     * Returns the Request URI.
     *
     * @return string
     */
    public function getRequestUri()
    {
        return $this->_requestUri;
    }

    /**
     * Returns the request object array.
     *
     * @return array
     */
    public function getRequestObject()
    {
        return $this->_requestObject;
    }

    /**
     * Returns whether or not an admin account is required.
     *
     * @return boolean
     */
    public function isAdminRequired()
    {
        return $this->_adminRequired;
    }

    /**
     * Returns whether or not an cloudholder account is required.
     *
     * @return boolean
     */
    public function isCloudholderRequired()
    {
        return $this->_cloudholderRequired;
    }

    /**
     * Returns whether or not an hmac is allowed.
     *
     * @return boolean
     */
    public function isHmacAllowed()
    {
        return $this->_hmacAllowed;
    }
}

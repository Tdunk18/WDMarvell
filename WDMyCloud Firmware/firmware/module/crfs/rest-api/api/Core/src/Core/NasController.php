<?php

namespace Core;

/**
 * \file nascontroller.php
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
class NasController {

    const URL_COMPONENT_PART = 4;
    const API_VERSION_PART = 2;

    // User ACL flags
    const NO_ACCESS = -1;         // APIs blocked
    const NO_AUTH = 1;         // Only used for login
    const USER_AUTH = 2;       // Requires user authentication (LAN/WAN)
    const ADMIN_AUTH = 3;      // Requires Admin user (LAN/WAN)
    const NO_AUTH_LAN = 4;     // No authentication LAN only
    const USER_AUTH_LAN = 5;   // Requires User authentication LAN only.
    const ADMIN_AUTH_LAN = 6;  // Requires Admin User authentication LAN only.
    // TODO: Imported from MR4.2 - This whole AUTH setup needs to be refactored to Auth/Location pairs.
    const NO_AUTH_LAN_USER_WAN=7;    // No authentication if request is from LAN, user authentication if request is from WAN
	const USER_AUTH_LAN_ADMIN_WAN=9; // User authentication if request is from LAN, Admin user if request is from WAN
    const USER_OR_HMAC_AUTH = 10;

    const CLOUDHOLDER_AUTH =11; // Cloudholder authentication
    const NO_AUTH_LAN_CLOUDHOLDER_AUTH_WAN = 12; //No auth needed on LAN, cloudholder needed on WAN

    public static $CALLED_COMPONENT = 'core';
    public static $API_VERSION = '2.1';

    private   static $acceptableHosts = array(
    										'mycloud.com',
    										'wdmycloud.com',
    										'wd2go.com',
    										'remotewd.com',
    										'remotewd1.com',
    										'remotewd2.com',
    										'remotewd3.com',
    										'remotewd4.com',
    										'remotewd5.com',
    										'remotewd6.com',
    										'wdtest.com',
    										'wdtest1.com',
    										'wdtest2.com',
    										'localhost',
    										'127.0.0.1'
    		);
    
    private static $userAgentMatches = array (
    									'Mozilla',
    									'Windows',
    									'Safari',
    									'Chrome',
    									'AppleWebKit',
    									'Firefox',
    									'Opera',
    									'Lynx'
    							);

    /*
     * ACL Group permissions.
     */

    /**
     * Standard USER_AUTH on all pequest methods.
     * @var array
     */
    public static $user_auth_all = array(
        'GET' => self::USER_AUTH,
        'POST' => self::USER_AUTH,
        'PUT' => self::USER_AUTH,
        'DELETE' => self::USER_AUTH);

    /**
     * Standard permission for Admin only across the board.
     * @var array
     */
    public static $admin_auth_lan_all = array(
        'GET' => self::ADMIN_AUTH_LAN,
        'POST' => self::ADMIN_AUTH_LAN,
        'PUT' => self::ADMIN_AUTH_LAN,
        'DELETE' => self::ADMIN_AUTH_LAN);

    /**
     * Standard permissions for admin on modifications only..
     * @var array
     */
    public static $admin_auth_lan_modify = array(
        'GET' => self::USER_AUTH,
        'POST' => self::ADMIN_AUTH_LAN,
        'PUT' => self::ADMIN_AUTH_LAN,
        'DELETE' => self::ADMIN_AUTH_LAN);

    /**
     * Standard CLOUDHOLDER_AUTH on all request methods.
     * @var array
     */
    public static $cloudholder_auth_all = array(
        'GET' => self::CLOUDHOLDER_AUTH,
        'POST' => self::CLOUDHOLDER_AUTH,
        'PUT' => self::CLOUDHOLDER_AUTH,
        'DELETE' => self::CLOUDHOLDER_AUTH);

    /**
     * Singelton instance of NasController
     *
     * @var \Core\NasController
     */
    static protected $self;

    protected static $_outputFormat = null; /* A way to improve speed: prevent multiple parsing if method is called multiple times. */

    /**
     * Using this to reset the format value if needed
     * @param string $value - new format value
     */
    protected function _setOutputFormat($value) {
        static::$_outputFormat = $value;
    }

    /**
     * Overloading constructor to add in support for module management. Falls back into
     *    old constructor after Core module successfully loads.
     */
    public function __construct() {

    	/* JS - set the path for session files to /tmp - prevent waking the hard drive */
    	session_save_path("/tmp");

        /* Now that Common is loaded, we can proceed with legacy code includes */
        require_once(COMMON_ROOT . '/includes/security.inc');

        Logger::getInstance()->runtime(__CLASS__ . '::_loadModuleConfig() start');

        self::$self = $this;
    }

    /**
     * Initialiation method. Also useful if we want to store, and prevent
     *   duplicate instances of self.
     *
     * @return NasController
     */
    public static function init() {
        return new self();
    }

    /**
     * Returns the current instance of NasController
     *
     * @return \Core\NasController
     * @throws Exception
     */
    public static function getInstance() {
        if (empty(self::$self)) {
            throw new \Exception('NasController not instanciated properly');
        }

        return self::$self;
    }

    /**
     * The main control of NasController: runs the application.
     */
    public function exec() {
        try {
        	
            if (!empty($_SERVER['HTTP_ORIGIN'])) {
        		$originUrl = parse_url($_SERVER['HTTP_ORIGIN']);
        	}
        	else if (!empty($_SERVER['HTTP_REFERER'])) {
        		$originUrl = parse_url($_SERVER['HTTP_REFERER']);
        	}
        	if (!empty($originUrl)) {
        		$originHost = strtolower($originUrl['host']);
                $originPort = strtolower($originUrl['port']);
        	}

			// Output headers before returning success or failure response so the Apps, that strictly depend on CORS headers,
			// can handle exceptions such as invalid authentication or unsupported method calls more elegantly
			if (!empty($originHost) && $this->isAcceptableHost($originHost)) {
				//if Origin or Referer headers are set *and* we accept requests from the origin host, outout CORS headers
				$this->outputCorsHeaders($originUrl['scheme'], $originHost, $originPort);
			}
        	
            if (!$this->_isValidRequest($originHost)) {
                return false;
            }

            $requestMethod = $this->_parseRequestMethod();
            $requestParams = $this->_parseRequestParams($requestMethod);

            $outputFormat = $this->_parseOutputFormat();
            list($component, $urlPath) = $this->_parseComponent();

            if (!method_exists($component, $requestMethod)) {
                /* Not a Rest\Exception: this is a bad application configuration -- all known request methods should be defined in all classes. */
                throw new \Core\Rest\Exception(sprintf('Invalid request method "%s" called.', $requestMethod, get_class($component)), 404, null, 'core');
            }

            Logger::getInstance()->runtime(sprintf('(%s) %s::%s start', self::$CALLED_COMPONENT, get_class($component), $requestMethod));
            $component->{$requestMethod}($urlPath, $requestParams, $outputFormat, self::$API_VERSION);



            /* For Rest based exception: 404, 401, etc */
        } catch (\Core\Rest\Exception $e) {
            $e->generateErrorOutput(($outputFormat ? : 'xml'));

            //Log any nested exception - this will nornally be an application exception that we want to log
            if ( $e->getPrevious() ) {
            	\Core\Logger::getInstance()->err($e->getPrevious());
            }

            //JS - there really is no point in logging HTTP error returns by default,
            //It also runs the risk of filling up the log file,so only log them if ORION_DEBUG is true

            if ( ORION_DEBUG ) {
	            \Core\Logger::getInstance()->err($e);
            }
            /* These are application based exceptions: something went wrong with the application itself. */
        } catch ( \Core\ClassFactory\Exception $e ) {
            apc_clear_cache();
            apc_clear_cache('user');

            static $retry = false;
            if ( $retry == false ) {
                $this->exec();
            } else {
                $newE = new \Core\Rest\Exception('Class Factory instantiation failed. APC Cleared. Try again.', 500, $e, 'core');
                $newE->generateErrorOutput(($outputFormat ? : 'xml'));
            }

        } catch (\Exception $e) {
            $newE = new \Core\Rest\Exception('Runtime Exception : ' . $e->getMessage(), 500, $e, 'core');
            $newE->generateErrorOutput(($outputFormat ? : 'xml'));
            if (ORION_DEBUG) {
            	//output stack trace
            	var_dump($e->getTraceAsString());
            }
            \Core\Logger::getInstance()->err($e);
        }
    }

    /**
     * A publicly accessable central method for authenticating users in instances where
     *   NO_AUTH is set, but authentication is necessary for sub-functions in a component.
     *
     * @param array $urlPath
     * @param array $params
     * @param boolean $adminRequired
     * @param boolean $cloudholderRequired
     * @param boolean $hmacAllowed
     * @throws \Core\Rest\Exception
     */
    public static function authenticate(array $urlPath, $params, $adminRequired = false, $cloudholderRequired = false, $hmacAllowed = false) {

        if (($auth = \Auth\User\UserSecurity::getInstance()->isAuthenticated($urlPath, $params, $adminRequired, $cloudholderRequired, $hmacAllowed)) === false ) {
            //unset($_SESSION['LOGIN_CONTEXT']); /* Legacy Code compatibility */
            throw new \Core\Rest\Exception('USER_NOT_AUTHORIZED', 401, null, 'core');
        }
    }

    /**
     * Parses PHP request parameters using $_GET, $_POST and direct input stream reading.
     *
     * @param string $requestMethod
     * @return array
     */
    protected function _parseRequestParams($requestMethod) {

        //$headers = apache_request_headers();

		$params = $_GET + $_POST; // We intentionally don't want _COOKIE which exists within _REQUEST.
        // _POST takes presidence in parameter clobbering.

        \Core\Logger::getInstance()->info('_SERVER', $_SERVER);
        switch ($requestMethod) {
            case 'put':
                //  TODO: Implement header checks when we depricate 1.0 APIs
                //  1.0 is not checked due to cross dependencies of methods: version is parsed in _parseComponent(). _parseComponent requires data from this method...
                if (isset($_SERVER['CONTENT_TYPE'])) {
                    //ignoring any parameters on content-type since we don't care about them here but still want to let controllers get the body in these cases.
                    $contentTypeWithoutParams = trim(explode(';', $_SERVER['CONTENT_TYPE'], 2)[0]);
                    if ($contentTypeWithoutParams !== 'application/json' && $contentTypeWithoutParams !== 'application/octet-stream') {
                        parse_str(file_get_contents("php://input"), $tmp);
                        $params = array_merge($params, $tmp);
                    }
                }
                break;
            default:
                // Intentionally empty
        }

        // 1.0 API conversion: user_id => username
        if (isset($params['username']) || isset($params['user_id'])) {
            $params['username'] = strtolower(isset($params['username']) ? $params['username'] : $params['user_id']);
        }
        \RequestScope::getInstance()->setQueryParams($params);
        // Backwards compatibility: $_REQUEST is used everywhere
        $_REQUEST = $params;

        return $params;
    }

    /**
     * Loads the required module, and instanciates the related component object.
     *
     * @param array $compInfo
     * @return \Core\RestComponent
     * @throws \Exception
     */
    protected function _createComponent($compInfo) {
        // Old school component, no longer supported.
        if (empty($compInfo['module'])) {
            // *Not* a Rest\Exception: this is an application configuration issue
            throw new \Exception('No module definition for ' . $compInfo['module']);
        }

        return new $compInfo['controller_class']();
    }

    protected function _isValidRequest($originHost) {
        $remoteAccess = \getRemoteAccess(); // TODO: Refactor global config handling.
        if (strcasecmp($remoteAccess, "FALSE") == 0 && !\isLanRequest() /* Old school call. */) {
            throw new Rest\Exception('Request is not allowed', 401, null, 'core');
        }
        if (!$this->isValidReferer($originHost)) {
        	throw new Rest\Exception('Request is not allowed', 401, null, 'core');
        }
        
        return true;
    }

    /**
     * Parses the output format from Accept header: "format" parameter overrules Accept header.
     *
     * @return string
     * @throws Rest\Exception
     */
    protected function _parseOutputFormat() {
        if (empty(static::$_outputFormat)) {
            $format = isset($_REQUEST['format']) ? strtolower($_REQUEST['format']) : false;
            static::$_outputFormat = $format ? : explode('/', $this->_parseAcceptHeader()[0])[1]; // PHP 5.4 Only

            if (!in_array(static::$_outputFormat, ['xml', 'json'])) {
                static::$_outputFormat = 'xml';
                // throw new Rest\Exception(sprintf('Invalid format type "%s".', $fm), 500, null, 'core');
            }
        }

        return static::$_outputFormat;
    }

    /**
     * Locates the current requested method: "rest_method" parameter will override server request method
     *    - for compatibility with clients that don't understand PUT and DELETE
     *
     * @return string
     */
    protected function _parseRequestMethod() {
        return (isset($_REQUEST['rest_method']) ? $_REQUEST['rest_method'] : strtolower($_SERVER['REQUEST_METHOD']));
    }

    /**
     * Parses the requested component from the REQUEST_URI.
     *
     * @return array   Core\RestComponent and urlPath required by components
     * @throws Rest\Exception
     */
    protected function _parseComponent() {
        $urlParts = explode('/', rawurldecode(trim(parse_url($_SERVER['REQUEST_URI'])['path'])));

        if (count($urlParts) <= (self::URL_COMPONENT_PART - 1)
                || empty($urlParts[self::URL_COMPONENT_PART]) /* This catches trailing slashes from faking us out */) {
            throw new Rest\Exception(sprintf('Component Not Found in URI', 404, null, 'core'));
        }

        $compName = $urlParts[self::URL_COMPONENT_PART];
        self::$API_VERSION = $urlParts[self::API_VERSION_PART]; // TODO: Debug if it's not 1.0 or 2.1
        \RequestScope::getInstance()->setApiVersion(self::$API_VERSION);

        $urlPath = array();
        if (count($urlParts) > (self::URL_COMPONENT_PART + 1)) {
            $urlPath = array_slice($urlParts, (self::URL_COMPONENT_PART + 1));
        }

        // Legacy code
        \RequestScope::getInstance()->setUrlPaths($urlPath);

        $componentInfo = apc_fetch('COMPONENT_CONFIG_' . strtoupper($compName));
        if ($componentInfo == NULL) {
        	throw new Rest\Exception(sprintf('Component "%s" not found', $compName), 404, null, 'core');
        }

        // Check if request is an Async request and is supported
        //
        $this->_validateAsyncRequest($componentInfo);

        Logger::getInstance()->runtime(__CLASS__ . '::_validateSecurity() start');
        $this->_validateSecurity($urlPath, $componentInfo, $this->_parseRequestMethod());

        $component = $this->_createComponent($componentInfo);
        if (empty($component)) {
            throw new Rest\Exception(sprintf('Component "%s" not found', $compName), 404, null, 'core');
        }

        self::$CALLED_COMPONENT = $compName;

        return array($component, $urlPath);
    }

    /**
     * Checks & validates if the Async functionality is supported and enabled,
     * and if the requested REST API/method supports Async functionality.
     *
     * @param array $componentInfo
     */
    protected function _validateAsyncRequest($componentInfo) {
        $qp = \array_map('strtolower', \RequestScope::getInstance()->getQueryParams());
        // Is Async param set?
        if(isset($qp['async']) && $qp['async'] === 'true') {
            // 1. async operation requested. Is the functionality supported though?
            if(!\Jobs\Common\JobMonitor::getInstance()->isJobsSupported()){
                throw new Rest\Exception('JOBS_NOT_SUPPORTED', 400, null, 'core');
            }
            // 2. async operation requested. Is the requested REST Method supported though?
            if(!isset($componentInfo['async_methods']) ||
               array_search(strtolower($this->_parseRequestMethod()),$componentInfo['async_methods'],true)===false) {
                throw new Rest\Exception('UNSUPPORTED_OPERATION', 400, null, 'core');
            }
        }
        return;
    }

    /**
     * Validates the security parameters against the current request.
     *
     * @param array $urlPath
     * @param array $componentInfo
     * @param string $requestMethod
     * @return boolean
     * @throws Rest\Exception
     */
    protected function _validateSecurity(array $urlPath, $componentInfo, $requestMethod) {
        $requestMethod = strtolower($requestMethod);
        Logger::getInstance()->info(__METHOD__ , array('componentInfo' => $componentInfo, 'requestMethod' => $requestMethod));

        if ( is_int($componentInfo['auth_security']) ) {
            $authorization = $componentInfo['auth_security']; // Handles situations where auth is <all>#</all>
        } elseif ( isset($componentInfo['auth_security'][$requestMethod]) ) {
            $authorization = $componentInfo['auth_security'][$requestMethod];
        } elseif ($requestMethod == "options") {
            $authorization = self::USER_AUTH;
        }
        else {
        	$authorization = self::ADMIN_AUTH;
        }

        /** Ability to block implemented APIs on a config basis */
        if ( $authorization == self::NO_ACCESS ) {
            throw new \Core\Rest\Exception(strtoupper( $requestMethod) . ' is not supported.', 405, null, $componentInfo['name']);
        }

        $isLanRequest = \isLanRequest();

        // LAN only requests.
        if (in_array($authorization, [self::USER_AUTH_LAN, self::ADMIN_AUTH_LAN, self::NO_AUTH_LAN])
                && !$isLanRequest) {
            throw new Rest\Exception(sprintf('%s::%s is allowed in LAN only.', $componentInfo['name'], $requestMethod), 401, null, 'core');
        }

        // NO AUTH requests, including NO AUTH if on LAN
        $noAuth = $isLanRequest ? [self::NO_AUTH_LAN, self::NO_AUTH, self::NO_AUTH_LAN_USER_WAN, self::NO_AUTH_LAN_CLOUDHOLDER_AUTH_WAN] : [self::NO_AUTH];

        if ( in_array($authorization, $noAuth) ) {
            return true;
        }

        // All WAN based authentication options.
        $wanAuth = [self::USER_AUTH, self::ADMIN_AUTH, self::USER_AUTH_LAN_ADMIN_WAN, self::NO_AUTH_LAN_USER_WAN, self::CLOUDHOLDER_AUTH, self::NO_AUTH_LAN_CLOUDHOLDER_AUTH_WAN];

        // Remote Access has been turned off - block any non-LAN queries.
        if(!$isLanRequest && in_array($authorization, $wanAuth) && strcasecmp(\getRemoteAccess(),"TRUE") != 0) {
            throw new Rest\Exception('WAN_LOGIN_NOT_ALLOWED', 401, null, self::$CALLED_COMPONENT);
        }

        // Requests that require admin auth, including Admin for WAN requests.
        $adminAuth = ! $isLanRequest ? [self::ADMIN_AUTH, self::ADMIN_AUTH_LAN, self::USER_AUTH_LAN_ADMIN_WAN] :
                [self::ADMIN_AUTH, self::ADMIN_AUTH_LAN];

        // Requests that require cloudholder auth, including cloudholder for WAN requests.
        $cloudholderAuth = $isLanRequest ? [self::CLOUDHOLDER_AUTH] : [self::CLOUDHOLDER_AUTH, self::NO_AUTH_LAN_CLOUDHOLDER_AUTH_WAN];

        self::authenticate($urlPath, $_REQUEST, in_array($authorization, $adminAuth), in_array($authorization, $cloudholderAuth), $authorization === self::USER_OR_HMAC_AUTH);

        return true;
    }

    /**
     * HTTP Header Parser.
     *   Snagged from http://shiflett.org/blog/2011/may/the-accept-header#comment-7
     *
     * @return array  List of accepted MIME types orderd by quotient value.
     */
    protected function _parseAcceptHeader() {

        $hdr = !empty($_SERVER['HTTP_ACCEPT']) ? $_SERVER['HTTP_ACCEPT'] : 'text/xml';
        $accept = array();

        foreach (preg_split('/\s*,\s*/', $hdr) as $i => $term) {

            $o = new \stdClass();
            $o->pos = $i;
            if (preg_match(",^(\S+)\s*;\s*(?:q|level)=([0-9\.]+),i", $term, $M)) {
                $o->type = $M[1];
                $o->q = (double) $M[2];
            } else {
                $o->type = $term;
                $o->q = 1;
            }

            $accept[] = $o;
        }

        /* Sorting the headers based on quotient value */
        usort($accept, function ($a, $b) {
                    /* first tier: highest q factor wins */
                    $diff = $b->q - $a->q;

                    if ($diff > 0) {
                        $diff = 1;
                    } else if ($diff < 0) {
                        $diff = -1;
                    } else {
                        /* tie-breaker: first listed item wins */
                        $diff = $a->pos - $b->pos;
                    }

                    return $diff;
                });

        $return = array();

        foreach ($accept as $a) {
            $return[] = $a->type;
        }

        return $return;
    }

    protected function isAcceptableHost($originHost) {
    	//get origin url form referer header or origin header
    	$acceptableHostsArr = self::$acceptableHosts;
    	//make sure we accept requests from the local web server, otherwise NAS Web UI will not work
    	$acceptableHostsArr[] = $_SERVER['SERVER_ADDR']; // gives the NAS IP Address
        //make sure we accept requests from the local web server with the hostname, otherwise NAS Web UI will not work
        $acceptableHostsArr[] = $_SERVER['SERVER_NAME']; // gives the NAS Hostname

    	if (!empty($originHost)) {
    		foreach ($acceptableHostsArr as $acceptableHost){
    			//test if origin host same as acceptable host or ends with an acceptable host name
    			if ( ($originHost == $acceptableHost) || (substr( $originHost, -strlen( $acceptableHost ) ) == $acceptableHost) ) {
    				 return true; //host is acceptable
    			}
    		}
    		return false; //origin host does not match any acceptable hosts
    	}
    	//if here, origin host is empty, for now we will allow it as to block it would cause our 
    	//non-web apps to fail (and our JMeter and BAT tests).
    	return true;
   }
    
    protected function outputCorsHeaders($scheme, $originHost, $originPort = null) {
    	//output CORS headers
        // Include if Port specified in Origin/Referrer
        $originUrl = (empty($originPort)) ?
                        $scheme .'://'. $originHost :
                        $scheme .'://'. $originHost . ':' . $originPort;
        header('Access-Control-Allow-Origin: '. $originUrl);
    	header('Access-Control-Allow-Credentials: true');
    	header('Access-Control-Allow-Headers: origin, content-type, accept');
    	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    		header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    		header('Access-Control-Max-Age: 604800');
    	}
    }
    
    protected function isValidReferer($originHost) {
    	//If user-agent header belongs to a web-browser, make sure the
    	//Referrer header (if set) contains a valid domain
    	$userAgent = $_SERVER['HTTP_USER_AGENT'];
    	foreach (self::$userAgentMatches as $userAgentMatch) {
    		if (strpos($userAgent, $userAgentMatch) !== false) {
    			//request is from a web browser, as far as we can tell
				return $this->isAcceptableHost($originHost, false);    			 
    		}
    	}
    	//if here, request does not appear to come from a web browser
    	//for now we will allow it as to block it would cause our non-web apps to fail (and our JMeter and BAT tests).
    	return true;
    }
    
}

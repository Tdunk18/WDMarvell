<?php

namespace Core\Rest;

/**
 * @concept
 *
 * Exception class for handling REST exception. In the end, we may jsut trash this
 *   in favor for ZFW's build in Error handler when we move to using built-in ZFW MVC
 */
class Exception extends \Exception {

    protected $component = 'core';

    public function __construct($message, $code = 0, $previous = null, $component = null) {
        parent::__construct($message, $code, $previous);

        $this->setComponent($component);
    }

    public function getComponent() {
        return $this->component;
    }

    public function setComponent($component) {
        $this->component = $component;
    }


    /**
     * Compile and generate the error elements.
     */
    function generateErrorOutput($outputFormat = 'xml') {

        $comp = getComponentCodes($this->getComponent());
        $error = getErrorCodes($this->getMessage());

        $compCode = isset($comp['code']) ? $comp['code'] : '';
        $errorCode = isset($error['error_sub_code']) ? $error['error_sub_code'] : '';

        $errorOverride = getParameter(null, 'error_status_override', \PDO::PARAM_BOOL);

        $errorOverride = !empty($errorOverride) && ($errorOverride === 'true' || $errorOverride == 1);
        $headerStatusCode = $this->getCode();

        if ($errorOverride) {
            $headerStatusCode = 200;
        }

        setHttpStatusCode($headerStatusCode, '', $compCode, $errorCode);

        require_once(COMMON_ROOT . '/includes/outputwriter.inc');
        $output = new \OutputWriter(strtoupper($outputFormat));
        $output->pushElement($this->getComponent());

        if ($error) {
            $errorMsg = $error['error_message'];
        } else {
            $errorMsg = $this->getMessage();
        }

        //generate error body
        //$output->element('comp_code', $compCode);
        $output->element('error_code', $this->getCode());
        $output->element('http_status_code', $this->getCode());
        $output->element('error_id', $errorCode);
        //$output->element('error_name', $errorName);
        $output->element('error_message', $errorMsg);

        $output->popElement();
        $output->close();
    }

}
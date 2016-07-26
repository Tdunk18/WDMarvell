<?php

namespace Core\Controller;

require_once(COMMON_ROOT . '/includes/globalconfig.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');
require_once(COMMON_ROOT . '/includes/security.inc');
require_once(COMMON_ROOT . '/includes/util.inc');

class Errors /* extends AbstractActionController */ {

    use \Core\RestComponent;

    var $errors;

    /**
     * Get error information.
     *
     * @param array $urlPath
     * @param array $queryParams
     * @param string $output_format
     * @return array $results
     */
    function get($urlPath, $queryParams = null, $output_format = 'xml') {
        $errorCode = isset($queryParams['error_code']) ? trim($queryParams['error_code']) : '';
        $errorName = isset($queryParams['error_name']) ? trim($queryParams['error_name']) : '';
        $language = isset($queryParams['language']) ? trim($queryParams['language']) : 'en';

        if (!getSessionUserId()) {
            $this->generateErrorOutput(401, 'errors', 'USER_LOGIN_REQUIRED', $output_format, $language);
            return;
        }

        if (!isAdmin(getSessionUserId())) {
            $this->generateErrorOutput(401, 'errors', 'USER_NOT_AUTHORIZED', $output_format, $language);
            return;
        }

        if (!empty($errorCode)) {

            $error = getErrorCodes($errorCode, '', $language);
            if (!isset($error['error_name'])) {
                $this->generateErrorOutput(404, 'errors', 'ERROR_CODE_NOT_FOUND', $output_format, $language);
                return;
            }
        } else if (!empty($errorName)) {

            $error = getErrorCodes('', $errorName, $language);
            if (!isset($error['error_code'])) {
                $this->generateErrorOutput(404, 'errors', 'ERROR_NAME_NOT_FOUND', $output_format, $language);
                return;
            }
        } else {

            $errors = getErrorCodes('', '', $language);
            $this->generateCollectionOutput(200, 'errors', 'error', $errors, $output_format);
            return;
        }

        $results = array('error_code' => $errorCode, 'error_name' => $errorName, 'error_desc' => "");
        $this->generateItemOutput(200, 'errors', $results, $output_format);
        return;
    }

}
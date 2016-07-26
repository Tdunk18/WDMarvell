<?php

namespace Common\Exception;

/**
 * NotImplementedException
 *
 * thrown for functions or features that are not implmented for the current run-time platform
 *
 * @author joesapsford
 */
class NotImplementedException extends \Exception {

    public function __construct($message = "", $code = 0, $previous = NULL) {
        if (empty($message)) {
            $message = "Function call not implemented";
        }
        parent::__construct($message, $code, $previous);
    }
}
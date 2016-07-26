<?php

namespace Core\Rest\Writer;

abstract class AbstractWriter extends \XMLWriter {

    use TraitWriter;

    public function __construct( $options ) {
        // TODO: Turn off Core\Logger FirePhp, since headers are sent right away for stream output.
        parent::__construct( $options );
    }

    static public function factory( $writer = 'xml', $options = array() ) {
        $class = __NAMESPACE__  . '\\' . ucfirst(strtolower($writer));
        return new $class($options);
    }
}
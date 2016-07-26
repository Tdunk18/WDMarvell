<?php

namespace Core;

/**
 * Yes, this is yet another Logger class. This one is using Zend\Log, with integration
 *   with FirePHP for debug messages to FireBug, instead of relying on print statements.
 *
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
use Zend\Log;

class Logger {

    private static $self = null;

    private $queries = array();
    private $shellCommands = array();
    private $http = array();
    private $zendLogger = null;
    private $logLevel = null;

    private function __construct($forceLoggingOn, $logLevel) {
        if (ORION_DEBUG || $forceLoggingOn) {
            $this->zendLogger = new Log\Logger();

            $sysLogWriter = new Log\Writer\Syslog();
            $firePhpWriter = new Log\Writer\FirePhp();
            $streamWriter = new Log\Writer\Stream(sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'rest-api.debug.' . date('Ymd') . '.log');

            if ($logLevel !== null) {
                $this->logLevel = $logLevel;
                $filter = new Log\Filter\Priority($logLevel);
                $sysLogWriter->addFilter($filter);
                $firePhpWriter->addFilter($filter);
                $streamWriter->addFilter($filter);
            }

            $this->zendLogger->addWriter($sysLogWriter);
            $this->zendLogger->addWriter($firePhpWriter);
            $this->zendLogger->addWriter($streamWriter);

            Log\Logger::registerExceptionHandler($this->zendLogger);
            Log\Logger::registerErrorHandler($this->zendLogger);
            return;
        }

        set_exception_handler(function() {});
        set_error_handler(function() {});
    }

    /**
     * Creates or returns an instance of \Core\Logger for logging messages.
     *
     * @param boolean $forceLoggingOn True to force logging output to the respective streams/files. False to let it be determined by the ORION_DEBUG constant.
     * @param int $logLevel One of the constants found in Zend\Log\Logger such as Zend\Log\Logger::ERR to filter the level that is logged to the streams/files.
     * @return \Core\Logger
     */
    public static function getInstance($forceLoggingOn = false, $logLevel = null) {
        if (
            self::$self === null ||
            ($forceLoggingOn && self::$self->zendLogger === null) ||
            self::$self->logLevel !== $logLevel
        ) {
            self::$self = new Logger($forceLoggingOn, $logLevel);
        }

        return self::$self;
    }

    public function runtime( $message, $extra = array() ) {
        if ($this->zendLogger === null) return;

        $this->zendLogger->log(Log\Logger::INFO, $message . ': ' .  (microtime(true) - APPLICATION_START_TIME), $extra);
    }

    public function debug( $message, $extra = array() ) {
        if ($this->zendLogger === null) return;

        $this->zendLogger->debug($message, $extra);
    }

    public function info( $message, $extra = array() ) {
        if ($this->zendLogger === null) return;

        $this->zendLogger->info($message, $extra);
    }

    public function err( $message, $extra = array() ) {
        if ($this->zendLogger === null) return;

        $this->zendLogger->err($message, $extra);
    }

    public function addQuery($query, $params, $totalTime) {
        if ($this->zendLogger === null) return;

        $this->queries[] = array('query' => $query, 'params' => $params, 'totalTime' => $totalTime);
    }

    public function addRequest($url, $response, $totalTime) {
        if ($this->zendLogger === null) return;

        $this->http[] = array('url' => $url, 'response' => $response, 'totalTime' => $totalTime);
    }

    public function addCommand($command, $output, $totalTime) {
        if ($this->zendLogger === null) return;

        $this->shellCommands[] = array('command' => $command, 'output' => $output, 'totalTime' => $totalTime);
    }

    public function __destruct() {
        if ($this->zendLogger === null) return;

        $shellRuntime = 0;
        foreach ( $this->shellCommands as $command ) {
            $shellRuntime += $command['totalTime'];
        }

        $queryRuntime = 0;
        foreach ( $this->queries as $query ) {
            $queryRuntime += $query['totalTime'];
        }

        $httpRuntime = 0;
        foreach ( $this->http as $http ) {
            $httpRuntime += $http['totalTime'];
        }

        self::$self->info(sprintf('Total number of shell commands: %d (%fs)', count($this->shellCommands), $shellRuntime));
        foreach ( $this->shellCommands as $command ) {
            $this->zendLogger->info(sprintf('[SHELL] (%0.5fs) %s', $command['totalTime'], $command['command']), $command['output'] ?: array());
        }

        self::$self->info(sprintf('Total number of queries: %d (%fs)', count($this->queries), $queryRuntime));
        foreach ( $this->queries as $query ) {
            $this->zendLogger->info(sprintf('[QUERY] (%0.5fs) %s', $query['totalTime'], $query['query']), $query['params'] ?: array());
        }

        self::$self->info(sprintf('Total number of HTTP calls: %d (%fs)', count($this->http), $httpRuntime));
        foreach ( $this->http as $command ) {
            $this->zendLogger->info(sprintf('[HTTP] (%0.5fs) %s', $command['totalTime'], $command['url']), $command['response'] ?: array());
        }
    }

}

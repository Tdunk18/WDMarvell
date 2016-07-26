<?php

namespace Core;

use OutputWriter;

/**
 * \file restcomponent.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
// Prevent any of these files from falling into the CORE namespace
require_once(COMMON_ROOT . '/includes/util.inc');
require_once(COMMON_ROOT . '/includes/outputwriter.inc');

trait RestComponent {

    public function __destruct() {
        try {
            \Core\Logger::getInstance()->info('Application run time ("'.\Core\NasController::$CALLED_COMPONENT.'"): ' . (microtime(true) - APPLICATION_START_TIME));
            \Core\Logger::getInstance()->info(sprintf('Total Memory usage (emalloc()): %0.5fMB', (memory_get_usage() / (1024 * 1024))));
        } catch (\Exception $e) {
            // Nothing to do - Most likely cause: FirePhp unable to write debug due to headers already sent.
            //    In this instance, syslog will still work.
            // In addition: exceptions thrown in destructors cause untraceable fatal errors in PHP.
        }
    }

    function get($urlPath, $queryParams = NULL, $outputFormat = 'xml', $version = NULL)
    {
        throw new \Core\Rest\Exception('GET is not supported.', 405, NULL, static::COMPONENT_NAME);
    }

    function post($urlPath, $queryParams = NULL, $outputFormat = 'xml', $version = NULL)
    {
        throw new \Core\Rest\Exception('POST is not supported.', 405, NULL, static::COMPONENT_NAME);
    }

    function put($urlPath, $queryParams = NULL, $outputFormat = 'xml', $version = NULL)
    {
        throw new \Core\Rest\Exception('PUT is not supported.', 405, NULL, static::COMPONENT_NAME);
    }

    function delete($urlPath, $queryParams = NULL, $outputFormat = 'xml', $version = NULL)
    {
        throw new \Core\Rest\Exception('DELETE is not supported.', 405, NULL, static::COMPONENT_NAME);
    }

    function options($urlPath, $queryParams = NULL, $outputFormat = 'xml', $version = NULL) {

    }

    /**
     * @param $statusCode
     * @param $compName
     * @param $itemName
     * @param $items
     * @param $outputFormat
     */
    function generateCollectionOutput($statusCode, $compName, $itemName, $items, $outputFormat) {
        ob_start();
        $isFirstElement = 1;
        setHttpStatusCode($statusCode);
        $output = new OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($compName);
        $output->pushArray($itemName);
        foreach ($items as $key => $item) {
            //$output->pushElement($itemName);
            $output->pushArrayElement();

            if (strtoupper($outputFormat) == 'HTML') {
                if ($isFirstElement) {
                    $isFirstElement = 0;
                    echo '<tr>';
                    foreach ($item as $key => $val) {
                        echo '<th>' . $key . '</th>';
                    }
                    echo '</tr>';
                }
            }

            if (isset($item) && is_array($item)) {
                foreach ($item as $key => $val) {
                    $output->element($key, $val);
                }
            } else if (is_object($item)) {
                $objAsArray = $item->toArray();
                foreach ($objAsArray as $key => $val) {
                    $output->element($key, $val);
                }
            }

            //$output->popElement();
            $output->popArrayElement();
        }
        $output->popArray();
        $output->popElement();
        $output->close();
    }

    /**
     *
     * @param $compName
     * @param $itemName
     * @param $items
     * @param $outputFormat
     */
    function generateCollectionOutputWithType($statusCode, $compName, $itemName, $items, $outputFormat) {
        ob_start();
        setHttpStatusCode($statusCode);
        $output = new OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($compName);
        $output->pushArray($itemName);
        foreach ($items as $key => $item) {
            //$output->pushElement($itemName);
            $output->pushArrayElement();
            foreach ($item as $key => $val) {
                if ($val['TYPE'] === 'NUMBER') {
                    $output->numberElement($key, $val['VALUE']);
                } else {
                    $output->element($key, $val['VALUE']);
                }
            }
            //$output->popElement();
            $output->popArrayElement();
        }
        $output->popArray();
        $output->popElement();
        $output->close();
    }

    /**
     * Generates output for multiple collections.
     *
     * @param $compName
     * @param $collectionList is list with name and collection
     * @param $outputFormat
     */
    function generateMultipleCollectionOutputWithCollectionName($statusCode, $compName, $collectionList, $outputFormat) {
        ob_start();
        setHttpStatusCode($statusCode);
        $output = new OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($compName);

        foreach ($collectionList as $collectionName => $collectionItems) {
            $output->pushElement($collectionName);
            foreach ($collectionItems as $elmKey => $elmVal) {
                $output->element($elmKey, $elmVal);
            }
            $output->popElement();
        }

        $output->popElement();
        $output->close();
    }

    /**
     * Generates output for multiple collections.
     *
     * @param $compName
     * @param $collectionList is list with name and collection
     * @param $outputFormat
     */
    function generateMultipleCollectionOutputWithType($statusCode, $compName, $collectionList, $outputFormat) {
        ob_start();
        setHttpStatusCode($statusCode);
        $output = new OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($compName);

        foreach ($collectionList as $collectionName => $collectionItems) {
            //$output->pushElement($collectionName);
            $output->pushArray($collectionName);
            foreach ($collectionItems as $key => $infoItem) {
                foreach ($infoItem as $itemKey => $itemVal) {
                    //$output->pushElement($key);
                    $output->pushArrayElement();
                    foreach ($itemVal as $elmKey => $elmVal) {
                        if ($elmVal['TYPE'] === 'NUMBER') {
                            $output->numberElement($elmKey, $elmVal['VALUE']);
                        } else {
                            $output->element($elmKey, $elmVal['VALUE']);
                        }
                    }
                    //$output->popElement();
                    $output->popArrayElement();
                }
            }
            //$output->popElement();
            $output->popArray();
        }
        $output->popElement();
        $output->close();
    }

    /**
     * Generates output for multiple collections.
     *
     * @param $compName
     * @param $collectionList is list with name and collection
     * @param $outputFormat
     */
    function generateMultipleCollectionOutputWithTypeAndCollectionName($statusCode, $compName, $collectionList, $outputFormat) {

    	ob_start();
        setHttpStatusCode($statusCode);
        $output = new OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($compName);
        foreach ($collectionList as $collectionName => $collectionItems) {
            $output->pushElement($collectionName);
            //$output->pushArray($collectionName);
            foreach ($collectionItems as $key => $infoItem) {
                foreach ($infoItem as $itemKey => $itemVal) {
                    $output->pushElement($key);
                    //$output->pushArrayElement();
                    foreach ($itemVal as $elmKey => $elmVal) {
                        if (is_numeric($elmVal)) {
                            $output->numberElement($elmKey, $elmVal);
                        } else {
                            $output->element($elmKey, $elmVal);
                        }
                    }
                    $output->popElement();
                    //$output->popArrayElement();
                }
            }
            $output->popElement();
            //$output->popArray();
        }
        $output->popElement();
        $output->close();
    }

    /**
     *
     * @param $compName
     * @param $itemName
     * @param $items
     * @param $outputFormat
     */
    function generateItemOutput($statusCode, $itemName, $item, $outputFormat) {
        ob_start();
        setHttpStatusCode($statusCode);
        $output = new OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($itemName);
        foreach ($item as $key => $val) {
            $output->element($key, $val);
        }
        $output->popElement();
        $output->close();
    }

    /**
     * Generates output for three layer collections.
     *
     * @param $compName
     * @param $collectionList is list with name and collection
     * @param $outputFormat
     */
    function generateThreeLayerCollectionOutput($statusCode, $compName, $collectionList, $outputFormat) {
        ob_start();
        setHttpStatusCode($statusCode);
        $output = new OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($compName); // jobs

        foreach ($collectionList as $collectionName => $collectionItems) {
            $output->pushElement($collectionName); //dir_jobs
            foreach ($collectionItems as $collectionItems2 => $collectionItems3) {
                $output->pushArray($collectionItems2); // dir_job
                foreach ($collectionItems3 as $collectionItems4 => $collectionItems5) {
                    $output->pushArrayElement();
                    foreach ($collectionItems5 as $elmKey => $elmVal) {
                        $output->element($elmKey, $elmVal);
                    }
                    $output->popArrayElement();
                }

                $output->popArray();
            }
            $output->popElement();
        }
        $output->popElement();
        $output->close();
    }

    /**
     *
     * @param $compName
     * @param $itemName
     * @param $items
     * @param $outputFormat
     */
    function generateItemOutputWithType($statusCode, $itemName, $item, $outputFormat) {
        ob_start();
        setHttpStatusCode($statusCode);
        $output = new OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($itemName);
        foreach ($item as $key => $val) {
            if ($val['TYPE'] === 'NUMBER') {
                $output->numberElement($key, $val['VALUE']);
            } else {
                $output->element($key, $val['VALUE']);
            }
        }
        $output->popElement();
        $output->close();
    }

    /**
     * generateSuccessOutput
     *
     * @param $compName Name of the component
     * @param $elmValues Array of Name and Value pairs to generate output
     * @param $outputFormat
     * @param $honorEmptyArray - flag that identifies if empty array sholud be displayed as such in JSON
     */
    function generateSuccessOutput($statusCode, $compName, $elmValues, $outputFormat, $honorEmptyArray=false) {
        ob_start();
        setHttpStatusCode($statusCode);
        /*
         *  A refactoring idea. This does not support streaming of content...
         *   ...but nither did generateSuccessOutput() to begin with
          $output = array($compName => $elmValues);
          switch ( strtolower($outputFormat) ) {
          case 'html':
          // TODO - figure out a good way to handle HTML, too.s
          break;
          case 'json':
          header('Content-type: text/plain; charset=utf-8');
          $output = json_encode($output);
          break;
          default: // XML
          header('Content-type: text/xml; charset=utf-8');
          $output = (new \Core\Config\Writer\Xml())->toString(new \Zend\Config\Config($output));
          break;
          }

          echo $output;
          return;
         *
         */

        $output = new OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($compName);

        if (strtoupper($outputFormat) == 'HTML') {
            echo '<tr>';
            foreach ($elmValues as $key => $value) {
                echo '<th>' . $key . '</th>';
            }
            echo '</tr>';
        }

        foreach ($elmValues as $key => $value) {
            $output->element($key, $value, false, $honorEmptyArray);
        }
        $output->popElement();
        $output->close();
    }

    /**
     * Compile and generate the error elements.
     *
     * @param $status_code
     * @param $comp_name
     * @param $error_name
     * @param $outputFormat
     */
    function generateErrorOutput($statusCode, $compName, $errorName, $outputFormat) {
        ob_start();
        $comp = getComponentCodes($compName);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'comp', print_r($comp,true));
        $error = getErrorCodes($errorName);
        //printf("<PRE>%s.%s=[%s]</PRE>\n", __METHOD__, 'error', print_r($error,true));

        $compCode = isset($comp['code']) ? $comp['code'] : '';
        $errorCode = isset($error['error_sub_code']) ? $error['error_sub_code'] : '';

        $errorOverride = getParameter(null, 'error_status_override', \PDO::PARAM_BOOL);

        $errorOverride = !empty($errorOverride) && ($errorOverride === 'true' || $errorOverride === '1');
        $headerStatusCode = $statusCode;

        if ($errorOverride) {
            $headerStatusCode = 200;
        }
//throw new \Exception('trace');
        setHttpStatusCode($headerStatusCode, '', $compCode, $errorCode);
        $output = new \OutputWriter(strtoupper($outputFormat), false);
        $output->pushElement($compName);

        if ($error) {
            $errorMsg = $error['error_message'];
        } else {
            $errorMsg = $errorName;
        }

        //generate error body
        //$output->element('comp_code', $compCode);
        $output->element('error_code', $statusCode);
        $output->element('http_status_code', $statusCode);
        $output->element('error_id', $errorCode);
        //$output->element('error_name', $errorName);
        $output->element('error_message', $errorMsg);

        $output->popElement();
        $output->close();
    }

    function getPutData() {
        ob_start();
        if (strtoupper($_SERVER['REQUEST_METHOD']) === 'PUT') {
            parse_str(file_get_contents("php://input"), $putData);
            return $putData;
        }
        return null;
    }

    /**
     * Generates output for multiple collections.
     *
     * @param $compName
     * @param $collectionList is list with name and collection
     * @param $outputFormat
     */
    function generateMultipleCollectionOutputWithTypeAndCollectionNameCustom($statusCode, $compName, $collectionList, $outputFormat) {
    	ob_start();
    	setHttpStatusCode($statusCode);
    	$output = new OutputWriter(strtoupper($outputFormat), false);
    	$output->pushElement($compName);
    	foreach ($collectionList as $collectionName => $collectionItems) {
    		if(is_array($collectionItems)){
    			$output->pushElement($collectionName);
	    		foreach ($collectionItems as $key => $infoItem) {
					foreach ($infoItem as $itemKey => $itemVal) {
						if(is_numeric($itemKey)){
							if(is_array($itemVal)){
								$output->pushElement($key);
								foreach ($itemVal as $elmKey => $elmVal) {
									if (is_numeric($elmVal)) {
										$output->numberElement($elmKey, $elmVal);
									} else {
										$output->element($elmKey, $elmVal);
									}
								}
								$output->popElement();
							}else{
								$output->element($key, $itemVal);
							}
						}else{
							foreach ($itemVal as $elmKey => $elmVal) {
								$output->element($elmKey, $elmVal);
							}
						}
					}
	    		}
	    		$output->popElement();
    		}else{
    			$output->element($collectionName, $collectionItems);
    		}
    	}
    	$output->popElement();
    	$output->close();
    }

    /**
     * Gets a SharePathObject instance from a url path array and handles catching exceptions.
     *
     * @param array $urlPath
     * @param bool $isWriteRequested Whether or not write access is requested.
     * @param bool $allowAdminOverride Whether or not the admin can override write access.
     * @param bool $specialException When true, throws USER_NOT_AUTHORIZED instead of SHARE_INACCESSIBLE.
     * @param bool $fourOhThree When true, uses status code 403 instead of 401.
     * @param bool $skipAccessibleCheck When true, does not check share for accessibility. Will ignore $isWriteRequested, $allowAdminOverride, $specialException and $fourOhThree params.
     * @throws \Core\Rest\Exception
     * @return \Filesystem\Model\SharePathObject
     * @todo Remove the $specialException and $fourOhThree parameters and standardize our clients.
     */
    protected function _getSharePathFromUrlPath(array $urlPath, $isWriteRequested, $allowAdminOverride = TRUE, $specialException = FALSE, $fourOhThree = FALSE, $skipAccessibleCheck = FALSE)
    {
        try
        {
            $sharePath = \Filesystem\Model\SharePathObject::createFromPathArray($urlPath);
        }
        catch (\Exception $spe)
        {
            throw new \Core\Rest\Exception($spe->getMessage(), $spe->getCode(), $spe, static::COMPONENT_NAME);
        }

        if (!$skipAccessibleCheck && !$sharePath->isAccessible($isWriteRequested, $allowAdminOverride))
        {
            $this->_throwInaccessibleException($specialException, $fourOhThree);
        }

        return $sharePath;
    }

    /**
     * Wrapper to convert a filter_var check avainst \FILTER_VALIDATE_BOOLLEAN to either 'true' or 'false'.
     *
     * @param bool $var
     * @return string 'true' or 'false'.
     */
    protected function _getFilteredBooleanValue($var)
    {
        return filter_var($var, \FILTER_VALIDATE_BOOLEAN) == 1 ? 'true' : 'false';
    }

    /**
     * Throws the exception when a share is inaccessible. Also handles special requirements for inconsistencies in our
     * codebase.
     *
     * @param bool $specialException Whether to use 'USER_NOT_AUTHORIZED' instead of 'SHARE_INACCESSIBLE'.
     * @param bool $forOhThree Whether to use 403 instead of 401 for the HTTP status code.
     * @throws \Core\Rest\Exception
     */
    protected function _throwInaccessibleException($specialException = FALSE, $forOhThree = FALSE)
    {
        $message = 'SHARE_INACCESSIBLE';
        $code    = 401;

        if ($specialException)
        {
            $message = 'USER_NOT_AUTHORIZED';

            if ($forOhThree)
            {
                $code = 403;
            }
        }

        throw new \Core\Rest\Exception($message, $code, NULL, static::COMPONENT_NAME);
    }

    /**
     * Returns a value if it is set, otherwise the alternate value which defaults to NULL.
     *
     * @param mixed $check The value to check
     * @param mixed $alternate An alternate value to return if $check is not set (defaults to NULL).
     * @return mixed
     */
    protected function _issetOr(&$check, $alternate = NULL)
    {
        return isset($check) ? $check : $alternate;
    }

    /**
     * Returns a trim()'d value if it is set, otherwise the alternate value which defaults to NULL.
     *
     * @param mixed $check The value to check and return a trim()'d output of.
     * @param mixed $alternate An alternate value to return if $check is not set (defaults to NULL).
     * @return mixed
     */
    protected function _issetOrWithTrim(&$check, $alternate = NULL)
    {
        return trim(isset($check) ? $check : $alternate);
    }

    /**
     * Throws a \Core\Rest\Exception on behalf of a controller implementing this trait.
     *
     * @param string $msg The error message to use as the first paramater in the exception constructor.
     * @param unknown $code The error code to use as the second paramater in the exception constructor.
     * @param \Exception|NULL $previous An optional \Exception to pass as a third parameter.
     * @throws \Core\Rest\Exception
     */
    protected function _throwRestException($msg, $code, $previous = NULL)
    {
        $componentName = defined('static::COMPONENT_NAME') ? static::COMPONENT_NAME : 'core';

        throw new \Core\Rest\Exception($msg, $code, $previous, $componentName);
    }
}

<?php

trait TraitWriter {

    /**
     * Pulled directly from \Zend\Config\Writer\Xml
     *
     * Zend Framework (http://framework.zend.com/)
     *
     * @link      http://github.com/zendframework/zf2 for the canonical source repository
     * @copyright Copyright (c) 2005-2012 Zend Technologies USA Inc. (http://www.zend.com)
     * @license   http://framework.zend.com/license/new-bsd New BSD License
     * @package   Zend_Config
     */

    /**
     * Add a branch to a Writer object recursively.
     *
     * @param  string    $branchName
     * @param  array     $config
     * @param  XMLWriter $writer
     * @return void
     * @throws Exception\RuntimeException
     */
    protected function addBranch($branchName, array $config, XMLWriter $writer)
    {
        $branchType = null;

        foreach ($config as $key => $value) {
            if ($branchType === null) {
                if (is_numeric($key)) {
                    $branchType = 'numeric';
                } else {
                    $writer->startElement($branchName);
                    $branchType = 'string';
                }
            } elseif ($branchType !== (is_numeric($key) ? 'numeric' : 'string')) {
                throw new Exception\RuntimeException('Mixing of string and numeric keys is not allowed');
            }

            if ($branchType === 'numeric') {
                if (is_array($value)) {
                    $this->addBranch($value, $value, $writer);
                } else {
                    $writer->writeElement($branchName, (string) $value);
                }
            } else {
                if (is_array($value)) {
                    $this->addBranch($key, $value, $writer);
                } else {
                    $writer->writeElement($key, (string) $value);
                }
            }
        }

        if ($branchType === 'string') {
            $writer->endElement();
        }
    }
}

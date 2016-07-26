<?php

namespace Core\Rest\Writer;

/**
 * @concept
 *
 * Enables Streaming of JSON data.
 * Designed to mimic built-in PHP XMLWriter, allowing full interchangeability.
 */
class Json extends AbstractWriter {

    use TraitWriter;

    /**
     *  @TODO: mimic below concept for JSON
     *
        $writer = new XMLWriter();  // Writer\Json
        $writer->openUri('php://output');
        $writer->setIndent(true); // not needed.

        $memWriter = new XMLWriter(); // Writer\Json
        $memWriter->openMemory();
        $memWriter->setIndent(true); // not needed.
        $memWriter->setIndentString(str_repeat(' ', 4)); // not needed

        $i = 0;
       /**  This look will exists within the using class. This is an example of how to use
        *      this class.
        foreach ($output as $sectionName => $data) {
            if (!is_array($data)) {
                $writer->writeElement($sectionName, (string) $data);
            } else {
                // addBranch() is from \Zend\Config\Writer\Xml -- will need a
                //     way to extract this same idea for branching into sub-dimentional arrays
                $this->addBranch($sectionName, $data, $writer); // addBranch from Zend\Config\Writer\Xml
                                                                // Will have to abstracted out some way.
            }

            if ($i++ % 5 == 0) {
                $batchXmlString = $memWriter->outputMemory(true);
                writer->writeRaw($batchXmlString);
            }
        }

        $memWriter->flush();
        unset($memWriter);

        $writer->endElement();
        $writer->endDocument();

        return $writer;
     */

    public function endDocument() { // in JSON: }
        return parent::endDocument();
    }

    public function endElement() { // in JSON: }; ] for array
        return parent::endElement();
    }

    public function openMemory() {
        return parent::openMemory();
    }

    public function openUri($uri) {
        return parent::openUri($uri);
    }

    public function outputMemory($flush = true) {
        return parent::outputMemory($flush);
    }

    public function startDocument($version = 1.0, $encoding = null, $standalone = null) { // in JSON: {
        return parent::startDocument($version, $encoding, $standalone);
    }

    public function startElement($name) { // In JSON: {; [ for array
        return parent::startElement($name);
    }

    public function writeElement($name, $content = null) { // in JSON: {name:"data"} - "data" = ["data, "data"] for arrays
        return parent::writeElement($name, $content);
    }

    public function writeRaw($content) {
        return parent::writeRaw($content); // Shouldn't need changing .. maybe be able to remove
    }
}

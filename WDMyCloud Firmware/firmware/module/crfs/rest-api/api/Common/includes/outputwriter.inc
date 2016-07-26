<?php
/**
 * \file outputwriter.inc
 * \author WDMV - Mountain View - Software Engineering
 * \copyright Copyright (c) 2012, Western Digital Corp. All rights reserved.
 */
require_once(COMMON_ROOT . '/includes/requestscope.inc');

function escape_json_string($input) {
    if(RequestScope::getInstance()->getApiVersion() > 2.6){
	   return mb_substr(json_encode([$input], JSON_UNESCAPED_SLASHES), 1, -1);
    }
    else{
        return addcslashes($input,'\"\\');
    }

}

class OutputWriter {
	var $format;
	var $indentOffset;
	var $isFirstElement;
	var $stack = array();
    var $apiVersion;
	/**
	 *
	 * Creates a new OutputWriter
	 * @param string $format must be 'XML', 'JSON', or 'HTML'
	 */
	public function __construct($format, $doObStart=true) {
		if($doObStart){
			ob_start();
		}
		$this->format         = strtoupper($format);
		$this->indentOffset   = 0;
		$this->isFirstElement = 1;
        $this->apiVersion = RequestScope::getInstance()->getApiVersion();

		if ($this->format == 'XML') {
			if ($_SERVER['APPLICATION_ENV'] != 'testing') {
				header('Content-type: text/xml; charset=utf-8');
			}
			echo '<?xml version="1.0" encoding="utf-8"?>';
		} else if ($this->format == 'JSON') {
			if ($_SERVER['APPLICATION_ENV'] != 'testing') {
				@header('Content-type: text/plain; charset=utf-8');
			}
			echo '{';
			array_push($this->stack, '');
		} else if ($this->format == 'HTML') {
			if ($_SERVER['APPLICATION_ENV'] != 'testing') {
				@header('Content-type: text/html; charset=utf-8');
			}
			echo '<style>';
			echo 'caption {font: bold 120% arial; color:#000066;}';
			echo 'table   {border-collapse:collapse; border-spacing:0; border-width:0 0 1px 1px;}';
			echo 'th      {font: bold   80% arial; padding:0 5 0 5; background-color:#000099; color:#ffffff;}';
			echo 'td      {font: normal 80% arial; padding:0 5 0 5;}';
			echo '</style>';
			echo '<table border="1" cellpadding="0" cellspacing="0">';
			echo '<tr>';
		} else {
		    throw new Exception('INVALID FORMAT!', 400); // TODO: Shouldn't this be "406 Not Acceptable"?
		}
	}

	/**
	 * Must be called at the very end of the document to properly close it
	 */
	public function close() {
		if ( $this->format =='XML' ) {

		} else if ( $this->format =='JSON' ) {
			array_pop($this->stack);
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo '}';
		}
	}

	/**
	 * Adds the line break of the previous line and the indentation for the new line.
	 */
	private function _indent() {
        if (!PRETTY) {
            return;
        }
		$indentCount = count($this->stack) - $this->indentOffset;
		switch($indentCount) {
			case 0: echo "\n"; return;
			case 1: echo "\n  "; return;
			case 2: echo "\n    "; return;
			case 3: echo "\n      "; return;
			case 4: echo "\n        "; return;
			case 5: echo "\n          "; return;
			default:
				echo "\n";
				for ($i = 0; $i < $indentCount; $i++) {
					echo "  ";
				}
		}
	}

	/**
	 * Begins a new element.  When the contents of the element have been completed, popElement must be called.
	 * @param string $element the name of the element to be added
	 */
	public function pushElement($element) {
		if ($this->format == 'XML') {
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo "<$element>";
		} else if ($this->format == 'JSON') {
			if (!$this->isFirstElement) {
				echo ', ';
			}
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo '"' , $element , '":{';
		} else if ($this->format == 'HTML') {
			if ($this->isFirstElement) {
			} else {
				echo '<tr>';
			}
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo '<caption>' , $element , '</caption>';
		}
		$this->stack[] = $element;
		$this->isFirstElement = 1;
	}

	/**
	 * Ends an element that was started with pushElement
	 */
	public function popElement() {
		$element = array_pop($this->stack);
		if (PRETTY) // indent only if pretty set
			$this->_indent();
		if ($this->format =='XML') {
			echo "</$element>";
		} else if ($this->format =='JSON') {
			echo '}';
		} else if ($this->format =='HTML') {
			echo '</table>';
		}
		$this->isFirstElement = 0;
	}

	/**
	 * Adds an element with the specified contents (e.g. <name>Eric</name>)
	 * @param string $element name of the element
	 * @param string $content contents contained within the element
	 * @param boolean $honorNull if true will treat null values as null otherwise it is treated as an empty string
	 * @param boolean $honorEmptyArray - flag that identifies if empty array sholud be displayed as such in JSON	 
	*/
	public function element($element, $content, $honorNull=false, $honorEmptyArray=false) {

		if ( $this->format =='XML' ) {
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			if ($honorNull && $content === null) {
				echo '<' , $element , ' xmlns:xsi="http://www.w3.org/2001/XMLSchema" xsi:nil="true"/>';
			} else {
				echo '<' , $element , '>' , htmlspecialchars($content, ENT_QUOTES) , '</' , $element , '>';
			}
		} else if ( $this->format =='JSON' ) {
			if (!$this->isFirstElement)
			echo ', ';
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			
			if($honorNull && $content === null) {
				echo '"' , $element , '":' , 'null';
			}elseif($honorEmptyArray && is_array($content) && empty($content)) {
				echo '"' , $element , '":[]';
			} else {
			    if($this->apiVersion > 2.6){
				    echo '"' , $element , '":' , escape_json_string($content);
			    }else{
			        echo '"' , $element , '":"' , escape_json_string($content) , '"';
			    }

			}
		} else if ( $this->format =='HTML' ) {
			if ($this->isFirstElement) {
				echo '<tr>';
			}
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			//echo '<td>' , $element , '</td><td>' , escape_json_string($content) , '</td>';
			//echo '<' , $element , '>' , htmlspecialchars($content, ENT_QUOTES, 'UTF-8') , '</' , $element , '>';
			$align = is_numeric($content) ? 'right' : 'left';
			$align = $content === true ? 'center' : $align;
			echo '<td align="' , $align , '">' , htmlspecialchars($content, ENT_QUOTES) , '</td>';
		}
		$this->isFirstElement = 0;
	}

	/**
	 * Adds an element with the specified contents (e.g. <name>Eric</name>).
	 * When using JSON format, the value will not be enclosed within double quotes.
	 * @param string $element name of the element
	 * @param string $content contents contained within the element
	 */
	public function numberElement($element, $content) {
		if ( $this->format =='XML' ) {
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo '<' , $element , '>' , htmlspecialchars($content, ENT_QUOTES, 'UTF-8') , '</' , $element , '>';
		} else if ( $this->format =='JSON' ) {
			if (!$this->isFirstElement)
			echo ', ';
			if (PRETTY) // indent only if pretty set
				$this->_indent();
            //JSON requires that a null numeric value not be blank, but should instead use the reserved word of 'null'
            if($content==='' || $content===null) {
                $content = 'null';
            }
            if(is_string($content) && $this->apiVersion > 2.6){
            	echo '"' , $element , '":' , mb_substr(escape_json_string($content), 1, -1);
            }else{
            	echo '"' , $element , '":' , escape_json_string($content);
            }
		}
		$this->isFirstElement = 0;
	}

	/**
	 * Adds or pushes an element with the specified sttribute list and contents (e.g. <name>Eric</name>)
	 * @param string $element name of the element
	 * @param array $attributes associative array of attribute-id,value pairs
	 * @param bool $push if true element is pushed on the stack and not closed, if false, element is closed
	 * @param string $content contents contained within the element
	 */
	private function insertElementWithAttributes($element, $attributes, $push=false, $content=NULL) {
		if (isset($element)) {
			if ( $this->format =='XML' ) {
				if (PRETTY) // indent only if pretty set
					$this->_indent();
				echo '<' , $element ;
				if (isset($attributes)) {
					foreach($attributes as $id => $value) {
						echo ' ' , $id , '=' , $value , ' ';
					}
				}
				if (isset($content)) {
					echo '>';
					echo htmlspecialchars($content, ENT_QUOTES, 'UTF-8');
					if (!$push) {
						echo'</' , $element , '>';
					}
				} else if ($push) {
					echo '>';
				} else {
					echo ' />';
				}
			} else if ( $this->format =='JSON' ) {
				if (!$this->isFirstElement)
				echo ', ';
				if (PRETTY) // indent only if pretty set
					$this->_indent();
				if (isset($attributes)) {
					echo '"' , $element , '": { "@attributes":{';
					$first = true;
					foreach($attributes as $id => $value) {
						if (!$first)
						echo ','; else
						$first = false;
						echo '"' , $id , '":"' , $value , '"';
					}
					echo '}';
					if (isset($content)) {
					    if($this->apiVersion > 2.6){
						  echo '", "@content":' , escape_json_string($content);
					    }else{
					      echo '", "@content":"' , escape_json_string($content) , '"';
					    }
					}
					echo '}';
				} else {
				    if($this->apiVersion > 2.6){
					   echo '"' , $element , '":' , escape_json_string($content);
				    }else{
					   echo '"' , $element , '":"' , escape_json_string($content) , '"';
				    }
				}
			}
			if ($push) {
				$this->stack[] = $element;
				$this->isFirstElement = 1;
			} else {
				$this->isFirstElement = 0;
			}
		}
	}
	/**
	 * Adds an element with the specified sttribute list and contents (e.g. <user id=12345>Eric</user>)
	 * @param string $element name of the element
	 * @param array $attributes associative array of attribute id,value pairs
	 * @param string $content contents contained within the element
	 */
	public function elementWithAttributes($element,  $attributes, $content=NULL) {
		$this->insertElementWithAttributes($element, $attributes, false, $content);
	}

	/**
	 * Pushes an element with the specified sttribute list and contents (e.g. <user id=12345>Eric</user>)
	 * @param string $element name of the element
	 * @param array $attributes associative array of attribute id,value pairs
	 * @param string $content contents contained within the element
	 */
	public function pushElementWithAttributes($element,  $attributes, $content=NULL) {
		$this->insertElementWithAttributes($element, $attributes, true, $content);
	}

	/**
	 * Adds a single element with no contents (e.g. <br/>)
	 * @param string $element name of element to be added which has no contents.
	 */
	public function emptyelement($element) {
		if ( $this->format =='XML' ) {
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo '<' , $element , '/>';
		} else if ( $this->format =='JSON' ) {
			if (!$this->isFirstElement)
			echo ', ';
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo '"' , $element , '":null';
		}
		$this->isFirstElement = 0;
	}

	/**
	 * This begins a new array where each entry within the array will by of the specified type of element.
	 * After all elements have been added, popArray must be called.
	 * @param string $element name of element for each entry in the array
	 */
	public function pushArray($element) {
		if ($this->format == 'XML') {
			//XML doesn't show the beginning of an array
			$this->indentOffset++;
		} else if ($this->format == 'JSON') {
			if (!$this->isFirstElement)
			echo ', ';
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo '"' , $element , '":[';
			$this->isFirstElement = 1;
		} else if ($this->format == 'HTML') {

		}
		array_push($this->stack, $element);
		$this->isFirstElement = 1;
	}

	/**
	 * This ends the whole array that was started with pushArray.
	 */
	public function popArray() {
		$element = array_pop($this->stack);
		if ( $this->format =='XML' ) {
			//XML doesn't show the ending of an array
			$this->indentOffset--;
		} else if ( $this->format =='JSON' ) {
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo ']';
		}
		$this->isFirstElement = 0;
	}

	/**
	 * Begins a new element of an array.  After this has been called and the contents of the array have been completed,
	 * then popArrayElement will then need to be called to complete this element of the array.
	 */
	public function pushArrayElement() {
		if ( $this->format =='XML' ) {
			//peek to see what is on the stack
			$element = array_pop($this->stack);
			array_push($this->stack, $element);
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo '<' , $element , '>';
		} else if ( $this->format =='JSON' ) {
			if (!$this->isFirstElement)
			echo ', ';
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo '{';
		}
		array_push($this->stack, '');
		$this->isFirstElement = 1;
	}

	/**
	 * Ends an element within an array.  This should have been preceeded with a pushArrayElement
	 */
	public function popArrayElement() {
		array_pop($this->stack);
		if (PRETTY) // indent only if pretty set
			$this->_indent();
		if ( $this->format =='XML' ) {
			//peek to see what is on the stack
			$element = array_pop($this->stack);
			array_push($this->stack, $element);
			echo '</' , $element , '>';
		} else if ( $this->format =='JSON' ) {
			echo '}';
		}
		$this->isFirstElement = 0;
	}

	/**
	 * Adds an element to the array with the specified content.  The element for this content must have been previously
	 * defined using the pushArray method.
	 * @param string $content the content within the new element
	 */
	public function arrayElement($content) {
		if ( $this->format =='XML' ) {
			//peek to see what is on the stack
			$element = array_pop($this->stack);
			array_push($this->stack, $element);
			if (PRETTY) // indent only if pretty set
				$this->_indent();
			echo '<' , $element , '>' , htmlspecialchars($content, ENT_QUOTES, 'UTF-8') , '</' , $element , '>';
		} else if ( $this->format =='JSON' ) {
			if (!$this->isFirstElement)
			echo ', ';
			if (PRETTY) // indent only if pretty set
				$this->_indent();

			    if($this->apiVersion > 2.6){
			        echo escape_json_string($content);
			    }
			    else{
			        echo '"' , escape_json_string($content) , '"';
			    }
		}
		$this->isFirstElement = 0;
	}
}

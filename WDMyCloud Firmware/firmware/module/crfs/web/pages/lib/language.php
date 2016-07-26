<?php

class Language{
    private $language;
    private $host = 'http://127.0.0.1';
    private $apiPath = '/api/2.1/rest/';
    
    public function getLanguage(){
    	/*
        if (!isset($this->language)){
            //default to en_US
            $this->language = 'en_US';
            $url = $this->host.$this->apiPath.'language_configuration';
            $ch = curl_init($url);
    		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    		$result = curl_exec($ch);
    		curl_close($ch);
    		$xml = simplexml_load_string($result);
    		if ($xml !== false){
    		    $language = $xml->language;
    		    if (isset($language) && !empty($language) && $language != 'DEFAULT'){
    		        $this->language = $language;
    		    }
    		}
        }
        return trim($this->language);
        */
        
		$Language = array(
			"0" => "en_US",
		    "1" => "fr_FR",
		    "2" => "it_IT",
		    "3" => "de_DE",
		    "4" => "es_ES",
		    "5" => "zh_CN",
		    "6" => "zh_TW",
		    "7" => "ko_KR",
		    "8" => "ja_JP",
		    "9" => "ru_RU",
		    "10" => "pt_BR",
		    "11" => "cs_CZ",
		    "12" => "nl_NL",
		    "13" => "hu_HU",
		    "14" => "nb_NO",
		    "15" => "pl_PL",
		    "16" => "sv_SE",
		    "17" => "tr_TR"
		);
		
		exec("xmldbc -g /language",$idx);
		return trim($Language[$idx[0]]);
    }
}
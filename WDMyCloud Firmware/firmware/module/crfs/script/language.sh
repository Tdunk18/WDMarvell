#!/bin/sh

  if [ ! -e /tmp/color_id ]; then
    language=language_KC
  else
    language=language_GT
  fi

	L=$(xmldbc -g "/language")
	
	rm -f /var/www/xml/english.xml >/dev/null
	rm -f /var/www/xml/lang.xml >/dev/null
	
	ln -s /usr/local/modules/$language/en-US/english_en-us.xml  /var/www/xml/english.xml
	
	if [ $L == "0" ]; then
		ln -s /usr/local/modules/$language/en-US/english_en-us.xml  /var/www/xml/lang.xml
	elif [ $L == "1" ];then
		ln -s /usr/local/modules/$language/fr-FR/english_fr-fr.xml  /var/www/xml/lang.xml
	elif [ $L == "2" ];then
		ln -s /usr/local/modules/$language/it_IT/english_it-it.xml  /var/www/xml/lang.xml
	elif [ $L == "3" ];then
		ln -s /usr/local/modules/$language/de-DE/english_de-de.xml  /var/www/xml/lang.xml
	elif [ $L == "4" ];then
		ln -s /usr/local/modules/$language/es-ES/english_es-es.xml  /var/www/xml/lang.xml
	elif [ $L == "5" ];then
		ln -s /usr/local/modules/$language/zh-CN/english_zh-cn.xml  /var/www/xml/lang.xml	
	elif [ $L == "6" ];then
		ln -s /usr/local/modules/$language/zh-TW/english_zh-tw.xml  /var/www/xml/lang.xml
	elif [ $L == "7" ];then
		ln -s /usr/local/modules/$language/ko-KR/english_ko-kr.xml  /var/www/xml/lang.xml	
	elif [ $L == "8" ];then
		ln -s /usr/local/modules/$language/ja-JP/english_ja-jp.xml  /var/www/xml/lang.xml
	elif [ $L == "9" ];then
		ln -s /usr/local/modules/$language/ru-RU/english_ru-RU.xml  /var/www/xml/lang.xml
	elif [ $L == "10" ];then
		ln -s /usr/local/modules/$language/pt-BR/english_pt-br.xml  /var/www/xml/lang.xml
	elif [ $L == "11" ];then
		ln -s /usr/local/modules/$language/cs-CZ/english_cs-cz.xml  /var/www/xml/lang.xml
	elif [ $L == "12" ];then
		ln -s /usr/local/modules/$language/nl-NL/english_nl-nl.xml  /var/www/xml/lang.xml	
	elif [ $L == "13" ];then
		ln -s /usr/local/modules/$language/hu-HU/english_hu-hu.xml  /var/www/xml/lang.xml	
	elif [ $L == "14" ];then
		ln -s /usr/local/modules/$language/no-NO/english_no-no.xml  /var/www/xml/lang.xml	
	elif [ $L == "15" ];then
		ln -s /usr/local/modules/$language/pl-PL/english_pl-pl.xml  /var/www/xml/lang.xml	
	elif [ $L == "16" ];then
		ln -s /usr/local/modules/$language/sv-SE/english_sv-se.xml  /var/www/xml/lang.xml	
	elif [ $L == "17" ];then
		ln -s /usr/local/modules/$language/tr-TR/english_tr-tr.xml  /var/www/xml/lang.xml	
	fi
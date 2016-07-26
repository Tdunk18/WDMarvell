var XML_LANGUAGE_EN;
var XML_LANGUAGE;
var LANGUAGE = new Array();
var _HOME_MULTI_LANGUAGE_FLAG = 1;

function load_language() {
	
	wd_ajax({
		type: "GET",
		url: "/xml/lang.xml",
		dataType: "xml",
		async: false,
		cache: false,
		error: function () {},
		success: function (xml) {
			XML_LANGUAGE = xml;
			
			if (_HOME_MULTI_LANGUAGE_FLAG == 1)
			{
				//LANGUAGE.length = 0;
				$(xml).find('text').children().each(function () {
						var idx = (this).nodeName;
						//LANGUAGE[idx] = new Array();			
						$(xml).find(idx).children().each(function () {
								LANGUAGE[idx][(this).nodeName] = $(this).text();
						});	
				});
			}
		}
	});
	
}

function load_en_language() {
	wd_ajax({
		type: "GET",
		url: "/xml/english.xml",
		dataType: "xml",
		async: false,
		cache: false,
		error: function () {},
		success: function (xml) {
			XML_LANGUAGE_EN = xml;
			
			if (_HOME_MULTI_LANGUAGE_FLAG == 1)
			{
				$(xml).find('text').children().each(function () {
						var idx = (this).nodeName;
						LANGUAGE[idx] = new Array();			
						$(xml).find(idx).children().each(function () {
								LANGUAGE[idx][(this).nodeName] = $(this).text();
						});	
				});
			}
		}
	});
}

function _T(c, id) {
	var str = "";
	if (typeof XML_LANGUAGE_EN == 'undefined') load_en_language();
	if (typeof XML_LANGUAGE == 'undefined') load_language();
	
	if (_HOME_MULTI_LANGUAGE_FLAG == 1)
	{
		str = (typeof LANGUAGE[c] == 'undefined' || typeof LANGUAGE[c][id] == 'undefined')? "":LANGUAGE[c][id];
	}
	else
	{	
		var find = false;
		$(XML_LANGUAGE).find(c).each(function () {
			str = $(this).find(id).text()
			if (str != "")
				find = true;
			return false;
		});
	
		if (find == false) {
			$(XML_LANGUAGE_EN).find(c).each(function () {
				str = $(this).find(id).text()
				return false;
			});
		}
	}
	return str;
}

function language() {
	$('._text').each(function () {
		var str = _T($(this).attr('lang'), $(this).attr('datafld'));
		if (str != "") {
			$(this).empty();
			$(this).html(str);
		}
	});
}

function language_for_iframe() {
	$("iframe").contents().find('._text').each(function () {
		var str = _T($(this).attr('lang'), $(this).attr('datafld'));
		if (str != "") {
			$(this).empty();
			$(this).html(str);
		}
	});
}
function ready_language() {
	load_en_language();
	load_language();
	language();
	
	$("body").removeClass();
    $("body").addClass(lanagage_list[parseInt(lang, 10)]);
    
    $("body").addClass(MODEL_NAME);
}

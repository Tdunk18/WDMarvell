var CODEPAGE_LIST = new Array();	
var CODEPAGE_DESC = new Array();	

function codepage_get_desc(codepage)
{
	var str = "";
	
	if (codepage == "") return str;
	
	for (var i=0;i<CODEPAGE_LIST.length;i++)
	{
		if (CODEPAGE_LIST[i] == codepage)
		{
			str = CODEPAGE_DESC[i];
			break;
		}	
	}	
	
	return str;
}

function check_codepage_list(codepage)
{
	var flag = 0;
	
	for (var i=0;i<CODEPAGE_LIST.length;i++)
	{
		if ( CODEPAGE_LIST[i].toString().toUpperCase()  == codepage.toUpperCase())
			flag = 1;
	}	
	
	return flag;
}

function codepage_get_mtui_lang(my_lang,my_codepage)
{
	var str = "";
	
	if (my_codepage == "BIG5-HKSCS:2001")
		str = _T('_codepage','BIG5-HKSCS_2001');
	else if (my_codepage == "BIG5-HKSCS:1999")
		str = _T('_codepage','BIG5-HKSCS_1999');
	else 
		str	 = _T('_codepage',my_codepage);
	
	if (str == "") 
		str = my_lang;
		
	return str;
}

function codepage_list(id_name, callback_fun)
{	
	CODEPAGE_LIST = new Array();
	CODEPAGE_DESC = new Array();
	
	wd_ajax({
		url: "/cgi-bin/codepage_mgr.cgi",
		type: "POST",
		async: false,
		cache: false,
		data:{cmd:'GUI_codepage_get_list'},
		dataType:"xml",
		success: function(xml)
		{	
			var html_select_options_desc="";
			var codepage_lang="";
			var codepage_desc="";
			
			//html_select_options_desc = "<option value=\"none\">"+_T('_common','add')+"</option>";	//Text:Add
			html_select_options_desc = '<ul>';
			html_select_options_desc += '<li class="option_list" >';
			html_select_options_desc += '<div id="'+id_name+'_main" class="wd_select option_selected">';
			html_select_options_desc += '<div class="sLeft wd_select_l"></div>';
			html_select_options_desc += '<div class="sBody text wd_select_m" id="'+id_name+'" rel="" style="width:242px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"></div>';
			html_select_options_desc += '<div class="sRight wd_select_r"></div>';
			html_select_options_desc += '</div>';
		
			html_select_options_desc += '<ul class="ul_obj" id="codepage_li">';
			html_select_options_desc += '<div class="codepage_language_scroll">'
			//html_select_options_desc += '<li class="li_start" id="'+id_name+'Li1_select" rel="none"><a href="#">'+_T('_common','add')+'</a>';
			
			var _tmp_show = "", _tmp_rel="";
			$('item', xml).each(function(idx){
				
				codepage_lang = $('lang',this).text();
				codepage_desc = $('desc',this).text();
				
				CODEPAGE_LIST.push(codepage_lang); 
				CODEPAGE_DESC.push(codepage_desc); 
				
				var codepage = new Array(codepage_lang,codepage_get_mtui_lang(codepage_desc,codepage_lang));
				
				html_select_options_desc += '<li id="'+id_name+'Li'+(parseInt(idx,10)+2)+'_select"';
				if (parseInt(idx,10) == ($('item',xml).length - 1)) 
					html_select_options_desc += ' class="li_end"';								
				html_select_options_desc += ' rel="'+codepage_lang+'"> <a href=\"#\" onclick='+ callback_fun +'(\"'+codepage_lang+'\")>' + codepage_get_mtui_lang(codepage_desc,codepage_lang)+'('+codepage_lang+')' + '</a></li>';
				
				if (parseInt(idx, 10) == 0)
				{
					_tmp_show = codepage_get_mtui_lang(codepage_desc,codepage_lang)+'('+codepage_lang+')';
				}
				
			});// end of $('item', xml).each(function(e)
			
			html_select_options_desc += '</div>';
			html_select_options_desc += '</ul>';
			html_select_options_desc += '</li>';
			html_select_options_desc += '</ul>';			
			
			$("#Selector_AllCodepage_Create").empty().append(html_select_options_desc);
			$("#"+id_name).attr("rel",_tmp_rel).html(_tmp_show);
			init_select();
			
		}//end of success
	});//end of ajax
	
}

function codepage_add(id_name,codepage)
{
	wd_ajax({
		url: "/cgi-bin/codepage_mgr.cgi",
		type: "POST",
		async: false,
		cache: false,
		data:{cmd:'GUI_codepage_add',f_lang:codepage},
		dataType:"xml",
		success: function(xml)
		{	
			 var res = $(xml).find('res').text();
			 
			 if (parseInt(res, 10) == 1)
			 {
				 	if (id_name == 'ftp')	ftp_set();
				 	//else if (id_name == 'ftp_downlaods')	FDownloads_create();
			 }
			 else
			 {
			 		if (id_name == 'ftp') jLoadingClose();
			 	
			 		jAlert( _T('_ftp','msg33'), "warning");	//Text:Invalid Client Language.
			 }	
			
		}//end of success
	});//end of ajax
	
}
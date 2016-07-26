<!doctype html>
<html>
<head>
<link rel="icon" type="image/x-icon" href="/web/images/Logo_16x16.ico"></link>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="PRAGMA" content="no-cache"> 
<meta http-equiv="Expires" content="-1">
<meta http-equiv="Cache-Control" content="no-cache">
<title></title>
</head>

<link rel="stylesheet" type="text/css" href="/web/css/eula.css">

<style>
	a:link {color:rgb(137,137,137)}
	a:visited {color:rgb(137,137,137)}
	a:active {color:rgb(137,137,137)}
	a:hover {color:rgb(137,137,137)}

.wdlink{
	cursor:pointer;
	text-decoration:underline;
}
</style>

<script type="text/javascript">
function open_eula()
{
	$("#eula_list").show();
	$("#eula_list1").hide();
}
	
function print_eula()
{
	var eula = frames[0];
	eula.focus();
	eula.print();
    return false;
}
function cancel()
{
	$("#eula_list").hide();
	$("#eula_list1").show();
	$("#eula_continue_button").removeClass("gray_out").addClass("gray_out");
	$("#eula_agreement_chkbox").attr('checked',false);
}
function accept()
{
	$("#eula_agreement_chkbox").attr('checked',true)
	$("#eula_list").hide();
	$("#eula_list1").show();
	$("#eula_continue_button").removeClass("gray_out")
}
var jload = -1;
function run()
{
	$("#gettingstarted_newPW_password").val("");
	$("#gettingstarted_comfirmPW_password").val("");
	
	if (!$("#eula_continue_button").hasClass("gray_out"))
	{
		chk_hdd_status(function(cntDisk,res,eula){//fish20140825+ for check hdd
			if(cntDisk==0 && res==0)
			{
				init_no_hdd_diag();
				return;
			}
			else
			{
				if(noHDDDiagObj!="")        			
				{
					noHDDDiagObj.close();
				}
			}
				
		$("#file").val("");
		if (jload == -1)
		{
		jLoading(_T('_common','set') ,'Wait' ,'s',""); 
			jload = 0;
		}	
		wd_ajax({
		type: "POST",			
		cache: false,
		dataType: 'xml',
		url: "/cgi-bin/system_mgr.cgi",
		data:"cmd=eula_update_fw",
	   	success:function(xml){	   	
	   		 		jLoadingClose();		
						$(xml).find('fw').each(function (index) {
							var update_status = $(this).find('update_status').text();
							var network_status = $(this).find('network_status').text();
							var current_version = $(this).find('current_version').text();
							var last_version = $(this).find('last_version').text();
								if (update_status == "n")
											run_wizard('eula');
								else
								{									
									$("#id_eula_current").text(current_version);
									$("#id_e_latest").text(last_version);
									$("#id_eula_auto_new_firm_note").attr("href",$(this).find('releasenote').text());									
									if (network_status == "error")
									{
											$("#eula_fwUpdateInstall_button").hide();
											hide('id_eula_auto_new_firm_note');
									}											
									//open_eula_diag();
									adjust_dialog_size("#eulaFWUpdateDiag",500, 350);								
									obj = $("#eulaFWUpdateDiag").overlay({
										expose: '#000',
										api: true,
										closeOnClick: false,
										closeOnEsc: false										
									});	
												
									obj.load();
									
									$("#eulaFWUpdateDiag .close").click(function () {
										$('#eulaFWUpdateDiag .close').unbind('click');
										obj.close();
									});
								}		
						});
	   		},
	   		error:function(){	   		
	   			run();
	   		}			
	 });	
		});
	}	
}	

function eula_start_upload()
{
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		async:true,
		dataType: 'html',
		data:{cmd:"cgi_firmware_init_upload"},
	   	success: function(data){
   		if (data == "success")
   		{
   					eula_chk_init_upload();
   					
			}		
	   }
	});													
	
}
var eula_loop_init_upload = -1;
function eula_chk_init_upload()
{
	wd_ajax({
						type: "POST",
						cache: false,
						url: "/cgi-bin/system_mgr.cgi",
						async:true,
						dataType: 'html',
						data:{cmd:"cgi_firmware_init_upload_chk"},
					   	success: function(data){					   	
					   		if (data == "success")
					   		{
					   			clearTimeout(eula_loop_init_upload);
//					   			if(window.attachEvent){
//							        document.getElementById("eula_upload_target").attachEvent('onload', u_uploadCallback);
//							    }
//							    else{
//							        document.getElementById("eula_upload_target").addEventListener('load', u_uploadCallback, false);
//									}
	    								   
	    						$("#eulaFWUpdateDiag").overlay().close();
							    clear_percentage();								
									startdownload("eula");									
										  
									document.form_fw.setAttribute('encoding','multipart/form-data');
									document.form_fw.setAttribute('enctype','multipart/form-data');	  
       					 	document.form_fw.target = 'eula_upload_target'; //'upload_target' is the name of the iframe										         									
       					 	setTimeout(function(){
									document.form_fw.submit();					   			
									},500);
									
					   		}	
					   		else
					   		{
					   			eula_loop_init_upload = setTimeout(eula_chk_init_upload,1000);
					   		}		
					  }});   			
}	
function chk_fw_upload(){}
function restart_get_name_mpapping(){}
function u_uploadCallback()
{
	//$("#upload_frame").attr("src", "/web/setting/firmware_result.html?r=" + sys_time);
}
function page_load()
{		
	
	var sys_time = (new Date()).getTime();
	initDiag("/web/wizardDiag.html?r="+sys_time, null, function() {
		$("input:checkbox").checkboxStyle();
		wd_ajax({
						type: "POST",
						cache: false,
						url: "/cgi-bin/system_mgr.cgi",
						async:true,
						dataType: 'html',
						data:{cmd:"cgi_get_eula_fw"},
					   	success: function(data){					   		
					   		if (data == "1")
					   		{					   					   			
					   			run_wizard('eula');					   		
					   		}					   		
					   }	
					  }); 
	
	
	var oBrowser = new detectBrowser();
 	if (oBrowser.isIE)
 	{
 		var l = navigator.systemLanguage
 		l = l.substr(l.length-2,2) 
 	}
 	else
 	{
 		var l = navigator.language
 		l=l.substr(l.length-2,2) 	
 	}			
	var language=0;

	var l_array_1 =  new Array("en","fr","it","de","es","zh","zh","ko","ja","ru","pt","cs","nl","hu","no","pl","sv","tr");			
	var l_array_2 =  new Array("US","FR","IT","DE","ES","CN","TW","KR","JP","RU","BR","CZ","NL","HU","NO","PL","SE","TR");
	
	
	for (var i = 0;i<l_array_1.length;i++)
	{
		if (l_array_1[i].toLowerCase() == l.toLowerCase() || l_array_2[i].toLowerCase() == l.toLowerCase())
		{
			language = i		
		}	
	}
	if (MODEL_NAME == "BAGX")
	{
		if (language != 0 && language != 8)
		{
			language = 0;
		} 
	}
	
	var str = "cmd=cgi_language&f_language="+parseInt(language,10);
	$.ajax({
		type: "POST",
		cache:false,
		url: "/cgi-bin/system_mgr.cgi",
		data:str,
	   	success:function(){	   			
					_REST_Language(language_array2[parseInt(language,10)]);							
					lang = language;
					ready_language();								
					TIME_FORMAT = parseInt(language,10);
					load_date_lang(parseInt(language,10));							
	   		}			
			});
	writeLangSelector();
	language_mapping(language);
	set_lang_doc(language);		
	init_select();
	$("input:checkbox").checkboxStyle();
	});
		
}
function set_lang_doc(language)
{
			var obj="";
			if (language == 0) obj = "en_US";
			else if (language == 1) obj = "fr_FR";
			else if (language == 2) obj = "it_IT";
			else if (language == 3) obj = "de_DE";
			else if (language == 4) obj = "es_ES";
			else if (language == 5) obj = "zh_CN";
			else if (language == 6) obj = "zh_TW";	
			else if (language == 7) obj = "ko_KR";
			else if (language == 8) obj = "ja_JP";
			else if (language == 9) obj = "ru_RU";
			else if (language == 10) obj = "pt_BR";
			else if (language == 11) obj = "cs_CZ";
			else if (language == 12) obj = "nl_NL";	
			else if (language == 13) obj = "hu_HU";
			else if (language == 14) obj = "nb_NO";
			else if (language == 15) obj = "pl_PL";
			else if (language == 16) obj = "sv_SV";
			else if (language == 17) obj = "tr_TR";		
			
			var	eulaFilename = {"en_US":"WDT Generic EULA 4078-705022-A09.html",
						"fr_FR":"WDT Generic EULA 4078-705022-D09.html",
						"it_IT":"WDT Generic EULA 4078-705022-F09.html",
						"de_DE":"WDT Generic EULA 4078-705022-E09.html",
						"es_ES":"WDT Generic EULA 4078-705022-B09.html",
						"zh_CN":"WDT Generic EULA 4078-705022-S09.html",
						"zh_TW":"WDT Generic EULA 4078-705022-T09.html",
						"ko_KR":"WDT Generic EULA 4078-705022-Q09.html",
						"ja_JP":"WDT Generic EULA 4078-705022-R09.html",
						"ru_RU":"WDT Generic EULA 4078-705022-K09.html",
						"pt_BR":"WDT Generic EULA 4078-705022-C09.html",
						"cs_CZ":"WDT Generic EULA 4078-705022-Z09.html",
						"nl_NL":"WDT Generic EULA 4078-705022-G09.html",
						"hu_HU":"WDT Generic EULA 4078-705022-Y09.html",
						"nb_NO":"WDT Generic EULA 4078-705022-H09.html",
						"pl_PL":"WDT Generic EULA 4078-705022-L09.html",
						"sv_SV":"WDT Generic EULA 4078-705022-J09.html",
						"tr_TR":"WDT Generic EULA 4078-705022-W09.html"
						};
						
		$("#eula_iframe").attr("src","/web/eula/"+obj+"/HTML/"+eulaFilename[obj]);	
}

function lang_save(index)
{	
//	jLoading(_T('_common','set') ,'loading' ,'s',""); 		
	//var str = "cmd=cgi_language&f_language="+ $('#f_language').attr('rel');
	var str = "cmd=cgi_language&f_language="+ index;
	wd_ajax({
		type: "POST",			
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		dataType: 'html',
		data:str,
	   	success:function(){
	   			//jLoadingClose();	   			   				   				   		 		 		  				
					hide('id_lang_save');
					hide('id_lang_cancel');
					_REST_Language(language_array2[$("#f_language").attr("rel")]);
					lang = index;
					ready_language();
					set_lang_doc(index);	
					TIME_FORMAT = parseInt(index,10);
					load_date_lang(parseInt(index,10));
				//	window.location.reload(true);
	   		}			
	 });	
	 return false;		
}
function language_mapping(language)
{
var lang_array = new Array(
"English",
"Francais",
"Italiano",
"Deutsch",
"Espanol",
"简体中文",      
"繁體中文",		
"한국어",        
"日本語",
"Русский",  
"Português",
"Čeština",
"Nederlands",
"Magyar",
"Norsk",
"Polski",
"Svenska",
"Türkçe");

$('#f_language').html(lang_array[language]);	
	
}
function writeLangSelector()
{
	$('#id_language_top_main').empty();		
	var my_html_options="";	
	my_html_options+="<ul>";
	my_html_options+="<li class='option_list'>";
	my_html_options+="<div id=\"eula_generalLanguage_select\" class=\"edit_select wd_select option_selected\" >";
	my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
	my_html_options+="<div class=\"sBody text wd_select_m\" id=\"f_language\" rel=\"0\">English</div>";
	my_html_options+="<div class=\"sRight wd_select_r\"></div>";
	my_html_options+="</div>";
	
	if (MODEL_NAME == "BAGX")
	{
		my_html_options+="<ul class='ul_obj' id='id_languag_li'><div>";
		my_html_options+="<li id=\"eula_generalLanguageLi1_select\" rel=\"0\" ><a href=\"#\" onclick=\"lang_save('0');\">English</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi9_select\" rel=\"8\" ><a href=\"#\" onclick=\"lang_save('8');\">日本語</a></li>";
		my_html_options+="</div></ul>";
	}
	else
	{	
		my_html_options+="<ul class='ul_obj' id='id_languag_li' style='height:250px;'>"	
		my_html_options+='<div class="language_scroll">';				
		my_html_options+="<li id=\"eula_generalLanguageLi1_select\" rel=\"0\" ><a href=\"#\" onclick=\"lang_save('0');\">English</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi2_select\" rel=\"1\" ><a href=\"#\" onclick=\"lang_save('1');\">Français</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi3_select\" rel=\"2\" ><a href=\"#\" onclick=\"lang_save('2');\">Italiano</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi4_select\" rel=\"3\" ><a href=\"#\" onclick=\"lang_save('3');\">Deutsch</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi5_select\" rel=\"4\" ><a href=\"#\" onclick=\"lang_save('4');\">Español</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi6_select\" rel=\"5\" ><a href=\"#\" onclick=\"lang_save('5');\">简体中文</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi7_select\" rel=\"6\" ><a href=\"#\" onclick=\"lang_save('6');\">繁體中文</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi8_select\" rel=\"7\" ><a href=\"#\" onclick=\"lang_save('7');\">한국어</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi9_select\" rel=\"8\" ><a href=\"#\" onclick=\"lang_save('8');\">日本語</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi10_select\" rel=\"9\" ><a href=\"#\" onclick=\"lang_save('9');\">Русский</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi11_select\" rel=\"10\" ><a href=\"#\" onclick=\"lang_save('10');\">Português</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi12_select\" rel=\"11\" ><a href=\"#\" onclick=\"lang_save('11');\">Čeština</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi13_select\" rel=\"12\" ><a href=\"#\" onclick=\"lang_save('12');\">Nederlands</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi14_select\" rel=\"13\" ><a href=\"#\" onclick=\"lang_save('13');\">Magyar</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi15_select\" rel=\"14\" ><a href=\"#\" onclick=\"lang_save('14');\">Norsk</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi16_select\" rel=\"15\" ><a href=\"#\" onclick=\"lang_save('15');\">Polski</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi17_select\" rel=\"16\" ><a href=\"#\" onclick=\"lang_save('16');\">Svenska</a></li>";
		my_html_options+="<li id=\"eula_generalLanguageLi18_select\" rel=\"17\" ><a href=\"#\" onclick=\"lang_save('17');\">Türkçe</a></li>";			
		my_html_options+="</div>";	
		my_html_options+="</ul>";
	}	
	my_html_options+="</li>";
	my_html_options+="</ul>";
	
		
	$("#id_language_top_main").append(my_html_options);			
}
function page_unload()
{
}
var noHDDDiagObj = "";
var noHDD_timeoutId=0;
var systemBusyDiag="";
var setSataPowerFlag=0;
function init_no_hdd_diag()
{
	stop_web_timeout(true);
	$("#eula_noHDD_link,#eula_noHDD2_link").addClass('wdlink');
	$("#eula_noHDD_link,#eula_noHDD2_link").attr('target','_blank');
	$("#eula_noHDD_link").attr("href","http://store.wd.com");
	$("#eula_noHDD2_link").attr("href","http://store.wd.com");
	//$("#eula_chkHDD_button").addClass('gray_out');
	
  	noHDDDiagObj=$("#noHDDDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
  		        		onBeforeLoad: function() {
            			},
						onBeforeClose: function() {            			
            			}
        			});
        			
	//sata power off
	$.ajax({
		type: "POST",
		cache: false,
		dataType:"xml",
		url: "/web/php/noHDD.php",
		data: {cmd:'setSataPower',enable:"disable"},
		success:function(xml){
			noHDDDiagObj.load();
			$("#noHDDDiag").show();
		}
	});

}

</script>
<style>
.ui-widget-header {
	background: #15ABFF;
}

.ui-widget-content {
		height: 4px;
		border:0;
		background: #C8C8C8 !important;;
		border-radius: 0;
}


.file_input_textbox
{
	float: left;
	width:5px;		
}

.file_input_div {			
  position: relative;
  width: 200px;
  height: 50px;
}

.file_input_button
{
	width: 200px; 
	position: absolute; 
	top: 0px;
	background-color: #33BB00;
	color: #FFFFFF;
	border-style: solid;
}

.file_input_hidden
{
	cursor: pointer;
	width:100%;
	height:150%;
  font-size: 40px; 
  position: absolute; 
  left: 0px; 
  top: 0px; 
  opacity: 0; 
  filter: alpha(opacity=0); 
	-ms-filter: "alpha(opacity=0)"; 
	-khtml-opacity: 0; 
	-moz-opacity: 0;
}

</style>
<body onload="page_load()">
<div class="b2" style="padding-left:40px;">
	<div class="wd_logo">
		<div class="wd_dev"></div>
	</div>
</div>

<div id="content" class="b1">
	<div id="main_content"></div>
	<table cellspacing="0" cellpadding="0" border="0">
		<tr>
			<td valign="top">
				<div class="overview r_content mainbody" style="border:0px solid #D2D2D2;width:850px;margin-top:180px;margin-left:200px;">
					<table border="0" cellspacing="0" cellpadding="0" height="0">
						<tr>
							<td valign="top">
								<img src="/web/images/icon/dev.png">
							</td>
							<td width="30"></td>
							<td>
								<span class="TD"></span>
							</td>
							<td>
								<div id="eula_list1" style="">
									<table cellspacing="0" cellpadding="0" border="0">
										<tr>
											<td>
												<span style="font-size:18px;font-weight:bold" class="_text" lang="eula" datafld="choose"></span>
											</td>
											<td style="padding-left: 15px;">
												<div class="select_menu" id="id_language_top_main"></div>										
											</td>
										</tr>
										<tr>
											<td COLSPAN="2" height="50">
												<table cellspacing="0" cellpadding="0" border="0">
													<tr>
														<td>
															<input type="checkbox" id="eula_agreement_chkbox" value="1" onclick="check_eula('#eula_agreement_chkbox')">
														</td>
														<td>
															<div class="_text" lang="eula" datafld="agree" style="padding-left:5px;"></div>
														</td>
													</tr>
												</table>
											</td>
										</tr>
										<tr>
											<td COLSPAN="2" height="200">												
											<button type="button" id="eula_continue_button" onclick="run();" class="gray_out"><span class="_text" lang="_button" datafld="continue"></span></button>
											</td>
										</tr>
									</table>
								</div>
								<div id="eula_list" style="display:none">
									<table cellspacing="0" cellpadding="0" border="0" width="600">
										<tr>
											<td COLSPAN="2"><span class="eulaTitle"><span class="_text" lang="eula" datafld="title">Western Digital End User License Agreement</span><br><span class="_text" lang="eula" datafld="title2" style="display:none">License Agreement</span></span>
												<br>
												<br><span class="eulaSubtext _text" lang="eula" datafld="desc"></span>

												<br>
												<br>
												<div id="eulaText">
													<iframe id="eula_iframe" src="/web/eula/en_US/HTML/WDT Generic EULA 4078-705022-A08.html"></iframe>
												</div>
											</td>
										</tr>
										<tr>
											<td height="60">
												<button type="button" id="eula_print_button" onclick="print_eula();"><span class="_text" lang="eula" datafld="print"></span></button>
												<button type="button" id="eula_cancel_button" onclick="cancel();"><span class="_text" lang="_button" datafld="Cancel"></span></button>
											</td>
											<td align="right">
												<button type="button" id="eula_accept_button" onclick="accept();"><span class="_text" lang="eula" datafld="accept"></span></button>
											</td>
										</tr>
									</table>
								</div>
							</td>
						</tr>
					</table>
				</div>
			</td>
		</tr>
	</table>
	<div id="append_diag"></div>
</div>
<iframe id="upload_frame" name="upload_frame" width="100%" height="0px" frameborder="0" scrolling="no" src="/web/setting/upload.html"></iframe>

<!-- [+] HD_HotPlug_Diag -->
<div id="HD_HotPlug_Diag" class="WDLabelDiag" style="display:none;">
	
	<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueHDDIcon"><span class="_text" lang="_disk_mgmt" datafld="title4"></span></div>
	<div align="center"><div class="hr"><hr></div></div>
	
		<div class="WDLabelBodyDialogue">
			<span class="_text" lang="_raid" datafld="msg8" id="home_hotplug_desc"></span><br>
		</div>
</div>
<?php
$c_path = $_SERVER['DOCUMENT_ROOT']."web";
require("$c_path/setting/fwDiag.html");
require("$c_path/noHDDDiag.php");

?>
</body>
</html>

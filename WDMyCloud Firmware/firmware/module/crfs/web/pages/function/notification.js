var mail_addr = new Array();
var _send_level = 1;
var MAIL_ENABLE = 0;				

function add_mail()
{
	if ($("#settings_notificationsAddMail_button").hasClass("gray_out")) return;
	$("#mail_save_li").show();

}
function mail_edit(index)
{	
	$("#settings_notificationsMail"+index+"_text").parent().show();
	$("#settings_notificationsMail"+index+"_text").show();
	hide('id_display_'+index);show('settings_notificationsSaveMail'+index+'_button');hide('settings_notificationsDelMail'+index+'_link');	
}

function mail_save(index)
{				
	if (checkmail($("#settings_notificationsMail_text").val()) == 1)
	{
		jAlert(_T('_mail','msg20'), _T('_common','error'),"",function(){
			$("#id_mail_"+index+" input[name='settings_notificationsMail_text']").focus();	
		});		
		
		return 0;			
	} 

	wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_mail_addr",mail:$("#settings_notificationsMail_text").val(),index:index},
			cache:false,
			async:true,
			success:function(){
							mail_reload();						
				}
		});										
	
	
}
function mail_del(index)
{	

	wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_mail_del",index:index},
			cache:false,
			async:true,
			success:function(){
				mail_reload();		
			}
		});
}


function open_mail_diag()
{		
	$("input:text").inputReset();		
	$(".wizard_add_email_container .resetButton").css("margin-top","13px");	
			
	var obj=$("#mail_Diag").overlay({fixed:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,
		});		
		obj.load();
		
		adjust_dialog_size("#mail_Diag",750,640);
		
    $("#mail_Diag.WDLabelDiag").css("top","-50px").css("left","110px");	
		init_button();		
		language();
	
		init_google = 0;				
		
		$( "#settings_notificationsAlert_slider" ).slider({	
			change: function( event, ui ) {
			var v = $("#settings_notificationsAlert_slider").slider('value');	                       	
			set_mail_send_type(v);									
			$("#settings_notificationsDisplay_slider").slider({value:v});			
		}
	});
	
		$("#settings_notificationsAlert_slider").slider({ value:_send_level,min:0,max:2,step:1});		

		
		$("#mail_Diag .close").click(function(){							
							$('#mail_Diag .close').unbind('click');							
							obj.close();	
							//var j = $("#settings_notificationsAlert_slider").slider('value');
						//$("#settings_notificationsDisplay_slider").slider({value:j});															
		});	
		
}

function mail_reload(google)
{
	wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_get_mail_addr"},
			cache:false,
			async:true,
			success:function(xml){
			
									mail_addr[0] = $(xml).find('mail_1').text();		
									mail_addr[1] = $(xml).find('mail_2').text();		
									mail_addr[2] = $(xml).find('mail_3').text();		
									mail_addr[3] = $(xml).find('mail_4').text();		
									mail_addr[4] = $(xml).find('mail_5').text();		
									
									str = "<ul class=\"mListDiv\">"; 
									for (var i = 0;i<5;i++)
									{
										if (mail_addr[i] == "") continue;
										str += "<li>";
										str += "<div class=\"div1\">"+mail_addr[i]+"</div>";
										str += "<div class=\"div2\"><div id=\"settings_notificationsDelMail1_link\" class=\"del\" onclick=\"mail_del("+parseInt(i+1)+");\" style=\"margin-top:13px;margin-left:70px;\" ></div></div>";
										str += "</li>"
									}	
									
									str += "<li id=\"mail_save_li\" style=\"display:none\">";
									str += "<div class=\"div1_input\"><input type=\"text\" name=\"settings_notificationsMail_text\" id=\"settings_notificationsMail_text\" placeholder='" + _T('getting_start','email') +"'></div>";
									str += "<div class=\"div2\"><button id=\"settings_notificationsSaveMail_button\" type=\"button\" onclick=\"mail_save()\">"+_T('_button','save')+"</button></div>";
									str += "</li>"										
									str += "</ul>";


									$("#id_mail_content").html(str);			
									var enable;
									if ($(".mListDiv li").length > 1)
									{
										$("#settings_notificationsTestMail_button").removeClass("gray_out");
																			
										if (MAIL_ENABLE == "0")
										{
										    set_mail_enable(1,google);
										}												
										enable = 1;
									}
									else
									{
										$("#settings_notificationsTestMail_button").addClass("gray_out");
																				
										if (MAIL_ENABLE == "1")
										{									
										    set_mail_enable(0,google);
										}
										enable = 0;
									}	
				
									if ($(".mListDiv li").length >= 6)
									{
										
										$("#settings_notificationsAddMail_button").addClass("gray_out");
									}
									else
									{
										$("#settings_notificationsAddMail_button").removeClass("gray_out");
									}	
																										
									setSwitch('#settings_notificationsAlert_switch',enable);
									if (enable == 1)
										show('settings_notificationsAlert_link');
									else
										hide('settings_notificationsAlert_link');									
			}
		});
}
function mail_load()
{
	wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_get_mail_addr"},
			cache:false,
			async:true,
			success:function(xml){
			
									mail_addr[0] = $(xml).find('mail_1').text();		
									mail_addr[1] = $(xml).find('mail_2').text();		
									mail_addr[2] = $(xml).find('mail_3').text();		
									mail_addr[3] = $(xml).find('mail_4').text();		
									mail_addr[4] = $(xml).find('mail_5').text();		
									
									str = "<ul class=\"mListDiv\">"; 
									for (var i = 0;i<5;i++)
									{
										if (mail_addr[i] == "") continue;
										str += "<li>";
										str += "<div class=\"div1\">"+mail_addr[i]+"</div>";
										str += "<div class=\"div2\"><div id=\"settings_notificationsDelMail1_link\" class=\"del\" onclick=\"mail_del("+parseInt(i+1)+");\" style=\"margin-top:13px;margin-left:70px;\" ></div></div>";
										str += "</li>"
									}	
									
									str += "<li id=\"mail_save_li\" style=\"display:none\">";
									str += "<div class=\"div1_input\"><input type=\"text\" name=\"settings_notificationsMail_text\" id=\"settings_notificationsMail_text\" placeholder='" + _T('getting_start','email') +"'></div>";
									str += "<div class=\"div2\"><button id=\"settings_notificationsSaveMail_button\" type=\"button\" onclick=\"mail_save()\">"+_T('_button','save')+"</button></div>";
									str += "</li>"										
									str += "</ul>";

									
									$("#id_mail_content").html(str);			
									if ($(".mListDiv li").length > 1)
									{
										$("#settings_notificationsTestMail_button").removeClass("gray_out");
									}
									else
									{
										$("#settings_notificationsTestMail_button").addClass("gray_out");
									}	
				
									if ($(".mListDiv li").length >= 6)
									{
										
										$("#settings_notificationsAddMail_button").addClass("gray_out");
									}
									else
									{
										$("#settings_notificationsAddMail_button").removeClass("gray_out");
									}	
								
									
									var enable =  $(xml).find('enable').text();		
									MAIL_ENABLE = enable;
									setSwitch('#settings_notificationsAlert_switch',enable);
									if (enable == 1)
										show('settings_notificationsAlert_link');
									else
										hide('settings_notificationsAlert_link');

									var level =  $(xml).find('level').text();
									var send_level = $(xml).find('send_level').text();
									$("#settings_notificationsDisplay_slider").slider({value:level});							
									_send_level = send_level;
									language();								
			}
		});
	
}



function set_mail_type(v)
{	
	wd_ajax({			 			   
		type: "POST",
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		async:true,
		data:{cmd:"cgi_mail_level",level:v},	
	   	success: function(data){
	   }
	});	
}
function set_mail_send_type(v)
{	
	wd_ajax({			 			   
		type: "POST",
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		async:true,
		data:{cmd:"cgi_mail_send_level",level:v},	
	   	success: function(data){
	   }
	});	
}

function set_mail_enable(v,google)
{
	wd_ajax({			 			   
		type: "POST",
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		async:true,
		data:{cmd:"cgi_mail_enable",enable:v},	
	   	success: function(data){
	   		if (google == 1)
	   		{	   			
	   			MAIL_ENABLE = v;
	   		        google_analytics_log('alert-email-en', v);	
	                }
	   }
	});	
}

function sent_mail_test()
{
		if ($("#settings_notificationsTestMail_button").hasClass("gray_out")) return;
		jLoading(_T('_common','set') ,'loading' ,'s',""); 
		/*
		get test mail result
		*/
		wd_ajax({			
			type: "POST",
			url: "/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_email_test"},
			async: true,
			cache: false,
			success: function(){									
				jLoadingClose();												 		        				
				}  
		});											
}
function google_notificationsDisplay()
{
	console.log("google_notificationsDisplay");
	var v = $("#settings_notificationsDisplay_slider").slider('value');
	//level: 0:critical ,1 ,2:all   	
	if (v == "0")
	{
		google_analytics_log('alert-mode-crit-warn', '0');
		google_analytics_log('alert-mode-all', '0');		
		google_analytics_log('alert-mode-crit', '1');
	}	
	else if (v == "1")
	{	
		google_analytics_log('alert-mode-all', '0');		
		google_analytics_log('alert-mode-crit', '0');
		google_analytics_log('alert-mode-crit-warn', '1');
	}	
	else if (v == "2")
	{	
		google_analytics_log('alert-mode-crit', '0');
		google_analytics_log('alert-mode-crit-warn', '0');
		google_analytics_log('alert-mode-all', '1');
	}	
}

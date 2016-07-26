
var FIX_TABLE = 5;

var SMS_URL_MAX_PARAM = 7;
var str1 = "";
var __URL = "";

var __PHONE_ARG_NAME = "";
var __TEXT_ARG_NAME = "";



function sms_clear_table()
{
	$("#id_table1 tr:eq(5)").remove();
	$("#id_table1 tr:eq(6)").remove();

	$("#id_table1 tr").each(function(index){
		if (index <FIX_TABLE) return;
		$(this).remove();
	});
}

function sms_write_select(item)
{		
	var my_html_options = "";
		my_html_options += "<div id='id_alias"+item+"_top_main' class='select_menu'>"
		my_html_options += "<ul>";
		my_html_options += "<li class='option_list'>";
		my_html_options += "<div id=\"settings_notificationsSmsParame"+item+"_select\" class=\"wd_select option_selected\">";
		my_html_options += "<div class=\"sLeft wd_select_l\"></div>";
		my_html_options += "<div class=\"sBody text wd_select_m\" id=\"id_alias"+item+"\" rel='username'>" + _T('_sms','username') + "</div>";
		my_html_options += "<div class=\"sRight wd_select_r\"></div>";
		my_html_options += "</div>";
		my_html_options += "<ul class='ul_obj' id='id_alias"+item+"_li' style='height:160px;width:250px;'><div>"
		my_html_options += "<li class=\"li_start\" rel=\"username\"  style='width:240px'><a href='#'>" + _T('_sms','username') + "</a>";		
		my_html_options += "<li rel=\"password\" style='width:240px'><a href='#'>" + _T('_sms','pw') + "</a>";
		my_html_options += "<li rel=\"phone_number\" style='width:240px'><a href='#'>" + _T('_sms','number') + "</a>";
		my_html_options += "<li rel=\"text\" style='width:240px'><a href='#'>" + _T('_sms','message') + "</a>";				
		my_html_options += "<li class=\"li_end\" rel='other' style='width:240px;'><a href='#'>" + _T('_sms','other') + "</a>";
		my_html_options += "</div></ul>";
		my_html_options += "</li>";
		my_html_options += "</ul>";
		my_html_options += "</div>";		
//		var my_html_options = "";
//		my_html_options += "<button value='username'>"+_T('_sms','username')+"</button>"
//		my_html_options += "<button value='password'>"+_T('_sms','pw')+"</button>"	
//		my_html_options += "<button value='phone_number'>"+_T('_sms','number')+"</button>"
//		my_html_options += "<button value='text'>"+_T('_sms','message')+"</button>"
//		my_html_options += "<button value='other'>"+_T('_sms','other')+"</button>"


		return my_html_options;
}

function sms_check()
{
	var check = 0;

	if (check == 1) return 1;
		
	
	if ($("#settings_notificationsSmsName_text").val() == "")
	{
			jAlert(_T('_sms','msg24'), _T('_common','error'),"",function(){
				$("#settings_notificationsSmsName_text").focus();	
			});	
			return 1;
	}
	/*
		�ˬd���L�Ѽ�
	*/
	if (name_check($("#settings_notificationsSmsName_text").val()) == 1)
	{	
		jAlert(_T('_sms','msg3'), _T('_common','error'),"",function(){
		$("#settings_notificationsSmsName_text").focus();
		});			
		return 1;
	}

	var sms_url = $('#settings_notificationsSmsUrl_text').val();
	if (sms_url.indexOf("?") == -1)
	{		
		jAlert(_T('_sms','msg4'), _T('_common','error'),"",function(){
		$("#settings_notificationsSmsUrl_text").focus();
		});			
		return 1;
		
	}
	/*
		���ΰѼ�, check �Ѽ� �O�_���T
	*/																																
	var temp = $('#settings_notificationsSmsUrl_text').val().split("?");																					
	var urlpatern1 =/^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i

	if(!urlpatern1.test(temp[0]))
	{		
		jAlert(_T('_sms','msg4'), _T('_common','error'),"",function(){
		$("#settings_notificationsSmsUrl_text").focus();	
		});			
		return 1;						
	} 
	
	__URL = temp[0];
	
	var parameter = temp[1].split("&")
	
	if (parameter.length < 2)
	{
		jAlert(_T('_sms','msg4'), _T('_common','error'),"",function(){
		$("#settings_notificationsSmsUrl_text").focus();
		});			
		return 1;
	}
	
	for (var i=0;i<parameter.length;i++)
	{
		var parameter_1= parameter[i].split("=");
		if (parameter_1.length!=2)
		{
			jAlert(_T('_sms','msg4'), _T('_common','error'),"",function(){
			$("#settings_notificationsSmsUrl_text").focus();
			});				
			return 1;
		}			
	}
	if (parameter.length > SMS_URL_MAX_PARAM)
	{		
		jAlert(_T('_sms','msg5'), _T('_common','error'),"",function(){
		$("#settings_notificationsSmsUrl_text").focus();
		});			
		return 1;
	}
	var str = ""						
	for (var i=0;i<parameter.length;i++)
	{
		var parameter_1= parameter[i].split("=");
		var t = parameter_1[0].substring(0,20)+ "<span style='display:none'>="+parameter_1[1]+"</span>";
		str+="<tr><td width='50%' height='40px' style='max-width: 350px'>"+t+"</td><td width='50%'>"+sms_write_select(i)+"</td></tr>";
		//str+="<tr><td width='50%' height='40px' style='max-width: 350px'>"+parameter_1[0].substring(0,20)+"</td><td width='50%'>"+sms_write_select(i)+"</td></tr>";
		//str+="<tr><td width='50%' height='40px' style='max-width: 350px'>"+parameter[i]+"</td><td width='50%'>"+sms_write_select(i)+"</td></tr>"													
	}

	$("#id_content tr").each(function(index){
		$(this).remove();
	});
	
	$("#id_content").append(str)				
	init_select();
	hide_select();
	
//	setTimeout(function()
//	{
//		$("#scrollbar_sms").jScrollPane();
//	},200);
	
	return 0;
}

function sms_check_alias()
{		
	var _arg_array = new Array();
	var _tag_array = new Array();
	var _content_array = new Array();
	
	var _arg_array_other = new Array();
	var _tag_array_other = new Array();
	var _content_array_other = new Array();
	
	var phone_array = new Array("","");
	var text_array = new Array("","");
	
	var other_num = 1;
	var str="";
	str1 = "";
	var each_flag = 0;

	
	$("#id_content tr").each(function(index){								
			var v = $("#id_alias"+index).attr("rel");
					
			for (j =0;j<_tag_array.length;j++)
			{			
				if (_tag_array[j] == v)
				{
					//���_��F�A					
					if (v == "username")					
						jAlert(_T('_sms','msg7'), _T('_common','error'),"",function(){$("#settings_notificationsSmsParame0_select").focus();});	
					else if (v == "password")	
						jAlert(_T('_sms','msg8'), _T('_common','error'),"",function(){$("#settings_notificationsSmsParame0_select").focus();});	
					else if (v == "phone_number")	
						jAlert(_T('_sms','msg9'), _T('_common','error'),"",function(){$("#settings_notificationsSmsParame0_select").focus();});		
					else if (v == "text")	
						jAlert(_T('_sms','msg10'), _T('_common','error'),"",function(){$("#settings_notificationsSmsParame0_select").focus();});			
					else	
						jAlert(_T('_sms','msg26'), _T('_common','error'),"",function(){$("#settings_notificationsSmsParame0_select").focus();});			
					
					each_flag = 1;
					return false;
				}
				if (phone_array[0] != ""  &&  v == "phone_number")
				{
					//���_��F�A					
					jAlert(_T('_sms','msg9'), _T('_common','error'),"",function(){
						$("#settings_notificationsSmsParame0_select").focus();
					});		
					//jAlert('The '+v+' is repetition', _T('_common','error'));	
					each_flag = 1;
					return false;
				}
				if (text_array[0] != ""  && v == "text")
				{
					//���_��F�A					
					jAlert(_T('_sms','msg10'), _T('_common','error'),"",function(){
						$("#settings_notificationsSmsParame0_select").focus();
					});				
					//jAlert('The '+v+' is repetition', _T('_common','error'));	
					each_flag = 1;
					return false;
				}
			}

			var tag = ($("#id_content tr:eq("+index+") td:eq(0)").text());			
			tag = tag+"="+"";
			var item = tag.split("=")	
			
			
			if ( v == "phone_number")		
			{
				__PHONE_ARG_NAME = item[0];							
				phone_array[0] = item[0];
				phone_array[1] = item[1];							
				
			}	
			else if (v == "text")			
			{			
				__TEXT_ARG_NAME = item[0];							
				text_array[0] = item[0];
				text_array[1] = item[1];
								
			}	
			else if (v == "other")
			{			
				_tag_array_other.push(v+other_num);
				other_num++;	
				_arg_array_other.push(item[0]);				
				_content_array_other.push(item[1]);			
			}
			else
			{	
				_tag_array.push(v);
				_arg_array.push(item[0]);	
				_content_array.push(item[1]);	
			}	
												
	});	
	
	if (each_flag == 1)
		return 1;
	

	if (phone_array[0] == "" || text_array[0] == "")
	{	
		jAlert(_T('_sms','msg6'), _T('_common','error'),"",function(){
			$("#settings_notificationsSmsParame0_select").focus();
		});		
		return 1;
	}
	_tag_array = _tag_array.concat(_tag_array_other);
	_arg_array = _arg_array.concat(_arg_array_other);
	_content_array = _content_array.concat(_content_array_other);
	
	sms_add(_tag_array.join('&'),_arg_array.join('&'),_content_array.join('&'),phone_array,text_array);
				
	return 0;
}
function sms_add(tag,arg,content,phone_array,text_array)
{		
	var phone_arg,phone_content;
	var text_arg,text_content;
		
	var sms_name = $("#settings_notificationsSmsName_text").val();
	
	phone_arg = phone_array[0];
	phone_content = phone_array[1];
	text_arg = text_array[0];
	text_content = text_array[1];
	

	var str = "";
	str= str+ tag.toString()+ "\n\n" + arg.toString() + "\n\n" + phone_array + "\n\n" + text_array + "\n\n";
	//alert(str);
//alert(tag.toString());
//alert(arg.toString() );
//alert(content.toString() );
//return;
		$.ajax({
		 type: "POST",
          async: false,
          cache: false,
          url: "/cgi-bin/system_mgr.cgi",
          data:{cmd:"cgi_sms_add",sms_name:sms_name,sms_url:__URL,phone_arg:phone_arg,phone_content:phone_content,
          	text_arg:text_arg.substring(0,64), text_content:text_content.substring(0,64),tag_data:tag.toString(),arg_data:arg.toString(),content_data:content.toString()          		
          	},              
            success: function(data){ 	            	                           
				
				sms_clear_table();
		
				$("#settings_notificationsSmsService_text").val(sms_name);
							
				$.ajax({			
						type: "GET",
						url: "/xml/sms_conf.xml",
						dataType:"xml",
						async: false,
						cache: false,
						success: function(xml){																		
							sms_get_box(xml,sms_name);							
						}  
					});		     			         			
					
           },
            error:function(xmlHttpRequest,error){}    	           
        });	
}
var _SMS_INIT_DIALOG=0;
function sms_init_dialog()
{	
	//xml_sms_load_info();
		
	if(_SMS_INIT_DIALOG==1)
		return;
	_SMS_INIT_DIALOG=1;
	
	//smsDiag_desc's button
	$("#sms_next_button_1").click(function(){	
		$("#smsDiag_desc").hide();
		$("#smsDiag_set").show();
	});
	//smsDiag_set's button
	$("#settings_notificationsSmsNext1_button").click(function(){
		if (sms_check() == 1)
			return;
		$("#smsDiag_set").hide();
		$("#smsDiag_url").show();
		ui_tab("#smsDiag","#settings_notificationsSmsParame0_select","#settings_notificationsSmsSave_button")
	});

	$("#sms_back_button_2").click(function(){		
		$("#smsDiag_set").hide();
		$("#smsDiag_desc").show();
	});
		
	$("#settings_notificationsSmsBack2_button").click(function(){		
		$("#smsDiag_url").hide();
		$("#smsDiag_set").show();
		ui_tab("#smsDiag","#settings_notificationsSmsName_text","#settings_notificationsSmsNext1_button");
	});		
	//smsDiag_url's button
	$("#settings_notificationsSmsSave_button").click(function(){
		var status = sms_check_alias();
		if (status == 1) return;			
		//if (sms_check_field() == false) return;
		sms_save(1);
		$("#smsDiag_desc").show();
		$("#smsDiag_set").hide();
		$("#smsDiag_url").hide();
		$("#scrollbar_sms_main").jScrollPane();
		ui_tab("#smsDiag","#settings_notificationsSmsService_text","#settings_notificationsSmsSetSave_button");
		
//		$("#smsDiag_url").hide();
//	  	var smsObj=parent.$("#smsDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
//		smsObj.close();
	});
		

	$("#sms_phone_button").click(function(){
		
		if (__phone_flag == 1)							
			$("#settings_notificationsSmsPhoneCountry1_text").val($("#countryCodeList").val());						
		else	
			$("#settings_notificationsSmsPhoneCountry2_text").val($("#countryCodeList").val());	
	  	var phoneObj=parent.$("#smsDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
		phoneObj.close();
		
	});
	
	$("#smsDiag .exit").click(function(){
				var smsObj=parent.$("#smsDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
				smsObj.close();
	});
}


function sms_get_station(v)
{	
			var station = v;				
		$.ajax({			
			type: "GET",
			url: "/xml/sms_conf.xml",
			dataType:"xml",
			async: false,
			cache: false,
			success: function(xml){							
				sms_clear_table();				
				sms_get_box(xml,station);				
				}
		});
	
}
function sms_check_field()
{
		var phone = 0;
		var url = $("#settings_notificationsSmsSetUrl_text").val();		
		
		if (url == "")
		{
			jAlert(_T('_sms','msg13'),_T('_common','error'),"",function(){
			$("#settings_notificationsSmsSetUrl_text").focus();
			});			
			return false;
		}
																					
		var urlpatern1 =/^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i	
		if(!urlpatern1.test(url))
		{	
			jAlert(_T('_sms','msg26'), _T('_common','error'),"",function(){
			$("#settings_notificationsSmsSetUrl_text").focus();
			});															
			return false;						
		} 
		if ( $("#settings_notificationsSmsPhone1_text").val()!= "")
		{
			if (isNaN($("#settings_notificationsSmsPhone1_text").val()) || $("#settings_notificationsSmsPhone1_text").val() < 0 || $("#settings_notificationsSmsPhone1_text").val() == "")
			{
				jAlert(_T('_sms','msg15'), _T('_common','error'),"",function(){
				$("#settings_notificationsSmsPhone1_text").focus();
				});
				return false;
			}
			phone++;	
		}

		if ( $("#settings_notificationsSmsPhone2_text").val()!= "")
			{
			if (isNaN($("#settings_notificationsSmsPhone2_text").val()) || $("#settings_notificationsSmsPhone2_text").val() < 0 || $("#settings_notificationsSmsPhone2_text").val() == "")
			{
				jAlert(_T('_sms','msg15'), _T('_common','error'),"",function(){
				$("#settings_notificationsSmsPhone2_text").focus();
				});
				return false;
			}	
			phone++;	
		}
		if (phone == 0 )
		{
			jAlert(_T('_sms','msg25'), _T('_common','error'),"",function(){				
			});
			return false;
		}
		if ($("#settings_notificationsSmsPhoneCountry1_text").val() == $("#settings_notificationsSmsPhoneCountry2_text").val() && $("#settings_notificationsSmsPhone1_text").val() == $("#settings_notificationsSmsPhone2_text").val())
		{
			jAlert(_T('_sms','msg16'), _T('_common','error'));
			return false;
		}
		
		if ($("#settings_notificationsSmsUsername_text").val() == "")
		{
			jAlert(_T('_sms','msg17'), _T('_common','error'),"",function(){
			$("#settings_notificationsSmsUsername_text").focus();
			});
			return false;
		}
		/*  //not limit any format ITR: 82516
		if (name_check4($("#settings_notificationsSmsUsername_text").val()) == 1)
		{				
			jAlert(_T('_sms','msg18'), _T('_common','error'));				
			$("#settings_notificationsSmsUsername_text").focus();
			return false;
		}
		*/
		if ($("#settings_notificationsSmsPwd_text").val() == "")
		{
			jAlert(_T('_sms','msg19'), _T('_common','error'),"",function(){
			$("#settings_notificationsSmsPwd_text").focus();
			});							
			return false;
		}		
			
		if (name_check4($("#settings_notificationsSmsPwd_text").val()) == 1)
		{
			jAlert(_T('_sms','msg20'),_T('_common','error'),"",function(){
			$("#settings_notificationsSmsPwd_text").focus();
			});			
			return false;
		}
		
		return true;		
}


function sms_get_box(xml,using_station)
{
		var str = "";
					
		$(xml).find('item').each(function(){			
			
					var item_name = $(this).attr("item_name");	
					
					if (item_name == using_station )					
					{				
								
						var item_name = $(this).attr("item_name");				
						var sms_url = $(this).find('url').text();
						var special_char = $(this).find('special_char').text();
						var country_code1 = $(this).find('country_code1').text();
						var phone_number1 = $(this).find('phone_number1').text();
						var country_code2 = $(this).find('country_code2').text();
						var phone_number2 = $(this).find('phone_number2').text();
						var phone_number_arg_name = $(this).find('phone_number1').attr('arg_name');				
																						
						var message_arg_name = $(this).find('text').attr('arg_name');																
						$("#settings_notificationsSmsSetUrl_text").val(sms_url);						
						
						if (special_char == "" || special_char == " ")							
						{
							$("#settings_notificationsSmsSpace_text").val("");
						}	
						else	
						{
							$("#settings_notificationsSmsSpace_text").val(special_char);	
							
						}	
						$("#settings_notificationsSmsPhoneCountry1_text").val(country_code1);
						$("#settings_notificationsSmsPhone1_text").val(phone_number1);												
						$("#settings_notificationsSmsPhoneCountry2_text").val(country_code2);
						$("#settings_notificationsSmsPhone2_text").val(phone_number2);												
						$("#id_text_arg_name").text(message_arg_name);
						if (phone_number_arg_name.length !=  0)
							$("#id_phone_alias1").text(phone_number_arg_name);
							
						if (	phone_number_arg_name.length != 0 )
							$("#id_phone_alias2").text(phone_number_arg_name);
															
						var username_arg_name = $(this).find("username").attr("arg_name");												
						if (username_arg_name != undefined)
						{
							var username = $(this).find('username').text();						
							str = str + "<tr><td width=187 height=35>"+_T('_admin','username')+"(<span id='id_username_arg_name'>"+ username_arg_name +"</span>)</td><td><input type='text' name='settings_notificationsSmsUsername_text' id='settings_notificationsSmsUsername_text' size='20' maxlength=256 value='"+username+"'></td></tr>"
						
						}
						
						var password_arg_name = $(this).find('password').attr('arg_name');						
						if (password_arg_name != undefined)
						{
							var password = $(this).find('password').text();
							str = str + "<tr><td width=187 height=35>"+_T('_admin','password')+"(<span id='id_pwd_arg_name'>"+ password_arg_name +"</span>)</td><td><input type='Password' name='settings_notificationsSmsPwd_text' id='settings_notificationsSmsPwd_text' size='20' maxlength=256 value='"+password+"'></td></tr>"
						}			
									
						for (i = 1;i<10;i++)
						{
							var other_name = 'other'+i							
							var other_arg_name  = $(this).find(other_name).attr('arg_name');							
							if (other_arg_name == undefined) break;
							var other  = $(this).find(other_name).text();																		
						   	str = str + "<tr><td width=187 height=35>"+_T('_sms','other')+"(<span id='id_other_arg_name"+i+"'>"+other_arg_name+"</span>)</td><td><input type='text' size='20' maxlength=256 id='settings_notificationsSmsOther"+i+"_text' name='settings_notificationsSmsOther"+i+"_text' value='"+other+"'></td></tr>"
						}						
						$("#id_table1").append(str);
						return false;						
					}									
			 }); 
}
function sms_url_arg(index,item)
{
	if (index == 1)	
		if ($("#settings_notificationsSmsPhone1_text").val() == "") return "";
	if (index == 2)	
		if ($("#settings_notificationsSmsPhone2_text").val() == "") return "";	
	
	var url_arg = new Array();
	if ($("#settings_notificationsSmsUsername_text").length != 0 )
	{		
		url_arg.push($("#id_username_arg_name").text() + "=" + $("#settings_notificationsSmsUsername_text").val())		
	}		
	if ($("#settings_notificationsSmsPwd_text").length != 0 )
	{				
		url_arg.push($("#id_pwd_arg_name").text() + "=" + $("#settings_notificationsSmsPwd_text").val())		
	}
	for (i = 1;i<10;i++)
	{
		if ($("#settings_notificationsSmsOther"+i+"_text").length == 0) break;				
		url_arg.push($("#id_other_arg_name"+i).text() + "=" + $("#settings_notificationsSmsOther"+i+"_text").val());
	}
	
	if (index == 1)	
		//url_arg.push( $("#id_phone_alias1").text().substr(1,$("#id_phone_alias1").text().length-2) + "=" + $("#settings_notificationsSmsPhoneCountry1_text").val()+$("#settings_notificationsSmsPhone1_text").val());	
		url_arg.push( $("#id_phone_alias1").text() + "=" + $("#settings_notificationsSmsPhoneCountry1_text").val()+$("#settings_notificationsSmsPhone1_text").val());	
	if (index == 2)	
	url_arg.push( $("#id_phone_alias2").text() + "=" + $("#settings_notificationsSmsPhoneCountry2_text").val()+$("#settings_notificationsSmsPhone2_text").val());		
		//url_arg.push( $("#id_phone_alias2").text().substr(1,$("#id_phone_alias2").text().length-2) + "=" + $("#settings_notificationsSmsPhoneCountry2_text").val()+$("#settings_notificationsSmsPhone2_text").val());		
		
	url_arg.push($("#id_text_arg_name").text()+"=");
		
	if (item == 1)
			return url_arg.join("&");		//for test
	else		
		return url_arg.join("&amp;");
}
function xml_sms_load_info()
{				
	
	$.ajax({
		url: "/xml/sms_conf.xml",		
		async: false,
		cache:false,
		dataType:"xml",				
		success: function(xml){		
			var using_station;	
			$(xml).find('common').each(function(){
					using_station = $(this).find('using_station').text();	
					if (using_station != "")
					{											
							$("#sms_msg").hide();										
					}		
					else
					{							
							$("#sms_msg").show();										
					}		
					var enable = $(this).find('sms_enable').text();										
					setSwitch('#settings_notificationsSms_switch',enable);					
					if (enable == 1)
						show('settings_notificationsSms_link');
					else
						hide('settings_notificationsSms_link');
			});											
		
			$(xml).find('item').each(function(){
					var item_name = $(this).attr("item_name");												
					$("#settings_notificationsSmsService_text").val(item_name);										
			});		
			
												
					
			 if (using_station == "" || using_station == "null" )
			 	using_station = $("#settings_notificationsSmsService_text").val();
			 	
			 sms_get_box(xml,using_station);
			
			 $("#settings_notificationsSmsService_text").val(using_station);
			 
			 
			 	$("input:text").inputReset();		
				$("input:password").inputReset();
			 
			},
		 error:function(xmlHttpRequest,error){   
        		//alert("Error: " +error);   
  		 }  

	});
	
}

function sms_save(v)
{
	/*
		�S��sms�A�N�������]�w
	*/
	
	var enable = v;
	var sms_name = $("#settings_notificationsSmsService_text").val();	
	var sms_url = $("#settings_notificationsSmsSetUrl_text").val();
	var spec_char = $("#settings_notificationsSmsSpace_text").val();

	
	if (spec_char.length == 0 )
	//if ($("input[name='f_spec_radio']").eq(1).prop("checked") == true)
	{
		spec_char = " ";
	}	
		
	var country_code1 = $("#settings_notificationsSmsPhoneCountry1_text").val();
	var phone_number1 = $("#settings_notificationsSmsPhone1_text").val();
	var country_code2 = $("#settings_notificationsSmsPhoneCountry2_text").val();
	var phone_number2 = $("#settings_notificationsSmsPhone2_text").val();
	var username;
	
	var data_info =  new Array();
	$("#id_table1 tr").each(function(index){
		if (index < FIX_TABLE) return;		
		data_info.push($("#id_table1 tr:eq("+index+") td:eq(1) input").val());		
	});


	var str = "";
	str+="enable = "+enable
	str+="\n name = "+ sms_name;
	str+="\n url = "+ sms_url;
	str+="\n phone = "+country_code1 + "-"+ phone_number1;
	str+="\n phone = "+country_code2 + "-"+ phone_number2;
	str+="\n data = " + data_info.join("&").toString();
	
	//alert(str);
	//return;

	$.ajax({
		 type: "POST",
          async: false,
          cache: false,
          url: "/cgi-bin/system_mgr.cgi",
          data:{cmd:"cgi_sms_modify",enable:enable,sms_name:sms_name,sms_url:sms_url,spec_char:spec_char,
          	country_code1:country_code1,phone_number1:phone_number1,country_code2:country_code2,phone_number2:phone_number2,data:data_info.join("&").toString(),url_arg1:sms_url_arg(1,0),url_arg2:sms_url_arg(2,0)   
          	},              
            success: function(data){ 	            	                           				
					$("#sms_msg").hide();	
					//jAlert(_T('_common','update_success'), _T('_common','success'));
					
						google_analytics_log('sms-en', enable);	
           },
            error:function(xmlHttpRequest,error){}    	           
        });	
}

function sms_del()
{
	var using_station = "";
	$.ajax({			
						type: "GET",
						url: "/xml/sms_conf.xml",
						dataType:"xml",
						async: false,
						cache: false,
						success: function(xml){																																										
							using_station = $(xml).find("using_station").text();
							
						}  
					});		     			         			
		
		
	$.ajax({
		 type: "POST",
          async: false,
          cache: false,
          url: "/cgi-bin/system_mgr.cgi",
          data:{cmd:"cgi_sms_del",enable:0,name:$("#settings_notificationsSmsService_text").val(),len:$("#settings_notificationsSmsService_text option").length,using_station:using_station
          	},              
            	success: function(data){ 	            	                           				
							sms_clear_table();
							get_sms();														
							$("#settings_notificationsSmsName_text").val("");
							$("#settings_notificationsSmsUrl_text").val("");
							$("#settings_notificationsSmsService_text").val("");														
							$("#smsDiag_desc").hide();
							$("#smsDiag_set").show();
							$("#smsDiag_url").hide();		
							
							ui_tab("#smsDiag","#settings_notificationsSmsName_text","#settings_notificationsSmsNext1_button");	
							
           },
            error:function(xmlHttpRequest,error){}    	           
        });	
}
function get_sms()
{
	xml_sms_load_info();
	

					$("#settings_notificationsSmsSetUrl_text").val("");
					$("#settings_notificationsSmsSpace_text").val("");
					$("#settings_notificationsSmsPhoneCountry1_text").val("");
					$("#settings_notificationsSmsPhone1_text").val("");					
					$("#settings_notificationsSmsPhoneCountry2_text").val("");
					$("#settings_notificationsSmsPhone2_text").val("");			
					$("#id_phone_alias1").text("");
					$("#id_phone_alias2").text("");												
				}
function sms_reset()
{	
	setTimeout(function(){
	$("#settings_notificationsSmsSetUrl_text").val("");	
	$("#settings_notificationsSmsSpace_text").val("");
	$("#settings_notificationsSmsPhone1_text").val("");
	$("#settings_notificationsSmsPhone2_text").val("");				
	sms_clear_table();
	$("#settings_notificationsSmsService_text option").remove();
	xml_sms_load_info();;
	},200);
}
var __phone_flag = 0;
function open_phone_list(index)
{
	if (index== 1)
		$("#countryCodeList").val($("#settings_notificationsSmsPhoneCountry1_text").val());
	else
		$("#countryCodeList").val($("#settings_notificationsSmsPhoneCountry2_text").val());	
	__phone_flag = index;	

	$("#smsDiag_desc").hide();
	$("#smsDiag_set").hide();
	$("#smsDiag_url").hide();
	$("#smsDiag_phone").show();
  	var phoneObj=parent.$("#smsDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
	phoneObj.load();
	
}

function sms_test()
{
	var buf1="",buf2="";
	var index = 0;
	if (sms_check_field() == false) return;
	if ($("#settings_notificationsSmsPhone1_text").val()!= "" )
	{
		index = 1;
		buf1 = "(send_sms -t --url \""+$("#settings_notificationsSmsSetUrl_text").val()+"\" --url_arg \""+sms_url_arg(1,1)+"\" --spec_char "+"\""+$("#settings_notificationsSmsSpace_text").val()+"\" >/dev/null ) &" ;
	}	
	if ($("#settings_notificationsSmsPhone2_text").val()!= "" )
	{
		index = index | 2;
		buf2 = "(send_sms -t --url \""+$("#settings_notificationsSmsSetUrl_text").val()+"\" --url_arg \""+sms_url_arg(2,1)+"\" --spec_char "+"\""+$("#settings_notificationsSmsSpace_text").val()+"\" >/dev/null ) &" ;
	}
		
	$.ajax({
	 	type: "POST",		
		url: "/cgi-bin/system_mgr.cgi",
		data:{cmd:"cgi_sms_test",index:index,url:$("#settings_notificationsSmsSetUrl_text").val(),
					url_arg1:sms_url_arg(1,1),url_arg2:sms_url_arg(2,1),spec_char:$("#settings_notificationsSmsSpace_text").val()
			},
		async: true,
		cache: false,      	         
        success: function(data){ 	            	                           												
					setTimeout(sms_test_result,1000); 	
       },
        error:function(xmlHttpRequest,error){}    	           
    });
}

function sms_test_result()
{
	$.ajax({
		type: "POST",
		url: "/cgi-bin/system_mgr.cgi",
		data:"cmd=cgi_sms_test_result",
		async: false,
		cache: false,
		success: function(status){						
				if (status == "1")
				{
					//var overlayObj=parent.$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
					//overlayObj.close();			
					jAlert(_T('_sms','msg22'), _T('_common','success'));													
				} 
				else if (status == "2")
				{																			
					jAlert(_T('_sms','msg23'), _T('_common','error'));
				} 
				else
				{	
					setTimeout(sms_test_result,2000);											
				}
					
		}
	});			 
}
function name_check4(str)
{	
	//for sms user name and password
	//return 1:	not a valid value
	
	// < > % & . *
	
	var re=/[<>%&.*]/;

	if(re.test(str))
	{
 		return 1;
	}
	return 0;
}
function sms_close()
{			
	if (sms_check_field() == false) return;
	sms_save(1);
	$('#smsDiag').overlay().close();	
	setSwitch('#settings_notificationsSms_switch',1);						
	show('settings_notificationsSms_link');		
}
var _INIT_BATCH_ACCOUNT_DIALOG=0;
var _INIT_IMPORT_ACCOUNT_DIALOG=0;
function init_account_batch_dialog()
{
	init_share_array();
	
	$("input:checkbox").attr("checked",false);
	$("#b_share_tab input[name='users_cifs_chkbox']").attr("checked",true);
	$("#b_share_tab input[name='users_ftp_chkbox']").attr("checked",true);
	$("#b_share_tab input[name='users_afp_chkbox']").attr("checked",true);
	
	$("#importDiag_title").html( _T('_common','batch_create'));
	
	$('#batch_set input[name=users_userNamePrefix_text]').focus();
	
	Get_User_Info();
	//alert("_TOTAL_ACCOUNT_NUM=" + _TOTAL_ACCOUNT_NUM + "\n_MAX_TOTAL_ACCOUNT" + _MAX_TOTAL_ACCOUNT)
	//check user's max number
	if(_TOTAL_ACCOUNT_NUM==_MAX_TOTAL_ACCOUNT)
	{
		jAlert(_T('_user','msg1'), _T('_common','error'));
		return;
	}
	
	var n = _MAX_TOTAL_ACCOUNT - _TOTAL_ACCOUNT_NUM;
	$("#u_number").html("( " + n +"&nbsp;" +_T('_user','max') +" )");
	
//  var batchObj=$("#batchDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
//	batchObj.load();

	//todo?
	//show_share_list("#b_share_tb");

	//write group list to table
	batch_write_group_table();
			
	$("#bDiag_set input").val("");

	//write quota field
	b_Write_Quota_Table();
		
	ui_tab("#importDiag","#users_userNamePrefix_text","#users_batchNext2_button");
	
	if(_INIT_BATCH_ACCOUNT_DIALOG==1)
		return;
		
	_INIT_BATCH_ACCOUNT_DIALOG=1;
	$("input:text").inputReset();
	$("input:password").inputReset();
		
	$("#tip_prefix").attr('title',_T('_tip','user_prefix'));
	$("#tip_account_prefix").attr('title',_T('_tip','account_prefix'));
	
	init_tooltip();
	
	language();
	
	//bDiag_set's button
    $("#users_batchNext2_button").click(function(){				
		
		var name =$("#users_userNamePrefix_text").val().toLowerCase();
		var name_obj=$("#users_userNamePrefix_text");
//可以是空的
//		if($("#users_userNamePrefix_text").val()=="")
//		{
//			jAlert( "Please enter a User Name Prefix", _T('_common','error'));
//			return;
//		}
		
		if (name.indexOf(" ") != -1) //find the blank space
	 	{
	 		//User Name Prefix must not contain spaces.
	 		jAlert(_T('_user','msg30'), _T('_common','error'));
	 		name_obj.select();
			name_obj.focus();
	 		return;
	 	}
	
		if(chk_first_char(name))	//0-9 a-z A-Z
		{
			jAlert(_T('_user','msg25'), _T('_common','error'));
			return;
		}
		
		if(chk_name_symbol(name)==1)	//account.js
		{
			//The user name format is not correct.\r\nCan not include / : ? \" < > | . ; + = ~ ' [ ] { } @ # ( ) ! ^ $ % & , ` \\
			jAlert(_T('_user','msg10'), _T('_common','error'));
	 		return;
	 	}
	
		var start = $("#users_accountPrefix_text").val();
		if(start=="")
		{
			jAlert( _T('_user','msg31'), _T('_common','error'));
			return;
		}
		if (parseInt(start,10) <= 0)
		{	
			//Not a valid value.
			jAlert(_T('_p2p','msg1'), _T('_common','error'));
			return;
		}
		if (parseInt(start,10)-start !=0)
		{
			jAlert(_T('_p2p','msg1'), _T('_common','error'));
			return;	
		}
		
		var num = $("#users_numberOfUsers_text").val()
		if(num=="")
		{
			jAlert( _T('_user','msg32'), _T('_common','error'));
			return;
		}
		if (parseInt(num,10) <= 0)
		{	
			//Not a valid value.
			jAlert(_T('_p2p','msg1'), _T('_common','error'));
			return;
		}
		if (parseInt(num,10)-num !=0)
		{
			jAlert(_T('_p2p','msg1'), _T('_common','error'));
			return;
		}
		
		var v = _MAX_TOTAL_ACCOUNT - _TOTAL_ACCOUNT_NUM;
		if(num > v)
		{
			//Create Number can't more then:
			jAlert(_T('_user','msg33') +n , _T('_common','error'));
			return;
		}
		
		var pw = $("#users_batchPW_password").val()
		if(pw=="")
		{
			jAlert(_T('_mail','msg11'), _T('_common','error'));
			return;
		}

		if(pw_check(pw)==1)
		{
			//The password must not include the following characters:  @ : / \\ % '
			jAlert(_T('_pwd','msg8'), _T('_common','error'));
			return;
		}
	
		if (pw.indexOf(" ") != -1) //find the blank space
	 	{
	 		//Password must not contain space.
	 		jAlert(_T('_pwd','msg9'), _T('_common','error'));
	 		return;
	 	}
	
		if (pw.length < 5) 
		{
			//Password must be at least 5 characters in length. Please try again
			jAlert(_T('_pwd','msg10'), _T('_common','error'));
	 		return;	
		}
		
		if (pw.length > 16)
		{
			//The password length cannot exceed 16 characters. Please try again.
			jAlert(_T('_pwd','msg11'), _T('_common','error'));
	 		return;		
		}
		
		if(pw!=$("#users_batchComfirmPW_password").val())
		{
			jAlert( _T('_wizard','msg1'), _T('_common','error'));
			return;
		}
		
		$("#bDiag_set").hide();
		$("#bDiag_group").show();
		
		init_scroll('.scroll-pane-group');
		
		$("#bDiag_group .chkbox:first").focus();
		ui_tab("#bDiag_group",".chkbox:first","#users_batchNext3_button");
	});
	
    $("#users_batchBack2_button").click(function(){	
		$("#bDiag_set").hide();
		$("#impDiag_sel_type").show();
		
		ui_tab("#importDiag","#users_createMultiUsers_button","#users_multipleNext1_button");
	});
	
	//bDiag_group's dialog
    $("#users_batchNext3_button").click(function(){				
		$("#bDiag_group").hide();
		$("#bDiag_quota").show();
		
		$("#bDiag_quota input[name='users_batchQuotaSize1_text']").focus();
		ui_tab("#bDiag_quota","#users_batchQuotaSize1_text","#users_batchNext4_button");
	});
	
    $("#users_batchBack3_button").click(function(){				
		$("#bDiag_group").hide();
		$("#bDiag_set").show();
		ui_tab("#importDiag","#users_userNamePrefix_text","#users_batchNext2_button");
	});

	//bDiag_quota's dialog
    $("#users_batchNext4_button").click(function(){
		//check quota
		//var hdd_size=_HDD_SIZE.split(",");
		var available1="null",available2="null",available3="null";
		var available4="null",available5="null",available6="null";
		var available_array = new Array($('#users_batchQuotaSize1_text'),$('#users_batchQuotaSize2_text'),$('#users_batchQuotaSize3_text'),$('#users_batchQuotaSize4_text'));
		var available_val = new Array("null","null","null","null");
		
		for(var i=0;i<parseInt(_HDD_NUM,10);i++)
		{
			if(chk_quota_value(available_array[i].val(),_HDD_SIZE[i])!=0)
				return;
			available_val[i]=available_array[i].val();
		}	
		
		if(b_Check_user_quota(available_val)==-1)
			return;

		$("#bDiag_quota").hide();
		$("#bDiag_complited").show();
		show_batch_user_list();
		
		ui_tab("#bDiag_complited","#users_batchBack5_button","#users_batchSave_button");
		//show_batch_info();
	});
	
    $("#users_batchBack4_button").click(function(){
    	$("#bDiag_quota").hide();
    	$("#bDiag_group").show();
		$("#bDiag_group .chkbox:first").focus();
		ui_tab("#bDiag_group",".chkbox:first","#users_batchNext3_button");
	});
	
	//bDiag_complited's dialog
    $("#users_batchSave_button").click(function(){				
		//$("#bDiag_complited").hide();
		create_batch_user();
		
	});
    $("#users_batchBack5_button").click(function(){
    	$("#bDiag_complited").hide();
		$("#bDiag_quota").show();

		$("#bDiag_quota input[name='users_batchQuotaSize1_text']").focus();
		ui_tab("#bDiag_quota","#users_batchQuotaSize1_text","#users_batchNext4_button");
	});
}
function batch_write_group_table()
{
	if(_ALL_GROUP=="")
	{
		$("#tip_group2").attr('title',_T('_tip','group'));
		$("#tip_group2").show();
		init_tooltip();
		document.getElementById("batch_group_list_div").innerHTML =_T('_user','none_group');	//None group.
		return;
	}
	else
		$("#tip_group2").hide();


	$("#batch_group_list_div").empty();
	
	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('uListDiv');

	var group=_ALL_GROUP.split("#");
	
	j=1;
	for(var i in group)
	{
		var li_obj = document.createElement("li"); 
		var chkbox="<input type='Checkbox' name='users_batchGroup_chkbox' value='" + group[i] + "'>"
		$(li_obj).append('<div class="chkbox" tabindex="' + j + '" onkeypress="chkboxEvent(event,this)">' + chkbox + '</div>');
		$(li_obj).append('<div class="username">' + group[i] + '</div>');
		$(ul_obj).append($(li_obj));
		j++;
	}
	
	$("#batch_group_list_div").append($(ul_obj));
	$("input:checkbox").checkboxStyle();
	
	$("#users_batchBack3_button").attr('tabindex',j);
	j++;
	$("#users_batchCancel3_button").attr('tabindex',j);
	j++;
	$("#users_batchNext3_button").attr('tabindex',j);
		
	$("#batch_group_list_div input[name='users_batchGroup_chkbox']").click(function() {
		
		if($(this).prop('checked'))
		{
			$(this).parent().parent().parent().find('.username').css("color","#0067A6");
		}
		else
		{
			$(this).parent().parent().parent().find('.username').css("color","#898989");
		}
 	});
}
function b_Select_all_group(obj)
{
	if($(obj).prop("checked"))
	{
		$("input[name='users_batchGroup_chkbox']").each(function() {
			$(this).attr("checked", true);
		});
	}
	else
	{
		$("input[name='users_batchGroup_chkbox']").each(function() {
			$(this).attr("checked", false);
		});
	}	
}
function show_batch_user_list()
{
	var _NAME = _T('_admin','username') //"Name";
	var _STATUS = _T('_module','status') //"Status";
	var _OVERWRITE = _T('_user','overwrite2')
	var _DUPLICATE = _T('_user','duplicate')	//Duplicate User Name
	var _ILLEGAL = _T('_user','illegal') //Illegal
	var _CREATE = _T('_user','create2') //New user

	var start = $("#users_accountPrefix_text").val();
	var num = $("#users_numberOfUsers_text").val();
	var name =$("#users_userNamePrefix_text").val().toLowerCase();
	var total_num = start + num;

	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('bListDiv');
		
	var name_str = start;
	for(var i=0; i < parseInt(num,10) ;i++)
	{
		var li_obj = document.createElement("li")
		
		var rel_name_str = name + name_str;
		
		name_str = increment(name_str)
		
		$(li_obj).append("<div class='icon' />" );
		
		if(chk_user_exist(rel_name_str)==1)
		{
			if($("#users_batchOverwrite_chkbox").prop("checked"))
			{
				$(li_obj).append("<div class='name'>" + rel_name_str );
				$(li_obj).append("<div class='addStatus'>" + _OVERWRITE );
			}
			else
			{
				$(li_obj).append("<div class='name'>" + rel_name_str );
				$(li_obj).append("<div class='addStatus error_color'>" + _DUPLICATE );
			}
		}
		else
		{
			if(rel_name_str.length>16 || Chk_account(rel_name_str))
			{
				$(li_obj).append("<div class='name'>" + rel_name_str );
				$(li_obj).append("<div class='addStatus error_color'>" + _ILLEGAL );
			}
			else
			{
				$(li_obj).append("<div class='name'>" + rel_name_str );
				$(li_obj).append("<div class='addStatus'>" + _CREATE );
			}
		}
		
		$(ul_obj).append($(li_obj));
	}

	$("#b_create_div").html($(ul_obj));
	init_scroll('.scroll-pane-group');
}
function show_batch_info()
{
	var _GROUP = _T('_user','group_name')//"Group";
	var _READONLY = _T('_network_access','read_only');//"Read only";
	var _READWRITE = _T('_network_access','read_write');//"Read / Write" ;
	var _DECLINE = _T('_network_access','decline');//"Deny Access :" ;
	var _APP = _T('_network_access','application_list');//"Application List :" ;
	
	var groupname = new Array();
    $("input:checkbox:checked[name='users_batchGroup_chkbox']").each(function(){  
		groupname.push($(this).val());
    });
    
	var app = new Array();
	if(share_read_list.length!=0 || share_write_list.length!=0
		|| share_decline_list.length!=0)
	{
		if($("#b_share_tab input[name='users_ftp_chkbox']").prop("checked"))
			app.push("FTP");
	}
	else
		app.push("-");
	
	var r_list = share_read_list.toString();
	var w_list = share_write_list.toString();
	var d_list = share_decline_list.toString();
	if(r_list.length<1)
		r_list = "-"

	if(w_list.length<1)
		w_list = "-"
		
	if(d_list.length<1)
		d_list = "-"
			
	var str = "<table id='b_info' width=480 style='table-layout:fixed'>";
		str += "<tr><td width='120'><b>" + _GROUP + "</b></td><td style='word-wrap : break-word; overflow:hidden;'>" + groupname.toString() + "</td></tr>";
		str += "</table>";
	document.getElementById("b_create_info").innerHTML = str;
}
function chk_user_exist(username)
{
	for(i=0;i<__USER_LIST_INFO.length;i++)
	{
		if(__USER_LIST_INFO[i].username==username && __USER_LIST_INFO[i].type=="local")
			return 1;
	}
	
	return 0;
}
function b_Write_Quota_Table()
{
	//show user's quota to webpage

	var MB = " MB" ;
	var s = "&nbsp;"+_T('_quota','quota_amount');
	var text_obj1='<input type="text" name="users_batchQuotaSize1_text" id="users_batchQuotaSize1_text" class="input_x2" + value="">';
	var text_obj2='<input type="text" name="users_batchQuotaSize2_text" id="users_batchQuotaSize2_text" class="input_x2" + value="">';
	var text_obj3='<input type="text" name="users_batchQuotaSize3_text" id="users_batchQuotaSize3_text" class="input_x2" + value="">';
	var text_obj4='<input type="text" name="users_batchQuotaSize4_text" id="users_batchQuotaSize4_text" class="input_x2" + value="">';
	
	var data1="<tr id='b_q1'><td class='tdfield'>" + _VOLUME_NAME[0] + s + "</td><td width='90' class='tdfield_padding'>" + text_obj1 + "</td>"+ "<td class='tdfield_padding'><div id='users_v1Unit_select' class='select_menu'>" +batch_user_show_unit("1") + "</div></td></tr>" ;
	var data2="<tr id='b_q2'><td class='tdfield'>" + _VOLUME_NAME[1] + s + "</td><td width='90' class='tdfield_padding'>" + text_obj2 + "</td>"+ "<td class='tdfield_padding'><div id='users_v2Unit_select' class='select_menu'>" +batch_user_show_unit("2") + "</div></td></tr>";
	var data3="<tr id='b_q3'><td class='tdfield'>" + _VOLUME_NAME[2] + s + "</td><td width='90' class='tdfield_padding'>" + text_obj3 + "</td>"+ "<td class='tdfield_padding'><div id='users_v3Unit_select' class='select_menu'>" +batch_user_show_unit("3") + "</div></td></tr>" ;
	var data4="<tr id='b_q4'><td class='tdfield'>" + _VOLUME_NAME[3] + s + "</td><td width='90' class='tdfield_padding'>" + text_obj4 + "</td>"+ "<td class='tdfield_padding'><div id='users_v4Unit_select' class='select_menu'>" +batch_user_show_unit("4") + "</div></td></tr>" ;
	var data_array = new Array(data1,data2,data3,data4);
	
	$('#b_quota_tb').append("<tr><td></td></tr>");

	$('#b_q1').remove();$('#b_q2').remove();
	$('#b_q3').remove();$('#b_q4').remove();
	$('#b_q5').remove();$('#b_q6').remove();
	
	if( parseInt(_HDD_NUM,10) ==0)
	{
		var str = _T('_user','no_hdd');//None Hard Drives.
		$('#b_quota_tb').html("<tr><td></td></tr><tr><td>" + str + "</td></tr>");
	}
	else
	{
		for(var i=0;i< parseInt(_HDD_NUM,10) ;i++)
			$('#b_quota_tb').append(data_array[i]);
	}
	
	$("input:text").inputReset();
	init_select();
}
function import_check_group_quota(q_list,ok_user,final_quota_list)
{		
	var quota_error=0;
	
	if(ok_user.length==0)
	{
		for(var x in q_list)
		{
			final_quota_list.push(q_list[x])
		}
		return quota_error;
	}
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_addgroup_get_group_quota_minsize" , name:ok_user.toString(),type:"local"},
		cache: false,
		dataType: "xml",
		async: false,
		success: function(xml){		
			$(xml).find('quota_info').each(function(){
				var minsize=$(this).find('min_size').text() ;
				var tmp_minsize=minsize.split(":");
				
				for(var x in q_list)
				{
					if(q_list[x]!=0 && q_list[x].indexOf("color") == -1)
					{
						var m_size=parseInt(tmp_minsize[x],10)/1024 ;
						if(parseInt(q_list[x],10) < m_size && tmp_minsize[x]!=0)
						{
							quota_error=1;
							//final_quota_list.push("<font color='#FF0000'>" + q_list[x] + "</font>");
							final_quota_list.push(q_list[x]);
							//The user quota amount cannot larger than the group quota amount.
						}
						else
							final_quota_list.push(q_list[x]);
					}
					else
					{
						if(q_list[x].indexOf("color") != -1) quota_error=1;
						final_quota_list.push(q_list[x]);
					}
				}
			});
		}
		,
		error:function(xmlHttpRequest,error){   
			//alert("cgi_adduser_get_user_quota_maxsize->Error: " +error);   
		}
	});
	
	return quota_error;
}
function import_check_user_quota(q_list,ok_group,final_quota_list)
{		
	var quota_error=0;
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_adduser_get_user_quota_maxsize" ,name:ok_group[0]},
		cache: false,
		dataType: "xml",
		async: false,
		success: function(xml){		
				var maxsize=$(this).find('quota_info > max_size').text() ;
				var tmp_maxsize=maxsize.split(":");
				
				for(var x in q_list)
				{
					if(q_list[x]!=0 && q_list[x].indexOf("color") == -1)
					{
						var m_size=parseInt(tmp_maxsize[x],10)/1024 ;
						if(parseInt(q_list[x],10)>m_size && tmp_maxsize[x]!=0)
						{
							quota_error=1;
							//final_quota_list.push("<font color='#FF0000'>" + q_list[x] + "</font>");
							final_quota_list.push(q_list[x]);
							//The user quota amount cannot larger than the group quota amount.
						}
						else
							final_quota_list.push(q_list[x]);
					}
					else
					{
						if(q_list[x].indexOf("color") != -1) quota_error=1;
						final_quota_list.push(q_list[x]);
					}
				}				
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("cgi_adduser_get_user_quota_maxsize->Error: " +error);   
  		 }
	});
	
	return quota_error;
}
function b_Check_user_quota(available_val)
{
	var maxsize;
	var str;
	var g_name = new Array();
	var MB = " MB" ;
	var CHECK_QUOTA_FLAG=0;
	var num=0;
	
    $("input:checkbox:checked[name='users_batchGroup_chkbox']").each(function(i){
		g_name.push($(this).val());
		num++;
    });
    
	if(num==0)
	{
		return CHECK_QUOTA_FLAG;
	}
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_adduser_get_user_quota_maxsize" ,name:g_name[0]},
		cache: false,
		dataType: "xml",
		async: false,
		success: function(xml){		
			$(xml).find('quota_info').each(function(){
				maxsize=$(this).find('max_size').text() ;
				var tmp_maxsize=maxsize.split(":");
				
				for(var i=i;i<tmp_maxsize.length;i++)
				{
					var available= available_val[i];
					if(available!="null" && available!=0)
					{
						var m_size=parseInt(tmp_maxsize[i],10)/1024 ;
						if(parseInt(available,10)>m_size && tmp_maxsize[i]!=0)
						{
							//str="The user quota amount cannot larger than the group quota amount." 
							str = _T('_quota','msg1');
							str = str + "(" + m_size  + MB + ")" ;
							jAlert(str, _T('_common','error'));
							CHECK_QUOTA_FLAG=-1;
						}
					}
				}						
			});
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("cgi_adduser_get_user_quota_maxsize->Error: " +error);   
  		 }
	});
	
	return CHECK_QUOTA_FLAG;  
}
function create_batch_user()
{
	var errors = $(".bListDiv li div.addStatus.error_color").length;
	var allItems = $(".bListDiv li div.addStatus").length;
	
	if(errors == allItems)
	{
		$("#bDiag_complited").hide();
		$("#users_batchBack3_button").click();
		jAlert(_T('_user','msg36'), _T('_common','error')); //Import user error.
		return;
	}

	//quota
	
	var available = new Array("","","","");
	for (var i=0 ;i < _HDD_NUM ;i++)
	{
		var idx = i+1;
		var qsize = $("#b_quota_tb input[name='users_batchQuotaSize" + idx +"_text']").val();
		if(qsize=="") qsize=0;
		available[i] = qsize;
		
		var unit_x = $("#b_quota_unit_" + idx).attr("rel");
		var unit = 0;
		switch(unit_x)
		{
			case 'GB':
				unit=1024;
				break;
			case 'MB':
				unit=1;
				break;
			case 'TB':
				unit=1024*1024;
				break;
			default:
				unit=1;
				break;
		}
		
		available[i] = available[i]*unit;
	}
	
	var q1=available[0];
	var q2=available[1];
	var q3=available[2];
	var q4=available[3];
	
	var quota=[0,0,0,0];
	switch(parseInt(_HDD_NUM,10))
	{
		case	1:
				quota=[q1,0,0,0];
				break;
		case	2:
				quota=[q1,q2,0,0];
				break;
		case	3:
				quota=[q1,q2,q3,0];
				break;
		case	4:
				quota=[q1,q2,q3,q4];	
				break;
	}

	var quota_list = quota.toString().replace(/,/g,':');
	//group
	var groupname = new Array();
	var group_list = "";
    $("input:checkbox:checked[name='users_batchGroup_chkbox']").each(function(){  
		groupname.push($(this).val());
    });
    
    group_list = groupname.toString().replace(/,/g,':');
    
    //apply to
	var app = "samba,afp";	//1:smb	2:afp 4:ftp 8:nfs 16:webdav (smb,afp default open)
	if(share_read_list.length!=0 || share_write_list.length!=0
		|| share_decline_list.length!=0)
	{
		if($("#b_share_tab input[name='users_ftp_chkbox']").prop("checked"))
			app +=",ftp"
	}
	else
		app="";
    
    //share 
    var r_list = share_read_list.toString().replace(/,/g,':');
    var w_list = share_write_list.toString().replace(/,/g,':');
    var d_list = share_decline_list.toString().replace(/,/g,':');

	var overwrite=0;
	if($("#users_batchOverwrite_chkbox").prop("checked"))
		overwrite=1;
		    
	var s = "f_prefix=" + $("#users_userNamePrefix_text").val() +"\nf_start=" + $("#users_accountPrefix_text").val() + "\nf_number=" + $("#users_numberOfUsers_text").val()
		s+= "\nf_batch_pw="  + $("#users_batchPW_password").val() +"\nquota=" + quota_list
		s+= "\nr=" + r_list + "\nw=" + w_list
		s+= "\nd=" + d_list + "\ngroup=" + group_list
		s+= "\napp=" + app + "\noverwrite=" + overwrite
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	var start = parseInt($("#users_accountPrefix_text").val(),10);
	var num = parseInt($("#users_numberOfUsers_text").val(),10);

	setTimeout(function(){stop_web_timeout(true);}, 1000);
	
	//alert(s)
	 wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
        data: { cmd:"cgi_user_batch_create" ,f_prefix:$("#users_userNamePrefix_text").val().toLowerCase(),
        		f_start:start,f_number:num,
        		f_batch_pw:$("#users_batchPW_password").val(),r_list:r_list,w_list:w_list,
        		d_list:d_list,group_list:group_list,app:app,quota:quota_list,
        		f_overwrite:overwrite},
		success: function(data){

				do_query_create_status("bUser",function(s){
						if(s==0)
						{
						restart_web_timeout();
							jLoadingClose();
							$("#bDiag_complited").hide();
							$("#users_batchBack3_button").click();
							jAlert(_T('_user','msg36'), _T('_common','error')); //Import user error.
						}
						else if(s==1)
						{
						restart_web_timeout();
							Get_User_Info();
							_DIALOG.close();
							jLoadingClose();
							
				   			_SEL_USER_INDEX = 0;
							$('.LightningSubMenu li').each(function() {
								$(this).removeClass('LightningSubMenuOn');
					    	});
					    	
					    	Get_SMB_Info(function(){
						   		get_account_xml('Loading',function(){
								currentIndex=1;
					   			get_user_list(AllUserList[0].username);
								scrollDivTop_User('SubMenuDiv');
					   		});
				   		
							if($(".userMenuList li").length >6)
							{
								$(".ButtonArrowTop").addClass('gray_out');
								$(".ButtonArrowBottom").removeClass('gray_out');
							}
					    	});
						}
				});
		}
	});
}
function do_query_create_status(ftype,callback)
{
	var create_status ="";
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_create_status&ftype=" + ftype,	
		dataType: "xml",
		success: function(xml){
			create_status = $(xml).find('status').text();
			if(create_status==-1)
			{
				setTimeout(function(){
					do_query_create_status(ftype,callback);
				},5000);
			}
			else
			{
				if(callback) callback(create_status);
			}
		}
		,
		 error:function(xmlHttpRequest,error){   
  		 }
	});
	
}
var gFlag=0,uFlag=0;
function init_import_group_dialog()
{
	var create_status = api_do_query_create_status2("iGroup");
	if(create_status==-1)
	{
		jAlert(_T('_user','msg46'), 'warning2');
		return;
	}
		
	$("#file_name_group").empty();
	$("#iGroupDiag_sel_file").show();
	$("#iGroupDiag_apply_to").hide();
	$("#iGroupDiag_complited").hide();
	$("#iGroupDiag_title").html(_T('_user','import_group'));
	$("#users_impGroupsFile_text").val("");

	Get_Group_Info('#g_quota_tb','#user_list_div');

	if(_TOTAL_GROUP_NUM==_MAX_TOTAL_GROUP)
	{
		jAlert(_T('_user','msg13'), _T('_common','error'));
		return;
	}
	
	$("input:checkbox").attr("checked",false);
	
	$("#imp_group_share_tab input[name='users_cifs_chkbox']").attr("checked",true);
	$("#imp_group_share_tab input[name='users_ftp_chkbox']").attr("checked",true);
	$("#imp_group_share_tab input[name='users_afp_chkbox']").attr("checked",true);
	
  	var importObj=$("#iGroupDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
	importObj.load();
	_DIALOG = importObj;	
	
	$("input:checkbox").checkboxStyle();
	language();

	//iGroupDiag_sel_file's dialog
	$("#users_impGroupNext1_button").unbind("click");
    $("#users_impGroupNext1_button").click(function(){
		import_r_list = new Array();
		import_w_list = new Array();
		import_d_list = new Array();
		import_name = new Array();
		import_user = new Array();
	   	import_quota = new Array();
	   	ok_group = new Array();
		if (_SelFile == 0)
		{
			//jAlert("Please choice file.",_T('_common','error'));		
			jAlert( _T('_wfs','msg6'), _T('_common','error'));			
			return;
		}
		$("#iGroupDiag_sel_file").hide();
		$("#iGroupDiag_complited").show();
		get_share_info();
    	import_group_ajaxFileUpload();
    	gFlag=1;
	});
	
	/*iGroupDiag_apply_to's dialog
	$("#users_impGroupNext2_button").unbind("click");
    $("#users_impGroupNext2_button").click(function(){
    	$("#iGroupDiag_apply_to").hide();
    	$("#iGroupDiag_complited").show();
		//Get_User_Info();	//users.js
		get_share_info();
    	import_group_ajaxFileUpload();
	});

	$("#users_impGroupBack2_button").unbind("click");
    $("#users_impGroupBack2_button").click(function(){
    	$("#iGroupDiag_apply_to").hide();
    	$("#iGroupDiag_sel_file").show();
	});*/
		
	//iGroupDiag_complited's dialog
	$("#users_impGroupSave_button").unbind("click");
    $("#users_impGroupSave_button").click(function(){
    	if(_ALL_FAIL!=0)
    	{
    		jAlert( _T('_user','msg37') , _T('_common','error'),"",g_backTo); //The import file format is not correct. Please try again.
    		return;
    	}
    	create_import_group();
	});
	
	$("#users_impGroupBack3_button").unbind("click");
    $("#users_impGroupBack3_button").click(function(){
		$("#iGroupDiag_complited").hide();
		$("#iGroupDiag_sel_file").show();
	});			
}
var _VOLUME_NAME = new Array("","","","");
function init_import_user_dialog()
{
	var create_status = api_do_query_create_status2("iUser");
	if(create_status==-1)
	{
		jAlert(_T('_user','msg45'), 'warning2');
		return;
	}
		
	import_r_list = new Array();
	import_w_list = new Array();
	import_d_list = new Array();
	import_name = new Array();
	import_group = new Array();
	import_quota = new Array();
	SetCreateType('#f_type','1',"");
	
	//$("#impDiag_desc").show();
	$("#file_name").empty();
	$("#impDiag_sel_type").show();
	$("#impDiag_sel_file").hide();
	$("#impDiag_apply_to").hide();
	$("#impDiag_complited").hide();
	$("#bDiag_set").hide();
	$("#bDiag_group").hide();
	$("#bDiag_quota").hide();
	$("#bDiag_complited").hide();
	
	$("#importDiag_title").html(_T('_common','batch_create'));
	
	$("input:checkbox").attr("checked",false);
	$("#imp_share_tab input[name='users_cifs_chkbox']").attr("checked",true);
	$("#imp_share_tab input[name='users_ftp_chkbox']").attr("checked",true);
	$("#imp_share_tab input[name='users_afp_chkbox']").attr("checked",true);
	$("#users_impUsersFile_text").val("");
	_SelFile=0;
	
	//alert("_TOTAL_ACCOUNT_NUM=" + _TOTAL_ACCOUNT_NUM + "\n_MAX_TOTAL_ACCOUNT" + _MAX_TOTAL_ACCOUNT)
	//check user's max number
	if(_TOTAL_ACCOUNT_NUM >= _MAX_TOTAL_ACCOUNT)
	{
		jAlert(_T('_user','msg1'), _T('_common','error'));
		return;
	}

  	var importObj=$("#importDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
	importObj.load();
	_DIALOG = importObj;
	
	ui_tab("#importDiag","#users_createMultiUsers_button","#users_multipleNext1_button");
		
	if(_INIT_IMPORT_ACCOUNT_DIALOG==1)
		return;
		
	_INIT_IMPORT_ACCOUNT_DIALOG=1;
	
	$("input:checkbox").checkboxStyle();
	init_button();
	language();
		
	//impDiag_sel_type's dialog
    $("#users_multipleNext1_button").click(function(){
		$("#impDiag_sel_type").hide();
		$("#users_impUsersFile_text").val("");
		$("#file_name").empty();
		_SelFile=0;
		
		var c_type = $("#f_type").attr("rel");

		if(c_type==1)	//Create Multiple Users
		{
			$("#bDiag_set").show();
			init_account_batch_dialog();
		}
		else
		{
			//Import Users
			$("#impDiag_sel_file").show();
		}
	});
	
	//impDiag_sel_file's dialog
    $("#users_impNext1_button").click(function(){
		import_r_list = new Array();
		import_w_list = new Array();
		import_d_list = new Array();
		import_name = new Array();
		import_group = new Array();
	   	import_quota = new Array();
		if (_SelFile==0)
		{
			//jAlert("Please choice file.",_T('_common','error'));		
			jAlert( _T('_wfs','msg6'), _T('_common','error'));			
			return;
		}
		$("#impDiag_sel_file").hide();
    	$("#impDiag_complited").show();
		Get_User_Info();	//users.js
		get_share_info();
    	import_ajaxFileUpload();
    	uFlag=1;
	});

    $("#users_impBack1_button").click(function(){
		$("#impDiag_sel_file").hide();
		$("#impDiag_sel_type").show();
		ui_tab("#importDiag","#users_createMultiUsers_button","#users_multipleNext1_button");
	});
	
//	//impDiag_apply_to's dialog
//    $("#users_impNext2_button").click(function(){
//    	$("#impDiag_apply_to").hide();
//    	$("#impDiag_complited").show();
//		Get_User_Info();	//users.js
//		get_share_info();
//    	import_ajaxFileUpload();
//	});

//    $("#users_impBack2_button").click(function(){
//		$("#impDiag_apply_to").hide();
//		$("#impDiag_sel_file").show();
//	});
		
    $("#users_impClose_button").click(function(){
		$("#impDiag_detail").hide();
		$("#impDiag_complited").show();
	});
	
	//impDiag_complited's dialog
    $("#users_impSave_button").click(function(){
    	if(_ALL_FAIL!=0)
    	{
    		jAlert( _T('_user','msg37') , _T('_common','error'),"",backTo); //The import file format is not correct. Please try again.
    		return;
    	}
    	create_import_user();
	});
	
    $("#users_impBack3_button").click(function(){
		$("#impDiag_complited").hide();
		$("#impDiag_sel_file").show();
	});
}
function u_uploadCallback()
{
	show_import_users_table();
}
function g_uploadCallback()
{
	show_import_groups_table();
}

function import_ajaxFileUpload()
{	
	$("#import_table").empty();
    if(window.attachEvent){
        document.getElementById("upload_target").attachEvent('onload', u_uploadCallback);
    }
    else{
        document.getElementById("upload_target").addEventListener('load', u_uploadCallback, false);
    }
        	
	$("#form_import").submit();
}
function import_group_ajaxFileUpload()
{	
	$("#import_group_table").empty();
    if(window.attachEvent){
        document.getElementById("upload_target_group").attachEvent('onload', g_uploadCallback);
    }
    else{
        document.getElementById("upload_target_group").addEventListener('load', g_uploadCallback, false);
    }
        	
	$("#form_import_group").submit();
}

var import_r_list = new Array();
var import_w_list = new Array();
var import_d_list = new Array();
var import_name = new Array();
var import_group = new Array();
var import_quota = new Array();
var import_user = new Array();
var ok_group = new Array();
var _ALL_FAIL=0;
function show_import_groups_table()
{
	import_name = new Array();
	_ALL_FAIL=0;
	
	$("#iGroupDiag_complited .SpinnerSun").show();
	
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_import_groups",	
		dataType: "xml",
		success: function(xml){
			show_group_info(xml);
			init_scroll('.scroll-pane-group');
		}
		,
		error:function(xmlHttpRequest,error){   
			if(gFlag==1)
			{
				jAlert( _T('_user','msg37') , _T('_common','error'),"",g_backTo); //The import file format is not correct. Please try again.
				gFlag=0;
			}
			
			api_remove_file('g');
		}  
	});
	
	function show_group_info(xml)
	{
		if($(xml).find('status').text()=="ng")
		{
			return;
		}
		
		var ul_obj = document.createElement("ul"); 
		$(ul_obj).addClass('iListDiv');		            
		var ok_user= new Array();          
		var total_num=0,error_num=0;
		var chk_flag=0;
		var name_exist=0;
		var total=0;
		$(xml).find('item').each(function(index){	
			var s = $(this).text();
			var name_error = 0,user_error=0,quota_error=0;
			
			if(s.indexOf("/")==-1) chk_flag++;
			
			s = s.split("/");
			var num = s.length;
			var tmp=$(this).text();
			var error_flag=0;
			for(var i=0;i<6-num;i++)
			{
				tmp+="/";
				error_flag=1;
			}
			
			s=tmp.split("/");

			var li_obj = document.createElement("li"); 
			var li_data_name = "",li_data_pw="",li_data_quota="";
			for(var i =0;i<s.length;i++)
			{
				if(i==2 || i==3 || i==4)	//read,write,deny list
				{
					if(s[i].length==0)
					{
						if(i==2)
							import_w_list.push("-");
						else if(i==3)
							import_r_list.push("-");
						else
							import_d_list.push("-");
						continue;
					}
					
					var share = s[i].split(":");
					var share_error=1;
					var s_list = new Array();

					for(var x in share)
					{
						share_error=1;
						for(var y in __NAME)
						{
							if(share[x]==__NAME[y])
							{
								share_error=0;
								break;
							}
						}
						
						if(share_error)
						{
							//s_list.push("<font color='#FF0000'>" + share[x] + "</font>")
							s_list.push(share[x]);
						}
						else
						{
							s_list.push(share[x]);
						}
					}
					if(i==2)
						import_w_list.push(s_list.toString());
					else if(i==3)
						import_r_list.push(s_list.toString());
					else
						import_d_list.push(s_list.toString());
				}
				if(i==0)	//name
				{
					name_error = 0;
					if(s[i].length==0)
						name_error=1;
					else
					{
						var chk_status = checkGroup(s[i]);
						
						if(chk_status==0)//This account does not accepted . Please try again.
							name_error=1;
						else if(chk_status==1 && !$("#users_impGroupOverwrite_chkbox").prop("checked"))//The user name entered already exists. Please select a different user name.
						{
							name_exist++;
							name_error=1;
						}

						if(name_check(s[i]))//This user name does not accepted . Please try again.
							name_error=1;
							
						if (s[i].indexOf(" ") != -1) //find the blank space
							name_error=1;

						if (s[i].length >16)
							name_error=1;

						if(chk_first_char(s[i]))//The user name must begin with a-z,A-Z,0-9
							name_error=1;

						if(chk_group_symbol("",s[i])==1)	//The user name format is not correct.Can not include / : ? " < > | . ; + = ~ ' [ ] { } @ # ( ) ! ^ $ % & , ` \
							name_error=1;
					}
					if(name_error)
					{
						if(s[i].length==0)
						{
							//import_name.push("<font color='#FF0000'>-</font>")
							import_name.push("-");
						}
						else
						{
							//import_name.push("<font color='#FF0000'>" +s[i] +"</font>")
							import_name.push(s[i]);
						}
							
						li_data_name += "<span class='error_color'>" +s[i] +"</span>";
					}
					else
					{
						import_name.push(s[i])
						li_data_name += s[i];
						total++;
					}
				}
				else if(i==1)	//username
				{
					if(s[i].length==0)
					{
						import_user.push("-");
						ok_group.push("");
						continue;
					}
						
					user_error=0;
					//chk gorup
				 	var alluser=_ALL_ACCOUNT.split("#");
				 	var u_list = new Array();
				 	var flag=0;
				 	var g = s[i].split(":");
				 	for(var k=0;k<g.length;k++)
				 	{
				 		flag=0;
				 		for(var j=0;j<alluser.length;j++)
				 		{
				 			if(g[k]==alluser[j])
				 			{
				 				flag=1;
				 				break;
				 			}
				 		}
				 		
				 		if(flag)	//username已存在
				 		{
				 			u_list.push(g[k]);
				 			ok_user.push(g[k]);
				 		}
				 		else
				 		{
				 			var tmp=g[k];
				 			if(g[k].indexOf(" ")!=-1)
				 				tmp = _T('_user','illegal');

				 				u_list.push("<span class='error_color'>" + tmp + "</span>");
				 			user_error=1;
				 		}
				 	}
				 	import_user.push(u_list.toString());
 					//先拿掉 info += "<td>" +g_list.toString() +"</td>"
				}
				else if(i==5)	//quota
				{
					quota_error=0;
					if(s[i].length==0)
					{
						//info +="<td><font color='#FF0000'>" + _T('_user','illegal') + "</font></td>";
						li_data_quota += "<span class='error_color'>" +  _T('_user','illegal') + "</span>";
						quota_error=1;
						continue;
					}
					var q_list = new Array();
					if(_HDD_NUM==0)
					{
						li_data_quota += "<span class='error_color'>" + s[i] + "</span>";
					}
					else
					{
						var quota= s[i].split(":");
						
						for(var j=0;j<parseInt(_HDD_NUM,10);j++)
						{
							var qVal="-";
							if(quota[j])
							{
								qVal = quota[j];
							}
							
							if(chk_import_quota_value(quota[j],_HDD_SIZE[j])!=0)
							{
								//q_list.push("<font color='#FF0000'>" + qVal + "</font>");
								q_list.push(qVal);
							}
							else
								q_list.push(qVal);
						}
						
						//todo:check quota
						var final_quota_list = new Array();
						
						//fish mark+ no need to check quota size, "quota_set" will check this
						//quota_error = import_check_group_quota(q_list,ok_user,final_quota_list);
						for(var x in q_list)
						{
							final_quota_list.push(q_list[x]);
						}
						
						li_data_quota += final_quota_list.toString();
					}
				}
			}
			
			import_quota.push(li_data_quota);
			var icon="";
			if(user_error==1 || quota_error==1)
			{
				icon = '<a class="warning" href="#"></a>';
			}
			else
			{
				icon = '<a class="ok" href="#"></a>';
			}
			
			if(name_error==1 || error_flag==1 )
			{
				error_num++;
				icon = '<a class="ng" href="#"></a>';
			}
			
			$(li_obj).append('<div class="icon">' + icon + '</div>');
			$(li_obj).append('<div class="uname overflow_hidden_nowrap_ellipsis">' + li_data_name + '</div>');
			$(li_obj).append('<div class="pw">' + li_data_pw + '</div>');
			$(li_obj).append('<div class="data">' + '<a id="users_impGInfo' + index + '_link" class="info_icon" href="javascript:show_import_group_detail(' + index + ')">' +  '</a></div>');
			
			$(ul_obj).append($(li_obj));
			
			total_num++;
		});
		if(total_num==chk_flag)
		{
			_ALL_FAIL=1;
			jAlert( _T('_user','msg37') , _T('_common','error'),"",g_backTo); //The import file format is not correct. Please try again.
			return;
		}
		else if(name_exist==total_num)
		{
			_ALL_FAIL=2;
			jAlert( _T('_user','msg42') , _T('_common','error'),"",g_backTo);
			return;
		}
		else if(error_num==total_num)
		{
			_ALL_FAIL=3;
			jAlert( _T('_user','msg37'), _T('_common','error'),"",g_backTo); //The import file format is not correct. Please try again.
			return;
		}

		$("#iGroupDiag_complited .SpinnerSun").hide();
		
		if(total >_MAX_TOTAL_GROUP-_TOTAL_GROUP_NUM)
		{
			if(gFlag==1)
			{
			jAlert(_T('_user','msg13'), _T('_common','error'));
			$("#users_impGroupBack3_button").click();
				$("#file_name_group").empty();
				$("#users_impGroupsFile_text").val("");
				gFlag=0;
			}
			return;
		}
		
		$("#import_group_table").append( $(ul_obj) )
	}
}
function show_import_users_table()
{	
	import_name = new Array();
	_ALL_FAIL=0;
	
	$("#impDiag_complited .SpinnerSun").show();
	
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_import_uesrs",	
		dataType: "xml",
		success: function(xml){
			show_info(xml);
			init_scroll('.scroll-pane-group');
		}
		,
		error:function(xmlHttpRequest,error){   
			if(uFlag==1)
			{
				jAlert( _T('_user','msg37') , _T('_common','error'),"",backTo); //The import file format is not correct. Please try again.
				uFlag=0;
			}
			
			api_remove_file('u');
		}  
	});
	
	function show_info(xml)
	{
		if($(xml).find('status').text()=="ng")
		{
			return;
		}
		
		var ul_obj = document.createElement("ul"); 
		$(ul_obj).addClass('iListDiv');		            
		var ok_group= new Array();          
		var total_num=0,error_num=0;
		var chk_flag=0;
		var name_exist=0;
		var total=0;
		
		$(xml).find('item').each(function(index){	
			var s = $(this).text();
			var name_error = 0, pw_error = 0,group_error=0,quota_error=0;
			
			if(s.indexOf("/")==-1) chk_flag++;
			
			s = s.split("/");
			var num = s.length;
			var tmp=$(this).text();
			var error_flag=0;
			for(var i=0;i<7-num;i++)
			{
				tmp+="/";
				error_flag=1;
			}
			
			s=tmp.split("/");

			var li_obj = document.createElement("li"); 
			var li_data_name = "",li_data_pw="",li_data_quota="";
			for(var i =0;i<s.length;i++)
			{
				if(i==3 || i==4 || i==5)	//read,write,deny list
				{
					if(s[i].length==0)
					{
						if(i==3)
							import_w_list.push("-");
						else if(i==4)
							import_r_list.push("-");
						else
							import_d_list.push("-");
						continue;
					}
					
					var share = s[i].split(":");
					var share_error=1;
					var s_list = new Array();

					for(var x in share)
					{
						share_error=1;
						for(var y in __NAME)
						{
							if(share[x]==__NAME[y])
							{
								share_error=0;
								break;
							}
						}
						
						if(share_error)
						{
							//s_list.push("<font color='#FF0000'>" + share[x] + "</font>");
							s_list.push(share[x]);
						}
						else
						{
							s_list.push(share[x]);
						}
					}
					if(i==3)
						import_w_list.push(s_list.toString());
					else if(i==4)
						import_r_list.push(s_list.toString());
					else
						import_d_list.push(s_list.toString());
				}
				if(i==0)	//name
				{
					name_error = 0;
					if(s[i].length==0)
						name_error=1;
					else
					{
						var local_account ="";
						for(j in AllUserList)
						{
							if(AllUserList[j].type=="local")
							{
								local_account +="#" + AllUserList[j].username;
							}
						}
						
						local_account = local_account.slice(1,local_account.length);

						var chk_status = checkID(s[i],local_account);
						
						if(chk_status==0)//This account does not accepted . Please try again.
							name_error=1;
						else if(chk_status==1 && !$("#users_impOverwrite_chkbox").prop("checked"))//The user name entered already exists. Please select a different user name.
						{
							name_exist++;
							name_error=1;
						}

						if(Chk_account(s[i]))//This user name does not accepted . Please try again.
							name_error=1;
							
						if (s[i].indexOf(" ") != -1) //find the blank space
							name_error=1;

						if (s[i].length >16)
							name_error=1;

						if(chk_first_char(s[i]))//The user name must begin with a-z,A-Z,0-9
							name_error=1;

						if(chk_name_symbol(s[i])==1)	//The user name format is not correct.Can not include / : ? " < > | . ; + = ~ ' [ ] { } @ # ( ) ! ^ $ % & , ` \
							name_error=1;
					}
					if(name_error)
					{
						if(s[i].length==0)
						{
							//import_name.push("<font color='#FF0000'>-</font>")
							import_name.push("-");
						}
						else
						{
							//import_name.push("<font color='#FF0000'>" +s[i] +"</font>")
							import_name.push(s[i]);
						}
							
						li_data_name += "<span class='error_color'>" +s[i] +"</span>";
					}
					else
					{
						import_name.push(s[i])
						li_data_name += s[i];
						
						total++;
					}
				}
				else if(i==1)	//pw
				{
					pw_error = 0;
					
					if( s[i] == "" )
						pw_error = 1;
						
					if(pw_check(s[i])==1)	//The password must not include the following characters:  @ : / \\ % '
						pw_error = 1;

					if (s[i].indexOf(" ") != -1) //find the blank space
						pw_error = 1;
						
				 	if (s[i].length < 5 || s[i].length > 16) 
						pw_error = 1;
						
					if(pw_error)
					{
						li_data_pw += "<span class='error_color'>" +s[i] +"</span>"
					}
					else					
					{
						li_data_pw += s[i];
					}
						
					
				}
				else if(i==2)	//group 
				{
					if(s[i].length==0)
					{
						import_group.push("-");
						ok_group.push("");
						continue;
					}
						
					group_error=0;
					//chk gorup
				 	var group=_ALL_GROUP.split("#");
				 	var g_list = new Array();
				 	var flag=0;
				 	var g = s[i].split(":");
				 	for(var k=0;k<g.length;k++)
				 	{
				 		flag=0;
				 		for(var j=0;j<group.length;j++)
				 		{
				 			if(g[k]==group[j])
				 			{
				 				flag=1;
				 				break;
				 			}
				 		}
				 		
				 		if(flag)	//gorup已存在
				 		{
				 			g_list.push(g[k]);
				 			ok_group.push(g[k]);
				 		}
				 		else
				 		{
				 			var tmp=g[k];
				 			if(g[k].indexOf(" ")!=-1)
				 				tmp = _T('_user','illegal');

				 				g_list.push("<span class='error_color'>" + tmp + "</span>");
				 			group_error=1;
				 		}
				 	}
				 	import_group.push(g_list.toString());
 					//先拿掉 info += "<td>" +g_list.toString() +"</td>"
				}
				else if(i==6)	//quota
				{
					quota_error=0;
					if(s[i].length==0)
					{
						//info +="<td><font color='#FF0000'>" + _T('_user','illegal') + "</font></td>";
						li_data_quota += "<span class='error_color'>" +  _T('_user','illegal') + "</span>";
						quota_error=1;
						continue;
					}
					var q_list = new Array();
					
					if(_HDD_NUM==0)
					{
						li_data_quota += "<span class='error_color'>" + s[i] + "</span>";
					}
					else
					{
						
						var quota= s[i].split(":");
						
						for(var j=0;j<parseInt(_HDD_NUM,10);j++)
						{
							var qVal="-";
							if(quota[j])
							{
								qVal = quota[j];
							}
							if(chk_import_quota_value(quota[j],_HDD_SIZE[j])!=0)
							{
								//q_list.push("<font color='#FF0000'>" + qVal + "</font>");
								q_list.push(qVal);
							}
							else
								q_list.push(qVal);
						}
						
						//todo:check quota
						var final_quota_list = new Array();
						
						quota_error = import_check_user_quota(q_list,ok_group,final_quota_list);
						
						li_data_quota += final_quota_list.toString();
					}
				}
			}
			
			import_quota.push(li_data_quota);
			var icon="";
			if(group_error==1 || quota_error==1)
			{
				icon = '<a class="warning" href="#"></a>';
			}
			else
			{
				icon = '<a class="ok" href="#"></a>';
			}
			
			if(name_error==1 || pw_error==1 || error_flag==1 )
			{
				error_num++;
				icon = '<a class="ng" href="#"></a>';
			}
			
			$(li_obj).append('<div class="icon">' + icon + '</div>');
			$(li_obj).append('<div class="uname overflow_hidden_nowrap_ellipsis">' + li_data_name + '</div>');
			$(li_obj).append('<div class="pw">' + li_data_pw + '</div>');
			//$(li_obj).append('<div class="quota overflow_hidden_nowrap_ellipsis">' + li_data_quota + '</div>');
			$(li_obj).append('<div class="data">' + '<a id="users_impUInfo' + index + '_link" class="info_icon" href="javascript:show_import_detail(' + index + ')">' +  '</a></div>');
			
			
			$(ul_obj).append($(li_obj));
			
			total_num++;
		});
		if(total_num==chk_flag)
		{
			_ALL_FAIL=1;
			jAlert( _T('_user','msg37') , _T('_common','error'),"",backTo); //The import file format is not correct. Please try again.
			return;
		}
		else if(name_exist==total_num)
		{
			_ALL_FAIL=2;
			jAlert( _T('_user','msg42') , _T('_common','error'),"",backTo);
			return;
		}
		else if(error_num==total_num)
		{
			_ALL_FAIL=3;
			jAlert( _T('_user','msg37'), _T('_common','error'),"",backTo); //The import file format is not correct. Please try again.
			return;
		}

		$("#impDiag_complited .SpinnerSun").hide();
		var aTotal = api_get_local_user_count('users');
		
		if(total >_MAX_TOTAL_ACCOUNT-aTotal)
		{
				if(uFlag==1)
				{
			jAlert(_T('_user','msg1'), _T('_common','error'));
			$("#users_impBack3_button").click();
					uFlag=0;
				}
			return;
		}
		
		$("#import_table").append( $(ul_obj) )
	}
}
function chk_import_quota_value(quota,hdd_max_size)
{
	var re=/[.]/;
	if(re.test(quota))
	{
		//The Quota Amount not a positive integer, Please try again.
		return 1;
	}
		
	if (isNaN(quota) || quota < 0)
	{
		//The Quota Amount is invalid. Please enter a valid number.
		return 2;
	}
	
	if( parseInt(quota,10) >  parseInt(hdd_max_size,10))
	{
		//This number is higher than the maximum capacity of the hard drives.\nPlease enter a real number or leave the setting at unlimited.
		return 3;
	}
	
	return 0;
	
}
function show_import_group_detail(index)
{
	$("#iGroupDiag_complited").hide();
	$("#iGroupDiag_detail").show();
	//$("#import_group_Detail_Diag_title").html(_T('_p2p','detail'));  
	
	$("#users_impGroupClose_button").click(function(){
		$("#iGroupDiag_detail").hide();
		$("#iGroupDiag_complited").show();
	});
		
	var _NAME = _T('_user','group_name')//"Group";
	var _USER = _T('_admin','username') //"Name";
	var _READONLY = _T('_network_access','read_only');//"Read only";
	var _READWRITE = _T('_network_access','read_write');//"Read / Write" ;
	var _DECLINE = _T('_network_access','decline');//"Deny Access :" ;
	var _QUOTA = _T('_menu','quota');
	//var _APP = _T('_network_access','application_list');//"Application List :" ;
    	
	var str = "<table id='import_detail' width=480 style='table-layout:fixed'>";
		str += "<tr><td width='120'>" + _NAME + "</td><td>" +import_name[index] +"</td></tr>";
		str += "<tr><td width='120'>" + _USER + "</td><td style='word-wrap : break-word; overflow:hidden;'>" + import_user[index] + "</td></tr>";
		str += "<tr><td width='120'>" + _READONLY + "</td><td style='word-wrap : break-word; overflow:hidden;'>" + import_r_list[index] + "</td></tr>";
		str += "<tr><td width='120'>" + _READWRITE + "</td><td style='word-wrap : break-word; overflow:hidden;'>" + import_w_list[index] + "</td></tr>";
		str += "<tr><td width='120'>" + _DECLINE + "</td><td style='word-wrap : break-word; overflow:hidden;'>" + import_d_list[index] + "</td></tr>";
		str += "<tr><td width='120'>" + _QUOTA + "</td><td style='word-wrap : break-word; overflow:hidden;'>" + import_quota[index] + "</td></tr>";
		
		str += "</table>";

	document.getElementById("import_group_info").innerHTML = str;
}
function show_import_detail(index)
{
	
	$("#impDiag_complited").hide();
	$("#impDiag_detail").show();
	$("#import_Detail_Diag_title").html(_T('_p2p','detail'));  
	
	$("#detail_exit").click(function(){
		$("#impDiag_detail").hide();
		$("#impDiag_complited").show();
	});
		
	var _NAME = _T('_admin','username') //"Name";
	var _GROUP = _T('_user','group_name')//"Group";
	var _READONLY = _T('_network_access','read_only');//"Read only";
	var _READWRITE = _T('_network_access','read_write');//"Read / Write" ;
	var _DECLINE = _T('_network_access','decline');//"Deny Access :" ;
	var _QUOTA = _T('_menu','quota');
	//var _APP = _T('_network_access','application_list');//"Application List :" ;
    	
	var str = "<table id='import_detail' width=480 style='table-layout:fixed'>";
		str += "<tr><td width='120'>" + _NAME + "</td><td>" +import_name[index] +"</td></tr>";
		str += "<tr><td width='120'>" + _GROUP + "</td><td style='word-wrap : break-word; overflow:hidden;'>" + import_group[index] + "</td></tr>";
		str += "<tr><td width='120'>" + _READONLY + "</td><td style='word-wrap : break-word; overflow:hidden;'>" + import_r_list[index] + "</td></tr>";
		str += "<tr><td width='120'>" + _READWRITE + "</td><td style='word-wrap : break-word; overflow:hidden;'>" + import_w_list[index] + "</td></tr>";
		str += "<tr><td width='120'>" + _DECLINE + "</td><td style='word-wrap : break-word; overflow:hidden;'>" + import_d_list[index] + "</td></tr>";
		str += "<tr><td width='120'>" + _QUOTA + "</td><td style='word-wrap : break-word; overflow:hidden;'>" + import_quota[index] + "</td></tr>";
		
		str += "</table>";

	document.getElementById("import_info").innerHTML = str;
}
function create_import_group()
{
   //apply to
	var app = "samba,afp";	//1:smb	2:afp 4:ftp 8:nfs 16:webdav (smb,afp default open)
	if($("#imp_group_share_tab input[name='users_ftp_chkbox']").prop("checked"))
		app +=",ftp"

	var overwrite=0;
	if($("#users_impGroupOverwrite_chkbox").prop("checked")) overwrite=1;
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	setTimeout(function(){stop_web_timeout(true);}, 1000);
	
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
        data: { cmd:"cgi_create_import_groups",app:app,overwrite:overwrite},
		success: function(data){
			
			do_query_create_status("iGroup",function(s){
					if(s==0)	//0:ng  1:ok
					{
						restart_web_timeout();
						jLoadingClose();
						jAlert(_T('_user','msg44'), _T('_common','error'),"",g_backTo); //Import group error
					}
					else if(s==1)
					{
						restart_web_timeout();
						get_group_list("","");
						_DIALOG.close();
						jLoadingClose();
						
						if($(".groupMenuList li").length >6)
						{
							currentIndex = Math.ceil($(".groupMenuList li").length/moveItem);
							$(".ButtonArrowTop").removeClass('gray_out');
							$(".ButtonArrowBottom").addClass('gray_out');
							scrollDivBottom_User('SubMenuDiv');
						}
					}
			});
		}
	});
}
function create_import_user()
{
    //apply to
	var app = "samba,afp";	//1:smb	2:afp 4:ftp 8:nfs 16:webdav (smb,afp default open)
	if($("#imp_share_tab input[name='users_ftp_chkbox']").prop("checked"))
		app +=",ftp"

	var overwrite=0;
	if($("#users_impOverwrite_chkbox").prop("checked")) overwrite=1;
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	setTimeout(function(){stop_web_timeout(true);}, 1000);
	
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
        data: { cmd:"cgi_create_import_users",app:app,overwrite:overwrite},
		success: function(data){
			
			do_query_create_status("iUser",function(s){
					if(s==0)	//0:ng  1:ok
					{
						restart_web_timeout();
						jLoadingClose();
						jAlert(_T('_user','msg36'), _T('_common','error'),"",backTo); //Import user error
					}
					else if(s==1)
					{
						restart_web_timeout();
						Get_User_Info();
						_DIALOG.close();
						jLoadingClose();
						
			   			_SEL_USER_INDEX = 0;
						$('.LightningSubMenu li').each(function() {
							$(this).removeClass('LightningSubMenuOn');
				    	});			   		
				    	Get_SMB_Info(function(){
					   		get_account_xml('Loading',function(){
							currentIndex=1;
				   			get_user_list(AllUserList[0].username);
							scrollDivTop_User('SubMenuDiv');
				   		});
			   		
						if($(".userMenuList li").length >6)
						{
							$(".ButtonArrowTop").addClass('gray_out');
							$(".ButtonArrowBottom").removeClass('gray_out');
						}
				    	});
					}
			});
		}
	});
}
function backTo()
{
	$("#impDiag_sel_type").hide();
	$("#impDiag_sel_file").show();
	$("#impDiag_apply_to").hide();
	$("#impDiag_complited").hide();
	$("#bDiag_set").hide();
	$("#bDiag_group").hide();
	$("#bDiag_quota").hide();
	$("#bDiag_complited").hide();
	$("#users_impUsersFile_text").val("");
	$("#file_name").empty();
}
function g_backTo()
{
	$("#iGroupDiag_sel_file").show();
	$("#iGroupDiag_apply_to").hide();
	$("#iGroupDiag_complited").hide();
	$("#users_impGroupsFile_text").val("");
	$("#file_name_group").empty();	
}
function set_start_number(v)
{
	return;
	//alert(v + "\nl=" + v.length)
	
	var len = v.length;
	var s = "( " + (16-len) + " )";
	$("#s_number").html(s);
	var num_max="";
	switch (16 - len)
	{
		case 1:
			num_max = 9;
			break;
		case 2:
			num_max = 99;
			break;
		case 3:
			num_max = 999;
			break;
		case 4:
			num_max = 9999;
			break;
		default:
			num_max = 99999;
			break;	
	}
	$("#u_number").html("( " + num_max + " )")
}
function chk_start_number(v)
{
	return;
	var n="";
	n = $("#users_userNamePrefix_text").val() + v;
	
	var n_length = $("#users_userNamePrefix_text").val().length;
	
	alert("n=" + n + "\nlen="+n.length + "\nv=" + v)
	if(n.length>16)
	{
		//alert(">16")
	}
}
function download_sample()
{
	document.form_download.submit();
}

function download_group_sample()
{
	document.form_group_download.submit();
}

/**
 * Increment a decimal by 1
 *
 * @param {String} n The decimal string
 * @return The incremented value
 */
function increment(n) {
    var lastChar = parseInt(n.charAt(n.length - 1)),
        firstPart = n.substr(0, n.length - 1);

    return lastChar < 9
        ? firstPart + (lastChar + 1)
        : firstPart
            ? increment(firstPart) + "0"
            : "10";
}
var _SelFile=0;
function show_filename()
{
	_SelFile=0;
	$("#file_name").empty();
	var filename = $("#users_impUsersFile_text").val();
	if(filename.length==0) return;
	filename = filename.split("\\");
	filename = filename[filename.length-1];
	$("#file_name").html( _T('_common','filename') +" : "+ filename );
	_SelFile=1;
}
function show_filename_group()
{
	_SelFile=0
	$("#file_name").empty();
	var filename = $("#users_impGroupsFile_text").val();
	if(filename.length==0) return;
	filename = filename.split("\\");
	filename = filename[filename.length-1];
	$("#file_name_group").html( _T('_common','filename') +" : "+ filename );
	_SelFile=1;
}

var __PATH = new Array();
var __NAME = new Array();
function get_share_info()
{
	__PATH = new Array();
	__NAME = new Array();
	wd_ajax({
			type: "POST",
		url: "/xml/smb.xml",
			dataType: "xml",	
			async:false,
			cache:false,
			success: function(xml){			
			$(xml).find('samba > item').each(function(){
					var name = $(this).find('name').text();
					var path = $(this).find('path').text();
					
					__NAME.push(name);
					__PATH.push(path);
				 }); 
				},
			 error:function(xmlHttpRequest,error){   
	  		 } 
	});	
}

function SetCreateType(obj,val,ftype)
{	
	$(obj).attr('rel',val);	//init rel value
	$( obj + " > button").each(function(index){
		if($(this).val()==val) 
			$(this).addClass('buttonSel');
		else
			$(this).removeClass('buttonSel');
	});
	
	$( obj + " > button").unbind("click");
	$( obj + " > button").click(function(index){
		$($(obj+ " > button").removeClass('buttonSel'))
			
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
	});
	
	$(obj).show();
}

function batch_user_show_unit(hdd_num)
{
	var _UNIT=["TB","GB","MB"];
	var val="GB";
	var option = "";
		option += '<ul style="margin-left:10px">';
		option += '<li class="option_list">';       
		option += '<div id="b_quota_unit_main_' + hdd_num + '" class="wd_select option_selected">';
		option += '<div class="sLeft wd_select_l"></div>';
		option += '<div class="sBody text wd_select_m" id="b_quota_unit_'+ hdd_num + '" rel="' + val + '">'+ val +'</div>';
		option += '<div class="sRight wd_select_r"></div>';
		option += '</div>';						
		option += '<ul class="ul_obj"><div>';
		
		for(var i=0;i<=2;i++)
		{
			option += '<li rel="'+ _UNIT[i] + '" style="width:120px;"> <a href="#">' + _UNIT[i]+ '</a></li>';
		}
		option += '</div></ul>';
		option += '</li>';
		option += '</ul>';
		
	return option;
}

function api_remove_file(type)
{
	wd_ajax({
		type: "GET",
		cache: false,
		url: "/web/php/users.php",
		data:"cmd=rmImportUserFile&type=" + type,
		dataType: "xml",
		success: function(xml){
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		 } 
	});
	
}

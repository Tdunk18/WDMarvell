var __ISO_PATH = new Array();
var __ISO_NAME = new Array();
var __ISO_SMB_SHARE_NAME = new Array();

var _ISO_MAX_TOTAL_SHARE = 10;
var iso_error_flag=0;
var _MAKE_ISO_LIST=0;
var _ISO_INDEX = 0;

var SHARE_NEW = 0;
var SHARE_MODIFY = 1;
var SHARE_ISO_IMG_NEW = 2;
var __com = SHARE_NEW;

var user_read_list = new Array();
var user_write_list = new Array();
var user_decline_list = new Array();

var group_read_list = new Array();
var group_write_list = new Array();
var group_decline_list = new Array();

var __ISO_SHARE_LIST_INFO= new Array();
var _ISO_TOTAL=0;
var __SERVICE_INFO = new Array();
function get_iso_list()
{
	//get_Name_Mapping_Hame("HDD"); //for translate_path_to_display();
	var list_obj = "#iso_list";
	$(list_obj).empty();
	
	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('ListDiv');
	
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/isomount_mgr.cgi",
		data: "cmd=cgi_get_iso_share&page=1&rp=100",	
		dataType: "xml",
		success: function(xml){
			var total = $(xml).find('total').text();
			_ISO_TOTAL = total;
			__SERVICE_INFO.ftp = $(xml).find('ftp').text();
			__SERVICE_INFO.nfs = $(xml).find('nfs_server').text();
			__SERVICE_INFO.media = $(xml).find('media_serving').text();
			__SERVICE_INFO.webdav = $(xml).find('webdav_server').text();
			__SERVICE_INFO.itunes = $(xml).find('itunes').text();
			
			$("#iso_list_info").hide();
			if(total==0)
			{
				$("#iso_list_info").show();
				return;
			}
			var s_detail = _T("_module", "desc2");
			var s_edit = _T("_common", "modify");
			var s_del = _T("_common", "del");
			$(xml).find('row').each(function(index){
				var s_name = $(this).find('cell').eq(0).text();
				var path = $(this).find('cell').eq(1).text();

				var li_obj = document.createElement("li"); 
				
				$(li_obj).append('<div class="icon"></div>');
				$(li_obj).append('<div class="iso_sname" id="settings_utilitiesISOName' + index + '_value">' + s_name + '</div>');
				$(li_obj).append('<a class="detail tip" rel="" title="' + s_detail +'" id="settings_utilitiesISODetail' + index + '_link" href="javascript:iso_detail(\'' + index + '\')"></a>');
				$(li_obj).append('<a class="sedit tip" rel="" title="' + s_edit +'" id="settings_utilitiesISOEdit' + index + '_link" href="javascript:iso_edit(\'' + index + '\')"></a>');
				$(li_obj).append('<a class="sdel tip" rel="" title="' + s_del +'" id="settings_utilitiesISODel' + index + '_link" href="javascript:iso_del(\'' + index + '\')"></a>');
				
				$(ul_obj).append($(li_obj));

				
				var new_sname = s_name.replace(/&nbsp;/g,' ');
				new_sname = new_sname.replace(/&amp;/g,'&');
				new_sname = new_sname.replace(/&apos/g,'\'');
				
				var new_path = path.replace(/&nbsp;/g,' ');
				new_path = new_path.replace(/&amp;/g,'&');
				new_path = new_path.replace(/&apos/g,'\'');
				
				__ISO_SHARE_LIST_INFO[index] = new Array();
				__ISO_SHARE_LIST_INFO[index].sharename = new_sname;
				__ISO_SHARE_LIST_INFO[index].path = new_path;
			});
			
			$(list_obj).append($(ul_obj));

			init_tooltip('.tip');
			
		},
		error:function(xmlHttpRequest,error){
			//alert("Error: " +error);
		}
	});
}
function get_iso_share_info()
{
	__ISO_PATH = new Array();
	__ISO_NAME = new Array();
	
	wd_ajax({
			type: "POST",
			url: "/cgi-bin/isomount_mgr.cgi",
			data: "cmd=cgi_get_all_iso_share",	
			dataType: "xml",	
			async:false,   
			cache:false,
			success: function(xml){			
				$(xml).find('share').each(function(){
					var name = $(this).find('name').text();
					var path = $(this).find('path').text();
					
					__ISO_NAME.push(name);
					__ISO_PATH.push(path);
				 }); 
				},
			 error:function(xmlHttpRequest,error){   
	  		 } 
	});	
}
function get_smb_share_info()
{
	__ISO_SMB_SHARE_NAME = new Array();
	wd_ajax({
			type: "POST",
		url: "/xml/smb.xml",
			dataType: "xml",	
			async:false,
			cache:false,
			success: function(xml){			
			$(xml).find('samba > item').each(function(){
					var name = $(this).find('name').text();
					__ISO_SMB_SHARE_NAME.push(name); 
				 }); 
				},
			 error:function(xmlHttpRequest,error){   
	  		 } 
	});	
}

function init_iso_share_dialog()
{	
	//tooltip
	var public = _T('_tip','public');
	var host_str = _T('_tip','host');
	var nfs_str = _T('_tip','nfs');
	var webdav_str = _T('_tip','webdav');
	$("#tip_public").attr('title',public);
	$("#tip_host2").attr('title',host_str);
		
	var _ftpTip = "";
	if(__SERVICE_INFO.ftp=="1")
		_ftpTip = _T('_tip','ftp_enable') 
	else
		_ftpTip = _T('_tip','ftp_disable')
	$("#tip_ftp2").attr('title',_ftpTip);

	var _nfsTip = "";
	if(__SERVICE_INFO.nfs=="1")
		_nfsTip = nfs_str; 
	else
		_nfsTip = _T('_tip','nfs_disable')
	$("#tip_nfs").attr('title',_nfsTip);

	var _webdavTip = "";
	if(__SERVICE_INFO.webdav=="1")
		_webdavTip = webdav_str; 
	else
		_webdavTip = _T('_tip','webdav_disable')
	$("#tip_webdav").attr('title',_webdavTip);
			
	init_tooltip();	
	
	$("#isoDiag_title").html(_T('_iso_mount','add_iso_share'));
	
	//iDiag_tree's button
	$("#settings_utilitiesISOShareNext_button").unbind("click");
	$("#settings_utilitiesISOShareNext_button").click(function(){
		_MAKE_ISO_LIST=0;
		if (__com == SHARE_NEW)
		{
			var test = $("#iso_tree_container input:checkbox:checked[name=folder_name]").length;
			if(!test)
			{
				//Please select one item.
				jAlert( _T('_user','msg2'), _T('_common','error'));
				return -1;
			}
		}
		
		iso_error_flag=0;
		document.getElementById("iso_note").innerHTML = "";
				
		make_iso_share_list();
		
		$("#iDiag_tree").hide();
		$("#iDiag_share_list").show();
		
		if($("#iso_table input[name='settings_utilitiesISOShareName_text']").hasClass("share_error"))
		{
			ui_tab("#isoDiag","#settings_utilitiesISOShareName_text","#settings_utilitiesISOShareNext1_button");
		}
		else
		{
		ui_tab("#isoDiag","#settings_utilitiesISOShareDesc_text","#settings_utilitiesISOShareNext1_button");
		}
	});

	//iDiag_apply_to's button
	$("#settings_utilitiesISOShareNext2_button").unbind("click");
	$("#settings_utilitiesISOShareNext2_button").click(function(){
		
		var public = getSwitch('#settings_utilitiesISOSharePublic_switch');
		if(NFS_FUNCTION==0)
		{
			if(public==0)
			{
				$("#iDiag_apply_to").hide();
				$("#iDiag_access").show();
				init_scroll('.iso_user_scroll');
			}
			else
			{
				apply_iso_share();
			}
			return;
		}

		$("#iDiag_apply_to").hide();
		$("#iDiag_apply_to2").show();
		
		var publicFlag = getSwitch('#settings_utilitiesISOSharePublic_switch');
		
		if(publicFlag==1 || __com == SHARE_NEW)
		{
			$("#settings_utilitiesISOShareNext3_button").hide();
			$("#settings_utilitiesISOShareSave_button").show();
		}
		else
		{
			$("#settings_utilitiesISOShareNext3_button").html(_T('_button','Next'));
			$("#settings_utilitiesISOShareNext3_button").show();
			$("#settings_utilitiesISOShareSave_button").hide();
		}
	});
	
	$("#settings_utilitiesISOShareBack2_button").unbind("click");
	$("#settings_utilitiesISOShareBack2_button").click(function(){
		
		$("#iDiag_share_list").show();
		$("#iDiag_apply_to").hide();
	});

	//iDiag_apply_to2's button
	$("#settings_utilitiesISOShareBack3_button").unbind("click");
	$("#settings_utilitiesISOShareBack3_button").click(function(){
		$("#iDiag_apply_to2").hide();
		$("#iDiag_apply_to").show();
	});
	
	$("#settings_utilitiesISOShareNext3_button").unbind("click");
	$("#settings_utilitiesISOShareNext3_button").click(function(){
		$("#iDiag_apply_to2").hide();
		$("#iDiag_access").show();
		init_scroll('.iso_user_scroll');
	});
	
	//iDiag_access's button
	$("#settings_utilitiesISOShareBack4_button").unbind("click");
	$("#settings_utilitiesISOShareBack4_button").click(function(){
		
		$("#iDiag_access").hide();
		if(NFS_FUNCTION==1 || MODEL_NAME=="GLCR" || MODEL_NAME =="BAGX")
		{
		$("#iDiag_apply_to2").show();
		}
		else
		{
			$("#iDiag_apply_to").show();
		}
	});	
	
	
	//iDiag_share_list's button
	$("#settings_utilitiesISOShareNext1_button").unbind("click");
	$("#settings_utilitiesISOShareNext1_button").click(function(){
		
		var v = $("#iso_note").html().length;
		
		if(v!=0)
		{
			$("#iso_table input[name='settings_utilitiesISOShareName_text']").focus();
			return;
		}
		
		var s_comment = $("#iso_table input[name='settings_utilitiesISOShareDesc_text']").val();
		if(check_iso_desc(s_comment)!=0)
		{
			$("#popup_ok_button").click( function (){
				$("#popup_ok_button").unbind("click");
				$("#iso_table input[name='settings_utilitiesISOShareDesc_text']").focus();
			});
			return;
		}
		$("#iDiag_share_list").hide();
		if(NFS_FUNCTION==0)
		{
			var public = getSwitch('#settings_utilitiesISOSharePublic_switch');
			if(__com == SHARE_MODIFY && public==0)
			{
				$("#settings_utilitiesISOShareNext2_button span").html(_T('_button','Next'));
			}
			else
			{
				$("#settings_utilitiesISOShareNext2_button span").html(_T('_button','save'));
			}
		}
		
		$("#iDiag_apply_to").show();
		ui_tab("#isoDiag","#iDiag_apply_to .checkbox_container:first","#settings_utilitiesISOShareNext2_button");
	});
	
	$("#settings_utilitiesISOShareBack1_button").unbind("click");
	$("#settings_utilitiesISOShareBack1_button").click(function(){
		$("#iDiag_share_list").hide();
		$("#iDiag_tree").show();
	});
}
var _OverlayObj="";
function apply_iso_share()
{	
	
	if (__com == SHARE_NEW || __com == SHARE_ISO_IMG_NEW)
		do_add_iso_share();
	else
		do_modify_iso_share();
}
function make_iso_share_list()
{
	
	//$("#iso_table").html( iso_list() )
	iso_list();
	
	if (iso_error_flag == 1)
        document.getElementById("iso_note").innerHTML = _T('_common','warning')+":"+_T('_network_access','msg1');
	else if(iso_error_flag==2)
		document.getElementById("iso_note").innerHTML = _T('_common','warning')+":"+_T('_network_access','msg19');
	else if(iso_error_flag==3)
		document.getElementById("iso_note").innerHTML = _T('_common','warning')+":"+_T('_network_access','msg20');
	else
		document.getElementById("iso_note").innerHTML = "";
		
	$("input:text").inputReset();
	$("#iso_table input[name='settings_utilitiesISOShareName_text']").focus();
}
//new add function
function iso_list_img_create()
{
	var index = "NULL";
	var sharename;
	var	path;
	var _share = new Array();
	var str = "";
	iso_error_flag =0;
  
  
 	var flag = 0;  
  	var sharename = $("#f_image_name").val();
  	var path;
  	var t = $("#f_image_path").val()+"/"+sharename+".iso"

		var str = "";
		var hdd_num=HDD_INFO_ARRAY.length;
			
		for(i=0;i<hdd_num;i++)
		{
			var hdd_info=HDD_INFO_ARRAY[i].split(":");
			
			if(t.indexOf(hdd_info[0])!=-1)
			{
				var str=t;
				str=str.split(hdd_info[0]);
				path=hdd_info[1] + str[1];						
			}												
		}
		str = "";
	path=path.replace(/&nbsp;/g,' ');     
    path=path.replace(/&amp;/g,'&');   
 

		var tmp1=sharename.lastIndexOf(".")
		if(tmp1!=-1)
			sharename=sharename.substring(0,tmp1);
			
		var s_name = sharename;		
		//var sharename_text = $(this).attr('src'); //為了處理空白字元而定屬性。
		var class_name="";

		flag = iso_share_exist(path,s_name);  	//1、比較已經設過的share name	
		
		if (s_name.length > 80) flag = 2;

	  	//check share name 
	  	//INVALID_SHARENAME_CHARS  %<>*?|/\+=;:", 和最後一個字元是$
	  	if(flag==1)
	  	{
      		var v = Chk_Samba_Share_Name(s_name)
      		if(v==1)
      		{
      			flag=3;
      			iso_error_flag = 2;
      		}
      		else if(v==2)
	  		{
	  			flag=3;
	  			iso_error_flag=3;
	  		}
	  	}
      	else
      		iso_error_flag =1;

		if (flag != 2)
        {
			for (var i=0;i<_share.length;i++)
       	 	{
				if (_share[i] == sharename)		//2、比較user選的checkbox的share name
					flag = 2
        	} 
      	}

		if(flag == 1) //沒有設過此路徑為share，share name以default
      	{
			class_name=" class='share_ok'"
			_share.push(sharename);
    	}
		else if(flag == 2 || flag==3)		 
		{	
			class_name=" class='share_error'"
		}
        
    	str = str + "<tr>"
		
		if (flag == 1)
		{
			//for special case
			if(sharename.charAt(0)=="`")
			{
				sharename = "*" + sharename;
			}	
			
			s_name = s_name.replace(/ /g,'&nbsp;')
			str = str + "<td>"+s_name+"<input type='hidden' size='25' id='settings_utilitiesISOShareName_text' name='settings_utilitiesISOShareName_text'" + class_name + " value=\""+ sharename+"\" rel=\""+path+"\"></td>";
		}
    	else
    		str = str + "<td><input type='text' size=50 id='settings_utilitiesISOShareName_text' name='settings_utilitiesISOShareName_text'" + class_name + " onkeyup='chk_iso_share_name(this,"+index+")' value=\""+ sharename+"\" rel=\""+path+"\"></td>";
		
		str = str + "<td><input type='text' size=25 name='settings_utilitiesISOShareDesc_text'></td>";
    	str = str + "</tr>";

  return str;
}
function iso_list()
{
	var sharename;
	var	path;
	var _share = new Array();
	var str = "";
  	iso_error_flag =0;
  	
    $("#iso_tree_container input:checkbox:checked[name=folder_name]").each(function(index){
    	
		var flag = 0;    	    	
		var path = $(this).val();
		var sharename = $(this).attr('rel').split("/");
		sharename = sharename[sharename.length-1];
		var tmp1=sharename.lastIndexOf(".");
		
		if(tmp1!=-1)
			sharename=sharename.substring(0,tmp1);
			
		var s_name = sharename;
		
		//var sharename_text = $(this).attr('src'); //為了處理空白字元而定屬性。
		var class_name="";

		flag = iso_share_exist(path,s_name);  	//1、比較已經設過的share name	
		
		if (s_name.length > 80) flag = 2;

	  	//check share name 
	  	//INVALID_SHARENAME_CHARS  %<>*?|/\+=;:", 和最後一個字元是$
	  	if(flag==1)
	  	{
      		var v = Chk_Samba_Share_Name(s_name)
      		if(v==1)
      		{
      			flag=3;
      			iso_error_flag = 2;
      		}
      		else if(v==2)
	  		{
	  			flag=3;
	  			iso_error_flag=3;
	  		}
	  	}
      	else
      		iso_error_flag =1;

		if (flag != 2)
        {
			for (var i=0;i<_share.length;i++)
       	 	{
				if (_share[i] == sharename)		//2、比較user選的checkbox的share name
					flag = 2
        	} 
      	}

		if(flag == 1) //沒有設過此路徑為share，share name以default
      	{
			class_name=" class='share_ok'"
			_share.push(sharename);
    	}
		else if(flag == 2 || flag==3)		 
		{	
			class_name=" class='share_error'"
		}
        
    	//str += "<tr>"
		
		if (flag == 1)
		{
			
			//str += "<td class='tdfield'>" + _T('_network_access','share_name') +"</td><td class='tdfield_padding'>"+sharename + "<input type='hidden' size='25' name='settings_utilitiesISOShareName_text'" + class_name + " value=\""+ sharename+"\" rel=\""+path+"\"></td>";
			str = "<input type='hidden' size='25' id='settings_utilitiesISOShareName_text' name='settings_utilitiesISOShareName_text'" + class_name + " value=\""+ sharename+"\" rel=\""+path+ "\">"
			$("#iso_sharename").html(sharename + str);
		}
    	else
    	{
    		$("#iso_sharename").html("<input type='text' size=50 id='settings_utilitiesISOShareName_text' name='settings_utilitiesISOShareName_text'" + class_name + " onkeyup='chk_iso_share_name(this,"+index+")' value=\""+ sharename+"\" rel=\""+path+"\">");
    		//str+="<td class='tdfield'>" + _T('_network_access','share_name') +"</td>"+ "<td class='tdfield_padding'><input type='text' size=50 name='settings_utilitiesISOShareName_text'" + class_name + " onkeyup='chk_iso_share_name(this,"+index+")' value=\""+ sharename+"\" rel=\""+path+"\"></td>"
    	}
		
		$("#settings_utilitiesISOShareDesc_text").val("");
		//str+="</tr>"
		//str+="<tr><td class='tdfield'>" + _T('_device','sdesc') + "</td><td class='tdfield_padding'><input type='text' size=25 name='settings_utilitiesISOShareDesc_text'></td>";
    	//str+="</tr>";
    });
			
  //return str;
}

function iso_share_exist(path,name)
{
	for (var i=0;i<__ISO_SMB_SHARE_NAME.length;i++)
	{   
		if (name == __ISO_SMB_SHARE_NAME[i])
			return 2;
	}
	
	for (var i = 0;i<__ISO_PATH.length;i++)
	{
		if (path == __ISO_PATH[i])
			return 0;
	}
	
	for (var i=0;i<__ISO_NAME.length;i++)
	{   
		if (name == __ISO_NAME[i])
			return 2;
	}
	return 1;
}
/***************************************************************************
	(( 比對user自己加的share ))
	0: 名稱不同，你可以安心設定。
	1：你完了，名字一樣。要改啦~~~
*/
function iso_select_folder_exist(index,name)
{
	for (var i=0;i< $('#iso_table tbody tr').length;i++)
	{
		if (index == i)continue;  //同一筆，自己不用跟自己比啦！
		if ($('#iso_table tbody tr:eq('+i+') td:eq(0) input').hasClass('share_ok'))
		{											
			if ($('#iso_table tbody tr:eq('+ i +') td:eq(0) input').val() == name)
      			return 1;
  		}
	}
  	return 0;
}
var _ftp_flag=0;
function iso_create(tag)
{
	init_iso_share_dialog();
	
	user_read_list = new Array();
	user_decline_list = new Array();
	
	if (tag == "img")
	{
		__com = SHARE_ISO_IMG_NEW;
		$("#iDiag_desc").hide();
		$("#iDiag_tree").hide();
		$("#iDiag_access_right").show();
		$("#iDiag_user_list").hide();
		$("#iDiag_group_list").hide();
		$("#iDiag_share_list").hide();
		$("#iDiag_allaccount").hide();
		$("#iDiag_apply_to").hide();
		$("#iDiag_nfs").hide();
		$("#iDiag_webdav").hide();
		$("#iDiag_ftp").hide();
		$("#iDiag_complited").hide();
		$("#settings_utilitiesISOShareBack2_button").hide();
		$("#isoDiag_title").html(ISO_STEP4);
	}	
	else	
	{	
		__com = SHARE_NEW;

		$("#create_div_button").show();
		$("#edit_div_button").hide();
		$("#settings_utilitiesISOShareSave_button").show();
		$("#settings_utilitiesISOShareNext3_button").hide();
		
		$("#iDiag_tree").show();
		$("#iDiag_share_list").hide();
		$("#iDiag_apply_to").hide();
		$("#iDiag_apply_to2").hide();
		$("#iDiag_access").hide();
		
		$("#ftp_anonymous2").hide();
		$("#nfs_conf_tb").hide();
		$("#nfs_conf_tb input[name='settings_utilitiesISOShareNFSHost_text']").val("*");
	}

	$("#iso_public_tr").hide();
	setSwitch('#settings_utilitiesISOShareMedia_switch',0);
	setSwitch('#settings_utilitiesISOShareFTP_switch',0);
	setSwitch('#settings_utilitiesISOShareWebDAV_switch',0);
	setSwitch('#settings_utilitiesISOShareNFS_switch',0);
	setSwitch('#recycle_switch2',0);
	setSwitch('#root_switch2',0);
	setSwitch('#write_switch2',0);
	setSwitch('#settings_utilitiesISOSharePublic_switch',1);
	$("input:text").inputReset();
	
	if(__SERVICE_INFO.ftp=="0")
	{
		$('#settings_utilitiesISOShareFTP_switch').attr('disabled',true);
	}
	if(__SERVICE_INFO.nfs=="0")
	{
		$('#settings_utilitiesISOShareNFS_switch').attr('disabled',true);
	}
	if(__SERVICE_INFO.media=="0" && __SERVICE_INFO.itunes=="0")
	{
		$('#settings_utilitiesISOShareMedia_switch').attr('disabled',true);
	}
	if(__SERVICE_INFO.webdav=="0")
	{
		$('#settings_utilitiesISOShareWebDAV_switch').attr('disabled',true);
	}
		
	init_button();
	init_switch();
	
	if(_ftp_flag==0)
	{
		_ftp_flag=1;
	    $("#settings_utilitiesISOShareFTP_switch").click(function(){
			var v = getSwitch('#settings_utilitiesISOShareFTP_switch');
			if( v==1)
			{
				$("#ftp_anonymous2").show();
			}
			else
			{
				$("#ftp_anonymous2").hide();
			}
		});
			
	    $("#settings_utilitiesISOShareNFS_switch").click(function(){
			var v = getSwitch('#settings_utilitiesISOShareNFS_switch');
			if( v==1)
			{
				$("#nfs_conf_tb").show();
			}
			else
			{
				$("#nfs_conf_tb").hide();
			}
		});
	}
	
	show_ftp_anonymous_options2('#ftp_anonymous2','n','settings_utilitiesISOShareFTPMain_select','settings_utilitiesISOShareFTP_select',"");

	language();
		
	//init all settings	
	$("#iso_tree_container input:checkbox").attr("checked",false);

	//get share info
	get_iso_share_info();	//get all iso share name,for check share exist or not
	get_smb_share_info();	//get all smb share name,for check share exist or not
			
	//tree
	__file = 1;
	__chkflag = 1;  //for show check box  1:show  0:not
	do_query_HD_Mapping_Info();
  	$('#iso_tree_container').fileTree({ root: '/mnt/HD' ,cmd: 'cgi_generic_open_tree', script:'/cgi-bin/folder_tree.cgi',function_id:'iso_mount',filetype:'iso'}, function(file) { });        
	var isoWizardObj=$("#isoDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	isoWizardObj.load();
	_DIALOG=isoWizardObj;		
	
	ui_tab("#isoDiag",".jqueryFileTree a:first","#settings_utilitiesISOShareNext_button");
}
var _ISO_SEL_IDX="";
function iso_edit(idx)
{
	init_iso_share_dialog();
	user_read_list = new Array();
	user_decline_list = new Array();
	
	_ISO_SEL_IDX = idx;
	get_modify_iso_info(__ISO_SHARE_LIST_INFO[idx].sharename,"edit");

	$("#create_div_button").hide();
	$("#edit_div_button").show();
	$("#settings_utilitiesISOShareSave_button").hide();
	$("#settings_utilitiesISOShareNext3_button").show();
	
	$("#iDiag_tree").hide();
	$("#iDiag_share_list").show();
	$("#iDiag_access").hide();
	$("#iDiag_apply_to").hide();
	$("#iDiag_apply_to2").hide();
		
	$("#isoDiag_title").html(_T('_iso_mount','edit_title'));

	if(__SERVICE_INFO.ftp=="0")
	{
		$('#settings_utilitiesISOShareFTP_switch').attr('disabled',true);
	}
	if(__SERVICE_INFO.nfs=="0")
	{
		$('#settings_utilitiesISOShareNFS_switch').attr('disabled',true);
	}
	if(__SERVICE_INFO.media=="0" && __SERVICE_INFO.itunes=="0")
	{
		$('#settings_utilitiesISOShareMedia_switch').attr('disabled',true);
	}
	if(__SERVICE_INFO.webdav=="0")
	{
		$('#settings_utilitiesISOShareWebDAV_switch').attr('disabled',true);
	}
		
	__com = SHARE_MODIFY;
	
	language();
	var isoWizardObj=$("#isoDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	isoWizardObj.load();
	_DIALOG = isoWizardObj;
	$("input:text").inputReset();
	
	$("#settings_utilitiesISOSharePublic_switch").unbind("click");
	$("#settings_utilitiesISOSharePublic_switch").click(function() {
		var public = getSwitch('#settings_utilitiesISOSharePublic_switch');	
		if(NFS_FUNCTION==1 || MODEL_NAME=="GLCR" || MODEL_NAME =="BAGX")
		{
			$("#settings_utilitiesISOShareNext2_button span").html(_T('_button','Next'));
		}
		else
		{
			if( public==1 )
			{
				$("#settings_utilitiesISOShareNext2_button span").html(_T('_button','save'));
			}
			else
			{
				$("#settings_utilitiesISOShareNext2_button span").html(_T('_button','Next'));
			}
		}
	});	
		
}
function iso_detail(idx)
{
	user_read_list = new Array();
	user_decline_list = new Array();
	
	get_modify_iso_info(__ISO_SHARE_LIST_INFO[idx].sharename,"detail");
	
	var detail_str = _T("_remote_backup","x_detail");
	
	var sname = __ISO_SHARE_LIST_INFO[idx].sharename;
	if(sname.length >34)
	{
		sname = sname.slice(0,34) + "...";
	}
	detail_str = detail_str.replace(/%s/g,sname);
	$("#isoDetailDiag_title").html(detail_str);
	
	var isoWizardObj=$("#isoDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	isoWizardObj.load();
		
	language();
}
function iso_del(idx)
{
	var hostname = __ISO_SHARE_LIST_INFO[idx].host;
	var sharename = __ISO_SHARE_LIST_INFO[idx].sharename;
	var path=__ISO_SHARE_LIST_INFO[idx].path;

	jConfirm('M',_T('_iso_mount','msg2'),_T('_iso_mount','del_title'),"share",function(r){
		if(r)
		{
			
			jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
			_DIALOG = "";

			var nfs_path = "/mnt/isoMount/" + sharename
			wd_ajax({
				type: "POST",
			async: true,
				cache: false,
				dataType: "xml",
				url: "/cgi-bin/isomount_mgr.cgi",
				data:{cmd:"cgi_del_iso_share",sharename:sharename,path:nfs_path,host:hostname},  	    
				success: function(xml){
					var iso_status = $(xml).find('iso_mount').text();
					if(iso_status!=0)
					{
						//The shared entry can't be deleted because it's still in use. To delete the entry, stop access to it first.
						jAlert(_T('_iso_mount','msg1'), _T('_common','error'));
					}
					else
					{
						var webdav_path = "/mnt/isoMount/"+sharename
						//alert("webdav_path=" + webdav_path)
						webdav_del_share(1,webdav_path);
					}
					get_iso_list();
					jLoadingClose();
				},
				error:function(xmlHttpRequest,error){}
			});
			
		}
	});
}
var __ISO_MODIFY_WEBDAV_FLAG=0;
function get_modify_iso_info(sharename,type)	//type:detail,edit
{
	wd_ajax({
		type: "POST",
		cache: false,
		dataType: "xml",
		url: "/cgi-bin/isomount_mgr.cgi",
		data: { cmd:"cgi_get_modify_iso_info" ,name:sharename },
		success: function(xml){
			
 				var comment = $(xml).find('comment').text();
				var path = $(xml).find('path').text();
				var read_list = $(xml).find('read_list').text();
				var invalid_users = $(xml).find('invalid_users').text();
				var ftp = $(xml).find('ftp').text();
				var ftp_anonymous = $(xml).find('ftp_anonymous').text();
				var nfs = $(xml).find('nfs').text();
				var media = $(xml).find('media').text();
				var webdav = $(xml).find('webdav').text();
				var nfs_host = $(xml).find('nfs_host').text();
				var remote = $(xml).find('remote_access').text();
				//if(type=="edit")
				{
					show_user_iso_list(read_list,invalid_users);
				}
				
				_OLD_NFS_HOST = nfs_host;
				_OLD_NFS_PATH = "/mnt/isoMount/" + sharename;
				
				
				//var str = "<tr><td class='tdfield'>" + _T('_network_access','share_name') +"</td><td class='tdfield_padding'>"+sharename + "</td></tr>";
				//str += "<tr><td class='tdfield'>" + _T('_device','sdesc') + "</td><td class='tdfield_padding'><input type='text' size=25 name='settings_utilitiesISOShareDesc_text'></td></tr>";
				//$("#iso_table").html( str )
				//$("input:text").inputReset();
				
				$("#iso_sharename").html(sharename);
				
				//show to detail dialog
				//get_Name_Mapping_Hame("HDD"); move to get_iso_list();
				//setTimeout(function(){
					var new_path = translate_path_to_display(path);
					$("#settings_utilitiesISOSharePath_value").html(new_path);
				//},500);
				
				$("#settings_utilitiesISOShareName_value").html(sharename);
				
				$("#iso_table input[name='settings_utilitiesISOShareDesc_text']").val(comment);
				if(comment.length==0) {comment="-";}
				$("#settings_utilitiesISOShareDesc_value").html(comment);
				

				setSwitch('#settings_utilitiesISOShareMedia_switch',media);
				setSwitch('#settings_utilitiesISOShareFTP_switch',ftp);
				setSwitch('#settings_utilitiesISOShareWebDAV_switch',webdav);
				setSwitch('#settings_utilitiesISOShareNFS_switch',nfs);
				$("#iso_public_tr").show();
				
				//if(read_list=="#admin#,#nobody#,#@allaccount#")
				//if(read_list.indexOf("#nobody#,#@allaccount#")!=-1)
				var yes = _T('_button','yes');
				var no = _T('_button','no');
				
				if(read_list.length==0 && invalid_users.length==0)
				{
					setSwitch('#settings_utilitiesISOSharePublic_switch',1);
				}
				else
				{
					setSwitch('#settings_utilitiesISOSharePublic_switch',0);
				}
					
				init_switch();

					
				if(_ftp_flag==0)
				{
					_ftp_flag=1;
				    $("#settings_utilitiesISOShareFTP_switch").click(function(){
				    	if($("#settings_utilitiesISOShareFTP_switch").hasClass("gray_out")) return;
						var v = getSwitch('#settings_utilitiesISOShareFTP_switch');
						if( v==1)
						{
							$("#ftp_anonymous2").show();
						}
						else
						{
							$("#ftp_anonymous2").hide();
						}
					});
						
				    $("#settings_utilitiesISOShareNFS_switch").click(function(){
				    	if($("#settings_utilitiesISOShareNFS_switch").hasClass("gray_out")) return;
						var v = getSwitch('#settings_utilitiesISOShareNFS_switch');
						if( v==1)
						{
							$("#nfs_conf_tb").show();
						}
						else
						{
							$("#nfs_conf_tb").hide();
						}
					});
				}

				
				
				/*
				console.log("comment[%s]",comment)
				console.log("media[%s]",media)
				console.log("ftp[%s]",ftp)
				console.log("webdav[%s]",webdav)
				console.log("nfs[%s]",nfs)
				console.log("media[%s]",media)
				*/
				
				//ftp-----------------------------------------
				if(ftp=='1') 
				{
					$("#settings_utilitiesISOShareFTP_value").html(yes);
					$("#ftp_anonymous2").show();
				}
				else
				{
					$("#settings_utilitiesISOShareFTP_value").html(no);
					$("#ftp_anonymous2").hide();
				}
				show_ftp_anonymous_options2('#ftp_anonymous2',ftp_anonymous,'settings_utilitiesISOShareFTPMain_select','settings_utilitiesISOShareFTP_select',"");

				//nfs-----------------------------------------
				if(NFS_FUNCTION==1 || MODEL_NAME=="GLCR" || MODEL_NAME =="BAGX")
				{
				if(nfs=='1')
				{
					$("#settings_utilitiesISOShareNFS_value").html(yes);
					$("#nfs_conf_tb").show();
					$("#nfs_conf_tb input[name='settings_utilitiesISOShareNFSHost_text']").val(nfs_host);
				}
				else
				{
					$("#settings_utilitiesISOShareNFS_value").html(no);
					$("#nfs_conf_tb").hide();
					$("#nfs_conf_tb input[name='settings_utilitiesISOShareNFSHost_text']").val("");
				}
				}
				else
				{
					$("#iso_nfs_tr").hide();
				}
				
				if(media=='1')
					$("#settings_utilitiesISOShareMedia_value").html(yes);
				else
					$("#settings_utilitiesISOShareMedia_value").html(no);
				if(webdav=='1')
					$("#settings_utilitiesISOShareWebDAV_value").html(yes);
				else
					$("#settings_utilitiesISOShareWebDAV_value").html(no);
				if(remote=='1')
					$("#settings_utilitiesISOShareRemote_value").html(yes);
				else
					$("#settings_utilitiesISOShareRemote_value").html(no);
		}
	});
}
function do_add_iso_share()
{
	var s_read_list = new Array();
	var s_write_list = new Array();
	var s_decline_list = new Array();

	//default always read only
	//s_read_list.push("#admin#");
	//s_read_list.push("#nobody#"); 	
	//s_read_list.push("#@allaccount#"); 		
	
	var s_name = $("#iso_table input[name='settings_utilitiesISOShareName_text'] ").val();
	var s_path = $("#iso_table input[name='settings_utilitiesISOShareName_text'] ").attr('rel');
	var s_comment = $("#iso_table input[name='settings_utilitiesISOShareDesc_text'] ").val();
	
	var s_ftp = getSwitch('#settings_utilitiesISOShareFTP_switch');
	var webdav = getSwitch('#settings_utilitiesISOShareWebDAV_switch');
	var nfs = getSwitch('#settings_utilitiesISOShareNFS_switch');
	var host = $("#nfs_conf_tb input[name='settings_utilitiesISOShareNFSHost_text'] ").val();
	var ftp_anonymous = $("#settings_utilitiesISOShareFTP_select").attr('rel');
	var media = getSwitch("#settings_utilitiesISOShareMedia_switch");
	var remote_access = getSwitch("#settings_utilitiesISOShareRemote_switch");
  	/*
  	var debug="\ns_name=" + s_name + "\ns_comment="+ s_comment +"\ns_path=" + 
  			s_path + "\ns_read_list=" + 
  			s_read_list.toString() +  
  			"\ns_decline_list=" + s_decline_list.toString() +
  			"\nftp=" + s_ftp + "\nftp_anonymous=" + ftp_anonymous + "\nmedia=" + media
	console.log(debug);
	*/

	if(nfs=="1")
	{
		var error=chk_nfs_host(host);
		if( error==1 || error==6)
		{
			//Not a valid host.
			jAlert(_T('_network_access','msg12'), _T('_common','error'));
			return;
		}
		else if(error==2)
		{
			//Invalid IP address. The first set of numbers must range between 1 and 223.
			jAlert(_T('_ip','msg4'), _T('_common','error'));
			return;
		}
		else if(error==3)
		{
			//Invalid IP address. The second set of numbers must range between 0 and 255.
			jAlert(_T('_ip','msg5'), _T('_common','error'));
			return;
		}
		else if(error==4)
		{
			//Invalid IP address. The third set of numbers must range between 0 and 255.
			jAlert(_T('_ip','msg6'), _T('_common','error'));
			return;
		}
		else if(error==5)
		{
			//Invalid IP address. The fourth set of numbers must range between 0 and 255.
			jAlert(_T('_ip','msg7'), _T('_common','error'));
			return;
		}
		else if(error==7)
		{
			//The host name allow characters : "a-z" , "A-Z" , "0-9" , "-"
			jAlert(_T('_nfs','msg1'), _T('_common','error'));
			return;
		}
	}
	$("#isoDiag").overlay().close();
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	do_add_post();
	
	function do_add_post()
	{
	     wd_ajax({
	      type: "POST",
	      cache: false,
	      dataType: "xml",
	      url: "/cgi-bin/isomount_mgr.cgi",
	      data: { cmd:"cgi_set_iso_share" ,path:s_path, name:s_name, 
		          comment:s_comment, 
		          read_list:s_read_list.toString(),
		          invalid_users:s_decline_list.toString(),
		          ftp:s_ftp,
		          ftp_anonymous:ftp_anonymous,
		          media:media,
		          remote_access:remote_access
	          	},
	      		success: function(xml){
	      			jLoadingClose();
	      			if($(xml).find('status').text()	=='0')
	      			{
	      				//fail item
	      				ADD_ISO_STATUS.push(s_name);
						//Mount failed item(s)
						jAlert( _T('_network_access','msg15') +": "+  ADD_ISO_STATUS.toString(), _T('_common','error'));
	      			}
	      			else
	      			{
	      				//set ftp,nfs,webdav
	      				if(s_ftp)
							do_ftp_service(_Start);
	
						if(nfs)
							do_add_nfs_iso_share();
	
						if(webdav)
							do_add_webdav_iso_share();
						get_iso_list();
	      			}
	      		},
				error:function(xmlHttpRequest,error){}
	      });
	}
}

function do_restart_webdav_service()
{
	var nfs =	getSwitch('#settings_utilitiesISOShareNFS_switch');	
	var webdav = getSwitch('#settings_utilitiesISOShareWebDAV_switch');
		
     wd_ajax({
      type: "POST",
      cache: false,
      url: "/cgi-bin/webdav_mgr.cgi",
      data: { cmd:"cgi_restart_service",nfs:nfs,webdav:webdav
          	},
      		success: function(){
      		},
            error:function(xmlHttpRequest,error){}                              
      });
}
function do_add_webdav_iso_share()
{
	var webdav_list = "";	
	var webdav_share_path = "",webdav_path = "";
	var webdav_rw="";
	var read_list = "",write_list="";	
	var webdav = getSwitch('#settings_utilitiesISOShareWebDAV_switch');
	
	webdav_share_path = $("#iso_table input[name='settings_utilitiesISOShareName_text'] ").val();
	webdav_path = "/mnt/isoMount/" + webdav_share_path;
	webdav_rw = 0; //always read only
	webdav_list = "#@allaccount#";	//always allaccount

	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/webdav_mgr.cgi",
		data:{cmd:"Webdav_Account_add",f_share_name:webdav_share_path,f_path:webdav_path,f_rw:webdav_rw,f_user:webdav_list,webdav:webdav},  
		success:function(xml)
		{
		  	do_restart_webdav_service();
		},
		error:function(xmlHttpRequest,error){   
			//alert("do_add_webdav_share() - Fail...");
			//$("#flex1").flexReload();
		}
	});
}
function do_add_nfs_iso_share()
{
	var host="",path="",s_name="";
	var rw="",rootsquash="";

	s_name = $("#iso_table input[name='settings_utilitiesISOShareName_text'] ").val();
	host = $("#nfs_conf_tb input[name='settings_utilitiesISOShareNFSHost_text'] ").val();
	path = "/mnt/isoMount/" + s_name;
	post_nfs_share();
	
	rw=0;	//rw always read only
	rootsquash = 0;

	function post_nfs_share()
	{
		wd_ajax({
			type: "POST",
			async: false,
			cache: false,
			url: "/cgi-bin/account_mgr.cgi",
			data: { cmd:"cgi_set_nfs_share" ,host:host, path:path, rw:rw , rootsquash:rootsquash },
			success: function(data){
			}
		});
	}
}

function do_iso_modify_nfs_share()
{
	var rw=0,rootsquash=0;
	var host="",path="";
	var nfs = $("#i_share_tab input[name='nfs1']").prop("checked");
	if(nfs)
	{
		host = $("#iso_nfs_table tbody tr:eq(0) td:eq(1) input ").attr('value');
		path = $("#iso_nfs_table tbody tr:eq(0) td:eq(1) input ").attr('rel');
	}
	else
	{
		host = _OLD_NFS_HOST;
		path = _OLD_NFS_PATH;
	}
	
	//alert( "_NFS_FLAG="+_NFS_FLAG +"\nold_host=" + _OLD_NFS_HOST + "\nhost="+host + "\n" + "path="+path + "\n" +"rw=" + rw+ "\n" + "rootsquash="+rootsquash)	

	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_modify_nfs_share" ,old_host:_OLD_NFS_HOST,host:host,
					path:path, rw:rw , rootsquash:rootsquash,nfs_flag:_NFS_FLAG,
					nfs:nfs},
		success: function(data){
		}
	});
}
function do_iso_modify_webdav_share(s_name)
{
	var webdav_share_path = "",webdav_path = "";
	var read_list = "",write_list="";	
	var webdav_list = "";	
	var webdav_rw="";
	var msg = "";
	var webdav = $("#i_share_tab input[name='webdav1']").prop("checked");
	if(!webdav)
		webdav_share_path = s_name;
	$('#iso_webdav_table tbody tr').each(function(index){
		//if($("#iso_webdav_table tbody tr:eq("+index+") td:eq(0) input ").prop('checked'))
		{
			//share name
			webdav_share_path = $("#iso_webdav_table tbody tr:eq("+index+") td:eq(0)").text();
			var s="";
			for(var i=0;i<webdav_share_path.length;i++)		
			{
				if(webdav_share_path.charCodeAt(i)==160)
					s += " ";
				else
					s += webdav_share_path.charAt(i);
			}
			webdav_share_path = s
			
			msg += "m_webdav_table=" + webdav_share_path + "\n";
			
			//path
			webdav_path = "/mnt/isoMount/" + webdav_share_path
			msg += "path=" + webdav_path + "\n";
			
			var item = $('#iDiag_access_right input[name=f_access]:checked').val();
			
			if(item==0)	//all account
			{
				var type = $('#iDiag_allaccount input[name=f_allaccount]:checked').val();
			
				if(type=="r")
				{
					webdav_rw = 0;
					webdav_list = "#@allaccount#";
				}
				if(type=="w")
				{
					webdav_rw = 1;
					webdav_list = "#@allaccount#";
				}
				
			}
			else	//
			{
				if($("#iso_webdav_table tbody tr:eq("+index+") td:eq(1) input ").prop('checked'))
				{
					webdav_rw = 0;
					read_list = $("#iso_webdav_table tbody tr:eq("+index+") td:eq(1) input ").val();
						msg += "r=" + read_list + "\n";
					webdav_list = "#" + read_list.replace(/,/g,'#,#') + "#";
				}		
			}
		}
	});
	
	msg += "webdav_list=" + webdav_list + "\n";
	msg += "r=" + read_list + "\n";
	msg += "w=" + write_list + "\n";
	//alert(msg);
	
	//todo:
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webdav_mgr.cgi",
		data:{cmd:"Webdav_Account_add",f_share_name:webdav_share_path,f_path:webdav_path,f_rw:webdav_rw,f_user:webdav_list,webdav:webdav},  
		success:function(xml)
		{
		}
	});
}
function iso_tree_check_share(path)
{
	for (var i = 0;i<__ISO_PATH.length;i++)
	{
		if (path == __ISO_PATH[i])
		{
			//ISO Share already exists
			jAlert(_T('_iso_mount','msg3'), _T('_common','error'));				
			return 0;
		}
	}
	
	var test = $("#iso_tree_container input:checkbox:checked[name=folder_name]").length;
	if (test > _ISO_MAX_TOTAL_SHARE - _ISO_TOTAL)
	{
		//The maximum number of share has been reached.
		jAlert( _T('_network_access','msg13'), _T('_common','error'));
		return 0;
	}
	
	return 1;
}
function iso_readd_group(tb_obj)
{
	// var v = $(tb_obj + " tbody tr:eq("+i+") td:eq(0)").text();
		
	var number_r = 0;	
	var number_d = 0;
	var total = 0;			
		
	$(tb_obj +' tbody tr').each(function(index){
		total = index+1;
		var v = $( tb_obj +' tbody tr:eq('+index+') td:eq(0)').text();
		
		//all allcount end	
		for(var i=0;i<group_read_list.length;i++)
		{
			if (v == group_read_list[i])
			{
				$(tb_obj + ' tbody tr:eq('+index+') td:eq(1) input').attr('checked',true);										
				number_r++;
				return;
			}
		}
					
		for(var i=0;i<group_decline_list.length;i++)
		{
			if (v == group_decline_list[i])
			{			
				$(tb_obj + ' tbody tr:eq('+index+') td:eq(2) input').attr('checked',true);										
				number_d++;									
				return;
			}
		}			
	});
	//alert("group:total=" + total + "\nnumber_r=" + number_r )
	if (total != 0 ) //when user or group is not null
	{
		$("input[name=r_chkAll]").attr('checked',false);
		$("input[name=d_chkAll]").attr('checked',false);
		
		if (number_r == total)
			$("input[name=r_chkAll]").attr('checked',true);
				
		if (number_d == total)
			$("input[name=d_chkAll]").attr('checked',true);	
	}
}
/*
USER如果在TABLE裡，要打勾
*/
function iso_readd_user(tb_obj)
{
	var number_r = 0;	
	var number_d = 0;
	var total = 0;	
	
	$(tb_obj +' tbody tr').each(function(index){
		total = index+1;
		var v = $(tb_obj + ' tbody tr:eq('+index+') td:eq(0)').text();
				
		for(var i=0;i<user_read_list.length;i++)
		{				
			if (v == user_read_list[i])
			{	
				$( tb_obj +' tbody tr:eq('+index+') td:eq(1) input').attr('checked',true);										
				number_r++;									
				return;
			}	
		}		
					
		for(var i=0;i<user_decline_list.length;i++)
		{		
			if (v == user_decline_list[i])
			{					
				$( tb_obj +' tbody tr:eq('+index+') td:eq(2) input').attr('checked',true);										
				number_d++;
				return;
			}
		}
	});
	
	//alert("user:total=" + total + "\nnumber_r=" + number_r )
	if (total != 0 ) //when user or group is not null
	{
		$("input[name=r_chkAll]").attr('checked',false);
		$("input[name=d_chkAll]").attr('checked',false);
		
		if (number_r == total)
			$("input[name=r_chkAll]").attr('checked',true);
				
		if (number_d == total)
			$("input[name=d_chkAll]").attr('checked',true);	
	}
}

/***********************************************************************
	For [Modify] session used, get r/w/d list from xml and write to variable
	0: array is null
	1: user is [ALL Account]
	2: OK
*/
function permission(arr,user,group)
{
	if (arr == "") return 0;
	var tmp = new Array();
	tmp = arr.replace(/\#/g,'').split(",");
	                
	for (var i =0;i<tmp.length;i++)
	{
		if (tmp[i].substr(0,1) == "@")
		{  
			//open model     
			if (tmp[i] == "@allaccount")
			{
				return 1;
			}
			else (tmp[i] != "@allaccount")     	
				group.push(tmp[i].substr(1,tmp[i].length));
		} 
		else if (tmp[i] != "nobody")
		{
			user.push(tmp[i]);            
		}
	} 
	return 2;
}
var ISOAllUserList = new Array();
function show_user_iso_list(read_list,invalid_users)
{
	//console.log("read_list=[%s]",read_list)
	//console.log("invalid_users=[%s]",invalid_users)
	$("#iso_userlist_ul").empty();

	//local user
	__iso_userlist = new Array();
	var __iso_userlist_tmp = new Array();
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/xml/account.xml",
		dataType: "xml",
		success: function(xml){
			
			var aIndex=0;
			var admin_array = new Array();
			var j=0;
			var cloudholderMember= new Array();
			$(xml).find('groups > item').each(function(index){
				var gname = $(this).find('name').text();

				if(gname==_Filter_Default_Group[0])	//0:cloudholders
				{
					$(this).find('users > user').each(function(){
						cloudholderMember.push($(this).text());
					});
				}
			});
			
			$(xml).find('users > item').each(function(index){
				var user_name = $(this).find('name').text();
				
				if(api_filter_user(user_name,cloudholderMember) ==1 ) return true;	//non-cloudholders users cannot show on GUI
				
				var uid = $(this).find('uid').text();
				var gid = $(this).find('gid').text();
				var pwd = $(this).find('pwd').text();
				
				//if(gid==_ADMIN_GID || uid==_ADMIN_UID)	//1001
				if(uid==_ADMIN_UID)	//1001
				{
					if(uid==_ADMIN_UID)
					{
						_LOCAL_ADMIN_NAME = user_name;
					}
					admin_array[j] = new Array();
					admin_array[j].username = user_name;
					admin_array[j].type = "local";
					admin_array[j].uid = uid;
					admin_array[j].gid = gid;
					j++;
					return true;
				}
					
				__iso_userlist[aIndex] = new Array();		
				__iso_userlist[aIndex].username = user_name;
				__iso_userlist[aIndex].uid = uid;
				__iso_userlist[aIndex].gid = gid;
				__iso_userlist[aIndex].type = "local";
				aIndex++;
			});
			
			__iso_userlist.sort(function(a, b){
			    var a1= a.username, b1= b.username;
			    if(!b1) b1=a1;
			    if(a1== b1) return 0;
			    return a1> b1? 1: -1;
			});
			
			__iso_userlist_tmp = admin_array.concat(__iso_userlist);
			
			_iso_get_ad();
    
		},
		error:function(xmlHttpRequest,error){
			//alert("Error: " +error);
		}
	});
	//ads account
	var ADUList = new Array();
	function _iso_get_ad()
	{
		wd_ajax({
			type: "GET",
			cache: false,
			url: "/web/php/getADInfo.php?type=users",
			dataType: "xml",
			success: function(xml){
				var workgroup= $(xml).find('ads_workgroup').text();
				var domain_enable= $(xml).find('domain_enable').text();//0:off 1:AD 2:LDAP 
				var dType = "ad";
				if(domain_enable=='2') dType="ldap";
				if(domain_enable!="0")
				{
					var idx=0;
					ADUList[idx] = new Array();
					ADUList[idx].username = "";
					ADUList[idx].uid = "";
					ADUList[idx].gid = "";
					ADUList[idx].type = "";
					
					idx++;
					$(xml).find('users > item').each(function(index){
						var user_name = $(this).find('name').text();
						if(user_name=="Administrator" && dType=="ad") 
						{
							_AD_ADMIN_NAME = workgroup + "\\" + user_name;
							return true;
						}
						else if(user_name=="Administrator" && dType=="ldap")
						{
							_AD_ADMIN_NAME = user_name;
							return true;
						}
						
						if(idx==_MAX_TOTAL_AD_ACCOUNT) return false;
						
						ADUList[idx] = new Array();
						if(dType=="ad")
						{
						ADUList[idx].username =  workgroup + "\\"+ user_name;
						}
						else
						{
							ADUList[idx].username =  user_name;
						}
						ADUList[idx].uid = "";
						ADUList[idx].gid = "";
						ADUList[idx].type = dType;
						idx++;
					});
					ADUList.sort(function(a, b){
					    var a1= a.username.toLowerCase() , b1= b.username.toLowerCase() ;
					    if(!b1) b1=a1;
					    if(a1== b1) return 0;
					    return a1> b1? 1: -1;
					});
					
					ADUList[0].username = _AD_ADMIN_NAME;
					ADUList[0].uid = "";
					ADUList[0].gid = "";
					ADUList[0].type = dType;
													
					ISOAllUserList = __iso_userlist_tmp.concat(ADUList);
				}
				else
				{
					ISOAllUserList = __iso_userlist_tmp;
				}
				
				//display all user to page
				$(".userMenuList").empty();
				var dstr = _T('_network_access','decline');
				var rstr = _T('_network_access','read_only');
				for(var i=0 in ISOAllUserList)
				{
					var user_name = ISOAllUserList[i].username;
					if(user_name.length==0) continue;
					
					var user_name_tmp = "#" + user_name + "#";	//#user1#
					//user_name_tmp = user_name_tmp.replace(/\\/g,'+');
					//if(uid==500) return true;
					
					var li_obj = document.createElement("li");
					$(li_obj).addClass('isoshare');
					
					$(li_obj).append('<div class="usericon"></div>');
					$(li_obj).append('<div class="ISOname">' + user_name + '</div>');
					
					var imgdiv_obj = document.createElement("div"); 
					$(imgdiv_obj).addClass('img');
					var access_flag="";
					if(invalid_users.length!=0 && access_flag.length==0)
					{
						if(invalid_users.indexOf("#@allaccount#")!=-1 || invalid_users.indexOf(user_name_tmp)!=-1)
						access_flag="d";
					}
		
					if(read_list.length!=0 && access_flag.length==0)
					{
						if(read_list.indexOf("#@allaccount#")!=-1 || read_list.indexOf(user_name_tmp)!=-1)
						access_flag="r";
					}
					
					if(access_flag.length==0)
						access_flag="d";
					
					switch(access_flag)
					{
						case 'd':
							$(imgdiv_obj).append('<a class="rUp" id="settings_utilitiesISOShareR' + i + '_link" onclick="set_iso_access(this,\'r\')"></a><a id="settings_utilitiesISOShareD' + i + '_link" class="dDown" onclick="set_iso_access(this,\'d\')"></a>');
							$(li_obj).append($(imgdiv_obj));
							$(li_obj).append('<div class="access2">'+ dstr + '</div>');
							user_decline_list.push(user_name);
							break;
						case 'r':
							$(imgdiv_obj).append('<a id="settings_utilitiesISOSharer' + i + '_link" class="rDown" onclick="set_iso_access(this,\'r\')"></a><a id="settings_utilitiesISOShareD' + i + '_link" class="dUp" onclick="set_iso_access(this,\'d\')"></a>');
							$(li_obj).append($(imgdiv_obj));
							$(li_obj).append('<div class="access2">'+ rstr + '</div>');
							user_read_list.push(user_name);
							break;
					}
					$("#iso_userlist_ul").append($(li_obj));

					var yes = _T('_button','yes');
					var no = _T('_button','no');
					
					if(read_list.length==0 && invalid_users.length==0)
					{
						$("#iso_detail_public_tr").show();
						$("#iso_ro_tr").hide();
						$("#iso_deny_tr").hide();
						$("#settings_utilitiesISOSharePublic_value").html(yes);
					}
					else
					{
						$("#iso_detail_public_tr").hide();
						$("#iso_ro_tr").show();
						$("#iso_deny_tr").show();
						
						var r=user_read_list.toString();
						if(r.length==0) r="-";

						var d=user_decline_list.toString();
						if(d.length==0) d="-";
												
						//if(invalid_users=="#nobody#") invalid_users=_T('_notification','all');
						$("#settings_utilitiesISOShareRO_value").html(r);
						$("#settings_utilitiesISOShareDeny_value").html(d);
					}
									
					//console.log(user_decline_list.toString())
					//console.log(user_read_list.toString())
				}
			},
			error:function(xmlHttpRequest,error){
				//alert("Error: " +error);
			}
		});
}	
	
//	wd_ajax({
//		type: "POST",
//		cache: false,
//		url: "/cgi-bin/share.cgi",
//		data: "cmd=cgi_get_user_list",	
//		dataType: "xml",
//		success: function(xml){
//			var total = $(xml).find('total').text();
//			/*
//			if(total==1)	//only admin
//			{
//				$("#iso_userlist_ul").html(_T('_user','none_user'));
//				return;
//			}*/
//			
//			$(xml).find('row').each(function(index){
//				var user_name = $(this).find('cell').eq(0).text();
//				var uid = $(this).find('uid').text();
//				
//				var user_name_tmp = "#" + user_name + "#";	//#user1#
//				//if(uid==500) return true;
//				
//				var li_obj = document.createElement("li");
//				$(li_obj).addClass('isoshare');
//				
//				$(li_obj).append('<div class="usericon"></div>');
//				$(li_obj).append('<div class="name">' + user_name + '</div>');
//				
//				var imgdiv_obj = document.createElement("div"); 
//				$(imgdiv_obj).addClass('img');
//				var access_flag="";
//				if(invalid_users.length!=0 && access_flag.length==0)
//				{
//					if(invalid_users.search("#@allaccount#")!=-1 || invalid_users.search(user_name_tmp)!=-1)
//					access_flag="d";
//				}
//	
//				if(read_list.length!=0 && access_flag.length==0)
//				{
//					if(read_list.search("#@allaccount#")!=-1 || read_list.search(user_name_tmp)!=-1)
//					access_flag="r";
//				}
//				
//				if(access_flag.length==0)
//					access_flag="d";
//				
//				switch(access_flag)
//				{
//					case 'd':
//						$(imgdiv_obj).append('<a class="rUp" onclick="set_iso_access(this,\'r\')"></a><a class="dDown" onclick="set_iso_access(this,\'d\')"></a>');
//						$(li_obj).append($(imgdiv_obj));
//						$(li_obj).append('<div class="access2">'+ _T('_network_access','decline') + '</div>');
//						user_decline_list.push(user_name);
//						break;
//					case 'r':
//						$(imgdiv_obj).append('<a class="rDown" onclick="set_iso_access(this,\'r\')"></a><a class="dUp" onclick="set_iso_access(this,\'d\')"></a>');
//						$(li_obj).append($(imgdiv_obj));
//						$(li_obj).append('<div class="access2">'+ _T('_network_access','read_only') + '</div>');
//						user_read_list.push(user_name);
//						break;
//				}
//				$("#iso_userlist_ul").append($(li_obj));
//			});
//		},
//		error:function(xmlHttpRequest,error){
//			//alert("Error: " +error);
//		}
//	});
}
function show_ftp_anonymous_options2(obj,val,dev_name1,dev_name2,button_name)
{
	var n=_T('_network_access','anonymous_none');
	var r=_T('_network_access','anonymous_read_only');
	
	var sel_option="";
	switch(val)
	{
		case 'n':
			sel_option = n;
			break;
		case 'r':
			sel_option = r;
			break;
		default:
			sel_option = n;
			break;
	}
	
	var options = "";
	options += '<ul>';
	options += '<li class="option_list">';          
	options += '<div id="' + dev_name1 + '" class="wd_select option_selected">';
	options += '<div class="sLeft wd_select_l"></div>';
	options += '<div class="sBody text wd_select_m" id="' + dev_name2 + '" rel="' + val + '">'+ sel_option +'</div>';
	options += '<div class="sRight wd_select_r"></div>';
	options += '</div>';
	options += '<ul class="ul_obj">'; 
	options += '<li rel="n" class="li_start" id="settings_utilitiesISOShareFTPUl0_select"><a href="#" onclick=\'show1("' + button_name + '")\'>' + n + "</a></li>";
	options += '<li rel="r" class="li_end" id="settings_utilitiesISOShareFTPUl1_select"><a href="#" onclick=\'show1("' + button_name + '")\'>' + r + "</a></li>";
	options += '</ul>';
	options += '</li>';
	options += '</ul>';
	
	$(obj).empty();
	$(obj).append(options);
	
	hide_select();
	init_select();
}
function do_modify_iso_share()
{
    var ftp="0",ftp_anonymous="n";
    var comment="";
    var media="0";
    var webdav="0",webdav_rw="0";
    var nfs="0",host="",root_squash="0",write="0";
    var sharename = __ISO_SHARE_LIST_INFO[_ISO_SEL_IDX].sharename;
    var remote_access="0";
    
    comment=$("#iso_table input[name='settings_utilitiesISOShareDesc_text']").val();
    media = getSwitch('#settings_utilitiesISOShareMedia_switch');
	ftp = getSwitch('#settings_utilitiesISOShareFTP_switch');
	ftp_anonymous = $("#settings_utilitiesISOShareFTP_select").attr("rel"); 
	webdav = getSwitch('#settings_utilitiesISOShareWebDAV_switch');
	path = "/mnt/isoMount/" + sharename;
	nfs = getSwitch('#settings_utilitiesISOShareNFS_switch');
	host = $("#nfs_conf_tb input[name='settings_utilitiesISOShareNFSHost_text']").val();
	remote_access = getSwitch('#settings_utilitiesISOShareRemote_switch');
	
	$("input:text").hidden_inputReset();

	var rlist = "#"+user_read_list.toString().replace(/,/g,'#,#') + "#";
	var dlist = "#"+user_decline_list.toString().replace(/,/g,'#,#') + "#";
	var publicFlag = getSwitch('#settings_utilitiesISOSharePublic_switch');
	
	//console.log("rlist=[%s]",rlist)
	//console.log("dlist=[%s]",dlist)
	
	if(rlist=="##") rlist="";
	if(dlist=="##") dlist="";
	if(publicFlag==1)
	{
		rlist = "#nobody#,#@allaccount#";
		dlist = "";
	}
	
	//rlist = rlist.replace(/\\/g,'+');
	
	if(nfs=="1")
	{
		var error=chk_nfs_host(host);
		if( error==1 || error==6)
		{
			//Not a valid host.
			jAlert(_T('_network_access','msg12'), _T('_common','error'));
			return;
		}
		else if(error==2)
		{
			//Invalid IP address. The first set of numbers must range between 1 and 223.
			jAlert(_T('_ip','msg4'), _T('_common','error'));
			return;
		}
		else if(error==3)
		{
			//Invalid IP address. The second set of numbers must range between 0 and 255.
			jAlert(_T('_ip','msg5'), _T('_common','error'));
			return;
		}
		else if(error==4)
		{
			//Invalid IP address. The third set of numbers must range between 0 and 255.
			jAlert(_T('_ip','msg6'), _T('_common','error'));
			return;
		}
		else if(error==5)
		{
			//Invalid IP address. The fourth set of numbers must range between 0 and 255.
			jAlert(_T('_ip','msg7'), _T('_common','error'));
			return;
		}
		else if(error==7)
		{
			//The host name allow characters : "a-z" , "A-Z" , "0-9" , "-"
			jAlert(_T('_nfs','msg1'), _T('_common','error'));
			return;
		}
	}
		
	$("#isoDiag").overlay().close();
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback

	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/isomount_mgr.cgi",
		data: {
			cmd:"cgi_modify_iso_share" ,name:sharename, 
			comment:comment,path:path,
			ftp_anonymous:ftp_anonymous,
			ftp:ftp,
			webdav:webdav,
			nfs:nfs,host:host,root_squash:root_squash,write:write,
			media:media,
			read_list:rlist,decline_list:"",	//no need to fill decline list
			old_host:_OLD_NFS_HOST,publicFlag:publicFlag,
			remote_access:remote_access
		},
		success: function(xml){
			jLoadingClose();
		},
		error:function(xmlHttpRequest,error){}
	});
}
function set_iso_access(obj,flag)
{
						    
	$(obj).parent().find('a:eq(0)').removeClass();
	$(obj).parent().find('a:eq(1)').removeClass();
	var username=$(obj).parent().prev().html();	
	switch(flag)
	{
		case 'r':
			$(obj).parent().find('a:eq(0)').addClass('rDown');
			$(obj).parent().find('a:eq(1)').addClass('dUp');
			$(obj).parent().next().html(_T('_network_access','read_only') );
			user_read_list.push(username);
			remove_arr(user_decline_list,username);
			flag=1;
			break;
		case 'd':
			$(obj).parent().find('a:eq(0)').addClass('rUp');
			$(obj).parent().find('a:eq(1)').addClass('dDown');
			$(obj).parent().next().html(_T('_network_access','decline'));
			user_decline_list.push(username);
			remove_arr(user_read_list,username);
			flag=3;
			break;
	}
	
	var rlist = "#"+user_read_list.toString().replace(/,/g,'#,#') + "#";
	var dlist = "#"+user_decline_list.toString().replace(/,/g,'#,#') + "#";	
	
//	console.log("user_read_list=%s",user_read_list.toString())
//	console.log("user_decline_list=%s",user_decline_list.toString())
//	return;


}
/*************************************************************
  remove array element
*/
function remove_arr(arr, sharename)
{
	for(x in arr) 
	{
		if (arr[x] == sharename)
		{
			arr[x] = "";
			arr.sort();
			arr.shift();
			return; 
		}
	}
}
function check_iso_desc(desc)
{
	if(desc.length > 128) 
	{
		jAlert(_T('_network_access','msg22'), 'warning',"");
		return 1;
	}
	
	return 0;
}
function chk_iso_share_name()
{
	var path = $("#iso_table input[name='settings_utilitiesISOShareName_text']").attr('rel');
	var s_name = $("#iso_table input[name='settings_utilitiesISOShareName_text']").val();
			
	iso_error_flag=0
	flag = iso_share_exist(path,s_name);  	//1、比較已經設過的share name	
	
	if (s_name.length > 80) flag = 2;

  	//check share name 
  	//INVALID_SHARENAME_CHARS  %<>*?|/\+=;:", 和最後一個字元是$
  	if(flag==1)
  	{
  		var v = Chk_Samba_Share_Name(s_name)
  		if(v==1)
  		{
  			flag=3;
  			iso_error_flag = 2;
  		}
  		else if(v==2)
  		{
  			flag=3;
  			iso_error_flag=3;
  		}
  	}
  	else
  		iso_error_flag =1;

	if (iso_error_flag == 1)
        document.getElementById("iso_note").innerHTML = _T('_common','warning')+":"+_T('_network_access','msg1');
	else if(iso_error_flag==2)
		document.getElementById("iso_note").innerHTML = _T('_common','warning')+":"+_T('_network_access','msg19');
	else if(iso_error_flag==3)
		document.getElementById("iso_note").innerHTML = _T('_common','warning')+":"+_T('_network_access','msg20');
	else
	{
		document.getElementById("iso_note").innerHTML = "";
		$("#iso_table input[name='settings_utilitiesISOShareName_text']").removeClass('share_error');
	}
		  		
  	return iso_error_flag;
}
_SELECT_ITEMS  = new Array("volume1_f_dev_main","volume2_f_dev_main");
var _DIALOG = "";
var DEFAULT_SHARE_ARRAY = new Array("Public","SmartWare","TimeMachineBackup");
function get_volume_info(val)
{
	$("#select_menu2").html("");
	
	do_query_HD_Mapping_Info();
	
    var html_select_open = "";
    
    if(HDD_INFO_ARRAY.length >1)
    {
		html_select_open += '<ul>';
		html_select_open += '<li class="option_list">';          
		html_select_open += '<div id="volume2_f_dev_main" class="wd_select option_selected">';
		html_select_open += '<div class="sLeft wd_select_l"></div>';
		for( var i=0 in HDD_INFO_ARRAY)
		{
			var info = HDD_INFO_ARRAY[i].split(":");
			var volume_name = info[0];
			var volume_path = info[1];
			if(i==0 && HDD_INFO_ARRAY.length==1)
			{
				html_select_open += '<div class="sBody text wd_select_m" id="shares_volume_select" rel="' + volume_path + '">'+volume_name+'</div>';
				html_select_open += '<div class="sRight wd_select_r"></div>	';
				html_select_open += '</div>';
				html_select_open += '<ul class="ul_obj"><div>'; 
				html_select_open += '<li rel="' + volume_path + '" class="li_start li_end"><a href=\"#\">' + volume_name + '</a></li>';
			}
			else if(i==0) 
			{
				html_select_open += '<div class="sBody text wd_select_m" id="shares_volume_select" rel="' + volume_path + '">'+volume_name+'</div>';
				html_select_open += '<div class="sRight wd_select_r"></div>	';
				html_select_open += '</div>';
				html_select_open += '<ul class="ul_obj"><div>';
				html_select_open += '<li rel="' + volume_path + '" class="li_start"><a href=\"#\">' + volume_name + '</a></li>';
			}
			else if(i==HDD_INFO_ARRAY.length-1) 
				html_select_open += '<li rel="' + volume_path + '" class="li_end"><a href=\"#\">' + volume_name + '</a></li>';
			else
			{
				html_select_open += '<li rel="' + volume_path + '"><a href=\"#\">' + volume_name + '</a></li>';
			}
		}
	
		html_select_open += '</div></ul>';
		html_select_open += '</li>';
		html_select_open += '</ul>';
	}
	else if(HDD_INFO_ARRAY.length==1)
	{
		var info = HDD_INFO_ARRAY[0].split(":");
		var volume_name = info[0];
		var volume_path = info[1];
		html_select_open += '<div id="shares_volume_select" rel="' + volume_path + '">'+volume_name+'</div>';
		$("#volume_select").hide();
	}
	
	$("#select_menu2").append(html_select_open);
	
	hide_select();
	init_select();
}
function show_webdav_rw_options(obj,val)
{
	var r=_T('_network_access','read_only');
	var w=_T('_network_access','read_write');

	var sel_option="";
	switch(val)
	{
		case '0':
			sel_option = r;
			break;
		case '1':
			sel_option = w;
			break;
	}
	
	var options = "";
	options += '<ul>';
	options += '<li class="option_list">';          
	options += '<div id="webdav_dev_main" class="wd_select option_selected" tabindex="0">';
	options += '<div class="sLeft wd_select_l"></div>';
	options += '<div class="sBody text wd_select_m" id="webdav_dev" rel="' + val + '">'+ sel_option +'</div>';
	options += '<div class="sRight wd_select_r"></div>';
	options += '</div>';
	options += '<ul class="ul_obj">'; 
	options += '<li rel="0" class="li_start"><a href=\"#\" onclick=\'show1("id_webdav_save")\'>' + r + "</a></li>";
	options += '<li rel="1" class="li_end"><a href=\"#\" onclick=\'show1("id_webdav_save")\'>' + w + "</a></li>";
	options += '</ul>';
	options += '</li>';
	options += '</ul>';

	$(obj).empty();
	$(obj).append(options);
	
	hide_select();
	init_select();
}
function show_ftp_anonymous_options(obj,val,dev_name1,dev_name2,button_name)
{
	var n=_T('_network_access','anonymous_none');
	var r=_T('_network_access','anonymous_read_only');
	var w=_T('_network_access','anonymous_write');
	
	var sel_option="";
	switch(val)
	{
		case 'n':
			sel_option = n;
			break;
		case 'r':
			sel_option = r;
			break;
		case 'w':
			sel_option = w;
			break;
		default:
			sel_option = n;
			break;
	}
	
	var options = "";
	options += '<ul>';
	options += '<li class="option_list">';          
	options += '<div id="' + dev_name1 + '" class="wd_select option_selected" tabindex="0">';
	options += '<div class="sLeft wd_select_l"></div>';
	options += '<div class="sBody text wd_select_m" id="' + dev_name2 + '" rel="' + val + '">'+ sel_option +'</div>';
	options += '<div class="sRight wd_select_r"></div>';
	options += '</div>';
	options += '<ul class="ul_obj"><div>'; 
	options += '<li rel="n" class="li_start"><a href="#" onclick=\'show1("' + button_name + '")\'>' + n + "</a></li>";
	options += '<li rel="r"><a href="#" onclick=\'show1("' + button_name + '")\'>' + r + "</a></li>";
	options += '<li rel="w" class="li_end"><a href="#" onclick=\'show1("' + button_name + '")\'>' + w + "</a></li>";
	options += '</div></ul>';
	options += '</li>';
	options += '</ul>';
	
	$(obj).empty();
	$(obj).append(options);
	
	hide_select();
	init_select();
}
var __SHARE_LIST_INFO = new Array();
var __SERVICE_INFO = new Array();
var __SHARE_CREATED_BY_USER=0;
function get_share_list(c_share,get_type ,callback)
{
	__SHARE_LIST_INFO = new Array();
	__SHARE_CREATED_BY_USER = 0;
	
	if(c_share=="")
	{
		$("#shares_removeShare_button").addClass("gray_out");
	}

	wd_ajax({
		type: "POST",
		cache: false,
		url: "/xml/smb.xml",
		dataType: "xml",
		success: function(xml){
			
			$(".LightningSubMenu").empty();
			
			show_tip();
			var idx=0;
			$(xml).find('item').each(function(){
				var name = $(this).find('name').text();
				var path = $(this).find('path').text();
				var read_list = $(this).find('read_list').text();
				var write_list = $(this).find('write_list').text();
				var invalid_users = $(this).find('invalid_users').text();
				var comment = $(this).find('comment').text();
				var recycle = $(this).find('recycle_enable').text();
				var public = $(this).find('web_public').text();
				var media = $(this).find('media_flag').text();
				var oplocks = $(this).find('oplocks').text();
				var remote = $(this).find('remote_access').text();
				
				if(api_filter_share(path)==1) //in users.js
				{
					return true;
				}

				__SHARE_LIST_INFO[idx] = new Array();
				__SHARE_LIST_INFO[idx].name = name;
				__SHARE_LIST_INFO[idx].path = path;
				__SHARE_LIST_INFO[idx].read_list = read_list;
				__SHARE_LIST_INFO[idx].write_list = write_list;
				__SHARE_LIST_INFO[idx].invalid_users = invalid_users;
				__SHARE_LIST_INFO[idx].comment = comment;
				__SHARE_LIST_INFO[idx].recycle = recycle;
				__SHARE_LIST_INFO[idx].public = public;
				__SHARE_LIST_INFO[idx].media = media;
				__SHARE_LIST_INFO[idx].oplocks = oplocks;
				__SHARE_LIST_INFO[idx].remote = remote;
				idx++;
				var v = $.inArray(name,DEFAULT_SHARE_ARRAY );
				if(v==-1 && path.indexOf("/mnt/USB/")==-1)
				{
					__SHARE_CREATED_BY_USER++;
				}
			});
			
			__SHARE_LIST_INFO.sort(function(a, b){
			    var a1= a.name.toLowerCase() , b1= b.name.toLowerCase() ;
			    if(!b1) b1=a1;
			    if(a1== b1) return 0;
			    return a1> b1? 1: -1;
			});

			for(i in __SHARE_LIST_INFO)
			{
				var name = __SHARE_LIST_INFO[i].name;
				var path = __SHARE_LIST_INFO[i].path;
				var li_obj = document.createElement("li"); 
				$(li_obj).attr("id","shares_share_"+name);
				$(li_obj).html("<div class='ficon' rel='" + i +"'></div><div class='sName'>" + name + "</div>");
				$(li_obj).attr("title",name);
				$(li_obj).addClass("uTooltip");
				
				if(c_share!="" && c_share==name)
				{
					$(li_obj).addClass('LightningSubMenuOn');
					get_modify_session_info(name);
				}
				
				if(i==0)
				{
					$(li_obj).addClass('LightningSubMenuFirst');
					_EDIT_INFO.sharename = name;
					_EDIT_INFO.path = path;
					if(get_type=="del")
					{
						_SEL_INDEX=0;
						$(li_obj).addClass('LightningSubMenuOn');
						get_modify_session_info(name);
						
						currentIndex=1;
						$(".ButtonArrowTop").removeClass('gray_out').addClass('gray_out');
						$(".ButtonArrowBottom").removeClass('gray_out');
						scrollDivTop_User('SubMenuDiv');
					}
				}
				else if(i== (__SHARE_LIST_INFO.length-1))
				{
					$(li_obj).addClass('LightningSubMenuEnd');
				}
				
				$(li_obj).attr('tabindex','0');
				
				$(".LightningSubMenu").append($(li_obj));
				
				if(c_share!="" && c_share==name)
				{
					scrollDivBottom_User('SubMenuDiv');
				}
			}
			
			init_tooltip2(".uTooltip");
			
			if( __SHARE_LIST_INFO.length > 6)
			{
				$(".ButtonArrowTop").removeClass('disable');
				$(".ButtonArrowTop").addClass('enable');

				$(".ButtonArrowBottom").removeClass('disable');
				$(".ButtonArrowBottom").addClass('enable');
			}
			else
			{
				$(".ButtonArrowTop").addClass('disable');
				$(".ButtonArrowTop").removeClass('enable');

				$(".ButtonArrowBottom").addClass('disable');
				$(".ButtonArrowBottom").removeClass('enable');				
			}
			
			init_share_item_click();
			api_chk_share_max_number();

		if(callback) {callback()};
		},	
		error:function(xmlHttpRequest,error){   
			//alert("do_query_user_info->Error: " +error);   
		}
	});
}
var _INIT_M_FLAG=0;
function init_nfs_dialog(type)	//smb,iso
{
	var _TITLE = _T('_network_access','nfs_setting');
	$("#modifyShareDiag_title").html(_TITLE);
	
	init_button();
	language();
	
  	var modify_Obj=$("#modifyShareDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
  					onClose: function() {
  						setSwitch('#shares_nfs_switch',_NFS);
						(_NFS=='0') ?$("#shares_editNFS_link").hide() : $("#shares_editNFS_link").show()
					}});
	modify_Obj.load();
	_DIALOG = modify_Obj;

	ui_tab("#nfsDiag","#shares_nfsHost_text","#shares_editNFSSave_button");
	
	if(_INIT_M_FLAG==1) return;
	_INIT_M_FLAG=1;

	var host_str = _T('_tip','host');
	var root_str = _T('_tip','root');
	var write_str = _T('_tip','write');
	$("#tip_host").attr('title',host_str);
	$("#tip_root").attr('title',root_str);
	$("#tip_write").attr('title',write_str);
	
	//setSwitch('#shares_rootSquash_switch',0);
	//setSwitch('#shares_write_switch',0);
	//init_switch();
	
	//nfsDiag
	$("#shares_editNFSSave_button").click(function(){
		if(type=="smb") modify_share('nfs');
		else if(type=="iso") modify_iso_share('nfs');
	});
}
var _INIT_FLAG=0;
function init_create_share_dialog()
{
	get_volume_info();
	
	if(HDD_INFO_ARRAY.length==0)
	{
		jAlert( _T('_user','no_hdd'), 'warning');
		return;
	}
	
	var _TITLE = _T('_network_access','add_title');
	$("#createShareDiag_title").html(_TITLE);
	$("#create_share_tb input[name='shares_shareName_text']").val("");
	$("#create_share_tb input[name='shares_shareDesc_text']").val("");
	$("#ftp_anonymous2").hide();
	$("#nfs_conf_tb").hide();
	$("#nfs_conf_tb input[name='f_host2']").val("");
	
	setSwitch('#media_switch2',0);
	setSwitch('#ftp_switch2',0);
	setSwitch('#webdav_switch2',0);
	setSwitch('#nfs_switch2',0);
	setSwitch('#recycle_switch2',0);
	setSwitch('#root_switch2',0);
	setSwitch('#write_switch2',0);
	
	if(__SERVICE_INFO.ftp=="0")
	{
		$('#ftp_switch2').attr('disabled',true);
	}
	if(__SERVICE_INFO.nfs=="0")
	{
		$('#nfs_switch2').attr('disabled',true);
	}
	/*
	if(__SERVICE_INFO.media=="0")
	{
		$('#media_switch2').attr('disabled',true);
	}*/
	if(__SERVICE_INFO.webdav=="0")
	{
		$('#webdav_switch2').attr('disabled',true);
	}
	init_switch();
	$("input:text").inputReset();
	//init_button();
	language();

	var recycle_str=_T('_tip','recycle');
	var webdav_str = _T('_tip','webdav');
	var nfs_str = _T('_tip','nfs');
//	var host_str = _T('_tip','host');
//	var root_str = _T('_tip','root');
//	var write_str = _T('_tip','write');
	
	$("#tip_recycle").attr('title',recycle_str);
//	$("#tip_webdav").attr('title',webdav_str);
//	$("#tip_host").attr('title',host_str);
//	$("#tip_root").attr('title',root_str);
//	$("#tip_write").attr('title',write_str);
	
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
	
	$("#shareDiag").show();
	$("#applytoDiag").hide();
	$("#applytoDiag2").hide();
	
  	var Create_Obj=$("#createShareDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
  		        		onBeforeLoad: function() {
            				setTimeout(function(){
            					$('#create_share_tb input[name=shares_shareName_text]').focus();
            			},100);
            		}});
	Create_Obj.load();
	_DIALOG = Create_Obj;	
	
	if(_INIT_FLAG==1) return;
	_INIT_FLAG=1;

	//shareDiag
	$("#shares_createSave_button").keydown(function(e){
		if (e.keyCode == 9) {
			$("#create_share_tb input[name=shares_shareName_text]").focus();
			return false;
		}
	});
	
	$("#shares_createSave_button").click(function(){
		
		var sharename = $("#create_share_tb input[name='shares_shareName_text']").val();
		var desc = $("#create_share_tb input[name='shares_shareDesc_text']").val();
		if(check_sharename(sharename)!=0)
		{
			$("#popup_ok_button").click( function (){
				$("#popup_ok_button").unbind("click");
				$("#create_share_tb input[name='shares_shareName_text']").focus();
			});
			return;
		}
		if(check_desc(desc)!=0)
		{
			$("#popup_ok_button").click( function (){
				$("#popup_ok_button").unbind("click");
				$("#create_share_tb input[name='shares_shareDesc_text']").focus();
			});
			return;
		}
		
		Create_Obj.close();
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		create_share();
				
		//$("#shareDiag").hide();
		//$("#applytoDiag").show();
	});
	
	//applytoDiag
	$("#back_button2").click(function(){
		$("#shareDiag").show();
		$("#applytoDiag").hide();
	});
	
	$("#next_button2").click(function(){
		$("#applytoDiag").hide();
		$("#applytoDiag2").show();
	});
	
	//applytoDiag2
	$("#back_button3").click(function(){
		$("#applytoDiag").show();
		$("#applytoDiag2").hide();
	});	

	$("#next_button3").click(function(){
		$("#applytoDiag").hide();
		$("#applytoDiag2").show();
	});
		
	$("#create_button").click(function(){
		
		//chk nfs 
		var nfs = getSwitch('#nfs_switch2');
		var hostname = $("#f_host2").val();

		if(nfs=="1")
		{
			var error=chk_nfs_host(hostname); //function.js
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

		Create_Obj.close();
		_DIALOG="";
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		create_share();

	});
		
}
var _Start = 1;
var _Stop = 0;
function create_share()
{
	var path = $("#shares_volume_select").attr("rel");
	var folder_name = $("#create_share_tb input[name='shares_shareName_text']").val();
	path = path + "/" + folder_name;
	
	var comment = $("#create_share_tb input[name='shares_shareDesc_text']").val();
	var recycle = getSwitch('#recycle_switch2');
	var media = getSwitch('#media_switch2');
	var ftp = getSwitch('#ftp_switch2');
	var webdav = getSwitch('#webdav_switch2');
	var nfs = getSwitch('#nfs_switch2');
	
	var ftp_anonymous = $("#ftp_dev2").attr("rel");
	var hostname = $("#f_host2").val();
	var rootsquash = getSwitch('#root_switch2');
	var rw = getSwitch('#write_switch2');
	
	//var userlist = "#admin#,#nobody#,#@allaccount#";	//fish20140226 mark,ITR:88022
	var userlist="";
	var data = "cmd=cgi_create_share&path=" +  encodeURIComponent(path) + "&recycle=" + recycle + "&media=" + media+
				"&ftp=" + ftp +"&webdav=" + webdav + "&nfs=" + nfs+"&host=" + hostname +"&root_squash=" + rootsquash+
				"&write=" + rw + "&write_list=" + userlist + "&comment=" + encodeURIComponent(comment)+
				"&sharename=" + encodeURIComponent(folder_name) + "&ftp_anonymous=" + ftp_anonymous ;
		
	//stop ftp
	//do_ftp_service(_Stop);
		
	do_add_post();
	
	function do_add_post()
	{
		wd_ajax({
			type: "POST",
			cache: false,
			url: "/cgi-bin/share.cgi",
			data: data,
			dataType: "xml",
			success: function(xml){
				
				/*
				if(nfs=="1")
					do_add_nfs_share(hostname,path,rw,rootsquash);
			
				if(webdav=="1")
					do_add_webdav_share(folder_name,path,"1",userlist);
					
				do_ftp_service(_Start);
				do_restart_nfs_webdav(nfs,webdav);
				*/
				
				do_restart_service();//restart smb,afp...
				
				$('.LightningSubMenu li').each(function() {
					$(this).removeClass('LightningSubMenuOn');
		    	});
				var idx = $(".shareMenuList li").length;			    	
				var li_obj = document.createElement("li");
				$(li_obj).html( "<div class='ficon' rel='" + idx +"'></div><div class='sName'>" + folder_name + "</div>");
				$(".shareMenuList").append($(li_obj));
				$(li_obj).attr("title",folder_name);
				$(li_obj).addClass("uTooltip");
				init_tooltip2(".uTooltip");
				
				$(li_obj).addClass('LightningSubMenuOn');
				_SEL_INDEX = idx;
				__SHARE_LIST_INFO[_SEL_INDEX] = new Array();
				__SHARE_LIST_INFO[_SEL_INDEX].name = folder_name;
				__SHARE_LIST_INFO[_SEL_INDEX].path = path;
				__SHARE_LIST_INFO[_SEL_INDEX].recycle = "0";
				__SHARE_LIST_INFO[_SEL_INDEX].comment = comment;
				__SHARE_LIST_INFO[_SEL_INDEX].oplocks = "yes";
				__SHARE_LIST_INFO[_SEL_INDEX].media = media;
				__SHARE_LIST_INFO[_SEL_INDEX].public = "1";
				__SHARE_LIST_INFO[_SEL_INDEX].read_list = "";
				__SHARE_LIST_INFO[_SEL_INDEX].write_list = "";
				__SHARE_LIST_INFO[_SEL_INDEX].invalid_users = "";
				__SHARE_LIST_INFO[_SEL_INDEX].remote = "";
					
				get_modify_session_info(folder_name);
								
				init_share_item_click();
				__SHARE_CREATED_BY_USER++;
				api_chk_share_max_number();
				
				if(idx > 5 )
				{
					$(".ButtonArrowTop").removeClass('disable').addClass('enable');
					$(".ButtonArrowBottom").removeClass('disable').addClass('enable');
					currentIndex = Math.ceil($(".shareMenuList li").length/moveItem);
					$(".ButtonArrowTop").removeClass('gray_out');
					$(".ButtonArrowBottom").addClass('gray_out');
					scrollDivBottom_User('SubMenuDiv');
				}
					
				jLoadingClose();
			},
			error:function(xmlHttpRequest,error){   
				//alert("Error: " +error);   
			}
		});	
	}
}
var _EDIT_INFO= new Array();
var _NFS="";
//var Default_Share = ["Volume_1","Volume_2","Volume_3","Volume_4","P2P","aMule"];
var Default_Share = ["P2P","aMule"];
function get_modify_session_info(sharename)
{
	$("#shares_removeShare_button").removeClass("gray_out");
	
	$("#shares_descSave_button").css('visibility', 'hidden');
	$("#shares_ftpSave_button").css('visibility', 'hidden');
	$("#shares_editNFS_link").hide();
	$("#share_desc").hide();
	$("#userlist_div").show();
	
	$("#shares_removeShare_button").removeClass('gray_out');
	
	//P2P
	if(sharename==Default_Share[0] && __SERVICE_INFO.p2p=='1')
	{
		$("#shares_removeShare_button").addClass('gray_out');
	}
	
	//aMule
	if(sharename==Default_Share[1] && __SERVICE_INFO.aMule=='1')
	{
		$("#shares_removeShare_button").addClass('gray_out');
	}

	var path = __SHARE_LIST_INFO[_SEL_INDEX].path;
	var webdav = "";
	var ftp = "";
	var ftp_anonymous = "";
	var nfs = "";
	var nfs_real_path = "";
	var nfs_host = "";
	var nfs_write = "";
	var nfs_root = "";
	var ip = "";
	var recycle = __SHARE_LIST_INFO[_SEL_INDEX].recycle;
	var comment = __SHARE_LIST_INFO[_SEL_INDEX].comment;
	var oplocks = __SHARE_LIST_INFO[_SEL_INDEX].oplocks;
	var media = __SHARE_LIST_INFO[_SEL_INDEX].media;
	var public_flag = __SHARE_LIST_INFO[_SEL_INDEX].public;
	var read_list = __SHARE_LIST_INFO[_SEL_INDEX].read_list;
	var write_list = __SHARE_LIST_INFO[_SEL_INDEX].write_list;
	var invalid_users = __SHARE_LIST_INFO[_SEL_INDEX].invalid_users;
	var usage = "";
	var remote = __SHARE_LIST_INFO[_SEL_INDEX].remote;

	//nfs
	var exfatFlag=0;
	if(NFS_FUNCTION==1 || MODEL_NAME=="GLCR" || MODEL_NAME=="BAGX")
	{
		if(path.indexOf("/mnt/USB/")!=-1)
		{
			if(get_usb_fs(path)=='exfat')
			{
				exfatFlag=1;
				$("#nfs_tr,#nfs_tr2").hide();
			}
		}
		
		if(exfatFlag==0)$("#nfs_tr,#nfs_tr2").show();
	}
	
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/share.cgi",
		data: "cmd=cgi_get_modify_session&sharename=" +  encodeURIComponent(sharename) + 
				"&path=" + encodeURIComponent(__SHARE_LIST_INFO[_SEL_INDEX].path),
		dataType: "xml",
		success: function(xml){			
			usage = $(xml).find('usage').text();
			ftp = $(xml).find('ftp').text();
			ftp_anonymous = $(xml).find('ftp_anonymous').text();
			
			webdav =  $(xml).find('webdav').text();
			
			nfs = $(xml).find('nfs > status').text();
			nfs_real_path = $(xml).find('nfs > real_path').text();
			nfs_host = $(xml).find('nfs > host').text();
			nfs_write = $(xml).find('nfs > write').text();
			nfs_root = $(xml).find('nfs > root_squash').text();
			ip = $(xml).find('ip').text();
			
			__SHARE_LIST_INFO[_SEL_INDEX].host = nfs_host;
			__SHARE_LIST_INFO[_SEL_INDEX].nfs = nfs;
			_EDIT_INFO.sharename = sharename;
			_EDIT_INFO.path = path;
			_EDIT_INFO.ip = ip;
			_NFS = nfs;
			
			$("#nfs_real_path").html("");
			hide_button("shares_shareNameSave_button");
			hide_button("shares_descSave_button");
			hide_button("shares_ftpSave_button");
			
			_get_usage();
			_display_info();
		},
		error:function(xmlHttpRequest,error){   
			//alert("Error: " +error);   
		}
	});

	var xhr;
	function _get_usage()
	{
		$("#shares_usage_value").html("<div style='float:left'><img src='/web/images/spinner.gif?r=20150204'>&nbsp;</div> <div style='float:left;margin-top:-1px;'>" + _T('_common','loading') + "</div>");
        if(xhr && xhr.readystate != 4)
        {
            xhr.abort();
        }
		xhr = $.ajax({
			type: "POST",
			cache: false,
			url: "/cgi-bin/share.cgi",
			data: "cmd=cgi_get_folder_usage&sharename=" +  "&path=" + encodeURIComponent(__SHARE_LIST_INFO[_SEL_INDEX].path),
			dataType: "xml",
			success: function(xml){			
				usage = $(xml).find('usage').text();
    			setTimeout(function(){
				$("#shares_usage_value").empty().html(usage);
    			},500);
		},
		error:function(xmlHttpRequest,error){   
			//alert("Error: " +error);   
		}
	});
	}
	function _display_info()
	{
		if(path.indexOf("/mnt/media/")!=-1)
		{
			$("#share_detail").hide();
			$("#usb_share_detail").show();
			
			$("#usb_sharename_info").html(sharename);
			$("#usb_desc_info").html(comment);
			
			$("#shares_removeShare_button").addClass('gray_out');
			
			var YES = _T('_button','yes');
			var NO = _T('_button','no');
			(webdav=='1')? $("#usb_webdav_info").html(YES):$("#usb_webdav_info").html(NO);
			(ftp=='1')? $("#usb_ftp_info").html(YES):$("#usb_ftp_info").html(NO);
			(nfs=='1')? $("#usb_nfs_info").html(YES):$("#usb_nfs_info").html(NO);
			(recycle=='1')? $("#usb_recycle_info").html(YES):$("#usb_recycle_info").html(NO);
			(remote=='1')? $("#usb_remote_info").html(YES):$("#usb_remote_info").html(NO);
			
			if(nfs=='1')
			{
				$("#nfs_real_path").html( _T('_nfs','msg2')+": "+"nfs://" + _EDIT_INFO.ip + "/nfs/"+ translate_path_to_display(path));
			}
		
			/*if(path.indexOf("/mnt/media/")!=-1)
			{
				(media=='1')? $("#usb_media_info").html(YES):$("#usb_media_info").html(NO);
			}
			else*/
			{
				var onoff ='<input id="usb_media_switch" name="usb_media_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">'
				$("#usb_media_info").html(onoff);
				setSwitch('#usb_media_switch',media);
				init_switch();
				
				$("#usb_media_switch").unbind('click');
			    $("#usb_media_switch").click(function(){
			    	if($("#usb_media_switch").hasClass("gray_out")) return;
			    	modify_share('usb_media');
				});
			}
		}
		else
		{
			if(path.indexOf("/mnt/USB/")!=-1)
			{
				$("#shares_removeShare_button").addClass('gray_out');
				$("#recycle_tr").hide();
			}
			else
			{
				if(RECYCLE_BIN_FUNCTION==1)
				{
					$("#recycle_tr").show();
				}
			}
			
			$("#share_detail").show();
			$("#usb_share_detail").hide();
			
			$("#shares_editShareName_text").val(sharename);
			
			$("#edit_share_tb input[name='shares_editShareDesc_text']").val(comment);
			setSwitch('#shares_media_switch',media);
			setSwitch('#shares_ftp_switch',ftp);
			setSwitch('#shares_webdav_switch',webdav);
			setSwitch('#shares_nfs_switch',nfs);
			setSwitch('#shares_recycle_switch',recycle);
			setSwitch('#shares_remoteAccess_switch',remote);
			if(nfs=='1')
			{
				$("#nfs_real_path").html( _T('_nfs','msg2')+": " + "nfs://" + _EDIT_INFO.ip + "/nfs/" +translate_path_to_display(path));
			}
							
			if(oplocks=="yes") 
				oplocks="1";
			else
				oplocks="0";
			
			setSwitch('#shares_oplocks_switch',oplocks);
			
			var v_info = api_map_hd_name(path);
			
			$('#vinfo_tr').hide();
			//if(VOLUME_INFO.length >0)
			if(VOLUME_NUM!=1)
			{
				$('#vinfo_tr').show();
				$('#volume_info').html(v_info.name).show();
			}
			
			//media------------------------------------------
			/*
			if(__SERVICE_INFO.media=="1")
			{
				$("#media_switch").attr('disabled',false);
			}
			else
			{
				$("#media_switch").attr('disabled',true);
			}*/
			
			//webdav-----------------------------------------
			if(__SERVICE_INFO.webdav=="1")
			{
				$("#shares_webdav_switch").attr('disabled',false);
			}
			else
			{
				$("#shares_webdav_switch").attr('disabled',true);
			}
			
			//ftp-----------------------------------------
			if(__SERVICE_INFO.ftp=="1")
			{
				if(ftp=='1') 
				{
					$("#shares_ftpAnonymous_select").show();
				}
				else
				{
					$("#shares_ftpAnonymous_select").hide();
				}
				show_ftp_anonymous_options('#shares_ftpAnonymous_select',ftp_anonymous,"ftp_dev_main","ftp_dev","shares_ftpSave_button");
			}
			else
			{
				$("#shares_ftp_switch").attr('disabled',true);
			}
			
			if(__SERVICE_INFO.nfs=="1")
			{
				//nfs-----------------------------------------
				if(nfs=='1')
				{
					$("#shares_editNFS_link").show();
					$("#shares_nfsHost_text").val(nfs_host);
					setSwitch('#shares_write_switch',nfs_write);
					setSwitch('#shares_rootSquash_switch',nfs_root);
				}
				else
				{
					$("#shares_editNFS_link").hide();
					$("#shares_nfsHost_text").val("*");
					setSwitch('#shares_write_switch',0);
					setSwitch('#shares_rootSquash_switch',0);
				}
			}
			else
			{
				$("#shares_nfs_switch").attr('disabled',true);
			}
		}
		
		
		//if(write_list=="#nobody#,#@allaccount#")
		if(public_flag=='1')
		{
			setSwitch('#shares_public_switch',1);
			if(!$("#mask_id").hasClass('gray_out'))
				$("#mask_id").addClass('gray_out')
		}
		else
		{
			$("#mask_id").removeClass('gray_out')
			setSwitch('#shares_public_switch',0);
		}

		if(__SERVICE_INFO.dlna=="0" && __SERVICE_INFO.itunes=="0")
		{
			$("#shares_media_switch").attr('disabled',true);
		}
		else
		{
			$("#shares_media_switch").attr('disabled',false);
		}
					
		if(sharename=="Public" || sharename=="Public_2" || sharename=="Public_3" || sharename=="Public_4")
		{
			$("#shares_public_switch").attr('disabled',false);
			//$("#poblic_tr").hide();
			$("#edit_sharename_tb").hide();
			$("#show_sharename_tb").show();
			$("#show_sharename_span").html(sharename);
		}
		else
		{
			$("#shares_public_switch").attr('disabled',false);
			$("#poblic_tr").show();
			$("#edit_sharename_tb").show();
			$("#show_sharename_tb").hide();
		}
		
		//$("#shares_usage_value").empty().html(usage);
		show_user_list(read_list,write_list,invalid_users,public_flag);
		init_switch();
		
		$("input:text").inputReset();
	}
			
			
/*									
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/share.cgi",
		data: "cmd=cgi_get_modify_session&sharename=" +  encodeURIComponent(sharename),	
		dataType: "xml",
		success: function(xml){
			var read_list = $(xml).find('read_list').text();
			var write_list = $(xml).find('write_list').text();  
			var invalid_users = $(xml).find('invalid_users').text();
			var comment = $(xml).find('comment').text();
			var path = $(xml).find('path').text();
			var recycle = $(xml).find('recycle').text();
			var public_flag = $(xml).find('public').text();
			var oplocks = $(xml).find('oplocks').text();
			
			var ftp = $(xml).find('ftp').text();
			var ftp_anonymous = $(xml).find('ftp_anonymous').text();
			
			var media =  $(xml).find('media').text();
			
			var webdav =  $(xml).find('webdav').text();
			var webdav_rw =  $(xml).find('webdav_rw').text();
			
			var nfs = $(xml).find('nfs > status').text();
			var nfs_real_path = $(xml).find('nfs > real_path').text();
			var nfs_host = $(xml).find('nfs > host').text();
			var nfs_write = $(xml).find('nfs > write').text();
			var nfs_root = $(xml).find('nfs > root_squash').text();
			var ip = $(xml).find('ip').text();
			
			var new_sname = sharename.replace(/&nbsp;/g,' ');
			new_sname = new_sname.replace(/&amp;/g,'&');
			new_sname = new_sname.replace(/&apos/g,'\'');			
			_EDIT_INFO.sharename = new_sname;
			_EDIT_INFO.path = path;
			_EDIT_INFO.ip = ip;
			_NFS = nfs;
			
			$("#nfs_real_path").html("");
			

		},
		error:function(xmlHttpRequest,error){   
			//alert("Error: " +error);   
		}
	});
*/
}
/*
<ul class="UserListDiv">	
	<li>
		<div class="icon"></div>
		<div class="name">aaaa</div>
		<div class="img">
			<a class="rwDown" href="#"></a><a class="rUp" href="#"></a><a class="dUp" href="#"></a>
		</div>
		<div class="access">RW</div>
	</li>
</ul>*/
function show_user_list(read_list,write_list,invalid_users,public_flag)
{
	$("#userlist_ul").empty();
	
	var decline = _T('_network_access','decline');
	var read_only = _T('_network_access','read_only');
	var read_write = _T('_network_access','read_write');
	var public = _T('_network_access','public');
	var no_access = _T('_network_access','no_access');
	
	for(i=0;i < AllUserList.length;i++)
	{
		var user_name = AllUserList[i].name;
		var uid = AllUserList[i].uid;
		var gid = AllUserList[i].gid;
		var type = AllUserList[i].type;
		
		var user_name_tmp = "#" + user_name + "#";
		//user_name_tmp = user_name_tmp.replace(/\\/g,'+');
		var iconClass = "usericon";
		if( type=="local")
		{
			if(gid==_ADMIN_GID || uid==_ADMIN_UID)
			{
				iconClass= "adminicon";
			}
		}
		else
		{
			//ad mode
			var tmp_name = user_name.split("+")[1];
			if(tmp_name=="Administrator")
			{
				iconClass= "adminicon";
			}
		}

		var li_obj = document.createElement("li");
		$(li_obj).append('<div class="' + iconClass + '"></div>');
		$(li_obj).append('<div class="name">' + user_name + '</div>');
		$(li_obj).attr('src',type);
		
		var imgdiv_obj = document.createElement("div"); 
		$(imgdiv_obj).addClass('img');
		var access_flag="";
		if(invalid_users.length!=0 && access_flag.length==0)
		{	
			if(invalid_users.indexOf("#@allaccount#")!=-1 || invalid_users.indexOf(user_name_tmp)!=-1)
			access_flag="d";
		}
		if(write_list.length!=0 && access_flag.length==0)
		{
					if(write_list.indexOf("#@allaccount#")!=-1 || write_list.indexOf(user_name_tmp)!=-1)
			access_flag="rw";			
		}		
		if(read_list.length!=0 && access_flag.length==0)
		{
					if(read_list.indexOf("#@allaccount#")!=-1 || read_list.indexOf(user_name_tmp)!=-1)
			access_flag="r";
		}

		if(access_flag.length==0)
		{
			access_flag="none";	//user not in list
		}
		
		if(public_flag==1)
		{
			access_flag="public";
		}
	
		switch(access_flag)
		{
					case 'none':
			case 'd':
				$(imgdiv_obj).append('<a class="rwUp" onKeyPress="set_smb_access2(this,\'rw\',event)" onclick="set_smb_access(this,\'rw\')"></a><a class="rUp" onKeyPress="set_smb_access2(this,\'r\',event)" onclick="set_smb_access(this,\'r\')"></a><a class="dDown" onKeyPress="set_smb_access2(this,\'d\',event)" onclick="set_smb_access(this,\'d\')"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ decline + '</div>');
				break;
			case 'r':
				$(imgdiv_obj).append('<a class="rwUp" onKeyPress="set_smb_access2(this,\'rw\',event)" onclick="set_smb_access(this,\'rw\')"></a><a class="rDown" onKeyPress="set_smb_access2(this,\'r\',event)" onclick="set_smb_access(this,\'r\')"></a><a class="dUp" onKeyPress="set_smb_access2(this,\'d\',event)" onclick="set_smb_access(this,\'d\')"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ read_only + '</div>');
				break;
			case 'rw':
				$(imgdiv_obj).append('<a class="rwDown" onKeyPress="set_smb_access2(this,\'rw\',event)" onclick="set_smb_access(this,\'rw\')"></a><a class="rUp" onKeyPress="set_smb_access2(this,\'r\',event)" onclick="set_smb_access(this,\'r\')"></a><a class="dUp" onKeyPress="set_smb_access2(this,\'d\',event)" onclick="set_smb_access(this,\'d\')"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ read_write + '</div>');
				break;
			case 'public':
				$(imgdiv_obj).append('<a class="rwUp" onKeyPress="set_smb_access2(this,\'rw\',event)" onclick="set_smb_access(this,\'rw\')"></a><a class="rUp" onKeyPress="set_smb_access2(this,\'r\',event)" onclick="set_smb_access(this,\'r\')"></a><a class="dUp" onKeyPress="set_smb_access2(this,\'d\',event)" onclick="set_smb_access(this,\'d\')"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ public + '</div>');						
				break;
					/*
			case 'none':
				$(imgdiv_obj).append('<a class="rwUp" onKeyPress="set_smb_access2(this,\'rw\',event)" onclick="set_smb_access(this,\'rw\')"></a><a class="rUp" onKeyPress="set_smb_access2(this,\'r\',event)" onclick="set_smb_access(this,\'r\')"></a><a class="dUp" onKeyPress="set_smb_access2(this,\'d\',event)" onclick="set_smb_access(this,\'d\')"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ no_access+ '</div>');						
						break;*/
		}
		$("#userlist_ul").append($(li_obj));
	}

    $("#userlist_ul a").each(function(idx){
    	if (!$(this).parent().parent().hasClass('gray_out'))
    		$(this).attr('tabindex','0');
    	
    	var i = Math.floor(idx/3);
    	if($(this).hasClass('rwUp') || $(this).hasClass('rwDown'))
    	{
    		$(this).attr("id","shares_rw" + i + "_link");
    	}
    	else if($(this).hasClass('rUp') || $(this).hasClass('rDown'))
    	{
    		$(this).attr("id","shares_r" + i + "_link");
    	}
    	else if($(this).hasClass('dUp') || $(this).hasClass('dDown'))
    	{
    		$(this).attr("id","shares_d" + i + "_link");
    	}
    });
	
}
function check_sharename(sharename)
{
	var slen=sharename.length;
	if (slen == 0) 
	{
		jAlert(_T('_network_access','msg9'), 'warning',"");
		return 1;
	}
	
	if (slen > 80) 
	{
		jAlert(_T('_network_access','msg1'), 'warning',"");
		return 2;
	}
	
	if(share_exist(sharename)!=0) return 3;
	
	/* move to Chk_Samba_Share_Name()
	if(Chk_Folder_Name(sharename)!=0) 
	{
		jAlert(_T('_network_access','msg23'), 'warning',"");
		return 4;
	}*/
	
	if(sharename.indexOf(" ")!=-1)
	{
		jAlert(_T('_network_access','msg25'), 'warning',"");
		return 5;
	}
	//INVALID_SHARENAME_CHARS  %<>*?|/\+=;:", 和最後一個字元是$ 和 .
	if(Chk_Samba_Share_Name(sharename)!=0) return 5;
	if(chk_rejected_sharename(sharename)!=0) return 6;
	return 0;
}
function check_desc(desc)
{
	if(desc.length > 128) 
	{
		jAlert(_T('_network_access','msg22'), 'warning',"");
		return 1;
	}
	
	return 0;
}
function Chk_Samba_Share_Name(sharename)
{
	//return 1:	not a valid name
	var re=/[%<>*?|/\\+=;:"@#!~\[\]]/;	//wd case add @ # ! ~ (ITR No.: 78120) , add [] (MWARE-1252)
	if(re.test(sharename))
	{		
		jAlert(_T('_network_access','msg19'), 'warning',"");
 		return 1;
	}
	if(sharename.charAt(0)=="." || sharename.charAt(0)=="&" || sharename.charAt(0)=="#")
	{
		jAlert(_T('_network_access','msg21'), 'warning',"");
		return 3;
	}
	
	//INVALID_SHARENAME_CHARS  %<>*?|/\+=;:", 和最後一個字元是$ 和 .
	if(sharename.charAt(sharename.length-1)=="$" || sharename.charAt(sharename.length-1)==".")
	{
		jAlert(_T('_network_access','msg20'), 'warning',"");
		return 2;
	}
	
	var space_count = sharename.split(" ");
	if(space_count.length == sharename.length+1)
	{
		jAlert(_T('_network_access','msg9'), 'warning',"");
		return 4;
	}
	return 0;
}
function Chk_Folder_Name(FolderName)
{
	//return 1:	not a valid name
	
	var re=/[\\/:*?"<>|]/;
	if(re.test(FolderName))
	{
 		return 1;
	}

	//if(FolderName.charAt(0)=="." || FolderName.charAt(FolderName.length-1)==".")
	//	return 2;

	return 0;
}
var reject_sharename = ["CON","PRN","AUX","NUL","COM1","COM2","COM3","COM4","COM5","COM6","COM7","COM8","COM9",
						"LPT1","LPT2","LPT3","LPT4","LPT5","LPT6","LPT7","LPT8","LPT9","VOLUME_1","VOLUME_2"
						,"VOLUME_3","VOLUME_4","P2P","AMULE"];
function chk_rejected_sharename(name)
{
	//var v = reject_sharename.indexOf(name.toUpperCase())
	var v = $.inArray(name.toUpperCase(),reject_sharename );
	if(v!=-1)
	{
		var msg = _T('_network_access','msg24').replace(/%s/g,name);
		jAlert(msg, 'warning',"");
		return 1;
	}
	else
		return 0;
}
function share_exist(name)
{
//	for (var i=0;i<__ISO_NAME.length;i++)
//	{   
//		if (name == __ISO_NAME[i])
//			return 2;
//	}
	var root_path = $("#shares_volume_select").attr("rel");
	
	var real_path =  root_path + "/" +name;
	
	for (var i = 0;i<__SHARE_LIST_INFO.length;i++)
	{
		if (real_path == __SHARE_LIST_INFO[i].path)
		{
			jAlert(_T('_network_access','msg11'), 'warning',"");
			return 1;
		}
		
		if (name.toUpperCase() == __SHARE_LIST_INFO[i].name.toUpperCase())
		{
			jAlert(_T('_network_access','msg1'), 'warning',"");
			return 2;
		}
	}

	if(chk_vv_sharename(name)=='1') 
	{
		jAlert(_T('_network_access','msg1'), 'warning',"");
		return 2;
	}
	
	return 0;
}
function chk_vv_sharename(name)
{
	var res="";
	wd_ajax({
		url:"/web/php/chk_vv_sharename.php",
		type:"GET",
		data:{vv_sharename:name},
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml)
		{	
			res = $(xml).find("res").text();
		}
	});	// end of ajax
	
	return res;
}
function do_add_nfs_share(host,path,rw,rootsquash)
{	
	var str = "cmd=cgi_set_nfs_share" + "&host=" + encodeURIComponent(host) + "&path=" + encodeURIComponent(path)+
			"&rw=" + rw +"&rootsquash=" + rootsquash;
			
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: str,
		success: function(data){
		}
	});
}
function do_add_webdav_share(sharename,path,rw,user)
{
	var webdav_list = "";	
	var webdav_share_path = "",webdav_path = "";
	var webdav_rw="";
	var read_list = "",write_list="";	
	
	//todo:
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webdav_mgr.cgi",
		data:{cmd:"Webdav_Account_merge",f_share_name:encodeURIComponent(sharename),f_path:encodeURIComponent(path),f_rw:rw,f_user:user,webdav:"1"},  
		success:function(xml)
		{
		  	
		},
		error:function(xmlHttpRequest,error){   
			//alert("do_add_webdav_share() - Fail...");
			//$("#flex1").flexReload();
		}
	});
}
function do_ftp_service(type)
{
	//type:	0 stop
	//		1 start
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_ftp_service" ,type:type},
		success: function(data){
						//you can to add:
					}
		});
}
function do_restart_service()
{
	//smb,afp
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_restart_service"},
		success: function(data){
		}
	});
}
function do_restart_nfs_webdav(type,nfs,webdav)
{
	//nfs,webdav
//	if(type==1)
//	{	
//		nfs = $("#s_share_tab input[name='nfs1']").prop("checked");
//		webdav = $("#s_share_tab input[name='webdav1']").prop("checked");
//	}
//	else
//	{
//		nfs = $("#s_m_share_tab input[name='nfs1']").prop("checked");
//		webdav = $("#s_m_share_tab input[name='webdav1']").prop("checked");		
//	}
						
     wd_ajax({
      type: "POST",
      async: false,
      cache: false,
      url: "/cgi-bin/webdav_mgr.cgi",
      data: { cmd:"cgi_restart_service",nfs:nfs,webdav:webdav
          	},
      		success: function(){

      		},
            error:function(xmlHttpRequest,error){}                              
      });
}
function remove_share()
{
	var hostname = "";
	var sharename = "",path="";
	var smb_info = get_current_share_item();
	hostname = smb_info.hostname;
	sharename = smb_info.sharename;
	path = smb_info.path;

			if(sharename=="Public")
			{
				jAlert( errorsList['error_id_127'], _T('_common','error'));
				return;
			}
			
	jConfirm('M',_T('_network_access','del_desc'),_T('_network_access','del_title'),"share",function(r){
		if(r)
		{
			//alert("name"+ encodeURIComponent(sharename) + "\npath=" + encodeURIComponent(path) + "\nhost=" + encodeURIComponent(hostname) + "\nsmb_path=" + encodeURIComponent(path))
			jLoading(_T('_common','set') ,'loading' ,'s',"");
			wd_ajax({
			type: "POST",
				async: true,
				cache: false,
				url: "/cgi-bin/account_mgr.cgi",
				data:{cmd:"cgi_del_session",name:sharename,path:path,
						host:hostname,smb_path:path},
				success: function(data){
						webdav_del_share(0,path);
						get_share_list("","del",function(){
							
						if(__SHARE_LIST_INFO.length==0)
						{
							$("#share_desc").show();
						}
						jLoadingClose();
						});
					},
				error:function(xmlHttpRequest,error){}
			});
		}
    });
}
function webdav_del_share(flag,webdav_share_path)
{
	/*
		flag = 0 , webdav_share_path = Volume_1/test
		flag = 1 , webdav_share_path = /mnt/HD/HD_a2/
	*/
	
	//alert("f_flag=" + flag + "\nwebdav_share_path=" + webdav_share_path)
	wd_ajax({ 
		type: "POST",
		cache: false,
		url: "/cgi-bin/webdav_mgr.cgi",
		data:{cmd:"Webdav_Account_Del",f_flag:flag,f_path:webdav_share_path},  
		success:function(xml)
		{
		  	
		}
	});
}
function get_current_share_item()
{
	var _array = new Array();
    $('.shareMenuList li').each(function() {
		if($(this).hasClass('LightningSubMenuOn'))
		{
			var i = $(this).children().attr('rel');
			_array.sharename = __SHARE_LIST_INFO[i].name;
			_array.path = __SHARE_LIST_INFO[i].path;
			_array.hostname = __SHARE_LIST_INFO[i].host;
			return false;
		}
    });
	
    return _array;
}
function set_smb_access2(obj,flag,e)
{
	if (e.keyCode=='13')
		set_smb_access(obj,flag);
}
function set_smb_access(obj,flag)
{
	if ($("#mask_id").hasClass('gray_out')) return;
	
	if(_LOCAL_LOGIN==0)
	{
		jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
		return;
	}
			
	_DIALOG="";
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	var sharename="",path="",permission="";
	var smb_info = get_current_share_item();
	sharename = smb_info.sharename;
	path = smb_info.path;
    
	$(obj).parent().find('a:eq(0)').removeClass();
	$(obj).parent().find('a:eq(1)').removeClass();
	$(obj).parent().find('a:eq(2)').removeClass();
			
	switch(flag)
	{
		case 'rw':
			$(obj).parent().find('a:eq(0)').addClass('rwDown');
			$(obj).parent().find('a:eq(1)').addClass('rUp');
			$(obj).parent().find('a:eq(2)').addClass('dUp');
			$(obj).parent().next().html(_T('_network_access','read_write')	);
			flag=2;
			permission="RW";
			break;
		case 'r':
			$(obj).parent().find('a:eq(0)').addClass('rwUp');
			$(obj).parent().find('a:eq(1)').addClass('rDown');
			$(obj).parent().find('a:eq(2)').addClass('dUp');
			$(obj).parent().next().html(_T('_network_access','read_only') );
			flag=1;
			permission="RO";
			break;
		case 'd':
			$(obj).parent().find('a:eq(0)').addClass('rwUp');
			$(obj).parent().find('a:eq(1)').addClass('rUp');
			$(obj).parent().find('a:eq(2)').addClass('dDown');
			$(obj).parent().next().html(_T('_network_access','decline'));
			flag=3;
			permission="DENY";
			break;
	}
	
	var username=$(obj).parent().prev().html();
	var uType = $(obj).parent().parent().attr("src");
	if(uType=="ad")
		uType=1;
	else if(uType=="ldap")
		uType=2;
	else
		uType=0;
	
	/*
	if(username.indexOf("\\")!=-1)
	{
		username = username.replace(/\\/g,'+');
	}*/
	
	//console.log("access=[%d], username=[%s], sharename[%s]",flag,username,sharename)

	if(uType==1 || uType==2)
	{
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/share.cgi",
		data:{cmd:"cgi_set_share_access",access:flag,sharename:sharename,username:username,
				path:path,uType:uType},
		dataType: "xml",
		success:function(xml)
		{
			var read_list = $(xml).find("read_list").text();
			var write_list = $(xml).find("write_list").text();
			var invalid_users = $(xml).find("invalid_users").text();
			
			__SHARE_LIST_INFO[_SEL_INDEX].read_list = read_list;
			__SHARE_LIST_INFO[_SEL_INDEX].write_list = write_list;
			__SHARE_LIST_INFO[_SEL_INDEX].invalid_users = invalid_users;
		  	jLoadingClose();
		}
	});
}
	else
	{
		//local account
		_REST_Set_Share_Permission(sharename,username,permission);
	}
}

function api_map_hd_name(path)
{
	var v_info={
		name:"",
		path: ""
	}
	
	for( var i in All_Volume_Info)
	{
		var info = All_Volume_Info[i].split(":");
		var volume_name = info[0];
		var volume_path = info[1];
		
		if(path.indexOf(volume_path)!=-1)
		{
			v_info.name = volume_name;
			v_info.path = volume_path;
			break;
		}
	}

	return v_info;
}

function modify_share(mtype,val,obj)
{
	var sharename = "",path="";
	var smb_info = get_current_share_item();
	sharename = smb_info.sharename;
	var old_sharename = sharename;
	path = smb_info.path;
    
    var ftp="0",ftp_anonymous="";
    var comment="";
    var recycle="0";
    var media="0";
    var webdav="0",webdav_rw="";
    var nfs="0",host="",root_squash="",write="";
    var publicFlag="";
	var oplocks="";
	var remoteAccess="";
	switch(mtype)
	{
		case 'remoteAccess':
			remoteAccess = getSwitch('#shares_remoteAccess_switch');
			__SHARE_LIST_INFO[_SEL_INDEX].remote = remoteAccess;
			mflag=10;
			break;
		case 'desc':
			comment=$("#edit_share_tb input[name='shares_editShareDesc_text']").val();
			if(check_desc(comment)!=0)
			{
				$("#popup_ok_button").click( function (){
					$("#popup_ok_button").unbind("click");
					$("#edit_share_tb input[name='shares_editShareDesc_text']").focus();
				});
				return;
			}
			hide2("shares_descSave_button");
			__SHARE_LIST_INFO[_SEL_INDEX].comment = comment;
			mflag=1;
			break;
		case 'recycle':
			recycle = getSwitch('#shares_recycle_switch');
			__SHARE_LIST_INFO[_SEL_INDEX].recycle = recycle;
			mflag=2;
			break;
		case 'media':
			media = getSwitch('#shares_media_switch');
			__SHARE_LIST_INFO[_SEL_INDEX].media = media;
			mflag=3;
			break;
		case 'usb_media':
			media = getSwitch('#usb_media_switch');
			__SHARE_LIST_INFO[_SEL_INDEX].media = media;
			mflag=3;
			break;
		case 'ftp':
			ftp = getSwitch('#shares_ftp_switch');
			ftp_anonymous = $("#ftp_dev").attr("rel");
			hide2("shares_ftpSave_button");
			mflag=4;
			break;
		case 'webdav':
			webdav = getSwitch('#shares_webdav_switch');
			mflag=5;
			break;
		case 'nfs':
			nfs = getSwitch('#shares_nfs_switch');
			host = $("#shares_nfsHost_text").val();
			root_squash = getSwitch('#shares_rootSquash_switch');
			write = getSwitch('#shares_write_switch');
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
				
				$("#nfs_real_path").html( _T('_nfs','msg2')+": " +  "nfs://" + _EDIT_INFO.ip + "/nfs/"+ translate_path_to_display(path));
			}
			else
			{
				$("#nfs_real_path").html("");
			}
			__SHARE_LIST_INFO[_SEL_INDEX].nfs = nfs;
			_NFS = nfs;
			mflag=6;
			break;
		case 'public':
			publicFlag = getSwitch('#shares_public_switch');
			webdav = getSwitch('#shares_webdav_switch');
			ftp = getSwitch('#shares_ftp_switch');
			ftp_anonymous = $("#ftp_dev").attr("rel");
			__SHARE_LIST_INFO[_SEL_INDEX].public = publicFlag;
			__SHARE_LIST_INFO[_SEL_INDEX].read_list = "";
			__SHARE_LIST_INFO[_SEL_INDEX].write_list = "";
			__SHARE_LIST_INFO[_SEL_INDEX].invalid_users = "";
			mflag=7;
			break;
		case 'sharename':
			sharename=$("#edit_share_tb input[name='shares_editShareName_text']").val();
			if(check_sharename(sharename)!=0)
			{
				$("#popup_ok_button").click( function (){
					$("#popup_ok_button").unbind("click");
					$('#edit_share_tb input[name=shares_editShareName_text]').focus();
				});
				return;
			}
			
			__SHARE_LIST_INFO[_SEL_INDEX].name = sharename;
			
			var root_path = path.split("/");
			if(path.indexOf("/mnt/USB/")==-1)
			{
			root_path[root_path.length-1] = sharename;
			}
			
			var new_path = root_path.toString().replace(/,/g,'/');
			__SHARE_LIST_INFO[_SEL_INDEX].path = new_path;
			
			$(".LightningSubMenuOn .sName").html(sharename);
			$(".LightningSubMenuOn").attr("title",sharename);
			$(".LightningSubMenuOn").attr("rel",sharename);
			if(__SHARE_LIST_INFO[_SEL_INDEX].nfs =="1")
			{
				$("#nfs_real_path").html( _T('_nfs','msg2')+": " +  "nfs://" + _EDIT_INFO.ip + "/nfs/"+ sharename );
			}
			
			hide2("shares_shareNameSave_button");
			mflag=8;
			break;
		case 'oplocks':
			oplocks = getSwitch('#shares_oplocks_switch');
			var oplocksTmp ="";
			(oplocks==1)? oplocksTmp="yes":oplocksTmp="no";
			__SHARE_LIST_INFO[_SEL_INDEX].oplocks = oplocksTmp;
			mflag=9;
			break;
	}

	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	_NFS = nfs;
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/share.cgi",
		data:{cmd:"cgi_modify_share",mtype:mflag,path:path,
					sharename:sharename,comment:comment,recycle:recycle,
					ftp:ftp,ftp_anonymous:ftp_anonymous,
					webdav:webdav,
					nfs:nfs,host:host,root_squash:root_squash,write:write,
					media:media,publicFlag:publicFlag,old_sharename:old_sharename,oplocks:oplocks,
					remoteAccess:remoteAccess},
		success:function(xml)
		{
		  	if(mtype=='nfs' && nfs=='1')
		  	{
		  		_DIALOG.close();
		  		_DIALOG="";
		  	}
		  	else if(mtype=='desc' || mtype=='sharename')
		  	{
		  		$("input:text").inputReset();
		  	}
		  	else if(mtype=='public')
		  		get_modify_session_info(sharename);
		  		
		  	jLoadingClose();
		}
	});
}
/*
function chk_nfs_host(host) //move to function.js
{
	//for nfs check host format
	if(host.length==0)
		return 6;
		
	if(host=="*")
		return 0;
	
	if(host.indexOf("\\") != -1)
		return 1;

	var value=host.split(".");
	if(value.length==4)
	{
		if(!isNaN(value[0]) && !isNaN(value[1]) && !isNaN(value[2]) && !isNaN(value[3]))
		{
			if(value[3].length<1)
				return 0;
				
			if ( !checkDigitRange(host, 1, 1, 223) )
			{
				return 2;
			}
			if ( !checkDigitRange(host, 2, 0, 255) )
			{
				return 3;
			}
			if ( !checkDigitRange(host, 3, 0, 255) )
			{
				return 4;
			}
			if ( !checkDigitRange(host, 4, 0, 255) )
			{
				return 5;
			}
		}
		else
		{
			if( name_check3(host) ) 
				return 7;
		}
	}
	else
	{
		if( name_check3(host) ) 
			return 7;
	}
	return 0;
}*/
var _SEL_INDEX=0;
function init_share_item_click()
{
	$('.LightningSubMenu li').unbind('click');
    $('.LightningSubMenu li').click(function() {
	    $('.LightningSubMenu li').each(function() {
			$(this).removeClass('LightningSubMenuOn');
	    });
	    
	    $(this).addClass('LightningSubMenuOn');
	    var i = $(this).children().attr('rel');
	    _SEL_INDEX=i;
	    get_modify_session_info(__SHARE_LIST_INFO[i].name);
    });
    
    $('.LightningSubMenu li').unbind('keypress');
    $('.LightningSubMenu li').keypress(function(e) {
		if (e.keyCode=='13')
			$(this).click();
    });
}

function smb_show_save_button(e,obj)
{
	if (e.keyCode!='9') show1(obj);
}

function get_aMule_state()
{
	var aMule="0";
	wd_ajax({
			url: "/xml/apkg_all.xml",
			type: "POST",
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
			
			$(xml).find('item').each(function(index){
				var name = $(this).find('name').text();
				if(name=="aMule")
				{
					aMule = $(this).find('enable').text();
				}
			});
			
		},
        error:function (xhr, ajaxOptions, thrownError){}  
	});
	return aMule;
}
var AllUserList = new Array();
function api_get_user_list(callback)
{	
	//local account
	var UList = new Array();
	var UList_Tmp = new Array();
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/xml/account.xml",
		dataType: "xml",
		success: function(xml){
			
			var admin_array = new Array();
			var i=0;j=0;
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
				var gid = $(this).find('gid').text();
				var name = $(this).find('name').text();
				var uid = $(this).find('uid').text();
				if(api_filter_user(name,cloudholderMember) ==1 )
				{
					return true;
				}
				
				if(gid==_ADMIN_GID || uid==_ADMIN_UID)	//1001
				{
					admin_array[j] = new Array();
					admin_array[j].name = name;
					admin_array[j].uid = uid;
					admin_array[j].gid = gid;
					admin_array[j].type = "local";
					j++;
					return true;
				}
				
				UList[i] = new Array();
				UList[i].name = name;
				UList[i].uid = uid;
				UList[i].gid = gid;
				UList[i].type = "local";
				i++;
			});
			
			UList.sort(function(a, b){
			    var a1= a.name.toLowerCase() , b1= b.name.toLowerCase() ;
			    if(!b1) b1=a1;
			    if(a1== b1) return 0;
			    return a1> b1? 1: -1;
			});
			
			UList_Tmp = admin_array.concat(UList);
			
			_get_ad();
		},
		error:function(xmlHttpRequest,error){
			//alert("Error: " +error);
		}
	});
	
	
	//ads account
	var ADUList = new Array();
	function _get_ad()
	{
		var _AD_ADMIN = "";
		wd_ajax({
			type: "GET",
			cache: false,
			url: "/web/php/getADInfo.php?type=users",
			dataType: "xml",
			success: function(xml){
				var workgroup= $(xml).find('ads_workgroup').text();
				var domain_enable = $(xml).find('domain_enable').text();//0:off 1:AD 2:LDAP 
				var dType = "ad";
				if(domain_enable=='2') dType="ldap";
				
				var idx=0;
				var count = $(xml).find('users > item').length;
				
				$(xml).find('users > item').each(function(index){
					var user_name = $(this).find('name').text();
					if( user_name=="Administrator" && domain_enable=="1")
					{
						_AD_ADMIN = user_name;
						return true;
					}
					else if(user_name=="admin" && domain_enable=="2")
					{
						_AD_ADMIN = user_name;
						return true;
					}
					if(idx==_MAX_TOTAL_AD_ACCOUNT) return false;
					
					ADUList[idx] = new Array();
					if(dType=="ad")
					{
					ADUList[idx].name =  workgroup + "\\"+ user_name;
					}
					else
					{
						ADUList[idx].name =  user_name;
					}
					ADUList[idx].uid = "";
					ADUList[idx].gid = "";
					ADUList[idx].type = dType;
					idx++;
				});
				
				if(count!=0)
				{
					ADUList.sort(function(a, b){
					    var a1= a.name.toLowerCase() , b1= b.name.toLowerCase() ;
					    if(!b1) b1=a1;
					    if(a1== b1) return 0;
					    return a1> b1? 1: -1;
					});
					
					var _ad_admin_tmp = new Array();
					if(_AD_ADMIN.length!=0)
					{
					_ad_admin_tmp[0] = new Array();
						if(dType=="ad")
						{
					_ad_admin_tmp[0].name =  workgroup + "\\"+ _AD_ADMIN;
						}
						else
						{
							_ad_admin_tmp[0].name =  _AD_ADMIN;
						}
					_ad_admin_tmp[0].uid = "";
					_ad_admin_tmp[0].gid = "";
						_ad_admin_tmp[0].type = dType;
						ADUList = _ad_admin_tmp.concat(ADUList);
					}
										
					AllUserList = ADUList.concat(UList_Tmp);
				}
				else
				{
					AllUserList = UList_Tmp;
				}
				if (callback) {callback();}
			},
			error:function(xmlHttpRequest,error){
				//alert("Error: " +error);
			}
		});
	}
}

function api_get_service_info()
{
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: "cmd=cgi_get_service_info",	
		dataType: "xml",	
		cache:false,
		success: function(xml){			

			__SERVICE_INFO.ftp = $(xml).find('ftp').text();
			__SERVICE_INFO.nfs = $(xml).find('nfs_server').text();
			__SERVICE_INFO.media = $(xml).find('media_serving').text();
			__SERVICE_INFO.webdav = $(xml).find('webdav_server').text();
			__SERVICE_INFO.p2p = $(xml).find('p2p').text();
			__SERVICE_INFO.aMule = get_aMule_state();
			__SERVICE_INFO.dlna = $(xml).find('dlna').text();
			__SERVICE_INFO.itunes = $(xml).find('itunes').text();

		},
		error:function(xmlHttpRequest,error){   
  		} 
	});
}
function api_chk_share_max_number()
{
	//console.log("__SHARE_CREATED_BY_USER=[%s] _MAX_TOTAL_SHARES=[%s]\n",__SHARE_CREATED_BY_USER,_MAX_TOTAL_SHARES)
	if( __SHARE_CREATED_BY_USER >=_MAX_TOTAL_SHARES )
	{
		if( !$("#shares_createShare_button").hasClass("gray_out") )
		{
			$("#shares_createShare_button").addClass("gray_out");
		}
	}
	else
	{
		$("#shares_createShare_button").removeClass("gray_out");
	}
}
function get_usb_fs(path)
{
	var usb_len = usb_info_list.length;
	var fs_type="";
	for (var i = 0; i < usb_len; i++)
	{
		if (usb_info_list[i]['usb_type'] == "storage") //USB Stroage
		{
			for (var j in usb_info_list[i]['partition'])
			{
				if(usb_info_list[i]['partition'][j].base_path == path)
				{
					fs_type = usb_info_list[i]['partition'][j].fs_type;
					break;
				}
			}
		}
	}
	
	console.log(fs_type)
	return fs_type;
}
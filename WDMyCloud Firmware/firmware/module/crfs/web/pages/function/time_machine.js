var __file = 0;	
var __chkflag = 0;	//for show check box	1:show	0:not
var _MAX_TOTAL_TM_SHARE = 64;
var overlayObj_wait;

function tm_name_check(str)
{	
	var mt = str.match(/[^a-zA-Z0-9_-]/);
	if (mt)
		return 1;
	else
		return 0;
}

function do_add_tm_share(name,path,share)
{	
	if(_TM_ENABLE!=1) do_set_tm_enable("1");
	
	_TM_ENABLE=1;
	
	var path = $("#settings_generalTMShare_select").attr("rel").split(":")[0];
	var name = $("#settings_generalTMShare_select").html();
	var share = name;
	var quota = $("#time_machine_backup_size_limit").val();
	var isTMLimited=1;
	if(_quota_percent==100)
	{
		isTMLimited=0;
	}
		
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	wd_ajax({
	type: "POST",
	cache: false,
	url: "/cgi-bin/time_machine.cgi",
	data: { cmd:"cgi_tm_set_share" ,path:path, name:name,share:share,tmQuota:quota,isTMLimited:isTMLimited},	//quota: quota size is in MB
	success: function(data){
			_DIALOG.close();
			_DIALOG="";
			jLoadingClose();
		},
	error:function(xmlHttpRequest,error){}
	});
}

function chk_tm_sharename(name)
{
	for(var j=0;j<Sharename_array.length;j++)
	{
		if(Sharename_array[j]==name)
			return 1;
	}
	
	if(tm_name_check(name))
		return 1;
	else
	{
		return 0;
	}
}

function write_smb_share_options(obj,share_array)
{
	$(obj).empty();
	
	if(share_array.length==0) 
	{
		$("#tm_sel_tb").hide();
		$("#settings_generalTMSave_button").hide();
		$("#tm_info").html(_T("_time_machine","no_share"));
		$("#tm_info").show();
		return;
	}
	else
	{
		$("#tm_sel_tb").show();
		$("#settings_generalTMSave_button").show();
		$("#tm_info").hide();
	}
	
    var html_select_open = "";
	html_select_open += '<ul>';
	html_select_open += '<li class="option_list">';          
	html_select_open += '<div id="tm_f_dev_main" class="wd_select option_selected">';
	html_select_open += '<div class="sLeft wd_select_l"></div>';
	html_select_open += '<div class="sBody text wd_select_m" style="width:206px;" id="settings_generalTMShare_select" rel="' +":"+"0" + '">'+name+'</div>';
	html_select_open += '<div class="sRight wd_select_r"></div>	';
	html_select_open += '</div>';
	html_select_open += '<ul class="ul_obj">'; 
	
	if(share_array.length >=7)
	html_select_open += '<div class="cloud_time_machine_scroll">';		
	else
		html_select_open += '<div>';
		
	for( var i=0 in share_array)
	{
		var name = share_array[i].name;
		var path = share_array[i].path;
		var quota = share_array[i].quota;
		html_select_open += '<li rel="' + path+":"+quota + '"  id="settings_generalTMShareLi' + i +'_select"><a onclick=\'init_tm_slider("' + path + '","' + quota + '")\' href=\"#\">' + name + '</a></li>';
		}
			html_select_open += '</div>';
	html_select_open += '</ul>';
	html_select_open += '</li>';
	html_select_open += '</ul>';
	
	$(obj).append(html_select_open);
	
	hide_select();
	init_select();
}
function init_tm_slider(path,quota)
{
	//var rel = $(obj).parent().attr("rel").split(":");
	//var path = rel[0];
	//var quota = rel[1];
	setTimeMachineSlider(path,quota);
	setTimeMachineSlider(path,quota);
}
function get_smb_share_list()
{
	var share_array = new Array();
	$("#settings_generalTM_slider").hide();
	$("#time_machine_slider_value").hide();
	$("#settings_generalTM_loading").show();
	
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/time_machine.cgi",
		data: "cmd=cgi_tm_get_smb_list",	
		dataType: "xml",
		success: function(xml){
			var total = $(xml).find('total').text();
			
			var tm_share = {name:"",path:""};
			var tm_flag=0;
			$(xml).find('row').each(function(index){
				var name = $(this).find('cell').eq(0).text();
				var path = $(this).find('cell').eq(1).text();
				var tm = $(this).find('cell').eq(2).text();
				var isTMLimited = $(this).find('cell').eq(3).text();
				var quota = $(this).find('cell').eq(4).text();
				
				share_array[index] = new Array();
				share_array[index].name = name;
				share_array[index].path = path;
				
				if(isTMLimited==-1 || isTMLimited==0)
				{
					
					share_array[index].quota = -1;
				}
				else
					share_array[index].quota = quota;
				
				if(tm=='1' || index==0)	//1:have set tm share
				{
					tm_share.name=name;
					tm_share.path=path;
					if(isTMLimited==-1 || isTMLimited==0)
					{
						tm_share.quota=-1;
						limit = 100;
						var current_share_max_capacity_MB=0;
						for(i in _VInfo)
						{
							if(path.indexOf(_VInfo[i].currentPath)!=-1)
							{
								current_share_max_capacity_MB = Math.round ( _VInfo[i].size / BYTE_DIVISOR );
								break;
							}
						}
						
						limit = current_share_max_capacity_MB;
					}
					else
					{
						tm_share.quota=quota;
						limit = quota;
					}
					

					$("#time_machine_backup_size_limit").val(limit);
				}
			});
			
			setTimeout(function(){
			$("#settings_generalTM_slider").show();
			$("#time_machine_slider_value").show();
			$("#settings_generalTM_loading").hide();
			write_smb_share_options("#tm_div",share_array);
			reset_sel_item("#tm_div",tm_share.name,tm_share.path +":"+ tm_share.quota);
			setTimeMachineSlider(tm_share.path,tm_share.quota);
			
			ui_tab("#tmDiag","#tm_f_dev_main","#settings_generalTMSave_button");
			},1000);
		},
		error:function(xmlHttpRequest,error){
			//alert("Error: " +error);
		}
	});
}

var init_tm_flag=0;
function init_tm_diag()
{
	var _TITLE = _T('_menu','time_machine');
	$("#tmDiag_title").html(_TITLE);
	
	get_volume_max_size(function(){
	get_smb_share_list();
	});
	
	adjust_dialog_size("#tmDiag", 850, 0);

  	var tm_Obj=$("#tmDiag").overlay({fixed: false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
  					onClose: function() {
						setSwitch('#settings_generalTM_switch',_TM_ENABLE);
						timachine_show_div(_TM_ENABLE)
					}
				});		
	tm_Obj.load();
	$("#tmDiag").center();
	_DIALOG = tm_Obj;
	
	if(init_tm_flag==1)	return;
	init_tm_flag=1;
	
	language();
	
    $("#settings_generalTMSave_button").click(function(){
    	do_add_tm_share();
	});
}
var _TM_ENABLE="";
function get_tm_info()
{
	wd_ajax({
		type: "POST",
		cache: false,
		dataType: "xml",
		url: "/cgi-bin/time_machine.cgi",
		data: { cmd:"cgi_tm_get_info"},
		success: function(xml){
				var tm_enable = $(xml).find('tm_enable').text();
				var ads_enable = $(xml).find('ads_enable').text();
				_TM_ENABLE = tm_enable;
				
				setSwitch('#settings_generalTM_switch',tm_enable);
				
				/*if(ads_enable==1)
				{
					$("#settings_generalTM_switch").attr('disabled',true);
				}
				else*/
				{
					timachine_show_div(tm_enable)
				}
			},
		error:function(xmlHttpRequest,error){}
	});
}

function Set_TM_Enable(enable)
{
	get_afp_status();

	//$('#my_scroll').jScrollPane({showArrows:true, scrollbarWidth: 15, arrowSize: 16});
	
	if (enable == 1 &&__AFP == 0)
	{
		//AFP services will start.
		jAlert( _T('_time_machine','msg6'), _T('_common','error'));
	}
	
	do_set_tm_enable(enable);
}
function do_set_tm_enable(enable)
{
	var async=false;
	if(enable=='0')
	{
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		async=true;
	}
	
	_TM_ENABLE = enable;	
	wd_ajax({
		type: "POST",
		async: async,
		cache: false,
		url: "/cgi-bin/time_machine.cgi",
		data:{cmd:"cgi_tm_set",enable:enable},
		dataType: "xml",
	   	success: function(xml)
	   	{
			if(enable=='0')
			{
				setTimeout("jLoadingClose()",1000);
			}
			google_analytics_log('tm-en', enable);
	   	}
	 });	
}
function get_afp_status()
{
	wd_ajax({
		type:"POST",
		cache: false,
		async: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: "cmd=cgi_get_afp_info",	
		dataType: "xml",	
		success: function(xml){							
				var enable=$(xml).find('afp_info > enable').text();			
				__AFP = enable;
		}
	});
}function timachine_show_div(tm_enable)
{
	if(tm_enable=="1")
		$("#settings_generalTM_link").show();
	else
		$("#settings_generalTM_link").hide();
}
var _quota_percent =100;
function setTimeMachineSlider(path,quota) {

	//Math.floor(1.2)
	//Math.round(1.2)
	
    // remove old slider if applicable
    //$("#settings_generalTM_slider").slider("destroy");
	var current_share_max_capacity_GB=0;

	for(var i=0 in _VInfo)
	{
		if(path.indexOf(_VInfo[i].currentPath)!=-1)
		{
			current_share_max_capacity_GB = Math.round ( _VInfo[i].size / BYTE_DIVISOR / BYTE_DIVISOR );
			break;
		}
	}
	
	var v=100;
	if(quota!=-1)
	{
		v = Math.round(((quota / BYTE_DIVISOR) / current_share_max_capacity_GB )*100);
	}
	
	$("#settings_generalTM_slider").slider({ value:v,min:1,max:100,step:1});
	
	$( "#settings_generalTM_slider" ).slider({	
		change: function( event, ui ) {
            var percent_value = ui.value;
            
            value = Math.round (percent_value * current_share_max_capacity_GB);
            if(value < 100)
            {
            	value = value / 100;
            }
            else if (value > 100) {
                value = Math.round(value / 100);
            }

            var valueTxt = ByteSize(value * BYTE_DIVISOR * BYTE_DIVISOR * BYTE_DIVISOR);
            $("#time_machine_slider_value").html(valueTxt + ' (' + percent_value + '%)');
            $("#time_machine_backup_size_limit").val(value * BYTE_DIVISOR);
            _quota_percent = percent_value;
		}
	});

    // update slider with selected values

    var backup_size_limit = parseInt( $("#time_machine_backup_size_limit").val() ,10); // backup_size_limit is in MB
	var backup_size_limit_GB=0;

    // backup_size_limit=0 means max capacity
    if (backup_size_limit == 0) {
        backup_size_limit_GB = current_share_max_capacity_GB;
    }
    else {
    	
    	if(backup_size_limit > BYTE_DIVISOR)
    	{
        backup_size_limit_GB = Math.round(backup_size_limit / BYTE_DIVISOR);
    	}
    	else
    	{
    		backup_size_limit_GB = backup_size_limit / BYTE_DIVISOR
    	}
        

        if (backup_size_limit_GB > current_share_max_capacity_GB) {
            backup_size_limit_GB = current_share_max_capacity_GB;
        }
    }

    // storage degraded will have current_share_max_capacity_GB=0
    var backup_size_limit_percent = 0;
    if (current_share_max_capacity_GB > 0) {
        backup_size_limit_percent = Math.round((backup_size_limit_GB / current_share_max_capacity_GB) * 100);
        
        if (backup_size_limit_percent == 0) {
            backup_size_limit_percent = 1;  // minimum 1%
            //backup_size_limit_GB = Math.round((backup_size_limit_percent * current_share_max_capacity_GB) / 100);
        }
    }
    else {
        // time machine size limit of 0 means 100%
        backup_size_limit_percent = 100;
    }

    // calculate slider display value in ByteSize()
    var valueTxt = ByteSize(backup_size_limit_GB * BYTE_DIVISOR * BYTE_DIVISOR * BYTE_DIVISOR);
    $("#settings_generalTM_slider").slider("option", "value", backup_size_limit_percent);  // slider scale is 1-100
    $("#time_machine_slider_value").html(valueTxt + ' (' + backup_size_limit_percent + '%)');
	_quota_percent = backup_size_limit_percent; 
    // calculate new time_machine_backup_size_limit
    $("#time_machine_backup_size_limit").val( Math.round(backup_size_limit_GB * BYTE_DIVISOR) );
}

var BYTE_DIVISOR = 1000;
function ByteSize(bytes) { 

    size = (bytes / BYTE_DIVISOR / BYTE_DIVISOR); 
    
    
    byteType = dictionary['labelgenericMBtxt'];

    if (size < BYTE_DIVISOR) { 
        
        kbSize = size * BYTE_DIVISOR;
        if (kbSize < BYTE_DIVISOR){
            byteType = dictionary['labelgenericKBtxt'];
            size = kbSize;        
        }
        else {        
            byteType = dictionary['labelgenericMBtxt'];
        }
    }  
    else if (size / BYTE_DIVISOR < BYTE_DIVISOR) { 
        size = size / BYTE_DIVISOR;
        byteType = dictionary['labelgenericGBtxt'];
    }  
    else if (size / BYTE_DIVISOR / BYTE_DIVISOR < BYTE_DIVISOR) { 
        size = size / BYTE_DIVISOR / BYTE_DIVISOR; 
        byteType = dictionary['labelgenericTBtxt'];
    }  

    size = ByteSizeRound(size);

    return size.toString() + ' ' + byteType; 
} 
function ByteSizeRound(size) {
    if (size <= 1) {
        size = Math.round(size);
    }
    else if (size < 10) {
        size = Math.round(size * 10) / 10;
    }
    else if (size < 100) {
        size = Math.round(size);
    }
    else if (size < 1000) {
        size = Math.round(size / 10) * 10;
    }
    
    return size;
}

var _VInfo = new Array();
function get_volume_max_size(callback)
{
	_VInfo = new Array();
	var idx=0;
	wd_ajax({
		url: FILE_USED_VOLUME_INFO,	// /xml/used_volume_info.xml
		type: "POST",
		cache:false,
		dataType:"xml",
		success: function(xml){
			$('item', xml).each(function(){
				_VInfo[idx] = new Array();	
				_VInfo[idx].volume = $('volume',this).text();
				_VInfo[idx].size = parseInt($('size',this).text(),10);
				switch(_VInfo[idx].volume)
				{
					case '1':
						_VInfo[idx].currentPath = "/mnt/HD/HD_a2/";
						break;
					case '2':
						_VInfo[idx].currentPath = "/mnt/HD/HD_b2/";
						break;
					case '3':
						_VInfo[idx].currentPath = "/mnt/HD/HD_c2/";
						break;
					case '4':
						_VInfo[idx].currentPath = "/mnt/HD/HD_d2/";
						break;
					case '5':
						_VInfo[idx].currentPath = "/mnt/HD/HD_e2/";
						break;
				}
				idx++;
			});//end of each
			
			for(i in usb_info_list)
			{
				var _partition = usb_info_list[i].partition;
				for(var par in _partition) {
					if (usb_info_list['lock_state'] == "locked" || usb_info_list['lock_state'] == "unlocks exceeded")
						continue;
					_VInfo[idx] = new Array();	
					_VInfo[idx].volume = _partition[par].share_name;
					_VInfo[idx].size = parseInt(_partition[par].size,10);
					
					_VInfo[idx].currentPath = _partition[par].base_path;
					idx++;
				}
			}
			
			if(callback){callback();}
		},
	    error:function (xhr, ajaxOptions, thrownError){}  
	});
}

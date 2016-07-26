var _SET_QUOTA_TYPE_FLAG=0;
var _V1="",_V2="";
var USER=1;
var GROUP=2;
var _HDD_MAX_SIZE1="",_HDD_MAX_SIZE2="";
var _HDD_MAX_SIZE3="",_HDD_MAX_SIZE4="";
	
function get_quota_maxsize(name,type)
{
	//name: xxx_1  xxx_2
	var hdd_num=name;
	var index=name.lastIndexOf("_");
	name=name.substring(0,index);

	var num=hdd_num.substr(hdd_num.length-1,1);
		
	var maxsize=0;
	var cmd;
	if(type=="1")
		cmd="cgi_get_user_quota_maxsize";
	else
		cmd="cgi_get_group_quota_minsize";
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:cmd ,name:name,hdd:num},
		cache: false,
		dataType: "xml",
		async: false,
		success: function(xml){		
			$(xml).find('quota_info').each(function(){
				maxsize=$(this).find('max_size').text() ;
			});
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("get_user_quota_maxsize->Error: " +error);   
  		 }
	});
	
	return maxsize;
}

function chk_value(limited_value,name,hddsize,type)
{	
	if( limited_value >= 4294967)
	{
		jAlert(_T('_quota','msg6'), _T('_common','error'));
		return -2;
	}
	
	/*type 1:user	2:gorup */
	var MB = "MB";

	var max_size=get_quota_maxsize(name,type);
	max_size=parseInt(max_size,10)/1024;
		
	if(chk_quota_value(limited_value,hddsize)!=0)
	{
		return -1;
	}
	
	if(limited_value==0) return 0;
	
	if(type==USER)
	{
		if(parseInt(limited_value,10)> max_size && limited_value>=1)
		{
			//var str="The user quota amount cannot larger than the group quota amount." 
			var str = _T('_quota','msg1');
			str = str + "(" + max_size + MB + ")" ;
			jAlert(str, _T('_common','error'));
			return -1;
		}
	}
	if(type==GROUP)
	{
		if(parseInt(limited_value,10)< max_size && limited_value>=1)
		{
			//var str="The quota amount cannot smaller than the user quota amount." 
			var str = _T('_quota','msg2');
			str = str + "(" + max_size + MB + ")" ;
			jAlert(str, _T('_common','error'));
			return -1;
		}
	}
	
	return 0;
}
function do_user_set_quota(name,available,type)
{
	//name: xxx_1  xxx_2
	var td_id=name;
	var hdd_num=name;	
	var index=name.lastIndexOf("_");
	
	name=name.substring(0,index);
	
	var available1='null';
	var available2='null';
	var available3='null';
	var available4='null';
	
	var num=hdd_num.substr(hdd_num.length-1,1);
	
	if(available=="")
		available = 0;
	
	available= parseInt(available,10);
		
	if(num==1)
		available1=available;
	
	if(num==2)
		available2=available;
	
	if(num==3)
		available3=available;

	if(num==4)
		available4=available;
	
	var UNLIMITED = _T('_quota','unlimited');//Unlimited;
	if(available=="0")
		available=UNLIMITED ;
	
	var cmd;
	if(type==1)
		cmd="cgi_user_set_quota";
	else
		cmd="cgi_group_set_quota";
		
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:cmd ,name:name,available1:available1,available2:available2,
					available3:available3,available4:available4},
		success: function(data){
					  	var quotaDiag=$("#quotaDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});		
						quotaDiag.close();
					}
	//						,					   				   
	//					   error:function(xmlHttpRequest,error){   
	//		    				alert("cgi_set_quota_error: " +error);   				        				
	//						 }  
	
		});	
}


function chk_quota_value(quota,hdd_max_size)
{
	if(quota==0) return 0;
	
	var re=/[.]/;
	if(re.test(quota))
	{
		//jAlert('The Quota Amount not a positive integer, Please try again.', 'Error');
		jAlert(_T('_quota','msg3'), _T('_common','error'));
		return 1;
	}
		
	if (isNaN(quota) || quota < 0)
	{
		//jAlert('The Quota Amount is invalid. Please enter a valid number.', 'Error');
		jAlert(_T('_quota','msg4'), _T('_common','error'));
		return 2;
	}
	
	if( parseInt(quota,10) >  parseInt(hdd_max_size,10))
	{
		//jAlert('This number is higher than the maximum capacity of the hard drives.\nPlease enter a real number or leave the setting at unlimited.', 'Error');
		jAlert(_T('_quota','msg5'), _T('_common','error'));
		return 3;
	}
	
	return 0;
	
}
var HDD_INFO_ARRAY = new Array();
function fill_info(type,name,q_size_array,hdd_size_array,tb_id)
{
  	//var quotaDiag=$("#quotaDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});		
	//language();
	//quotaDiag.load();
	//$("#quotaDiag .exit").click(function(){
	//	quotaDiag.close();
	//});
	if(_HDD_NUM==0 || q_size_array.length==0)
	{
		$("#quota_info").html(_T('_user','no_hdd'))
		$("#q_desc").hide();
		return;
	}
	else
	{
		$("#quota_info").html("");
		$("#q_desc").show();
	}
	
	_SET_QUOTA_TYPE_FLAG = type;	//'u','g'
	
	if(type=='u')
		type=1;
	else
		type=2;
	//var v1_name="";v2_name="";
	//var v3_name="";v4_name="";
	var v_name="";
	var str="";
	
//	$('#q_name').val(name);
	_HDD_MAX_SIZE1=hdd_size_array[0];
	_HDD_MAX_SIZE2=hdd_size_array[1];
	_HDD_MAX_SIZE3=hdd_size_array[2];
	_HDD_MAX_SIZE4=hdd_size_array[3];
	
	//get volume name
	do_query_HD_Mapping_Info();	//Volume_1:/mnt/HD/HD_a2

	for( i=0 ;i < _HDD_NUM; i++ )
	{
		var v_num = i+1;
		//console.log("v_num=[%d]\n",v_num);
		
		var v_obj = $(tb_id).find("#v_" + v_num)
		var v_size_obj = $(tb_id +" input[name='users_v" + v_num + "Size_text']")
		var n_obj =$(tb_id).find("#n" + v_num)
		var max_size_obj = $(tb_id).find("#max_quota_size_" + v_num)
		
//		var v_obj		= tb_id +" > #v_" + v_num ;
//		var v_size_obj	= tb_id +" > #v"+ v_num + "_size";
//		var n_obj		= tb_id + "> #n" + v_num;
//		var max_size_obj= tb_id + "> #max_quota_size_" + v_num;
		
		$(v_obj).show();
		var q_size = parseInt(q_size_array[i],10);	//mb
		
		if(q_size < 1024)
		{
			//mb
		}
		else if(q_size >=1024 &&q_size <=1024000)
		{
			//gb
			q_size = q_size/1024;
		}
		else if(q_size >=1024000)
		{
			//tb
			q_size = q_size/1024/1024;
		}
		
		if(q_size_array[i]==0) q_size="";
		$(v_size_obj).val(q_size);
		
		//get_quota_maxsize
		//var max_quota_size = get_quota_maxsize(name+"_" + v_num ,type);
		//max_quota_size=parseInt(parseInt(max_quota_size,10)/1024,10);
		
		var s = _T('_quota','quota_amount');	//Quota Amount
		
		$(n_obj).html( _VOLUME_NAME[i] + "&nbsp;" + s )
		
		var max_quota_size=hdd_size_array[i];
		
		//$(max_size_obj).html("( " + "" + max_quota_size + " MB" + " )")
		
		var unit_obj = $(tb_id).find("#users_v" + v_num + "Unit_select");
		
		show_quota_unit(unit_obj,max_quota_size,v_num,q_size_array[i],0)
	}
}

function set_quota()
{
	var ads_enable=get_ads_enable();
	
	//var name = $('#q_name').val();
	var name = $("#create_user_tb input[name='users_userName_text']").val();
	
	if(ads_enable==1)
	{
		var tmp = name.split("\\");
		name = tmp[1];
	}
	
	var name_tmp1 = name + "_1"
	var name_tmp2 = name + "_2"
	var name_tmp3 = name + "_3"
	var name_tmp4 = name + "_4"
	
	var type="";
	
	if(_SET_QUOTA_TYPE_FLAG=='u')
		type = USER;
	else
		type = GROUP;
		
	var v1_size = $("#create_quota_tb input[name='users_v1Size_text']").val()
	var v2_size = $("#create_quota_tb input[name='users_v2Size_text']").val()
	var v3_size = $("#create_quota_tb input[name='users_v3Size_text']").val()
	var v4_size = $("#create_quota_tb input[name='users_v4Size_text']").val()
	
	if(v1_size=="") v1_size=0;
	if(v2_size=="") v2_size=0;
	if(v3_size=="") v3_size=0;
	if(v4_size=="") v4_size=0;
	
	var res = chk_value(v1_size,name_tmp1,_HDD_MAX_SIZE1,type);
	if(res!=0)
		return;

	res = chk_value(v2_size,name_tmp2,_HDD_MAX_SIZE2,type)
	if(res!=0)
		return;

	res = chk_value(v3_size,name_tmp3,_HDD_MAX_SIZE3,type)
	if(res!=0)
		return;
		
	res = chk_value(v4_size,name_tmp4,_HDD_MAX_SIZE4,type)
	if(res!=0)
		return;
		
	do_user_set_quota(name_tmp1 ,v1_size,type)
	do_user_set_quota(name_tmp2 ,v2_size,type)
	do_user_set_quota(name_tmp3 ,v3_size,type)
	do_user_set_quota(name_tmp4 ,v4_size,type)
	
	if(type==1)
		$("#user_quota_tb").flexReload();
	else
		$("#group_quota_tb").flexReload();
}

//var _HDD_NUM="";
//var _HDD_SIZE="";
var _USER_NUM="";
var _GROUP_NUM="";
function Get_Quota_Info()
{
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_quota_info",	
		cache: false,
		dataType: "xml",
		async: true,
		success: function(xml){
			$(xml).find('quota_info').each(function(){
				_HDD_NUM = $(this).find('hddnum').text();
				_HDD_SIZE = $(this).find('hddsize').text();
				_HDD_SIZE = _HDD_SIZE.split(",");
				_USER_NUM = $(this).find('usernum').text();
				_GROUP_NUM = $(this).find('groupnum').text();
				_VOLUME_NAME = $(this).find('v_name').text();
				_VOLUME_NAME = _VOLUME_NAME.split(":");
				/*
				var q_enable = $(this).find('enable').text();
				var status_text,but_text;
				
				//show quota on/off status
				if(q_enable=="1")
				{
					status_text=_T('_quota','start')//Started
					but_text='<div id="disabled" class="button">' + _T('_quota','disable') + '</div>'
				}
				else
				{
					status_text=_T('_quota','stop')//Stopped
					but_text='<div id="enabled" class="button">' + _T('_quota','enable') + '</div>'
				}
				
				$("#quota_status").html(status_text);
				$("#q_button").html(but_text);
				
				$("#disabled").click(function() {			
					QuotaStartOrNot(0);
				});

				$("#enabled").click(function() {			
					QuotaStartOrNot(1);
				});
				*/
			}); 
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_quota_Info->Error: " +error);   
  		 }  
	});
}

function show_quota_unit(obj,max_size,hdd_num,fill_size,tabidx)
{
	var _UNIT=["TB","GB","MB"];
	if(fill_size=="") fill_size=0;
	var size = parseInt(max_size,10);
	var fill_size = parseInt(fill_size,10);
	var flag=0;
	var val="";
	if(fill_size!=0)
	{
		if(fill_size < 1024)
		{
			//mb
			val = "MB"
			flag=2;
		}
		else if(fill_size >=1024 &&fill_size <=1024000)
		{
			//gb
			val = "GB"
			flag=1;
		}
		else if(fill_size >=1024000)
		{
			//tb
			val = "TB"
			flag=2;
		}
	}
	else
	{
		if(size < 1024)
		{
			//mb
			val = "MB"
			flag=2;
		}
		else if(size >=1024 &&fill_size <=1024000)
		{
			//gb
			val = "GB"
			flag=1;
		}
		else if(size >=1024000)
		{
			//tb
			val = "TB"
			flag=2;
		}		
	}
	
	$(obj).empty();
			
	var option = "";
		option += '<ul style="margin-left:10px">';
		option += '<li class="option_list" onKeyPress="sizeEvent(event,this)" tabindex="' + tabidx + '">';       
		option += '<div id="quota_unit_main_' + hdd_num + '" class="wd_select option_selected">';
		option += '<div class="sLeft wd_select_l"></div>';
		option += '<div class="sBody text wd_select_m" id="quota_unit_'+ hdd_num + '" rel="' + val + '">'+ val +'</div>';
		option += '<div class="sRight wd_select_r"></div>';
		option += '</div>';						
		option += '<ul class="ul_obj"><div>';
		
		for(var i=0; i < _UNIT.length ;i++)
		{
			option += '<li id="users_unit'+hdd_num + "_Ul"+i + '_select" rel="'+ _UNIT[i] + '" style="width:120px;"> <a href="#">' + _UNIT[i]+ '</a></li>';
		}
		option += '</div></ul>';
		option += '</li>';
		option += '</ul>';
	
	$(obj).append(option);
	init_select();
}
function get_current_item(list)
{
	var cName ="";
	if(list==".userMenuList")
	{
		cName=".uName";
	}
	else
	{
		cName=".gName";
	}
	
	var name="";
    $( list + ' li').each(function() {
		if($(this).hasClass('LightningSubMenuOn'))
		{
			name = $(this).find(cName).html();
			return false;
		}
    });	
    
    name = name.replace(/&nbsp;/g,'');
    if(name.indexOf("\\")!=-1)
    {
    	name = name.split("\\")[1];
    }
    return name;
}
function map_quota_size(mSize)
{
	var size=0;
	if(mSize < 1024)
	{
		//mb
		val = "MB"
		size = mSize;
	}
	else if(mSize >=1024 &&mSize <=1024000)
	{
		//gb
		size = mSize/1024;
		val = "GB"
	}
	else if(mSize >=1024000)
	{
		size = mSize/1024/1024;
		//tb
		val = "TB"
	}
	
	return size+val;
}

function sizeEvent(e,obj)
{
	if (e.keyCode=='38')	//up
	{
		
	}
	else if (e.keyCode=='40')	//down
	{
		
	}
}

var _DENY=0;
var _RW=1;
var _RO=2;
function api_get_smb_privileges(qtype,type,name)
{
	var tmp = new Array();
	
	if(qtype=="u")
	{
		/*
		if(type=="local")
			name = "#"+name+"#";
		else
			name = "#"+name.replace(/\\/g,'+')+"#";
		*/
		
		name = "#"+name+"#";
	}
	else
	{
		/*if(type=="local")
			name = "#@"+name+"#";
		else
			name = "#+"+name.replace(/\\/g,'+')+"#";		
		*/
		
		name = "#@"+name+"#";
	}
	
	for(i in _SMBInfo)
	{
		tmp[i] = new Array();
		tmp[i].sname = _SMBInfo[i].sname;
		tmp[i].read_list = _SMBInfo[i].read_list;
		tmp[i].write_list = _SMBInfo[i].write_list;
		tmp[i].invalid_users = _SMBInfo[i].invalid_users;
		tmp[i].public = _SMBInfo[i].public;
		//d,w,r,n
		
		var public = tmp[i].public;
		var invalid_users = tmp[i].invalid_users;
		var read_list = tmp[i].read_list;
		var write_list = tmp[i].write_list;
		
		if(public==1)
		{
			tmp[i].privileges="w";
		}
		else
		{
			if(invalid_users.indexOf(name)!=-1)
				tmp[i].privileges="d";
			else if(write_list.indexOf(name)!=-1)
				tmp[i].privileges="w";
			else if(read_list.indexOf(name)!=-1)
				tmp[i].privileges="r";
			else
				tmp[i].privileges="d";
		}
	}
	
	return tmp;
}


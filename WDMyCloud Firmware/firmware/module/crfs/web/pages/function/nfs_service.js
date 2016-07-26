function ready_nfs_service()
{
	wd_ajax({
		type:"POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: "cmd=cgi_get_nfs_info",	
		dataType: "xml",	
		success: function(xml){							
			var enable=$(xml).find('nfs_info > enable').text();			
			//$("input[name='f_nfs']").eq(1-parseInt(enable,10)).attr("checked",true);	
			setSwitch('#settings_networkNFS_switch',enable);
		}
	});
}

function set_nfs()
{
	var nfs_enable = getSwitch('#settings_networkNFS_switch');
	if(nfs_enable==1 && usbexfatFlag==1)
	{
		jAlert(_T('_network_services','msg1'), 'info',function(){
			jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		});
	}
	else
	{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	}
	wd_ajax({
		type:"POST",
		url:"/cgi-bin/account_mgr.cgi",
		data:{cmd:"cgi_nfs_enable",nfs_status:nfs_enable},
		cache:false,
		success:function(){
			setTimeout("jLoadingClose()",1000);
			//jAlert(_T('_common','update_success'), _T('_common','success'));
		}			
	});
	return false;	
}

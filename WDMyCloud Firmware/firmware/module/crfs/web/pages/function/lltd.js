function set_lltd()
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	var lltd_enable = getSwitch('#settings_networkLLTD_switch');
	
	wd_ajax({
		type:"POST",
		url:"/cgi-bin/network_mgr.cgi",
		data:{cmd:"cgi_lltd",f_enable:lltd_enable},
		cache:false,
		async:true,
		success:function(){
				//jAlert(_T('_common','update_success'), 'complete');
				setTimeout("jLoadingClose()",1000);
				google_analytics_log('lltd-en',lltd_enable);
		},
		error:function(xmlHttpRequest,error){  
  		}
	});
}

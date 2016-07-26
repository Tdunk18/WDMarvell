function ready_afp()
{
	_ADS_ENABLE = get_ads_enable();
	
	if(_ADS_ENABLE==1)
	{
		//$("#settings_networkAFP_switch").attr('disabled',true); //fish mark ,no need to blocking
	}
	
	wd_ajax({
		type:"POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: "cmd=cgi_get_afp_info",	
		dataType: "xml",	
		success: function(xml){					
			var enable=$(xml).find('afp_info > enable').text();			
			setSwitch('#settings_networkAFP_switch',enable);
		}
	});
}

function set_afp()
{
	var afp_enable = getSwitch('#settings_networkAFP_switch');
	if (!$("#settings_networkAFP_switch").hasClass('gray_out'))
	{
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
			
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/account_mgr.cgi",
			data:{cmd:"cgi_set_afp",afp:afp_enable},
			cache:false,
			success:function(){
				jLoadingClose();
				google_analytics_log('afp-en',afp_enable);
				//jAlert(_T('_common','update_success'), _T('_common','success'));
			}
		});
		return false;
	}
}
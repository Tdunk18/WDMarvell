function iTtunes_Advanced_Option_Diag(){
	
	$("#tip_itunes_AutoRefresh").attr('title',_T('_itunes','desc3'));
	
	init_tooltip();
	init_switch();
	
	wd_ajax({
    			url:"/cgi-bin/app_mgr.cgi",
    			type:"POST",
    			async:false,
    			cache:false,
    			data:{cmd:'iTunes_Server_Get_XML'},			
    			dataType:"xml",
    			success: function(xml)
    			{	
    				//show passwd
    			    var my_passwd = $(xml).find("passwd").text();
    			    if (my_passwd.length == 0)
    			    {
    			    	 setSwitch('#settings_mediaiTunesPWD_switch',0);
    			    	 $("#tr_itunes_pwd").hide();
    			    	 $('#settings_mediaiTunesPWD_password').attr('value','');    	
    			    }
    			    else
    			    {		
    			    	 setSwitch('#settings_mediaiTunesPWD_switch',1);
    			    	 
    			    	 $("#tr_itunes_pwd").show();
    			    	 $('#settings_mediaiTunesPWD_password').attr('value',my_passwd);    			       			    	
    			    }	
    			    
    			    //Auto Refresh
    			    var my_rescan_interval = $(xml).find("rescan_interval").text();	
    			    $("#f_itunes_rescan_interval").attr('rel',$(xml).find("rescan_interval").text());
    			    $("#f_itunes_rescan_interval").html(iTunes_autorefresh_show(my_rescan_interval));
   			}
    });//end of wd_ajax({....
	
	$("#MediaDiag_title").html(_T('_media','title3'));
	adjust_dialog_size("#MediaDiag",580,"");
	
	var MediaDiag = $("#MediaDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE('MediaDiag');
	$('#MediaDiag_iTuens_Advanced_Options').show();
	
	init_select();
	hide_select();
	init_button();
	language();
	
	MediaDiag.load();
	
	$("#settings_mediaiTunesPWD_switch").click(function(){
		
		if(getSwitch('#settings_mediaiTunesPWD_switch') == 1)
		{
			$("#tr_itunes_pwd").show();
		}
		else
		{
			$("#tr_itunes_pwd").hide();
			$('#settings_mediaiTunesPWD_password').attr('value','');    
		}	
	});
	
	$("#MediaDiag .close").click(function(){
		MediaDiag.close();
		INTERNAL_DIADLOG_BUT_UNBIND("MediaDiag");
		INTERNAL_DIADLOG_DIV_HIDE("MediaDiag");
	});
		
	$("#settings_mediaiTunesSave_button").click(function(){
		
		
		if(getSwitch('#settings_mediaiTunesPWD_switch') == 1)
		{
			if (iTunes_format_pwd($("#settings_mediaiTunesPWD_password").val()) != 1)	return;
		}
		
		var my_passwd = ( getSwitch('#settings_mediaiTunesPWD_switch')== 1)?$("#settings_mediaiTunesPWD_password").val():"";
		var my_rescan_interval = $("#f_itunes_rescan_interval").attr('rel');
		
		jLoading(_T('_common','set'), 'loading' ,'s', ''); 
		
		wd_ajax({
				url: "/cgi-bin/app_mgr.cgi",
				type: "POST",
				async: false,
				cache: false,
				data:{cmd:'iTunes_Server_Setting',
					f_passwd:my_passwd,
					f_rescan_interval:my_rescan_interval},	
				dataType:"xml",
				success: function(xml){
					MyVariTunes = setInterval("iTunes_check_ps('0')",2000);
							
					MediaDiag.close();
					INTERNAL_DIADLOG_BUT_UNBIND("MediaDiag");
					INTERNAL_DIADLOG_DIV_HIDE("MediaDiag");
					
				}//end of success: function(xml){
		}); //end of wd_ajax({	
	});
}
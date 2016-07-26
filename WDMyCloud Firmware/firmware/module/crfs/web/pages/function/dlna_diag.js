var _jScrollPane = "";
function INTERNAL_DLNA_Players_display(n, val)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	var my_id = "#DLNA_View_Players_List  > tbody > tr:eq("+parseInt(n,10)+") td:nth-child(4) div";
	
	if ( parseInt(val,10) == 1)
	{
		if ( !$("#dlna_players_switch_"+n+"_l").hasClass('sel') ) $("#dlna_players_switch_"+n+"_l").addClass('sel');
		if ( $("#dlna_players_switch_"+n+"_r").hasClass('sel') )	$("#dlna_players_switch_"+n+"_r").removeClass('sel');
	}
	else
	{
		if ( $("#dlna_players_switch_"+n+"_l").hasClass('sel') ) $("#dlna_players_switch_"+n+"_l").removeClass('sel');
		if ( !$("#dlna_players_switch_"+n+"_r").hasClass('sel') )	$("#dlna_players_switch_"+n+"_r").addClass('sel');
	}
		
	wd_ajax({
			type: "POST",
			url: "/cgi-bin/app_mgr.cgi",
			cache:false,
			data:{cmd:'cgi_dlna_players_client_change',
				  f_key:$(my_id).text(),
				  f_state:val},
			dataType: "xml",
			success: function(xml) {	
				
//				setTimeout(function(){
//					$("#MediaDiag_DLNA_View_Players_Flexgrid").hide();
//					$("#DLNA_View_Players_List").flexReload();
//					
//					setTimeout(function(){ //fish20140731+ for scrollbar
//						$("#MediaDiag_DLNA_View_Players_Flexgrid").show();
//						_jScrollPane.data('jsp').destroy();
//						_jScrollPane = $('.scroll-pane').css('width','700px').jScrollPane();
//					
//					},2000);
//				}
//				, 2000);
				
				jLoadingClose();
					
			}//end of success
	});	//end of ajax
	
}
function DLNA_View_Players_Diag()
{
	adjust_dialog_size("#MediaDiag",770,"");
	
	if ($("#DLNA_View_Players_List").parent().parent().hasClass('flexigrid') == true)
	{
		$("#DLNA_View_Players_List").flexReload();
	}
	else
	{
		$("#DLNA_View_Players_List").flexigrid({						
			url: '/cgi-bin/app_mgr.cgi',		
			dataType: 'xml',
			cmd: 'cgi_dlna_players_list',	
			colModel : [
				{display: "--", name : 'my_icon', width : '40', align: 'center'},	//Text:icon
				{display: "--", name : 'my_name', width : '200', align: 'left'},	//Text:Media Player 
				{display: "--", name : 'my_ip', width : '200', align: 'left'},		//Text:IP
				{display: "--", name : 'my_key', width : '0', align: 'left',hide: true},	
				{display: "--", name : 'my_state', width : '190', align: 'center'},		//Text:On/OFF
				],
			usepager: false,       //啟用分頁器
			useRp: true,
			rp: 10,               //預設的分頁大小(筆數)
			showTableToggleBtn: true,
			width:  670,
			height: 'auto',
			errormsg: _T('_common','connection_error'),		//Text:Connection Error
			nomsg: _T('_common','no_items'),				//Text:No items
			singleSelect:true,
		    striped:true,   //資料列雙色交差
		    resizable: false,
		    noSelect:true,
		    onSuccess:function(){
		    		
		    	$('#DLNA_View_Players_List > tbody > tr td:nth-child(1)').each(function(n){
			    			$(this).empty().html("<img border='0' src='/web/images/flexigrid/IconCLoudAccessComputerLaptop.png'>")
			    });	
			    	
		    	$('#DLNA_View_Players_List > tbody > tr td:nth-child(2) div').each(function(n){
		    		
		    			if ($.trim($(this).text()) == "")	{
		    				$(this).html(_T("_media","desc19"));
		    			}	
		    	});	
		    	
		    	$('#DLNA_View_Players_List > tbody > tr td:nth-child(5)').each(function(n){
		    		var my_state = parseInt($(this).text(),10);
		    		var my_html = "<div style=\"padding:7px 0px 0px 0px;\">";
		    		if (my_state == 1)
		    		{
							my_html += "<button class=\"left_button sel\" id=\"dlna_players_switch_"+n+"_l\" onclick=\"INTERNAL_DLNA_Players_display('"+n+"','1')\">"+_T('_media','desc16')+"</button>";
							my_html += "<button class=\"right_button\" id=\"dlna_players_switch_"+n+"_r\"  onclick=\"INTERNAL_DLNA_Players_display('"+n+"','0')\">"+_T('_media','desc17')+"</button>";
						}
						else
						{
							my_html += "<button class=\"left_button\" id=\"dlna_players_switch_"+n+"_l\" onclick=\"INTERNAL_DLNA_Players_display('"+n+"','1')\">"+_T('_media','desc16')+"</button>";
							my_html += "<button class=\"sel right_button\" id=\"dlna_players_switch_"+n+"_r\"  onclick=\"INTERNAL_DLNA_Players_display('"+n+"','0')\">"+_T('_media','desc17')+"</button>";
						}	
						my_html += "</div>";	
			    		$(this).empty().html(my_html);	
		    	});		
		    	
		    	switch(parseInt(MULTI_LANGUAGE, 10))
					{
						case 1:
						case 3:
						case 4:
						case 10:
						case 12:
						case 13:
						case 15:
							$("#DLNA_View_Players_List > tbody > tr td div").css('font-size','12px');
							$("#DLNA_View_Players_List > tbody > tr td div button").css('font-size','12px');
						break;
													
						case 9:
							$("#DLNA_View_Players_List > tbody > tr td div").css('font-size','10px');
							$("#DLNA_View_Players_List > tbody > tr td div button").css('font-size','10px');
						break;
						
						case 2:		
						case 11:
							$("#DLNA_View_Players_List > tbody > tr td div").css('font-size','9px');
							$("#DLNA_View_Players_List > tbody > tr td div button").css('font-size','9px');
						break;
						
						default:
							$("#DLNA_View_Players_List > tbody > tr td div").css('font-size','16px');
						break;
					}
			    
			    _jScrollPane = $('#Setting_mediaDLNADiagViewPlayersList_div').jScrollPane();		
			    
			    }
		});  	
	}
	
	$("#MediaDiag_title").html(_T('_media','desc13'));
	
	var MediaDiag=$("#MediaDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE('MediaDiag');
	$('#MediaDiag_DLNA_View_Players').show();
	
	init_button();
	language();
	
	MediaDiag.load();
	
	$("#MediaDiag .close").click(function(){
		
		if (_jScrollPane != "")
		{
			var api = _jScrollPane.data('jsp');
			api.destroy();
			_jScrollPane = "";
		}
		
		
		MediaDiag.close();
		
		INTERNAL_DIADLOG_BUT_UNBIND("MediaDiag");
		INTERNAL_DIADLOG_DIV_HIDE("MediaDiag");
	});
}	 
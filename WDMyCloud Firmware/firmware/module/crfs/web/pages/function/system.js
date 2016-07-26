function ready_system()
{
	
				
	$("#settings_utilitiesReboot_button").click(function(){
		
		if(!$("#settings_utilitiesReboot_button").hasClass("gray_out"))
	 	{				
			
			wd_ajax({
				type:"POST",
				async:false,
				cache:false,
				url:"/cgi-bin/hd_config.cgi",
				data:{cmd:'cgi_Detect_Dangerous'},
				dataType: "xml",
				success: function(xml){		
								
					var res = $(xml).find('res').text();
				
					if ( parseInt(res) != 0)	//volume format now,don't support restart and reboot
						jAlert( _T('_format','msg17'), _T('_common','error'));	//Text:Device shutdown or restarted is prohibited when disk formatting/firmware uploading is in progress.
					else
					{					
						jConfirm('M',_T('_system','msg2'),_T('_utilities','reboot'),'i',function(r){	//Text:Please wait a minute while the Lightning 4a is restarted before logging in again.					
						if(r)
						{							
								//document.form_restart.submit();
								setTimeout('stop_web_timeout(true);', 1000);	
								//adjust_dialog_style(400,276,0,0);
	
								var overlayObj=$("#rebootDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
								overlayObj.load();	
								count();
								wd_ajax({
										type:"POST",
										async: true,
										cache: false,
										url: "/cgi-bin/system_mgr.cgi",
										data: "cmd=cgi_restart",
										success: function(data){				
														}			
									});//end of .ajax...
								
								
						}
					    });
					 }   
				}//end of success
			});	// end of ajax			 
		}
	});

		
												

	$("#settings_utilitiesConfig_button").click(function(){		
		if($("#settings_utilitiesConfig_button").hasClass("gray_out")) return;	
		document.form_backup.submit();
	});
	
       
	$("#settings_utilitiesReset_button").click(function(){	
		if($("#settings_utilitiesReset_button").hasClass("gray_out")) return;		
		switch(parseInt($("#id_utilitiesReset").attr("rel"),10))
		{
			case 0://restore
				restore_system();
			break;	
			
			case 1://quick
				restore_quick();
			break;
			
			case 2://full
				restore_full();
			break;
		}
	});	
	
	$("#settings_utilitiesShutdown_button").click(function(){		
		if($("#settings_utilitiesShutdown_button").hasClass("gray_out"))return;		
		{							
			wd_ajax({
				type:"POST",
				async:false,
				cache:false,
				url:"/cgi-bin/hd_config.cgi",
				data:{cmd:'cgi_Detect_Dangerous'},
				dataType: "xml",
				success: function(xml){		
								
				var res = $(xml).find('res').text();
				
				if ( parseInt(res) != 0)	//volume format now,don't support restart and reboot
					jAlert( _T('_format','msg17'), _T('_common','error'));	//Text:Device shutdown or restarted is prohibited when disk formatting/firmware uploading is in progress.
				else
				{	
					jConfirm('M', _T('_system','msg4'),_T('_utilities','shutdown'),'i',function(r){
						if(r)
						{
								setTimeout('stop_web_timeout();', 1000);	
								var overlayObj=$("#shutdownDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
									overlayObj.load();										
							wd_ajax({
								type:"POST",
								async: false,
								cache: false,
								url: "/cgi-bin/system_mgr.cgi",
								data: "cmd=cgi_shutdown"
							});//end of .ajax...
						
						}//end of if(r)
					
					});//end of parent.jConfirm(...
				}	
				
				}//end of success
			});	// end of ajax	
		}
	});

	
}

function start_upload()
{
   if(window.attachEvent){
        document.getElementById("upload_target").attachEvent('onload', u_uploadCallback);
    }
    else{
        document.getElementById("upload_target").addEventListener('load', u_uploadCallback, false);
    }
         
		document.form_restore.f_ip.value = document.domain;				
		if (document.form_restore.settings_utilitiesImport_button.value == "")
		{
			jAlert(_T('_system','msg5'), _T('_common','error'));
			return;
		}		
		jLoading(_T('_common','set') ,'loading' ,'s',""); 	
		document.form_restore.submit();
}
function u_uploadCallback()
{
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		data:"cmd=cgi_get_restore_status",			
		success: function(data){
			jLoadingClose();
			if (data == "-1")
			{
				jAlert( _T('_system','msg1'), _T('_common','error'));	
			}
			else
			{
								setTimeout('stop_web_timeout();', 1000);
								var overlayObj=$("#rebootDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
								overlayObj.load();	
								count();
								wd_ajax({
										type:"POST",
										async: true,
										cache: false,
										url: "/cgi-bin/system_mgr.cgi",
										data: "cmd=cgi_restart",
										success: function(data){				
														}			
									});//end of .ajax...
			}	
		}
		,
		error:function(xmlHttpRequest,error){   
		}  
	});
}
var fmtQ_timeoutId = -1;
function Restore_format_volume(typ)
{
		var my_info = new Array();	
		var vol = "a";
		wd_ajax({
					url: FILE_USED_VOLUME_INFO,
						type: "POST",
					async:false,
					cache:false,
					dataType:"xml",
					success: function(xml){
						USED_VOLUME_INFO = xml;
					},
	            error:function (xhr, ajaxOptions, thrownError){}  
			});	
			
			if (vol == "a")	//all volume
			{
				var idx = 0;
				$('volume_info > item', USED_VOLUME_INFO).each(function(){
					if( parseInt($('mount_status',this).text(), 10)==1 ){
						my_info[idx] = new Array();	
						my_info[idx][0] = $('volume',this).text();
						my_info[idx][1] = (typ == "quick")?0:1;
						my_info[idx][2] = $('mount',this).text();  
						my_info[idx][3] = $('device',this).text();
						my_info[idx][4] = $('used_device',this).text();
						my_info[idx][5] = '1';
						idx++;	
					}
				});//end of each
			}			
			//$("#formatQ_state").html(_T('_format','initializing') + "...");			
			$("#formatQ_progressbar").progressbar({value: 0});																
			$("#formatQ_percent").html("&nbsp;&nbsp;0%&nbsp;&nbsp;");		
			
			wd_ajax({
			url:"/cgi-bin/hd_config.cgi",
			type:"POST",
			data:{
				cmd:'cgi_FMT_Wipe_DiskMGR',
				f_wipe_volume_info:my_info.toString(),
				form:typ},
				async:false,
		    cache:false, 
				dataType:"xml",
				success: function(xml){		
					fmt_QtimeoutId = setTimeout(Restore_FormatDisk_state,1000);	
					
					if (typ == "full")
					{
							$("#settings_utilitiesRestoreSwitchToQuick_button").show();		
					}	
				}
		});	
}


function Restore_FormatDisk_state()
{
	clearTimeout(fmt_QtimeoutId);
	/* ajax and xml parser start*/
		wd_ajax({
			url:FILE_DM_READ_STATE,
			type:"POST",
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
						 var bar_amount="";
						 var bar_state="";
						 var bar_desc="";
						 var bar_errcode="";
						 var mesg="";
						 
						 bar_amount = $(xml).find("dm_state>percent").text();
						 bar_state=$(xml).find("dm_state>finished").text();
						 bar_errcode=$(xml).find("dm_state>errcode").text();
						 bar_desc=$(xml).find("dm_state>describe").text();
//console.log("bar_amount = %s ",bar_amount);						 
						 if ( parseInt(bar_state) == 1 || parseInt(bar_errcode) != 1  )
						 {
								$("#formatQ_progressbar").progressbar('option', 'value', 100);
								$("#formatQ_percent").html("&nbsp;&nbsp;100%&nbsp;");		
								
								setTimeout(function(){
													var overlayObj=$("#RestoreFullDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
													overlayObj.close();
																									
													//reset to default
													var overlayObj=$("#rebootDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
													overlayObj.load();	
													count();
								},1000);						
								return;																				
						 }						 
						 $("#formatQ_progressbar").progressbar('option', 'value', parseInt(bar_amount,10));						 
						 $("#formatQ_percent").html("&nbsp;&nbsp;" + parseInt(bar_amount,10) + "%&nbsp;&nbsp;");						 
						 fmt_QtimeoutId = setTimeout(Restore_FormatDisk_state,3000);										
			},//end of success: function(xml){
			error:function()
			{
				 fmt_QtimeoutId = setTimeout(Restore_FormatDisk_state,3000);
			}
				
		}); //end of wd_ajax({	
}
function switch_quick_restore()
{
//	$("#RestoreFullDiag").overlay().close();
//	
//	adjust_dialog_style(400,276,0,0);
//	var overlayObj=$("#rebootDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
//	overlayObj.load();	
//	count();
	
	$("#Restore_title").empty().html(_T('_utilities','quick_factory_restore'))
	$("#settings_utilitiesRestoreSwitchToQuick_button").hide();
	
	setTimeout(function(){					
	$.ajax({
			type:"POST",
			async: false,
			cache: false,
			url: "/cgi-bin/system_mgr.cgi",
			data: "cmd=switch_quick_restore"
		});//end of .ajax...
	},1000);
}


function restore_system()
{			
		wd_ajax({
			type:"POST",
			async:false,
			cache:false,
			url:"/cgi-bin/hd_config.cgi",
			data:{cmd:'cgi_Detect_Dangerous'},
			dataType: "xml",
			success: function(xml){										
				var res = $(xml).find('res').text();				
				if ( parseInt(res) != 0)	//volume format now,don't support restart and reboot
					jAlert( _T('_format','msg17'), _T('_common','error'));	//Text:Device shutdown or restarted is prohibited when disk formatting/firmware uploading is in progress.
				else
				{					
						var str = _T('_system','default_system')
							jConfirm('M',str,_T('_utilities','restore_title'),'i',function(r){
							if(r)
							{
										setTimeout('stop_web_timeout();', 1000);												
										var overlayObj=$("#rebootDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
											overlayObj.load();	
											rebootFinishTimeout = setTimeout(reboot_finish,1000);		
											wd_ajax({
													type:"POST",
													async: true,
													cache: false,
													url: "/cgi-bin/system_mgr.cgi",
													data: "cmd=cgi_restore"
												});//end of .ajax...
											
							}
						  });
				}   
			}//end of success
		});	// end of ajax				
}
function restore_quick(){	
      	wd_ajax({
				type:"POST",
				async:false,
				cache:false,
				url:"/cgi-bin/hd_config.cgi",
				data:{cmd:'cgi_Detect_Dangerous'},
				dataType: "xml",
				success: function(xml){										
					var res = $(xml).find('res').text();				
					if ( parseInt(res) != 0)	//volume format now,don't support restart and reboot
						jAlert( _T('_format','msg17'), _T('_common','error'));	//Text:Device shutdown or restarted is prohibited when disk formatting/firmware uploading is in progress.
					else
					{					
							//You are about to reset all configuration settings.\nThis will not affect data stored on the drive.\nPress OK to continue.
							var str = _T('_system','default_quick')
							jConfirm('M',str,_T('_utilities','quick_restore'),'i',function(r){
							if(r)
							{
										setTimeout('stop_web_timeout();', 1000);											
										
										//var overlayObj=$("#rebootDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
										//count();
										
										$("#settings_utilitiesRestoreSwitchToQuick_button").hide();
																													
										$("#Restore_title").empty().html(_T('_utilities','quick_factory_restore'));					
										var overlayObj=$("#RestoreFullDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
										overlayObj.load();	
											
										setTimeout(function(){
											Restore_format_volume('quick');
										},500);
							}
						    });
					}   
				}//end of success
			});	// end of ajax				        
}		
function restore_full(){    
    	wd_ajax({
			type:"POST",
			async:false,
			cache:false,
			url:"/cgi-bin/hd_config.cgi",
			data:{cmd:'cgi_Detect_Dangerous'},
			dataType: "xml",
			success: function(xml){										
				var res = $(xml).find('res').text();				
				if ( parseInt(res) != 0)	//volume format now,don't support restart and reboot
					jAlert( _T('_format','msg17'), _T('_common','error'));	//Text:Device shutdown or restarted is prohibited when disk formatting/firmware uploading is in progress.
				else
				{					
						//You are about to reset all configuration settings.\nThis will not affect data stored on the drive.\nPress OK to continue.
						var str = _T('_system','default_full')
						jConfirm('M',str,_T('_utilities','full_restore'),'i',function(r){
						if(r)
						{
									setTimeout('stop_web_timeout(true);', 1000);											
									
									$("#Restore_title").empty().html(_T('_utilities','full_factory_restore'));
									var overlayObj=$("#RestoreFullDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
									overlayObj.load();	
													
									setTimeout(function(){	
										Restore_format_volume('full'); 
									},500);
						}
					  });
				}   
			}//end of success
		});	// end of ajax				        
}

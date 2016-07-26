function diskmgnt_hd_info()
{
	if (HOME_XML_CURRENT_HD_INFO == "")//re-load current_hd_info.xml
	{
		Home_Load_CURRENT_HD_INFO();// in function.js
	}
	
	var hd_info = new Array();
	$('item', HOME_XML_CURRENT_HD_INFO).each(function(e){
		var idx = parseInt($('scsi',this).text(),10);
		hd_info[idx] = new Array();
		hd_info[idx][0] = $('device_name',this).text();
		hd_info[idx][1] = $('scsi',this).text();
		hd_info[idx][2] = $('vendor',this).text();
		hd_info[idx][3] = $('model',this).text();
		hd_info[idx][4] = $('hd_serial',this).text();
		hd_info[idx][5] = $('hd_size',this).text();
		hd_info[idx][6] = $('hd_GiB_size',this).text();
		hd_info[idx][7] = $('sdx2_size',this).text();
		hd_info[idx][8] = $('allowed',this).text();
	});	//end of each
				
	DISK_MGNT_HD_INFO = hd_info;
}

function diskmgnt_hd_showname(str)	//sda -> Drive1 
{
	var my_slot = "", val = "";
	
	for(var i=0;i<DISK_MGNT_HD_INFO.length;i++)
	{
		if ((typeof DISK_MGNT_HD_INFO[i] != "undefined") )
		{
			if ( DISK_MGNT_HD_INFO[i][0]== str)
			{
				my_slot = DISK_MGNT_HD_INFO[i][1];
				break;
			}
		}	
	}
	
	if (my_slot != "")
	{
		switch(parseInt(my_slot, 10))
		{
			case 0:
				val = _T('_raid','desc12')+"1";
			break;
			
			case 1:
				val = _T('_raid','desc12')+"2";
			break;
			
			case 2:
				val =  _T('_raid','desc12')+"3";
			break;
			
			case 3:
				val = _T('_raid','desc12')+"4";
			break;
		}
	}
	return val;
}
function diskmgnt_hd_allow(scsi_idx)
{
	for(var i=0;i<DISK_MGNT_HD_INFO.length;i++)
	{
		if ( parseInt(DISK_MGNT_HD_INFO[i][1], 10) == parseInt(scsi_idx))
		{
			return DISK_MGNT_HD_INFO[i][8];
		}
	}
}
function system_disks_details_diag(idx)
{	
	var hd_info = DISK_MGNT_HD_INFO;
				
	for(var i=0;i<hd_info.length;i++)
	{
		if ((typeof hd_info[i] != "undefined") )
		{
			if (parseInt(hd_info[i][1],10) == ( parseInt(idx,10) - 1))
			{
				$('#DiskMgmt_details table tr').each(function(n){
					
					switch(n)
					{
						case 1://Model
							$('td:eq(1)', this).html(hd_info[i][3]);
						break;
						case 2:
							$('td:eq(1)', this).html(hd_info[i][4]);
						break;
						case 3:
							var my_size = size2str(parseInt(hd_info[i][5], 10) * 1024);
							$('td:eq(1)', this).html(my_size);
						break;
						case 4:
							$('td:eq(1)', this).html(hd_info[i][9]);
						break;
						default://Vendor
							$('td:eq(1)', this).html(hd_info[i][2]);
						break;
					}
					
				});
				break;
			}
		}
	}
	var my_title = _T('_disk_mgmt','title4');
	$("#DiskMgmt_Diag_title").html(my_title);
	$("#DiskMgmt_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	$("#DiskMgmt_details").show();
	$("#DiskMgmt_smartdata").hide();
	init_button();
	language();
	 $("#DiskMgmt_Diag").overlay().load();
 	
 	$("#DiskMgmt_Diag .close").click(function(){
		
		$("#DiskMgmt_Diag").overlay().close();
	});
}
function system_smart_data_diag(idx)
{	
	var _jScrollPane = "";
	var my_flexigrid_id_width = (MULTI_LANGUAGE == "15")?"90":"80";
	var my_flexigrid_item_width = (MULTI_LANGUAGE == "15")?"230":"240";
	var my_dev = idx.replace(/1/,"sda").replace(/2/,"sdb").replace(/3/,"sdc").replace(/4/,"sdd");
	if ($("#DiskMgmt_SMART_Data").parent().hasClass('bDiv'))
	{	
		$("#DiskMgmt_SMART_Data").flexOptions({ f_field: my_dev }).flexReload();
	}
	else
	{	
		$("#DiskMgmt_SMART_Data").flexigrid({						
			url: '/cgi-bin/smart.cgi',		
			dataType: 'xml',
			cmd: 'cgi_Status_SMART_HD_Info',	
			colModel : [
				{display: "ID", name : 'my_id', width : my_flexigrid_id_width, align: 'left'},			
				{display: "Name", name : 'my_name', width : my_flexigrid_item_width, align: 'left'},			
				{display: "Value", name : 'my_value', width : 80, align: 'left'},		
				{display: "Worst", name : 'my_worst', width : 100, align: 'left'},
				{display: "Thresh", name : 'my_thresh', width : 100, align: 'left'}	
//				{display: "Raw Value", name : 'my_raw_value', width : '80', align: 'center'}
				],
			usepager: false,       //啟用分頁器
			useRp: true,
			rp: 300,               //預設的分頁大小(筆數)
			showTableToggleBtn: true,
			f_field:my_dev,
			width:  650,
			height: 'auto',
			errormsg: _T('_common','connection_error'),		//Text:Connection Error
			nomsg: _T('_common','no_items'),				//Text:No items
			//singleSelect: true,
			noSelect:true,
		    striped:true,   //資料列雙色交差
		    resizable: false,
		    onSuccess:function(){
		    	
		    		 _jScrollPane = $("#DiskMgmt_smartdata_content").jScrollPane();
		    	
		    },//end of onSuccess..
	    	preProcess: function(r) {
	    		return r;
	    	}
		});  
	}
	
	var my_title = diskmgnt_hd_showname(idx) +" "+ _T('_disk_mgmt','desc13');
	$("#DiskMgmt_Diag_title").html(my_title);
	
	adjust_dialog_size("#DiskMgmt_Diag", 750, "");
	
	
	$("#DiskMgmt_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	$("#DiskMgmt_details").hide();
	$("#DiskMgmt_smartdata").show();
	
	init_button();
	language();
	
	$("#DiskMgmt_Diag").overlay().load();
 	
 	$("#DiskMgmt_Diag .close").click(function(){
		
		$("#DiskMgmt_Diag").overlay().close();
	});
}
function system_disks_list()
{
	var disk_temp = new Array();
		wd_ajax({
				url: "/xml/sysinfo.xml",
				type: "GET",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){						
						//$('disks > disk', xml).each(function(idx){
						$(xml).find('disks').find('disk').each(function(idx){
								if ( $('sn',this).text() != "none"){							
									var my_temp = (parseInt($('temp',this).text(),10) < 1) ? "":$('temp',this).text()+" &deg;C";
									disk_temp[parseInt($(this).attr('id'),10)] = my_temp;						
								}	
						});		
				},
        error:function (xhr, ajaxOptions, thrownError){}  
	});	
	
	$("#system_disks_list").flexigrid({						
		url: '/cgi-bin/home_mgr.cgi',		
		dataType: 'xml',
		cmd: '4',	
		colModel : [
			{display: "--", name : 'my_icon', width : '40', align: 'left'},				
			{display: "Drive", name : 'my_drive', width : '80', align: 'left'},			
			{display: "Size", name : 'my_size', width : '100', align: 'right'},			
			{display: "Status", name : 'my_status', width : '150', align: 'right'},		
			{display: "HD Version", name : 'f_hd_version', width : '0', align: 'right',hide: true},
			{display: "SMART Data", name : 'f_smart_data', width : '150', align: 'right'}		
			],
		usepager: false,       //啟用分頁器
		useRp: true,
		rp: 10,               //預設的分頁大小(筆數)
		showTableToggleBtn: true,
		width:  'auto',
		height: 'auto',
		errormsg: _T('_common','connection_error'),		//Text:Connection Error
		nomsg: _T('_common','no_items'),				//Text:No items
		noSelect:true,
		singleSelect: true,
	    striped:true,   //資料列雙色交差
	    resizable: false,
	    onSuccess:function(){
	    	$('#system_disks_list > tbody > tr td:nth-child(1) div').each(function(n){
	    		$(this).css('padding','8px 0px 0px 0px');
	    	});	
	    	
	    	$('#system_disks_list > tbody > tr td:nth-child(2) div').each(function(idx){
	    		if ($('#system_disks_list > tbody > tr:eq('+idx+') td:nth-child(5) div').text() != "-")
	    		{
	            	var my_disk = $(this).text().replace(/Disk/,_T('_raid','desc12'));
	            	var idx = $(this).text().substr($(this).text().length -1 ,$(this).text().length);
	            	$(this).addClass('edit_detail').attr('onclick','system_disks_details_diag('+idx+')');
	            }	
            });//end of $('#downloads_status > tbody > tr td:nth-child(3) div span..
            
            $('#system_disks_list > tbody > tr td:nth-child(6) div').each(function(n){
            	if ($(this).text() != "-")
            	{
	            	var my_idx = $(this).text();
	            	$(this).text(_T('_disk_mgmt','desc13'));
	            	$(this).addClass('edit_detail').attr('onclick','system_smart_data_diag(\"'+my_idx+'\")');
            	}
            	else
            	{
            		$(this).text(_T('_raid','unknown'));
            	}	
            });//end of $('#downloads_status > tbody > tr td:nth-child(3) div span..
            
            
           $('#system_disks_list > tbody > tr').each(function(n){           	
           	var j = $(this).find("td:eq(1)").text();         
           	var t = j.substr(j.length -1,j.length);           	           	
           	$(this).find("td:eq(2)").after('<td align="left"><div style="text-align: right; width: 100px;">'+disk_temp[t]+'</div></td>');           	           	
          });
            
	    },//end of onSuccess..
    	preProcess: function(r) {
    		
    		$(r).find('row').each(function(idx){
					 var my_scsi = parseInt($(this).find('cell').eq(1).text(),10) - 1;
					 
					//disk
					var my_disk = _T('_raid','desc12') + $(this).find('cell').eq(1).text();
					$(this).find('cell').eq(1).text(my_disk);
					
					//size
					var my_size = ($(this).find('cell').eq(2).text()!= "-")? size2str($(this).find('cell').eq(2).text()):_T('_raid','unknown');	
					$(this).find('cell').eq(2).text(my_size);
					
					//disk status:allow/good/bad
					var my_disk_status = $(this).find('cell').eq(3).text();
					switch($(this).find('cell').eq(3).text())
					{
						case "incompatible":
							$(this).find('cell').eq(3).text(_T('_disk_mgmt','desc10'));
						break;
						
						case "healthy":
							$(this).find('cell').eq(3).text(_T('_disk_mgmt','desc8'));
						break;
						
						case "non-healthy":
							$(this).find('cell').eq(3).text(_T('_disk_mgmt','desc9'));
							$("#disk_mgmt_state").html(_T('_disk_mgmt','desc9'));
						break;
					}
					
					//hd version
					if ($(this).find('cell').eq(4).text()!= "-")
					{
						DISK_MGNT_HD_INFO[my_scsi][9] = $(this).find('cell').eq(4).text();
					}	
					
			});//end of each 
    		
    		if (parseInt($(r).find('total').text(), 10) == 0)
    		{
    			$("#disk_mgmt_state").html(_T('_disk_mgmt','desc11'));
    		}	
    		
			$("#icon_loading").hide();
			
			return r;
    	}
	});  
}


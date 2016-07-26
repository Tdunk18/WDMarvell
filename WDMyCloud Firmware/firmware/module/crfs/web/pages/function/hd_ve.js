function ve_list()
{
	$("#VE_List").flexigrid({						
		url: '/cgi-bin/ve_mgr.cgi',		
		dataType: 'xml',
		cmd: 'cgi_VE_List',	
		colModel : [
			/* 0 */{display: "--", name : 'my_vol', width : '100', sortable : true, align: 'left'},			//Text:Volume Name
			/* 1 */{display: "--", name : 'my_mode', width : '80', sortable : true, align: 'left'},				//Text:Mode
			/* 2 */{display: "--", name : 'my_file_system', width : '100', sortable : true, align: 'left'},	//Text:File System
			/* 3 */{display: "--", name : 'my_mount', width : '100', sortable : true, align: 'center'},				//Text:Mount
			/* 4 */{display: "--", name : 'my_save', width : '250', sortable : true, align: 'center'},				//Text:Mount
			],
		usepager: false,       //啟用分頁器
		useRp: true,
		rp: 10,               //預設的分頁大小(筆數)
		showTableToggleBtn: true,
		width:  650,
		height: 'auto',
		errormsg: _T('_common','connection_error'),		//Text:Connection Error
		nomsg: _T('_common','no_items'),				//Text:No items
		singleSelect:true,
	    striped:true,   //資料列雙色交差
	    resizable: false,
	    onSuccess:function(){ 
	    	
	    	$('.Tooltip').remove();
    		init_tooltip();
    			
	    },//end of onSuccess..
    	preProcess: function(r) {
    		var my_html = "";
    		$(r).find('row').each(function(idx){
    			
    			//RAID Mode
    			var my_mode = INTERNAL_RaidLeve_HTML($(this).find('cell').eq(1).text());
    			$(this).find('cell').eq(1).text(my_mode);
    			
    			//File system
    			var my_filesystem = INTERNAL_File_System_HTML($(this).find('cell').eq(2).text());
    			$(this).find('cell').eq(2).text(my_filesystem);
    			
    			//Mount
    			var my_val = $(this).find('cell').eq(3).text();
    			if (my_val != "--")
    			{	
    				my_html = "<div class='edit_detail' style='padding:0px 0px 0px 0px;' onClick=ve_mount_diag(\'"+ my_val+"\');>"+_T('_ve','mount')+"</div>";
    				$(this).find('cell').eq(3).text(my_html);
    			}
    			
    			//download icon
    			var my_val = $(this).find('cell').eq(4).text();
    			if (my_val != "--")
    			{
    				my_html = '<div class="list_icon">';
		    		my_html +="<div class='download TooltipIcon' onClick=ve_save_key(\'"+ my_val +"\'); title='"+_T('_tip','ve_download_key')+"'></div>";
		    		my_html += '</div>';
		    		$(this).find('cell').eq(4).text(my_html);
    			}
    		});	
    		
			if (parseInt($(r).find('total').text(), 10) == 0)
				$("#VE_List_Button").hide();
			else
				$("#VE_List_Button").show();

			return r;
    	}
	}); 
}


function ve_save_key(my_vol)
{
	var my_mount_info = new Array();	
	my_mount_info = Internal_VE_Mount_Info_Get(my_vol);	
	
	var my_vol = "Volume_" + my_mount_info[0].toString();
	$("#VE_Save_Vol").attr('value', my_vol);
	$("#VE_Save_Dev").attr('value',my_mount_info[1].toString());
	
	document.form2.submit();
	
}
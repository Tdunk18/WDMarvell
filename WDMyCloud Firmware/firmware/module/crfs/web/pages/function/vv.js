
var vol_list_grid = false;
function VirtualVol_List_Refresh(flag)
{
	wd_ajax({
		url:"/cgi-bin/virtual_vol.cgi",
		type: "POST",
		data:{cmd:'cgi_VirtalVol_Refresh'},
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
			
			if (parseInt(flag, 10) == 1)	
				$("#VV_List").flexReload();
			else
				$("#View_LUN_List").flexReload();	
			
		}
	});//end of ajax...
}
function VirtualVol_List()
{
	if (vol_list_grid)
	{
		VirtualVol_List_Refresh(1);
		return;
	}

	 $("#VV_List").flexigrid({	
    		url: '/cgi-bin/virtual_vol.cgi',		
    		dataType: 'xml',
    		cmd: 'cgi_VirtalVol_List',	
    		colModel : [
    		    {display: "Target", name : 'f_target', width : 335, align: 'left'},
    			{display: "--", name : 'f_connect', width : 150,  align: 'left'}, 
    			{display: "--", name : 'f_view', width : 40,  align: 'left'},  			
    			],
    		usepager:true,
    		useRp: true,
    		page: 1, 
    		rp: 10,
    		showTableToggleBtn: false,
    		singleSelect:true,
    		width: 650,
    		height: 'auto',
    		errormsg: _T('_common','connection_error'),		//Text:Connection Error
			nomsg: _T('_common','no_items'),				//Text:No items
    		noSelect:false,
    		resizable: false,
    		rpOptions: [20],
    		onSuccess:function(){
    			
    			init_tooltip();
    			
    		},//end of onSuccess..
    		preProcess: function(r) {
    			
				$(r).find('row').each(function(idx){
						//Status
						var my_state = $(this).find('cell').eq(1).text()
						.replace(/0/g,_T('_vv','desc16'))
    					.replace(/1/g,_T('_vv','desc15'))
    					.replace(/2/g,_T('_vv','desc14'))
    					.replace(/3/g,_T('_vv','desc17'))
    					.replace(/4/g,_T('_vv','desc13'));
    					$(this).find('cell').eq(1).text(my_state);
    					
    					//Deatil
    					var my_html = '<div class="list_icon">';
    					var my_idx = $(this).find('cell').eq(2).text();
    					my_html +="<div class='detail TooltipIcon' onClick=VirtualVol_View_Diag(\'"+ my_idx+"\'); title='"+_T("_usb_backups", "details")+"'></div>";
    					my_html += '</div>';
    					$(this).find('cell').eq(2).text(my_html);
				});	
				
				if (parseInt($(r).find('total').text(), 10) == 0)
				{
						$("#DIV_VV_List").hide();
						$("#TD_VV_Modify_Button").hide();
				}		
				else
				{
					$("#DIV_VV_List").show();
					$("#TD_VV_Modify_Button").show();
				
					timeoutId = setTimeout(function() {
	    				$("#VV_List").flexReload();
					}, 5000);
				}	
				
				if (parseInt($(r).find('total').text(), 10) == 8)
					$("#TD_VV_Create_Button").hide();
				else
					$("#TD_VV_Create_Button").show();
					
				return r;
    		}
    }); 
    vol_list_grid = true;
}

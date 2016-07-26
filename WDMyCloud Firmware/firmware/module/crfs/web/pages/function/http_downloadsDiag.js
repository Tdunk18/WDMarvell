var HTTP_Modify = new Array(
"0",					//HTTP_Modify[0]:Category,ex:0->HTTP Downloads, 1->FTP Downloads
"1",					//HTTP_Modify[1]:Login Method,ex:0->Account,1->Anonymous
getCookie("username"),	//HTTP_Modify[2]:Login User
"",						//HTTP_Modify[3]:User
"",						//HTTP_Modify[4]:PWD
"0",					//HTTP_Modify[5]:Type, 0->File,1->Folder
"",						//HTTP_Modify[6]:URL
"",						//HTTP_Modify[7]:Save To
"",						//HTTP_Modify[8]:Date
"none",					//HTTP_Modify[9]:f_period:$("#f_period").attr('rel'),
"",						//HTTP_Modify[10]:f_period_week:$("#f_period_week").attr('rel'),
"",						//HTTP_Modify[11]:f_period_month:$("#f_period_month").attr('rel'),
"",						//HTTP_Modify[12]:Incremental Backup
"",						//HTTP_Modify[13]:Rename
"",						//HTTP_Modify[14]:CodePage
""						//HTTP_Modify[15]:idx
)
function HDownload_Modify_init()
{
	HTTP_Modify = new Array(
	"0",					//HTTP_Modify[0]:Category,ex:0->HTTP Downloads, 1->FTP Downloads
	"1",					//HTTP_Modify[1]:Login Method,ex:0->Account,1->Anonymous
	getCookie("username"),	//HTTP_Modify[2]:Login User
	"",						//HTTP_Modify[3]:User
	"",						//HTTP_Modify[4]:PWD
	"0",					//HTTP_Modify[5]:Type, 0->File,1->Folder
	"",						//HTTP_Modify[6]:URL
	"",						//HTTP_Modify[7]:Save To
	"",						//HTTP_Modify[8]:Date
	"none",					//HTTP_Modify[9]:f_period:$("#f_period").attr('rel'),
	"",						//HTTP_Modify[10]:f_period_week:$("#f_period_week").attr('rel'),
	"",						//HTTP_Modify[11]:f_period_month:$("#f_period_month").attr('rel'),
	"",						//HTTP_Modify[12]:Incremental Backup
	"",						//HTTP_Modify[13]:Rename
	"",						//HTTP_Modify[14]:CodePage
	""						//HTTP_Modify[15]:idx
	)
}
function HDownload_test()
{
	$("#HDownloads_test_waiting_tr").show();
	
	if ( HTTP_Modify[15].length == 0)
	{
		var HTTP_Downloads_Test = new Array(
			/*0*/ HTTP_Downloads[6],
			/*1*/	HTTP_Downloads[5],
			/*2*/	HTTP_Downloads[3],
			/*3*/ HTTP_Downloads[4],
			/*4*/ HTTP_Downloads[2],
			/*5*/ HTTP_Downloads[14]
		);	
	}
	else
	{
		var HTTP_Downloads_Test = new Array(
			/*0*/ HTTP_Modify[6],
			/*1*/	HTTP_Modify[5],
			/*2*/	HTTP_Modify[3],
			/*3*/ HTTP_Modify[4],
			/*4*/ HTTP_Modify[2],
			/*5*/ HTTP_Modify[14]
		);	
	}	
	wd_ajax({
    			url:"/cgi-bin/download_mgr.cgi",
    			type:"POST",
    			data:{	cmd:"Downloads_Schedule_Test",
    					f_src:HTTP_Downloads_Test[0],
    					f_type:HTTP_Downloads_Test[1],
    					f_user:HTTP_Downloads_Test[2],
    					f_pwd:HTTP_Downloads_Test[3],
    					f_field:HTTP_Downloads_Test[4],
    					f_lang:HTTP_Downloads_Test[5]},
    			async:false,
    			cache:false,
    			dataType:"xml",
    			success: function(xml)
    			{
    			   	$("#HDownloads_test_waiting_tr").hide();
    			    $("#HDownloads_test_res_tr").show();
    			     
    			    var my_html="";
    			     
    			    var str = $(xml).find('config > result').text();
    			    var fsize = $(xml).find('config > size').text();
    			    var f_src = $(xml).find('config > src').text();
    			    
              my_html += "<table width='450' border='0'><tr>";
    			    my_html += "<td width='100' align='left' valign='top'><b>"+_T('_backup','url')+"</b></td>";
    			    my_html += "<td align='left' style='word-break: break-all;'>&nbsp;"+f_src+"</td></tr>";
    			      
    			    if (parseInt(str) == 0)
                   my_html += "<tr><td align='left'><b>"+_T('_download','test_result')+"&nbsp;</b></td><td align='left'>&nbsp;"+_T('_download','successful')+"</td></tr>";
              else
                   my_html += "<tr><td align='left'><b>"+_T('_download','test_result')+"&nbsp;</b></td><td align='left'>&nbsp;"+_T('_download','fail')+"</td></tr>";
              
              if (parseInt(fsize,10) < 1)
                  my_html += "<tr><td align='left'><b>"+_T('_download','file_size')+"&nbsp;</b></td><td align='left'>&nbsp;"+_T('_download','unavailable')+"</td></tr>";
              else
                 my_html += "<tr><td align='left'><b>"+_T('_download','file_size')+"&nbsp;</b></td><td align='left'>&nbsp;"+fsize+" "+_T('_download','bytes')+"<br>"; 
                 
              my_html += "</td></tr></table>";    
              $('#HDownloads_test_res').html(my_html);
                    
    			}
    	}); 
}
function HDownload_test_diag()
{
	 HDownload_test();
	 
	 var HDownloadsDiag_obj=$("#HDownloads").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE('HDownloads');
	$('#HDownloads_Test').show();
	
	init_button();
	language();
	
	$("#HDownloads_title").html(_T('_http_downloads','title3'));
	
	HDownloadsDiag_obj.load();
	
	_jScrollPane = $(".httpdownloads_url_scroll").jScrollPane();
	
	$("#HDownloads .close").click(function(){
		if (_jScrollPane != "")
		{
			var api = _jScrollPane.data('jsp');
			api.destroy();
			_jScrollPane = "";
		}
		
		HDownloadsDiag_obj.close();
		
		$('#HDownloads_test_waiting_tr').hide();
		$('#HDownloads_test_res_tr').hide();
		$('#HDownloads_test_res').empty();
		
		INTERNAL_DIADLOG_BUT_UNBIND("HDownloads");
		INTERNAL_DIADLOG_DIV_HIDE("HDownloads");
	});
}
function HDownload_saveto()
{
	open_folder_selecter({
				title: _T('_usb_backups', 'select_dest_dir'),
				device: "HDD", //HDD, USB, ..., ALL
				root: '/mnt/HD',
				cmd: 'cgi_read_open_tree',
				script: '/cgi-bin/folder_tree.cgi',
				effect: 'no_son',
				formname: 'generic',
				textname: null,
				filetype: 'all',
				checkbox_all: 2,
				showfile: 1,
				chkflag: 1, //for show check box, 1:show, 0:not
				chk:1,
				callback: null,
				single_select: true,
				over_select_msg: _T("_usb_backups", "over_select_msg"),
				afterOK: function() {
						var sel_source_ele = $("#folder_selector input:checkbox:checked[name=folder_name]");				
						sel_source_ele.each(function(k){					
						var _path = translate_path_to_display($(this).val());
						$("#apps_httpdownloadsSaveTo_text").val(_path);
					});
				},
				afterCancel: function() {
				}
		});
}
function HDownload_get_detail_info(idx)
{
	HDownload_Modify_init();
	
	wd_ajax({
			url: "/cgi-bin/download_mgr.cgi",
			type: "POST",
			data: {cmd:'Downloads_Schedule_Info',f_idx:idx,f_login_user:getCookie("username")},
			async: false,
			cache:false,
			dataType:"xml",
			success: function(xml){	
					
					/*
					HTTP_Modify = new Array(
					"0",					//HTTP_Modify[0]:Category,ex:0->HTTP Downloads, 1->FTP Downloads
					"1",					//HTTP_Modify[1]:Login Method,ex:0->Account,1->Anonymous
					getCookie("username"),	//HTTP_Modify[2]:Login User
					"",						//HTTP_Modify[3]:User
					"",						//HTTP_Modify[4]:PWD
					"0",					//HTTP_Modify[5]:Type, 0->File,1->Folder
					"",						//HTTP_Modify[6]:URL
					"",						//HTTP_Modify[7]:Save To
					"",						//HTTP_Modify[8]:Date
					"none",					//HTTP_Modify[9]:f_period:$("#f_period").attr('rel'),
					"",						//HTTP_Modify[10]:f_period_week:$("#f_period_week").attr('rel'),
					"",						//HTTP_Modify[11]:f_period_month:$("#f_period_month").attr('rel'),
					"",						//HTTP_Modify[12]:Incremental Backup
					"",						//HTTP_Modify[13]:Rename
					"",						//HTTP_Modify[14]:CodePage
					""						//HTTP_Modify[15]:idx
					)
					*/
					
					//idx
					HTTP_Modify[15] = $(xml).find("idx").text();	
					
					//task name
					HTTP_Modify[14]= $(xml).find("task").text();	
					
					//check Login Method
					var user_name = $(xml).find("src_user").text();
					if (user_name.length > 0)   //account
					{ 
					    HTTP_Modify[1] = "0";
					    HTTP_Modify[3] = $(xml).find("src_user").text();	
						HTTP_Modify[4] = $(xml).find("src_passwd").text();	
					}
				    else//Anonymous 
				    {
				       HTTP_Modify[1] = "1";
				       HTTP_Modify[3] = "";
				       HTTP_Modify[4] = "";
				    }	
					
					//Download URL
					HTTP_Modify[6] = $(xml).find("config>src").text();	
					
					//Save To
					HTTP_Modify[7] = translate_path_to_display($(xml).find("config>dest").text());	
					
					//type: file or folder & rename
					var f_type = $(xml).find("file_type").text();	
					if ( parseInt(f_type) == 1) // folder
					{
						HTTP_Modify[5] = "1";
						HTTP_Modify[13] = "";
					}
					else
					{
						HTTP_Modify[5] = "0";
						HTTP_Modify[13] = $(xml).find("rename").text();
					}
					
					/* When and Recurring Backup:
					0 -> download once;
					1 -> download per day;
					2 -> download per week
					3 -> download per month 	
					*/
					var period = $(xml).find("config>period").text();	
					var at = $(xml).find("execat").text();	
					var recur_date = $(xml).find("recur_date").text();	
					
					var hour_tmp = at.slice(8,10); 
					var min_tmp = at.slice(10,12); 
						
					switch (parseInt(period))	
					{
							case 1://Recurring Backup:dayily
								HTTP_Modify[8] = at;
								HTTP_Modify[9] = "day";
								
								$("#period_hour").attr("value",hour_tmp);
								$("#period_min").attr("value",min_tmp);
							break;
							
							case 2://Recurring Backup:weekly
								HTTP_Modify[8] = at;
								HTTP_Modify[9] = "week";
								
								switch(parseInt(recur_date))
								{
									case 1:
									case 2:
									case 3:
									case 4:
									case 5:
									case 6:
										HTTP_Modify[10] = recur_date;
									break;
									
									default:
										HTTP_Modify[10] = "0";
										$("#period_week").attr("value","0");
									break;
								}
								
							break;
							
							case 3://Recurring Backup:monthly
								HTTP_Modify[8] = at;
								HTTP_Modify[9] = "month";
								HTTP_Modify[11] = recur_date;
							break;
							
							default://Recurring Backup:none
								HTTP_Modify[8] = at;
								HTTP_Modify[9] = "none";
							break;
					}
						
					//Incremental
					HTTP_Modify[12] = $(xml).find("config>inc").text();
					
//					var msg = "";
//					for(var i=0;i<HTTP_Modify.length;i++)
//					{
//						msg += "["+i+"]"+HTTP_Modify[i].toString()+"\n";
//					}
//					alert(msg);
		}
	});
}
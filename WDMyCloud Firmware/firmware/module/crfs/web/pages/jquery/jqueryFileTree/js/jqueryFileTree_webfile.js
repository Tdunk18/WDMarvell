// jQuery File Tree Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Visit http://abeautifulsite.net/notebook.php?article=58 for more information
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// TERMS OF USE
// 
// jQuery File Tree is licensed under a Creative Commons License and is copyrighted (C)2008 by Cory S.N. LaViska.
// For details, visit http://creativecommons.org/licenses/by/3.0/us/
//
if(jQuery) (function($){
	
	$.extend($.fn, {
		fileTree_webfile: function(o, h) {
			// Defaults
			if( !o ) var o = {};
			if( o.root == undefined ) o.root = '/';
		//	if( o.script == undefined ) o.script = '/cgi-bin/account_mgr.cgi';
		//	if( o.script == undefined ) o.script = 'jqueryFileTree.php';
			if( o.folderEvent == undefined ) o.folderEvent = 'click';
			if( o.expandSpeed == undefined ) o.expandSpeed= 500;
			if( o.collapseSpeed == undefined ) o.collapseSpeed= 500;
			if( o.expandEasing == undefined ) o.expandEasing = null;
			if( o.collapseEasing == undefined ) o.collapseEasing = null;
			if( o.multiFolder == undefined ) o.multiFolder = true;
			if( o.loadMessage == undefined ) o.loadMessage = 'Loading...';
			if( o.formname == undefined ) o.formname = null;
			if( o.textname == undefined ) o.textname = null;
			if( o.chkflag == undefined ) o.chkflag = null;
			//alpha.amy++
			if( o.effect == undefined ) o.effect = null;
			//alpha.amy--
			
			$(this).each( function() {			
							
				function showTree(c, t,read) {					
					//fish+					
//alert(t);					
					if(__chkflag==0)
					{
						chg_path(t,o.formname,o.textname);
					}
					

					$(c).addClass('wait');
					$(".jqueryFileTree.start").remove();
				
				//	$.post(o.script, { dir: t, cmd:'cgi_open_tree', show_file: __file }, function(data) {
					var string = t;
					var new_str = string.substring(string.length-4,string.length);
								
					/*
						open new folder (by amy++)
					*/										
					//if (new_str == "new/")
					if ( $(c).hasClass("directory") && $(c).hasClass("collapsed") && $(c).hasClass("add"))
					{					
						if(o.textname!=null)
						{
							if ( o.formname == "generic")
								mainFrame.document.getElementById(o.textname).value="";
							else
							document.getElementById(o.textname).value="";
						}	
																		
						//var ret = prompt("Please input a new folder name");
						var ret = prompt( _T('_network_access','input_folder_name'));	//Text:Please input a new folder name
						//exception
						if (ret == null){
							$(c).removeClass('wait');								
							//alert("null");													
							return;
						}
						if (ret.replace(/^\s+|\s+$/g,"") == ""){
							alert( _T('_network_access','msg7'));	//Text:folder name cann't be empty. //alert("folder name cann't be empty.");
							$(c).removeClass('wait');return;}
						
						//fish+ for safari ,multi-line issue
						var s="";
						for(var i=0;i<ret.length;i++)
						{
							if(ret.charCodeAt(i)!=10)
								s += ret.charAt(i);
						}
						ret = s;
												
						var flag=Chk_Folder_Name(ret);
						if(flag==1)	//function.js
						{
							//alert('The folder name must not include the following characters: \\ / : * ? " < > | ')
							alert( _T('_network_access','msg3') );	//Text:The folder name must not include the following characters: \\ / : * ? " < > | 
							$(c).removeClass('wait');
							return;
						}
						else if(flag==2)
						{
							//alert("Not a valid folder name.")
							alert( _T('_network_access','msg4') );	//Text:Not a valid folder name.
							$(c).removeClass('wait');
							return;	
						}
						
						if(ret.length > 226)
						{
							//alert("Folder name length should be 1-226.");
							alert( _T('_network_access','msg5') );	//Text:Folder name length should be 1-226.
							$(c).removeClass('wait');
							return;
						}

						if (ret.replace(/^\s+|\s+$/g,"") == ""){
							//alert("Folder name cann't be empty.");
							alert( _T('_network_access','msg7'));	//Text:Folder name cann't be empty.
							$(c).removeClass('wait');return;}				
			
						//var new_f = string.substring(0,string.length-4) +ret;
						var new_f = unescape(string.substring(0,string.length-4));
						var filename = unescape(ret);
								$.post(o.script, { dir: unescape(new_f), filename:filename,cmd: 'cgi_open_new_folder', show_file: __file ,chk_flag: __chkflag,function_id:"webfile"}, function(data) {
								var mkdir_status=$(data).find('mkdir > status').text();
								if(mkdir_status=="error")
								{
										//alert("Cannot rename New Folder:A file with the name you specified already exists.Specify a different file name.")
										alert( _T('_network_access','msg8') );	//Text:Cannot rename New Folder:A file with the name you specified already exists.Specify a different file name.
								}		
								$(c).find('.start').html('');
								$(c).removeClass('wait').append("");
								if( o.root == t ) $(c).find('UL:hidden').show(); else $(c).find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
								//bindTree(c);  //amymark
								
								//collapsed
//								$(c).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
//								$(c).parent().parent().removeClass('expanded').addClass('collapsed');
								
								
								//expand
								
										
								$(c).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });																								
							//	$(c).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
							
							//	$(c).parent().parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });																								
							//	$(c).parent().parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
								
							//	$(c).parent().parent().find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });								
								showTree( $(c).parent().parent(), string.substring(0,string.length-4) );		
								$(c).parent().parent().removeClass('collapsed').addClass('expanded');																								
							
								//root-re-start	
//								if (string.substring(0,string.length-5) == o.root)						
//								{
//									$('#container_id').fileTree({ root: '/mnt' ,cmd: 'cgi_open_tree', script:'/cgi-bin/account_mgr.cgi'}, function(file) {        
//	    							});
//    							}

							});																						
						return;
					}
/*
 web file test
*/				
				
				 // 	jQuery('#flex1').flexOptions({used_dir: unescape(t)});      
				  	jQuery('#flex1').flexOptions({used_dir: unescape(t),newp:1,query:""});      				  	
					//	jQuery('#flex1').flexOptions({dir: "/mnt/HD/HD_a2/"});      
		  			jQuery("#flex1").flexReload();             
		  					  		  					  			
		  					  		  					  					  			

					$("#id_now_path").html(chg_path_web(unescape(t)));
					var kk = chg_path_web(unescape(t));
					
										
					
					//alert(k+",length="+k.length);		
					
					var buf="";
					
					var k = kk.split("/")				
					
					buf +="<a href='javascript:click_path(\"root\")'>\\\\</a>&nbsp;"
						
					for (var i = 0;i<k.length;i++)
					{
					//lert(k[i]+",i="+i);
						
						if (i == 0 && k[i] == "")
						{
							//buf +="<a href='javascript:#'></a>\\\\"
						}					
						else
						{			
							if (__level == 1 && i== 0)
								continue;	
								
							buf+="<a href='javascript:click_path(\""+i+"\")'>"+k[i]+"</a>"
							
							//alert("i="+i+",length="+k.length)
							if (i < k.length-2)		
							buf+=" >>"
						}	
					}
						$("#id_path").html(buf);
													
//					var kk = k.split("/");
//					var str = "<a href='javascript:click_path(\"0\")'>\\\\</a>"
//					var j = 0;
//					
//			
//					for (var q = 0;q<kk.length;q++) {
//								
//						
//						if (kk[q] = "") continue;
//						
//						j++
//						if (j == 1	)
//					    str+="<a href='javascript:click_path(\""+j+"\")'>"+kk[q]+"</a>"
//					  else
//					  {						  								  			
//					   	str+=">> <a href='javascript:click_path(\""+j+"\")'>"+kk[q]+"</a>"
//					  }
//					  alert("kk="+kk[q])			
//					  alert("str="+str);
//					   						  
//					}
//
//					$("#id_path").html(str);

				
					//alpha.amy++	
					var flag;
					wd_ajax({
						type:"POST",
						async:false,
						cache:false,
						url:"/cgi-bin/login_mgr.cgi",
						data:{cmd:'ui_check_wto'},
						success:function(data){
				
							if (data == "fail")
	            {
	            	flag = data;
	            	return false;	           
	            }							
						}
					});
					if (flag == "fail") return;
			
					$.post(o.script, { dir: unescape(t), cmd: o.cmd, show_file: __file ,chk_flag: __chkflag ,function_id:"webfile",read:read}, function(data) {
/*						
						var new_folder = "";
						var new_tree='<ul class="jqueryFileTree" style="display: none;">\n'
						//先顯示目錄，再顯示檔案
						$(data).find('LI').each(function(i){
							if( $(this).hasClass('directory') )
							{
								var new_text =""

								if (o.checkbox_all == 2)//show checkbox,support file and folder to selected
								{
									var v = $(this).find('input').attr("value")
									var t = $(this).text()
									new_text+= '<input name="folder_name" value="' + v + '" src="' + t + '" rel="' + t + '" type="checkbox">'
									new_text += '<a href="#" rel="' + v + '/">' + t +'</a>'
								}
								else if (o.checkbox_all == 3)//don't show checkbox,support file or folder to selected
								{
									var v = $(this).find('a').attr("rel");
									var t = $(this).text();
									new_text += '<a href="#" rel="' + v + '">' + t +'</a>';
								}
								else 
								{		
									if((__chkflag==0 && __file==0) || (__chkflag==1 && __file==1))
									{
										var v = $(this).find('a').attr("rel")
										var t = $(this).text()
										new_text += '<a href="#" rel="' + v + '">' + t +'</a>'
									}
									else if(__chkflag==1)
									{
										var v = $(this).find('input').attr("value")
										var t = $(this).text()
										new_text+= '<input name="folder_name" value="' + v + '" src="' + t + '" rel="' + t + '" type="checkbox">'
										new_text += '<a href="#" rel="' + v + '/">' + t +'</a>'
									}
								}

								new_folder="";
								if($(this).hasClass('add'))
								{
									var v = $(this).find('a').attr("rel")
									new_folder = '<a href="#" rel="' + v + '">' + _T('_common','new') +'</a>'
									return true;
								}
								new_tree += '<li class="directory collapsed">'+ new_text+'</li>\n'
							}
						});
						$(data).find('LI').each(function(i){
							if( $(this).hasClass('file') )
							{
								//alert($(this).html())
								new_tree += '<li class="file">'+ $(this).html()+'</li>\n'
							}
						});
						
						if(new_folder!="")
						new_tree += '<li class="directory collapsed add">'+ new_folder +'</li>\n'
						new_tree +='</ul>'
*/						
						//alert(new_tree)
						//$(c).removeClass('wait').append(data);
												
						$(c).find('.start').html('');
						$(c).find('UL').remove(); // cleanup		amy++
						
//						$(c).removeClass('wait').append(new_tree);
             
            if(data.replace != undefined)
            {		            		
							data = data.replace('>New</a>', '>' + _T('_common','new') +'</a>');
						}	
				

						$(c).removeClass('wait').append(data);
						
						if( o.root == t ) $(c).find('UL:hidden').show(); else $(c).find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });													
//alert($(c).html());
//		__str = $(c).html();
						init();
						disable_menu();
		 				__str = t.substr(0,t.length-1);		
		 				__str = unescape(__str);
		//alert(__str);
						bindTree(c);
						//test_tree(c);
						//fish +
						if(__chkflag==0)
						{
							chg_path(t,o.formname,o.textname);
						}
						
						//amy+
						$("#tree_container input[name=folder_name]").click(function(){
							if(this.checked == true)
							{										
								var status = tree_check_share(this.value);																									
								if (status == 0) this.checked = false;
							}	
						});
						
						$("#container_id input[name=folder_name]").click(function(){
							
							if(this.checked == true)
							{	
								var status = cifs_tree_check_share(this.value);																									
								if (status == 0) this.checked = false;
								
								if (o.effect == "no_son")
								{
									var status = cifs_tree_check_upnp(this.value);									
									if (status == 0) this.checked = false;
								}
							}	
						});
						
						/* fish mark
						if(o.chkflag!=0)
						{
							$("#tree_div input[name=folder_name]").click(function(){
								if(this.checked == true)
								{								
									var ftp_status = ftp_tree_check_share(this.value);																									
									if (ftp_status == 1) this.checked = false;
								}	
							});
						}
						*/
					});
				}
				
				
				
				//fish+
				function chg_path(t,form_obj,text_obj)
				{
					if (form_obj == null && text_obj == null) return;
					var hdd_num=HDD_INFO_ARRAY.length;
					
					for(i=0;i<hdd_num;i++)
					{
						var hdd_info=HDD_INFO_ARRAY[i].split(":");
						
						if(t.indexOf(hdd_info[1])!=-1)
						{
							var str=t;
							str=str.split(hdd_info[1]);
							var new_path=hdd_info[0] + str[1];
							new_path=new_path.substr(0,new_path.length-1);	//remove end of '/'
						}
					}
					if(t!="/mnt/HD")
					{
						SEL_PATH=unescape(new_path);
						if(form_obj=="upnp")
							mainFrame.document.getElementById(text_obj).value=unescape(new_path);
						else
							document.getElementById(text_obj).value=unescape(new_path);
					}
				}
				//fish end
				function bindTree(t) {			
//					$(t).find('LI A').bind("mouseover",function(){										
						$(t).find('LI A').bind("mouseup",function(){																	
									var v = $(this).attr('rel').match( /.*\// );					
									
//document.forms[0].Mouseddd.value = tempX;	
									dragEnd_tempX = tempX;	
									
									__path = v;					
	

//									if ((tempX ==  dragEnd_tempX)  && __move == 1)								
//									{			        										
//											__path = v;
//											var _data = "cmd=cgi_move&path="+__path+"&source_path="+__source_path+"&type="+__source_type;
//											//alert(_data);
//											
//											 	wd_ajax({
//														type:"POST",
//														async:false,
//														cache:false,
//														url:"/cgi-bin/webfile_mgr.cgi",
//														data:_data,
//														success:function(data){															
//														}
//													});
//											
//												jQuery("#flex1").flexReload();  
//									};
//									__move = 0;		
//									__source_path = 0;		
					});

																		
					$(t).find('LI A').bind(o.folderEvent, function() {						
						if( $(this).parent().hasClass('directory') ) {						
							if( $(this).parent().hasClass('collapsed') ) {							
								// Expand								
						
						
								if( !o.multiFolder ) {
									$(this).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
									$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
								}								
								$(this).parent().find('UL').remove(); // cleanup		
var read



if ($(this).parent().hasClass('read'))
//if ($(this).parent().parent().find('LI.read'))
{
	read = "yes";	
}	
else
{	
	read = "no";		
}


	__read = read;																																		
		
												
								showTree( $(this).parent(), escape($(this).attr('rel').match( /.*\// )),read);								
 
								var f = escape($(this).attr('rel').match( /.*\// ));								
								if (f.substring(f.length-4,f.length) != "new/")
								{								
									$(this).parent().removeClass('collapsed').addClass('expanded');							
								}	
								//amy--	
							} else {
//alert("collapse");								
								// Collapse									
								$(this).parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });								
								$(this).parent().removeClass('expanded').addClass('collapsed');

								return;
							}
						} else {						
							h($(this).attr('rel'));
						}

						return false;
					});
					// Prevent A from triggering the # on non-click events					
					if( o.folderEvent.toLowerCase != 'click' ) $(t).find('LI A').bind('click', function() { return false; });										
				}
				
//amy test start
//				function test1() {						
//						if( $(this).parent().hasClass('directory') ) {
//alert("directory");							
//							if( $(this).parent().hasClass('collapsed') ) {							
//								// Expand								
////alert("expand");								
//								if( !o.multiFolder ) {
//									$(this).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
//									$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
//								}								
//								$(this).parent().find('UL').remove(); // cleanup		
////var v = $(this).attr('rel');
////alert(v);																											
//								showTree( $(this).parent(), escape($(this).attr('rel').match( /.*\// )) );								
// 
//								var f = escape($(this).attr('rel').match( /.*\// ));								
//								if (f.substring(f.length-4,f.length) != "new/")
//								{								
//									$(this).parent().removeClass('collapsed').addClass('expanded');							
//								}	
//								//amy--	
//							} else {
////alert("collapse");								
//								// Collapse									
//								$(this).parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });								
//								$(this).parent().removeClass('expanded').addClass('collapsed');
//
//								return;
//							}
//						} else {						
//							h($(this).attr('rel'));
//						}
//
//						return false;
//					});
//amy test end				
					
				
					
						
						if (o.root == "/")
						{			
																									
							//other item								
							//	bindTree($(this));					
//							$(this).find('LI A').bind('click', function() { return false; });										
//alert( $(this).find('LI').html());
//alert(__str);
////var v =  escape($(this).find('LI A').attr('rel').match( /.*\// ));
////alert(v);
//var v = $(this).find('LI').hasClass('directory');
//alert(v);

//return;
//							$(this).mouseup(function(v){		
//								alert("345")
//							});


								$(this).find('LI A').each(function(){				
									var rel= escape($(this).attr('rel').match( /.*\// ));				
									var rel_selected  = rel.substr(0,rel.length -1);
//alert(rel_selected)
//rel_selected = encodeURIComponent(rel_selected);
//alert(rel_selected);
//alert(__str);
//alert(escape(__str.match( /.*\// )));

									if (rel_selected == escape(__str))				
	//								if (rel_selected == __str)
									{					
																if( $(this).parent().hasClass('directory') ) {										
																	if( $(this).parent().hasClass('collapsed') ) {							
																		// Expand								
																		if( !o.multiFolder ) {
																			$(this).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
																			$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
																		}								
																		$(this).parent().find('UL').remove(); // cleanup		
																		
																		if( $(this).parent().hasClass('read') )		
																		{
																			read = "yes";
																		}
																		else
																			read = "no";													
				
																					
																		showTree( $(this).parent(), escape($(this).attr('rel').match( /.*\// )),read );								
										 
																		var f = escape($(this).attr('rel').match( /.*\// ));								
																		if (f.substring(f.length-4,f.length) != "new/")
																		{								
																			$(this).parent().removeClass('collapsed').addClass('expanded');							
																		}	
																		//amy--	
																	} else {							
																		// Collapse									
																		$(this).parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });								
																		$(this).parent().removeClass('expanded').addClass('collapsed');
										
																		return;
																	}
																} else {						
																	h($(this).attr('rel'));
																}
										
										
										return false;
									}
									
									
								}); 

						}
						else
						{
							// Loading message
							$(this).html('<ul class="jqueryFileTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
							// Get the initial file list				
							showTree( $(this), escape(o.root) );
						}
			});
						
		}
	});
	
//	$(this).find('LI A').bind('mouseover', function() { alert("mouseup") });						
//			});
//			
//				$(this).find('LI A').each(function(){			
//								alert("1")
//				});
//		
})(jQuery);



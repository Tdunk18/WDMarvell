var index = 0;

function ready_html5_upload()
{
 var oBrowser = new detectBrowser();
 if (oBrowser.isIE){}
 	else
 {	
      var dnd = {
        ready : function()
        {        
          $('div#uploadTarget')
           .bind(
              'dragend',
              function(e) {                 	  	         	
                e.preventDefault();
                e.stopPropagation();

              }
            )
            .bind(
              'dragenter',
              function(e) {                 	  	
                e.preventDefault();
                e.stopPropagation();
//               $(this).addClass('upload-drop-area');  
//               $("#uploadHidden").addClass('upload-drop-area-hidden');
//               $(".upload-drop-text").css("display","block");             
              }
            )
            .bind(
              'dragover',
              function(e) {                   	
                e.preventDefault();
                e.stopPropagation();    
                $(this).addClass('upload-drop-area');  
                $("#uploadHidden").addClass('upload-drop-area-hidden');
                $(".upload-drop-text").css("display","block");                                     
              }
            )
             .bind(
              'dragleave',
              function(e) {                      	        
                e.preventDefault();
                e.stopPropagation();                                   
                
                setTimeout(dnd.drag_leave,800);
//                $(this).removeClass('upload-drop-area');    
//                $("#uploadHidden").removeClass('upload-drop-area-hidden');                    
              }
            )
            .bind(
              'drop',
              function(e) {              	            	
                if (e.originalEvent.dataTransfer.files.length) {
                	if (e.originalEvent.dataTransfer.files.length > 100)
                	{
                		alert("Upload file limit 100.");
                		return;
                	}
                	$(this).removeClass('upload-drop-area');
                	$("#uploadHidden").removeClass('upload-drop-area-hidden');
                	$(".upload-drop-text").css("display","none");
                	
                  e.preventDefault();
                  e.stopPropagation();    
                  //dnd.createFileQueue(e.originalEvent.dataTransfer.files);                    
                  
                  parent.$("#html5_upload").html("");
                  setTimeout(dnd.show_img,200);   
                  open_win();                                                   	
                  dnd.upload(e.originalEvent.dataTransfer.files);                                                                               
                }
              }
            );
        },
        drag_leave: function()
        {
        				$(".upload-drop-text").css("display","none"); 
                $("#uploadTarget").removeClass('upload-drop-area');    
                $("#uploadHidden").removeClass('upload-drop-area-hidden');   
        },
        show_img : function()
        {
        	$("#upload_img").css("display","");         
        },
        hide_img : function()
        {
        	$("#upload_img").css("display","none");                        
					open_win();
        },
        close_img : function()
        {
        	$("#upload_img").css("display","none");                        					
        },     
        createFileQueue : function(files)
        {       	
          $('tbody#uploadQueue').find('tr').not('.uploadTemplate').remove();

          $(files).each(
            function(key, file) {
              var tr = $('tr.uploadTemplate').clone();
         
              tr.removeClass('uploadTemplate');
              tr.attr('id', 'file-' + key);
              
           //   if (file.type.match(new RegExp('/image.*/')) && FileReader) {
           		if (FileReader) {

                // Displaying a thumbnail doesn't seem to work in Safari
//                var img = document.createElement('img');
//                img.file = value;
//                img.classList.add('thumbnail');
//      
//                tr.find('tr').eq(0).html(img); 

//                var reader = new FileReader();
//                reader.onload = (function(img) {
//                  return function(e) {
//                 //   img.src = e.target.result;
//                  };
//                })(img);
 								var reader = new FileReader();
                reader.onload = (function(img) {
                  return function(e) {
                 //   img.src = e.target.result;
                  };
                });
            
               // reader.readAsDataURL(value);
              }
              
              tr.find('td').eq(1).html(file.name);
              tr.find('td').eq(2).html(dnd.getFileSize(file.size));
    
              $('tbody#uploadQueue').append(tr);
            }
          );
        },
//    		uploadProgress : function(e)
//    		{
//    			if (e.lengthComputable) {              
//                progress.value = (e.loaded / e.total) * 100;
//    		},          
        upload : function(files)
        {
          // This is a work-around for Safari occaisonally hanging when doing a 
          // file upload.  For some reason, an additional HTTP request for a blank
          // page prior to sending the form will force Safari to work correctly.
    
//       //   $.get('/file/blank.html');
//       	//		$.get('http://www.deadmarshes.com/file/blank.html');       
        
          var http = new XMLHttpRequest();
          
          $('div#uploadProgress > div > div').css('width', 0);
          
          $('div#uploadComplete').fadeOut(
            'normal',
            function() {
              $('div#uploadProgress').fadeIn();
            }
          );

//-----------------------------------
	
         
         
         
 if (http.upload && http.upload.addEventListener) {        	 	

            http.upload.addEventListener(          
              'progress',
              function(e) {           
              	alert("progress")  	
                if (e.lengthComputable) {                	
                  var progress = Math.round((e.loaded * 100) / e.total);  
                  alert(progress)
                  //var progressDiv = $('div#uploadProgress > div > div');
                  //progressDiv.css('width', progress + '%');  
                }
              },
              false
            );

            http.upload.addEventListener(
              'load',
              function(e) {
                $('div#uploadProgress > div > div')
                  .css('width', '100%');

                $('div#uploadProgress').fadeOut(
                  'normal',
                  function() {                  	
                    $('div#uploadComplete').fadeIn();
                  }
                );
              }
            );
          }						  	
//-----------------------------------						  	
						  	
						  	
						  	

				
    
          if (typeof(FormData) != 'undefined') {
               
						var path = get_path().substr(0,12) + "2/.systemfile/";
//							var blob = files[0];														
						var slices2 = new Array();	
						var slices = new Array();
						var continue_num = 0;												
						var files_upload = new Array();
						var files_total = 0;
						var files_completed = 0;
						var j = 0;
						var error_num = 0
						
						//progress
						var progress;
						var progress_num;
						
						//list all upload file information
					
						
						  for (var i = 0; i < files.length; i++) {   
						  	
            		var blob = files[i];          
            		            		
            		if (blob.type.length == 0 && blob.size == 0) //folder
            		{        
            			//parent.$("#html5_upload").append(blob.name +" - folder cann't upload.<br>");									     		            			
            			parent.$("#html5_upload").append(blob.name +" - "+_T('_wfs','not_upload')+".<br>");									     		            			
            			error_num++;
            			continue;            			            		
            		}
            		                              			
								if (blob.size > 2000000000) //if file size > 2G, return error
								{
									parent.$("#html5_upload").append(blob.name +" "+_T('_wfs','msg15')+".<br>");									
									error_num++;
									continue;
								}								
								j= i+1 - error_num;	
								files_upload[i] = blob.name;
								
								//uploading
		  					parent.$("#html5_upload").append("<span id='upload_"+j+"'>("+j+"). "+ blob.name +" "+ _T('_wfs','msg13')+".</span><br><br>");						    							              		            
            }		
            files_total = j;
            //parent.$( "#html5_upload" ).dialog({ title: "Total Files: "+files_total });		
            parent.$( "#html5_upload" ).dialog({ title: _T('_p2p','total')+": "+files_total });		
						
						//end list all upload file information
						
						
            for (var i = 0; i < files.length; i++) {                        
            		var blob = files[i];          
            		       		
            		if (blob.type.length == 0 && blob.size == 0) //folder
            		{             		
            			if (files.length == 1)
            			{            			
            						setTimeout(dnd.close_img,200);		           			
            			}			
            						
            			//alert("Please choice file.");
            			continue;
            			            		
            		}            		         		
            		                  
            			//const BYTES_PER_CHUNK = 20*1024 * 1024; // 20MB chunk sizes.									
            			var BYTES_PER_CHUNK = 20*1024 * 1024; // 20MB chunk sizes.									
									var start = 0;
									var end;
									var index = 0;
												
									if (blob.size > 2000000000)
									{
										//$("#html5_upload").append(blob.name +" "+_T('_wfs','msg15')+".<br>");
										continue_num++;
										continue;
									}
									
									
									// calculate the number of slices we will need
							    slices[i] = Math.ceil(blob.size / BYTES_PER_CHUNK);
							   // slices2 = slices;
							   
									slices2[i] = slices[i];
																		
									
//alert("blob.size = "+blob.size+" BYTES_PER_CHUNK="+BYTES_PER_CHUNK +" slices = "+slices[i]);
		  					//	$("#html5_upload").append(blob.name +" "+ _T('_wfs','msg13')+".<br>");
						    
							  	while(start < blob.size) {
							        end = start + BYTES_PER_CHUNK;
							        if(end > blob.size) {
							            end = blob.size;
							        }									        
//alert("file name = "+blob.name +"  slices2 ="+slices2[i]);							        

							        uploadFile(blob, index, start, end,i);
							        start = end;
							        index++;
							    }
            		
            		            
            }							
							
						if (continue_num == i)
						{
							setTimeout(dnd.hide_img,1000);							
						}	           	
																			
          } else {
           // alert('Your browser does not support standard HTML5 Drag and Drop');
          }
          
          
          //amy++
						function uploadFile(blob, index, start, end ,num) {
						    var xhr = new Array();
						    var end;
						    var fd;
						    var chunk;
						    var url;
						
						    xhr[num] = new XMLHttpRequest();
						    
						    
						    
//						     function uploadProgress(e) {
//                if (e.lengthComputable) {
//                	alert("lengthComputable")
//                    progress.value = (e.loaded / e.total) * 100;
//                }
//            }                         			    						    
						    
						    
						    
						    
						    
						
//						    xhr[num].onreadystatechange = function() {
//						    	alert(xhr[num].readyState)						    	
//						        if(xhr[num].readyState == 4) {
//						            if(xhr[num].responseText) {
//						                alert(xhr.responseText);
//						            }						
//						            slices[num]--;												
//						            // if we have finished all slices
//						            if(slices[num] == 0) {			            	
//						                mergeFile(blob,num);
//						               
//						            }
//						        }
//						    };
										
								xhr[num].onload = function() {						    		    	
						        if(xhr[num].readyState == 4) {
						            if(xhr[num].responseText) {
						                alert(xhr.responseText);
						            }						
						            slices[num]--;																		            
						            // if we have finished all slices
						            if(slices[num] == 0) {			          						            	
						                mergeFile(blob,num);
						               
						            }
						        }
						    };		
										
																		
						    if (blob.webkitSlice) {
						        chunk = blob.webkitSlice(start, end);
						    } else if (blob.mozSlice) {
						        chunk = blob.mozSlice(start, end);
						    }
						
							//	dnd.draw_progress(files_upload,blob,slices2[num],index);
var _name = blob.name;								
								//xhr[num].upload.onprogress = dnd.uploadProgress();
								xhr[num].upload.onprogress = function(e){									
									var show = ((e.loaded/e.total)*100).toFixed(0);									
								//	var t = 1;
								//alert(_name +" len = "+files_upload.length);
								
								var k =0 ;
								for (k = 0;k<files_upload.length;k++)
								{	
									
									if (_name == files_upload[k])
									{
										var t = k+1;												
										//parent.$("#upload_"+t).html("("+t+"). "+blob.name+" upload success. ");
										
										 parent.$("#upload_"+t).html("("+t+"). "+_name+"  "+show+"% <img src='/web/images/spinner.gif' border=0>");																									
									}
								}
								
								
								  	
								}
								
								
						    fd = new FormData();
						    fd.append("file", chunk);
						    fd.append("name", blob.name);
						    fd.append("index", index);
						    fd.append("folder", path);												   
						    xhr[num].open("POST", "/web/web_file/upload.php", true);						    
						    xhr[num].send(fd);
					    
						}						
						function mergeFile(blob, num) {
						    var xhr = new Array();
						    var fd;
						
						    xhr[num] = new XMLHttpRequest();
						    
						    xhr[num].onload = function() {
						        if(xhr[num].readyState == 4) {
						         if (xhr[num].status == 200) {												
													//$("#html5_upload").html("1. " +blob.name +" upload success.");												
													var index = num+1;
//													$("#html5_upload").append(blob.name +" "+ _T('_wfs','msg12')+".<br>");

													//check upload success
												//	dnd.draw_progress(files_upload,blob,'','ok');
												
var k =0 ;
for (k = 0;k<files_upload.length;k++)
{	
	if (blob.name == files_upload[k])
	{
		var t = k+1;		
		files_completed++;
		//parent.$("#upload_"+t).html("("+t+"). "+blob.name+" upload success. ");
		//parent.$("#html5_upload" ).dialog({ title: "Total Files: <span id='upload_total_files'>"+files_total + "</span>     <span style='margin-left:30px'>Completed Files: <span id='upload_completed_files'>"+files_completed+"</span></span>"});				
		parent.$("#upload_"+t).html("("+t+"). "+blob.name+" "+_T('_wfs','msg12')+". ");
		parent.$("#html5_upload" ).dialog({ title: _T('_p2p','total')+": <span id='upload_total_files'>"+files_total + "</span>     <span style='margin-left:30px'>"+_T('_button','Completed')+": <span id='upload_completed_files'>"+files_completed+"</span></span>"});				
	}
}
													//check upload success end
													//open_win();
													jQuery("#flex1").flexReload()  
													
													if (num == files.length-1)													
																$("#upload_img").css("display","none");
										} else {
									         	//$("#html5_upload").html("1. " +blob.name +" upload fail.");
										}
						        }
						    };
						
						    fd = new FormData();
						    fd.append("name", blob.name);						   
						    fd.append("index",slices2[num]);
								fd.append("upload_folder", path);		
								fd.append("folder", get_path());									
						    xhr[num].open("POST", "/web/web_file/merge.php", true);
						    xhr[num].send(fd);						 
						}													
          //amy--
  
          
        },
     		draw_progress : function(files_upload,blob,n,index)
     		{     			
     				var k =0 ;
     				var show;
						for (k = 0;k<files_upload.length;k++)
						{	
							if (blob.name == files_upload[k])
							{							
									if (index == "ok") show = 98;		
									else if (index == 0) show = 10;
									else show = (index+1)*(100/n)																				
									var t = k+1;												
   		 						parent.$("#upload_"+t).html("("+t+"). "+blob.name+" "+show+"% <img src='/web/images/spinner.gif' border=0>");																
							}
						}
     		},
        getFileSize : function(bytes)
        {
          switch (true) {
            case (bytes < Math.pow(2,10)): {
              return bytes + ' Bytes';
            };
            case (bytes >= Math.pow(2,10) && bytes < Math.pow(2,20)): {
              return Math.round(bytes / Math.pow(2,10)) +' KB';
            };
            case (bytes >= Math.pow(2,20) && bytes < Math.pow(2,30)): {
              return Math.round((bytes / Math.pow(2,20)) * 10) / 10 + ' MB';
            };
            case (bytes > Math.pow(2,30)): {
              return Math.round((bytes / Math.pow(2,30)) * 100) / 100 + ' GB';
            };
          }
        }
      };
  }    
}
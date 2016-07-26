
function set_port(tb)
{
	return;
	
	var http_port = $( tb + " input[name='http_port']").val();
	var https_port = $( tb + " input[name='https_port']").val();
	
	if(port_set_check(http_port,'HTTP')==1) return;
	if(port_set_check(https_port,'HTTPS')==1) return;
 	
 	jLoading(_T('_common','set') ,'loading' ,'s',"");
 	var hostname = window.location.hostname;
 	var url = "/cgi-bin/network_mgr.cgi?cmd=cgi_port&https_port=" + https_port + "&http_port=" + http_port;
 	
 	setTimeout(function(){
					jLoadingClose();
					var str = "http://" + hostname + ":" + http_port;
					location.replace(str);
				},10000);
 	
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/network_mgr.cgi",
		data: { cmd:"cgi_port" ,https_port:https_port,http_port:http_port },
		dataType: "xml",
		success: function(data){								
		}
		,
		 error:function(xmlHttpRequest,error){   
  		 }  
	});
}

function port_set_check(port,port_type)
{
	var portnum = parseInt(port, 10);
	
	if ( port.length==0 || port.length > 5 || isNaN(port)) {
		if (port_type=="HTTP") {
			var str = _T('_port','msg1').replace(/%s/g,port);
			jAlert( str, _T('_common','error'));
			return 1;
		}
		else if (port_type=="HTTPS") {
			var str = _T('_port','msg2').replace(/%s/g,port);
			jAlert( str, _T('_common','error'));
			return 1;
		}
	}
	else if (portnum < 1024 || portnum > 65535) {

		if (port_type=="HTTP" && portnum == 80) {
			return 0;
		}
		else if (port_type=="HTTPS" && portnum == 443) {
			return 0;
		}
		else
		{
			var str="";
			if (port_type=="HTTP") 
				str = _T('_port','msg1').replace(/%s/g,port);
			else
				str = _T('_port','msg2').replace(/%s/g,port);
			
			jAlert( str, _T('_common','error'));
			return 1;
		}
	}
	
	return 0;
	/*
	if(port_type=='HTTP')
	{
		if( 1024 >= parseInt(port,10) && 80 != parseInt(port))
		{
			jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
			return 1;
		}
	}
	else
	{
		if( 1024 >= parseInt(port,10) && 443 != parseInt(port))
		{
			jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
			return 1;
		}
	}
	
	
	if( 67 == parseInt(port,10) || 68 == parseInt(port,10))
	{
		jAlert( _T('_ftp','msg5'), _T('_common','error'));	//Text: The port 67,68 has used for DHCP Server.
		//jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
		return 1;	
	}	
	if( 3689 == parseInt(port) )
	{
		jAlert( _T('_ftp','msg3'),  _T('_common','error'));	//Text:The port 3689 has used for iTunes Server.
		//jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
		return 1;	
	}
	
	if( 50000 <= parseInt(port,10) && 65500 >= parseInt(port,10))
	{
		jAlert( _T('_ftp','msg4'), _T('_common','error'));	//Text:The port 50000-65500 has used for UPnP Server.
		//jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
		return 1;	
	}
	
	if( 4711 == parseInt(port,10))
	{
		jAlert( _T('_ftp','msg28'), _T('_common','error'));	//Text: The port 4711 has used for aMule.
		//jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
		return 1;
	}
	
	if( 8000 == parseInt(port,10))
	{
		jAlert( _T('_ftp','msg32'), _T('_common','error'));	//Text: The port 8000 has used for IceStation.
		//jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
		return 1;
	}
	
	if( 9000 == parseInt(port,10))
	{
		jAlert( _T('_ftp','msg29'), _T('_common','error'));	//Text: The port 9000 has used for Squeeze Center.
		//jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
		return 1;
	}

	//port
	if (port=="")
	{
		//jAlert( _T('_mail','msg7'),  _T('_common','error'));	//Text:Please enter a port.
		jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
		return 1;
	}
	
	if (port.indexOf(" ") != -1) 
 	{
 		jAlert( _T('_mail','msg8'),  _T('_common','error'));	//Text:Port can not contain spaces.
 		//jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
 		return 1;
 	}
	
 	if (isNaN(port))
 	{
		jAlert( _T('_ftp','msg6'),  _T('_common','error'));	//Text:Port must be a number.
		//jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
		return 1;
 	}	

	if (port<=0 || port>65535)
	{
		jAlert( _T('_ftp','msg7'),  _T('_common','error'));	//Text:Please enter a port.
		//jAlert( _T('_mail','msg9'), _T('_common','error'));	//Text:Invalid port number.
		document.form_port.f_port.focus();
		return 1;
	}
	*/
	
	
}	
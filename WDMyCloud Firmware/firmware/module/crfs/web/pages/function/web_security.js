function getParameter(parameterName) {  
  var strQuery = location.search.substring(1);  // 菠筁 "?"  

  var paramName = parameterName + "=";  // р "=" 讽Θ把计嘿场だ  
  
  if (strQuery.length > 0) {  
    begin = strQuery.indexOf(paramName);  // 眔 paramName  strQuery 竚  
  
    if (begin != -1) {  //  strQuery 柑т眔 paramName  
      begin += paramName.length;  // 砞﹚把计币﹍竚  
  
      // 眔把计挡竚  
      end = strQuery.indexOf("&" , begin);  
      if ( end == -1 ) end = strQuery.length  
  
      return unescape(strQuery.substring(begin, end));  
    }  
    return "null";  
  }  
}

function timeout_alert()
{
	var type=getParameter("type");
	if(type=="public") return;
		
	if(parentExists())
	{
		parent.location.replace("/web/login.html");
	}
	else
	{
		location.replace("/web/login.html");
	}
}


function ready_web_security()
{
	wd_ajax({
		type:"POST",
		async:true,
		cache:false,
		url:"/cgi-bin/login_mgr.cgi",
		data:{cmd:'ui_check_wto'},
		success:function(data){
			//alert("data=" +data + "\nparentExists():"+ parentExists())
			if (data == "fail")
			{  
				setTimeout(timeout_alert,200);					
			}
		}
	});
}

function parentExists()
{
	return (parent.location == window.location)? false : true;
}

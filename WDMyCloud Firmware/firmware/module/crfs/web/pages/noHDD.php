<?
$date = new DateTime();
$r= $date->getTimestamp();

?>
<!doctype html>
<html>
<head>
<link rel="icon" type="image/x-icon" href="/web/images/Logo_16x16.ico"></link>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="PRAGMA" content="no-cache"> 
<meta http-equiv="Expires" content="-1">
<meta http-equiv="Cache-Control" content="no-cache">
<title></title>
</head>
<script type="text/javascript" src="/web/jquery/js/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="/web/jquery/js/jquery-migrate-1.1.1.min.js"></script>
<link rel="stylesheet" type="text/css" href="/web/jquery/css/redmond/jquery-ui-1.10.3.min.css">
<link rel="stylesheet" type="text/css" href="/web/jquery/css/jquery-ui.custom.css">
<script type="text/javascript" src="/web/jquery/js/jquery.tools-1.2.7.min.js"></script>
<script type="text/javascript" src="/web/jquery/js/jquery.tools.expose-1.2.7.min.js"></script>
<script type="text/javascript" src="/web/jquery/jquery.cookie/jquery.cookie.js?v=WDV1.01"></script>
<script type="text/javascript" src="/web/jquery/jquery.cookie/jquery.cookie.pack.js?v=WDV1.01"></script>
<script language="javascript" src="/web/function/language.js?id=<?=$r; ?>"></script>
<script type="text/javascript" src="/web/function/wd_ajax.js"></script>
<script language="javascript" src="/web/function/input.js?id=<?=$r; ?>"></script>
<link rel="stylesheet" type="text/css" href="/web/css/style.css?id=<?=$r; ?>">
<link rel="stylesheet" type="text/css" href="/web/css/dialog.css?id=<?=$r; ?>">

<style>
a:link {color:#0066FF}
a:visited {color:#0066FF}
a:active {color:#0066FF}
a:hover {color:#0066FF}

.wdlink{
	cursor:pointer;
	text-decoration:underline;
}

#noHDDDiag ul{
	margin-top:20px;
}

#noHDDDiag ul li{
	margin-top:10px;
}
</style>
<script type="text/javascript">

var timeoutId=0,satatimeoutId=0;
var noHDDDiagObj="";
function page_load()
{
	ready_language();
	
	$("#eula_noHDD_link,#eula_noHDD2_link").addClass('wdlink');
	$("#eula_noHDD_link,#eula_noHDD2_link").attr('target','_blank');
	$("#eula_noHDD_link").attr("href","http://store.wd.com");
	$("#eula_noHDD2_link").attr("href","http://store.wd.com");
	
  	noHDDDiagObj=$("#noHDDDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
  		        		onBeforeLoad: function() {
            			},
						onBeforeClose: function() {            			
            			}
        			});
	
	$.ajax({
		type: "POST",
		cache: false,
		dataType:"xml",
		url: "/web/php/noHDD.php",
		data: {cmd:'setSataPower',enable:"disable"},
		success:function(xml){
				
				var s = $(xml).find("status").text();
				if(s=="ok")
				{
			noHDDDiagObj.load();
			$("#noHDDDiag").show();
		}
			}
	});	
}

function chk_hdd()
{
	//sata power on
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	$.ajax({
		type: "POST",
		cache: false,
		dataType:"xml",
		url: "/web/php/noHDD.php",
		data: {cmd:'setSataPower',enable:"enable"},
		success:function(xml){
			
			timeoutId = setInterval(function(){
				chk_hdd_status(function(cntDisk,res,eula){

					if(res==0 && cntDisk!=0)
					{
						clearInterval(timeoutId);
						noHDDDiagObj.close();
						jLoadingClose();
						location.replace("/");
					}
					else if(res==0 && cntDisk==0)
					{
						clearInterval(timeoutId);
						sata_power_off();
						jLoadingClose();
					}
				});	
			}, 4000);
		}
	});
}
</script>


<body onload="page_load()">
<div class="b2">
	<div class="wd_logo">
		<div class="wd_dev"></div>
	</div>
</div>

<div id="content" class="b1">
</div>

<div id="noHDDDiag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueHDDIcon2 _text" id="noHDDDiag_title" lang="eula" datafld="nohdd_desc1"></div>
	<div align="center"><div class="hr"><hr/></div></div>
	
	<!-- infoDiag -->
		<div id="infoDiag">
			<div class="WDLabelBodyDialogue" style="overflow:hidden;">
				<div>
					<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<div class="_text maxwidth" lang="eula" datafld="nohdd_desc2"></div>
						</td>
					</tr>
				</table>
				</div>
			</div><!-- WDLabelBodyDialogue end -->
			<div class="hrBottom2"><hr/></div>
			<button type="button" class="ButtonRightPos2" id="eula_chkHDD_button" onclick="chk_hdd();"><span class="_text" lang="_button" datafld="continue"></span></button>
		</div>
</div> <!-- createUserDiag end -->

</body>
</html>

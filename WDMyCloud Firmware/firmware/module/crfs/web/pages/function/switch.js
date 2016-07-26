function ready_switch()
{
}

function init_switch()
{
	$(".onoffswitch").checkbox();
}
function setSwitch(obj,val)
{
	var v = parseInt(val,10);
	var chked=false;
	if(v) {chked=true};
	$(obj).prop("checked",chked);
	$(obj).val(val);
}

function getSwitch(obj)
{
	if($(obj).is(":checked")) 
		return 1;
	else
		return 0;
}
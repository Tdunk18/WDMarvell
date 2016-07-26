
function ready_button()
{
	$(".LightningLabelButtonSecondary").mouseover(function(){
		if($(this).hasClass('gray_out')) return;
		$(this).removeClass('up').removeClass('down').addClass('over');
		$(this).find('.bLeft').removeClass('LightningLabelButtonLeftUp').addClass('LightningLabelButtonLeftOver').removeClass('LightningLabelButtonLeftDown');
		$(this).find('.bBody').removeClass('LightningLabelButtonLeftBody').addClass('LightningLabelButtonBodyOver').removeClass('LightningLabelButtonBodyDown');
		$(this).find('.bRight').removeClass('LightningLabelButtonRightUp').addClass('LightningLabelButtonRightOver').removeClass('LightningLabelButtonRightDown');
	});
	
	$(".LightningLabelButtonSecondary").mouseout(function(){
		if($(this).hasClass('gray_out')) return;
		$(this).removeClass('over').removeClass('down').addClass('up');
		$(this).find('.bLeft').addClass('LightningLabelButtonLeftUp').removeClass('LightningLabelButtonLeftOver').removeClass('LightningLabelButtonLeftDown');
		$(this).find('.bBody').addClass('LightningLabelButtonLeftBody').removeClass('LightningLabelButtonBodyOver').removeClass('LightningLabelButtonBodyDown');
		$(this).find('.bRight').addClass('LightningLabelButtonRightUp').removeClass('LightningLabelButtonRightOver').removeClass('LightningLabelButtonRightDown');	
	});
	
	$(".LightningLabelButtonSecondary").click(function(){
		if($(this).hasClass('gray_out')) return;

		$(this).removeClass('over').addClass('down');
		$(this).find('.bLeft').removeClass('LightningLabelButtonLeftOver').addClass('LightningLabelButtonLeftDown')
		$(this).find('.bBody').removeClass('LightningLabelButtonBodyOver').addClass('LightningLabelButtonBodyDown')
		$(this).find('.bRight').removeClass('LightningLabelButtonRightOver').addClass('LightningLabelButtonRightDown')		
	});
}

function init_button()
{
	return;
	$('.LightningButton').each(function(){
		/*var id = $(this).attr('id');*/
		$(this).empty();
		
		var lang = $(this).attr('lang');
		var datafld = $(this).attr('datafld');
		
		var div_obj = document.createElement("div"); 
		$(div_obj).addClass('LightningLabelButtonSecondary up');
		
		var sub_left_div = document.createElement("div");
		$(sub_left_div).addClass('LightningLabelButtonLeftUp bLeft');
		
		var sub_body_div = document.createElement("div");
		$(sub_body_div).addClass('LightningLabelButtonBodyUp bBody _text');
		/*$(sub_body_div).attr('id',id);*/
		$(sub_body_div).attr('lang',lang);
		$(sub_body_div).attr('datafld',datafld);
		
		var sub_right_div = document.createElement("div");
		$(sub_right_div).addClass('LightningLabelButtonRightUp bRight');

		$(div_obj).append( $(sub_left_div));
		$(div_obj).append( $(sub_body_div));
		$(div_obj).append( $(sub_right_div));
		
		$(sub_body_div).html(_T(lang,datafld))
		$(this).append($(div_obj))
	});
	
	$(".LightningLabelButtonSecondary").mouseover(function(){
		if($(this).hasClass('gray_out')) return;
		$(this).removeClass('up').removeClass('down').addClass('over');
		$(this).find('.bLeft').removeClass('LightningLabelButtonLeftUp').addClass('LightningLabelButtonLeftOver').removeClass('LightningLabelButtonLeftDown');
		$(this).find('.bBody').removeClass('LightningLabelButtonLeftBody').addClass('LightningLabelButtonBodyOver').removeClass('LightningLabelButtonBodyDown');
		$(this).find('.bRight').removeClass('LightningLabelButtonRightUp').addClass('LightningLabelButtonRightOver').removeClass('LightningLabelButtonRightDown');
	});
	
	$(".LightningLabelButtonSecondary").mouseout(function(){
		if($(this).hasClass('gray_out')) return;
		$(this).removeClass('over').removeClass('down').addClass('up');
		$(this).find('.bLeft').addClass('LightningLabelButtonLeftUp').removeClass('LightningLabelButtonLeftOver').removeClass('LightningLabelButtonLeftDown');
		$(this).find('.bBody').addClass('LightningLabelButtonLeftBody').removeClass('LightningLabelButtonBodyOver').removeClass('LightningLabelButtonBodyDown');
		$(this).find('.bRight').addClass('LightningLabelButtonRightUp').removeClass('LightningLabelButtonRightOver').removeClass('LightningLabelButtonRightDown');	
	});
	
	$(".LightningLabelButtonSecondary").click(function(){
		if($(this).hasClass('gray_out')) return;
		
		$(this).removeClass('over').addClass('down');
		$(this).find('.bLeft').removeClass('LightningLabelButtonLeftOver').addClass('LightningLabelButtonLeftDown')
		$(this).find('.bBody').removeClass('LightningLabelButtonBodyOver').addClass('LightningLabelButtonBodyDown')
		$(this).find('.bRight').removeClass('LightningLabelButtonRightOver').addClass('LightningLabelButtonRightDown')		
	});
}
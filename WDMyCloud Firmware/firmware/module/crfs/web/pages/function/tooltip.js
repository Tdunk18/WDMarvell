function init_tooltip(tipClass)
{
	var tip; // make it global
	var rel;
	if(typeof(tipClass)=="undefined")
	{
		tipClass = ".TooltipIcon"
	}
   	$(tipClass).unbind('mouseover');
   	$(tipClass).unbind('mouseout');
    $(tipClass).mouseover(function(e) {
	
   	$('body').append('<div class="Tooltip" style="display:none"></div>');
   		tip = $(this).attr('title');
   		if(tip.length==0)
   			tip = $(this).attr('rel'); 
   		else
   		{
        	tip = $(this).attr('title'); // tip = this title   
        	$(this).attr('rel',tip);
        }
        	
        rel = $(this).attr('rel');
        if(rel.length==0) $(this).attr('rel',tip);
   	
        $(this).attr('title','');    // empty title
        $(this).attr('rel',tip);
        
        $('.Tooltip').fadeTo(300, 0.9).html( tip ); // fade tooltip and populate .tipBody

		var pos = $(this).offset(); // returns an object with the attribute top and left
		pos.top;  // top offset position
		pos.left; // left offset position
		
        //$('.Tooltip').css('top', pos.top - 61 );
        var tooltip_height = $('.Tooltip').height();
        $('.Tooltip').css('top', pos.top - ($('.Tooltip').height() +25) );
        $('.Tooltip').css('left', pos.left + 24 );
    }).mousemove(function(e) {
        //$('.WDTooltip').css('top', e.pageY + 10 ); // mouse follow!
        //$('.WDTooltip').css('left', e.pageX + 20 );
    }).mouseout(function(e) {
        //$('.Tooltip').hide(); // mouseout: HIDE Tooltip (do not use fadeTo or fadeOut )
        $('.Tooltip').remove();
        $(this).attr( 'title', tip ); // reset title attr
    });
}

function init_tooltip2(tipClass) //for sub-menu (users/gropus/shares/clouc access)
{
	var tip; // make it global
	var rel;
	if(typeof(tipClass)=="undefined")
	{
		tipClass = ".TooltipIcon"
	}
   	$(tipClass).unbind('mouseover');
   	$(tipClass).unbind('mouseout');
    $(tipClass).mouseover(function(e) {
	
   	$('body').append('<div class="Tooltip" style="display:none"></div>');
   		tip = $(this).attr('title');
   		if(tip.length==0)
   			tip = $(this).attr('rel'); 
   		else
   		{
        	tip = $(this).attr('title'); // tip = this title   
        	$(this).attr('rel',tip);
        }
        	
        rel = $(this).attr('rel');
        if(rel.length==0) $(this).attr('rel',tip);
   	
        $(this).attr('title','');    // empty title
        $(this).attr('rel',tip);
        
        $('.Tooltip').fadeTo(300, 0.9).html( tip ); // fade tooltip and populate .tipBody

		var pos = $(this).offset(); // returns an object with the attribute top and left
		pos.top;  // top offset position
		pos.left; // left offset position
		
        var tooltip_height = $('.Tooltip').height();

        $('.Tooltip').css('top', pos.top +10);
        $('.Tooltip').css('left', pos.left + 210 );
        
    }).mousemove(function(e) {
        //$('.WDTooltip').css('top', e.pageY + 10 ); // mouse follow!
        //$('.WDTooltip').css('left', e.pageX + 20 );
    }).mouseout(function(e) {
        //$('.Tooltip').hide(); // mouseout: HIDE Tooltip (do not use fadeTo or fadeOut )
        $('.Tooltip').remove();
        $(this).attr( 'title', tip ); // reset title attr
    });
}
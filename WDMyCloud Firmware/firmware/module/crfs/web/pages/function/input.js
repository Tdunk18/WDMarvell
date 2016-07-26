(function( $ ){
	$.fn.inputReset = function(method) {
		var $args = arguments;
        var $this = $(this);
        
        $this.each(function(){
            var curInput = $(this);
            
            if( curInput.parent().hasClass('deleteicon')) 
            {
            	//console.log(curInput.parent())
            	curInput.parent().find('span.deletebutton').hide();
            	curInput[0].defaultValue = curInput.val(); 
            	return true;
            }
            
            $(this)[0].defaultValue = curInput.val();
            curInput.wrap('<span class="deleteicon" />').after($('<span class="deletebutton"/>').click(function () {
                curInput.val(curInput[0].defaultValue ? curInput[0].defaultValue : '').focus();
                $(this).hide();

            }));
            curInput.after('<span class="spacer"/>');
            
            curInput.bind('blur keyup', function (event) {
            	
            	if($(this).hasClass("gray_out") || $(this).attr("readonly")) return;
            	
                if ($(this).val() !== $(this)[0].defaultValue) {
                    $(this).siblings('.deletebutton').show();
                }
            });

        	if(curInput.attr("readonly")) return true;
        	
        });
        
   //modify height     
   if(isiPhone())
   {	
  	$("span.deleteicon span.spacer").height("28px");  
		
		//for ipad ,remove ipad top shadow on input elements
		$this.css("-webkit-appearance", "caret");
		$this.css("-moz-appearance", "caret");
   }			    
   function isiPhone()
   {
    return ((navigator.platform.indexOf("iPhone") != -1) ||(navigator.platform.indexOf("iPad") != -1));
   }
   //modify end --	 
 }
})( jQuery );

(function( $ ){
	$.fn.hidden_inputReset = function(method) {
		var $args = arguments;
        var $this = $(this);
        $this.find('span.deleteicon span.deletebutton').each(function () {
            $(this).hide();
        });
        
	}
})( jQuery );

/* [+] For IE 8, Add by Ben */
(function( $ ){
	if (jQuery.browser.msie == true && jQuery.browser.version < 9.0)
	{
		$.propHooks.checked = {
			set: function (el, value) {
				el.checked = value;
				$(el).trigger('change');
			}
		};

		$.attrHooks.checked = {
			set: function (el, value) {
				el.checked = value;
				$(el).trigger('change');
			}
		};
	}
})( jQuery );

/* [-] For IE 8, Add by Ben */

(function( $ ){
	$.fn.checkboxStyle = function(method) {
		var $args = arguments;
        var $this = $(this);
	        
        $this.each(function(){
        	
        	var curInput = $(this);

			if(curInput.hasClass('onoffswitch')) return true;
			
        	if( !curInput.parent().hasClass('LightningCheckbox'))
        	{
        		curInput.wrap('<label class="LightningCheckbox" tabindex="0" />').after('<span/>');

				curInput.parent('label').unbind('keypress');
				curInput.parent('label').keypress(function(e){
					if(e.keyCode == 13) {
						$(this).click();
					}
        		});
        		
				/* [+] For IE 8, Add by Ben */
				if (jQuery.browser.msie == true && jQuery.browser.version < 9.0)
				{
					if (curInput.prop("checked")) curInput.next('span').addClass("checked"); //check checkbox default
					curInput.next('span').unbind('click');
					curInput.next('span').bind('click', function(e) {
						if(curInput.attr('disabled'))
							return;
						$(this).toggleClass("checked");
						curInput.trigger('click');
					});

					curInput.next('span').unbind('keyup');
					curInput.next('span').bind('keyup', function(e) {
						if(curInput.attr('disabled'))
							return;
						if(e.keyCode == 13) {
							$(this).toggleClass("checked");
							curInput.trigger('click');
						}
					});
					
					curInput.bind('change', function() {
						if (curInput.prop("checked"))
							curInput.next('span').addClass("checked");
						else
							curInput.next('span').removeClass("checked");
					});
				}
				/* [-] For IE 8, Add by Ben */
        	}
        	
        	if(curInput.attr('disabled'))
        	{
        		curInput.parent().addClass('gray_out');
        	}
        	else
        		curInput.parent().removeClass('gray_out');
        	//if(curInput.attr("readonly")) return true;        	

        });
	}
})( jQuery );

/**
 * jQuery custom checkboxes
 * 
 * Copyright (c) 2008 Khavilo Dmitry (http://widowmaker.kiev.ua/checkbox/)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @version 1.3.0 Beta 1
 * @author Khavilo Dmitry
 * @mailto wm.morgun@gmail.com
**/

var checkedLabel = '';
var uncheckedLabel = '';

(function($){
	/* Little trick to remove event bubbling that causes events recursion */
	var CB = function(e)
	{
		if (!e) var e = window.event;
		e.cancelBubble = true;
		if (e.stopPropagation) e.stopPropagation();
	};
	
	$.fn.checkbox = function(method) {
		var $arguments = arguments;
		/* IE6 background flicker fix */
		try	{ document.execCommand('BackgroundImageCache', false, true);	} catch (e) {}
		
		/* Default settings */
		var settings = {
			cls: 'jquery-checkbox',  /* checkbox  */
			empty: 'empty.png',  /* checkbox  */
			checkedLabel : _T('_common','on'),
			uncheckedLabel : _T('_common','off')
		};
		
		/* Adds check/uncheck & disable/enable events */
		var addEvents = function(object)
		{
			var checked = object.checked;
			var disabled = object.disabled;
			var $object = $(object);
			
			if ( object.stateInterval )
				clearInterval(object.stateInterval);
			
			object.stateInterval = setInterval(
				function() 
				{
					if ( object.disabled != disabled )
						$object.trigger( (disabled = !!object.disabled) ? 'disable' : 'enable');
					if ( object.checked != checked )
						$object.trigger( (checked = !!object.checked) ? 'check' : 'uncheck');
				}, 
				10 /* in miliseconds. Low numbers this can decrease performance on slow computers, high will increase responce time */
			);
			return $object;
		};
		
		var methods = {
			init: function(options)
			{
				/* Processing settings */
				settings = $.extend(settings, options || {});

				var ch = this; /* Reference to DOM Element*/
				var $ch = addEvents(ch); /* Adds custom events and returns, jQuery enclosed object */
				
				/* Removing wrapper if already applied  */
				if (ch.wrapper) ch.wrapper.remove();
				
				if ( ch.checked ) {
				    checkedStyle = 'display:inline-block';
				    checkedToggleClass = '';
				    uncheckedToggleClass = ' toggle_switch';
				    uncheckedStyle = 'display:none'
				}
				else {
				    checkedStyle = 'display:none';
				    checkedToggleClass = ' toggle_switch';
				    uncheckedToggleClass = '';
				    uncheckedStyle = 'display:inline-block'
				
				}
				var gray_out = "";
				
	            if ( ch.disabled ) {gray_out = " gray_out";}

				/* Creating wrapper for checkbox and assigning "hover" event */
				ch.wrapper = $('<span class="' + settings.cls +
				'"><div tabindex="0" class="checkbox_container' + gray_out + '"> <span class="toggle_off" style="'+uncheckedStyle+'"></span><label class="checkbox_on'+checkedToggleClass+'"><span class="checkbox_on_text" style="'+checkedStyle+'">'+settings.checkedLabel+'</span></label>'+
				'<label class="checkbox_off'+uncheckedToggleClass+'"><span class="checkbox_off_text" style="'+uncheckedStyle+'">'+settings.uncheckedLabel+'</span></label><span class="toggle_on" style="'+checkedStyle+'"></span></div></span>');
//				'"><div class="checkbox_container checkbox_on" style="' +checkedStyle +'" >'+settings.checkedLabel+'</div>'+
//				'<div class="checkbox_container checkbox_off" style="' + uncheckedStyle +'" >'+settings.uncheckedLabel+'</div></span>');
				ch.wrapperInner = ch.wrapper.children('span:eq(0)');
				ch.wrapper.hover(
					function(e) { ch.wrapperInner.addClass(settings.cls + '-hover');CB(e); },
					function(e) { ch.wrapperInner.removeClass(settings.cls + '-hover');CB(e); }
				);
				
				ch.checkbox_container = ch.wrapper.children('.checkbox_container');
				/*
				ch.checkbox_container.focus(function() {
					$(this).css("border", "#0067A6 solid 2px");
				});
				
				ch.checkbox_container.mouseover(function() {
					$(this).css("border", "#0067A6 solid 2px");
				});
				
				ch.checkbox_container.mouseout(function() {
					$(this).css("border", "#5A5A5A solid 2px");
				});
				
				ch.checkbox_container.blur(function() {
					$(this).css("border", "#5A5A5A solid 2px");
				});
				*/

				/* Wrapping checkbox */
				$ch.css({position: 'absolute', zIndex: -1, visibility: 'hidden'}).after(ch.wrapper);
				
				/* Ttying to find "our" label */
				var label = false;
				if ($ch.attr('id'))
				{
					label = $('label[for='+$ch.attr('id')+']');
					if (!label.length) label = false;
				}
				if (!label)
				{
					/* Trying to utilize "closest()" from jQuery 1.3+ */
					label = $ch.closest ? $ch.closest('label') : $ch.parents('label:eq(0)');
					if (!label.length) label = false;
				}
				/* Labe found, applying event hanlers */
				if (label)
				{
					label.hover(
						function(e) { ch.wrapper.trigger('mouseover', [e]); },
						function(e) { ch.wrapper.trigger('mouseout', [e]); }
					);
					label.click(function(e) { $ch.trigger('click',[e]); CB(e); return false;});
				}
				ch.wrapper.keyup(function(e){
					if(e.keyCode == 13) {
						$ch.trigger('click',[e]); 
						
					    CB(e); 

						$ch.trigger('toggle');
					    return false;
					}
				})
				
				ch.wrapper.click(function(e) { 
						
				    $ch.trigger('click',[e]); 
				
				    CB(e); 

					$ch.trigger('toggle');
				    return false;
				});
				
				$ch.click(function(e) { 
				    CB(e); 
				});
				
				$ch.unbind("disable");
				$ch.unbind("check");
				$ch.bind('disable', function() { ch.wrapper.addClass('ui-state-disabled');ch.wrapperInner.addClass(settings.cls+'-disabled');}).bind('enable', function() { ch.wrapper.removeClass('ui-state-disabled');ch.wrapperInner.removeClass(settings.cls+'-disabled');});
				$ch.bind('check', function() {
					$ch.val("1");
					//ch.wrapper.find('.checkbox_on').show();
					//ch.wrapper.find('.checkbox_off').hide();
					ch.wrapper.find('.checkbox_on_text').show();
					ch.wrapper.find('.checkbox_off_text').hide();
					ch.wrapper.find('.toggle_on').css('display', 'inline-block');
					ch.wrapper.find('.toggle_off').hide();
					ch.wrapper.find('.checkbox_on').removeClass('toggle_switch');
					ch.wrapper.find('.checkbox_off').addClass('toggle_switch');
				    ch.wrapper.addClass(settings.cls+'-checked' );
				}).bind('uncheck', function() {
					$ch.val("0");
					//ch.wrapper.find('.checkbox_on').hide();
					//ch.wrapper.find('.checkbox_off').show();
					ch.wrapper.find('.checkbox_on_text').hide();
					ch.wrapper.find('.checkbox_off_text').show();
					ch.wrapper.find('.toggle_off').css('display', 'inline-block');
					ch.wrapper.find('.toggle_on').hide();
					ch.wrapper.find('.checkbox_on').addClass('toggle_switch');
					ch.wrapper.find('.checkbox_off').removeClass('toggle_switch');
					ch.wrapper.removeClass(settings.cls+'-checked' );
				});
				
				/* Disable image drag-n-drop for IE */
				$('img', ch.wrapper).bind('dragstart', function () {return false;}).bind('mousedown', function () {return false;});
				
				/* Firefox antiselection hack */
				if ( window.getSelection )
					ch.wrapper.css('MozUserSelect', 'none');
				
				/* Applying checkbox state */
				if ( ch.checked ) 
					ch.wrapper.addClass(settings.cls + '-checked');
				if ( ch.disabled )
				{
					//console.log("%s[%s] [%s] [%s]",$ch.attr('id'),ch.disabled ,settings.cls + '-disabled',ch.wrapperInner)
					
					
					ch.wrapperInner.addClass(settings.cls + '-disabled');
				}
			},
			changeLabels: function (checkedLabel, uncheckedLabel)
			{
				settings.checkedLabel = checkedLabel;
				settings.uncheckedLabel = uncheckedLabel;
				this.wrapper.find('.checkbox_on_text').text(settings.checkedLabel);
				this.wrapper.find('.checkbox_off_text').text(settings.uncheckedLabel);
			},
			disable: function(){
				this.wrapper.addClass('ui-state-disabled');
			},
			enable: function(){
				this.wrapper.removeClass('ui-state-disabled');
			}
		};
		//try { console.log(this); } catch(e) {}
		
		/* Wrapping all passed elements */
		return this.each(function(){
		    if ( methods[method] ) {
		      return methods[ method ].apply( this, Array.prototype.slice.call($arguments, 1));
		    } else if ( typeof method === 'object' || ! method ) {
		      return methods.init.apply( this, $arguments );
		    }
		  });
	}
})(jQuery);

function checkboxOptions(onValue, offValue, id){
	$(document).ready(function(){	
		$("#"+id).checkbox({
			checkedValue : 'ON',
			uncheckedValue : 'OFF'

		});
	});	
}
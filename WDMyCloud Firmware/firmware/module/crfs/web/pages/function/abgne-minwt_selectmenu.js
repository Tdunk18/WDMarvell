var _SELECT_SHOW = 0;	
var _SELECT_ITEMS = new Array();
	function usb_icon_reset()
	{
		$(".sLeft").addClass('wd_select_l').removeClass('wd_select_l_over').removeClass('wd_select_l_down');
		$(".sBody").addClass('wd_select_m').removeClass('wd_select_m_over').removeClass('wd_select_m_down');
		$(".sRight").addClass('wd_select_r').removeClass('wd_select_r_over').removeClass('wd_select_r_down');
	}

	function hide_select()
{		return;
			$('.select_menu').find('ul li ul').hide();	
	}


	function init_select_once()
	{
		$("body").click(function(event) {							
			if(_SELECT_SHOW == 0)
			{ 
					/*
					for customer scroll bar, after click, select menu cann't leave amy++
					*/				
					var j = $('.selected').parents('.select_menu').find("ul li ul").find(">.jspScrollable>.jspContainer .jspHover").css("top");
					if (typeof(j) != "undefined")
					{
						return;
					}								
					$('.selected').removeClass('selected').parents('.select_menu').find('ul li ul').hide();										
					usb_icon_reset();
			}		
		});
		
		$(".wd_select").unbind();
		
	$(".wd_language").unbind();
		
		$(".wd_select").mouseover(function(){
		if (!$(this).find('.sLeft').hasClass("wd_select_l_down"))
                {
		$(this).find('.sLeft').removeClass('wd_select_l').addClass('wd_select_l_over').removeClass('wd_select_l_down');
		$(this).find('.sBody').removeClass('wd_select_m').addClass('wd_select_m_over').removeClass('wd_select_m_down');
		$(this).find('.sRight').removeClass('wd_select_r').addClass('wd_select_r_over').removeClass('wd_select_r_down');
		}	
	});
	
	$(".wd_select").mouseout(function(){
		if (!$(this).find('.sLeft').hasClass("wd_select_l_down"))
                {
		$(this).find('.sLeft').addClass('wd_select_l').removeClass('wd_select_l_over').removeClass('wd_select_l_down');
		$(this).find('.sBody').addClass('wd_select_m').removeClass('wd_select_m_over').removeClass('wd_select_m_down');
		$(this).find('.sRight').addClass('wd_select_r').removeClass('wd_select_r_over').removeClass('wd_select_r_down');
		}	
	});
	/*for IE,Chrome tabindex css ++*/
	$(".wd_select").focus(function(){	
		if (!$(this).find('.sLeft').hasClass("wd_select_l_down"))
                {
		$(this).find('.sLeft').removeClass('wd_select_l').addClass('wd_select_l_over').removeClass('wd_select_l_down');
		$(this).find('.sBody').removeClass('wd_select_m').addClass('wd_select_m_over').removeClass('wd_select_m_down');
		$(this).find('.sRight').removeClass('wd_select_r').addClass('wd_select_r_over').removeClass('wd_select_r_down');
		}	
	});
	$(".wd_select").blur(function(){		
		if (!$(this).find('.sLeft').hasClass("wd_select_l_down"))
                {
		$(this).find('.sLeft').addClass('wd_select_l').removeClass('wd_select_l_over').removeClass('wd_select_l_down');
		$(this).find('.sBody').addClass('wd_select_m').removeClass('wd_select_m_over').removeClass('wd_select_m_down');
		$(this).find('.sRight').addClass('wd_select_r').removeClass('wd_select_r_over').removeClass('wd_select_r_down');
		}	
	});
	/*for IE,Chrome tabindex css end */	
	$(".wd_select").click(function() {
		if ($(this).find('.sBody').hasClass('wd_select_m_down'))
		{
			usb_icon_reset();
			return;
		}

		//when click, reset others select UI
		usb_icon_reset();
		$(this).find('.sLeft').addClass('wd_select_l_down').removeClass('wd_select_l').removeClass('wd_select_l_over');
		$(this).find('.sBody').addClass('wd_select_m_down').removeClass('wd_select_m').removeClass('wd_select_m_over');
		$(this).find('.sRight').addClass('wd_select_r_down').removeClass('wd_select_r').removeClass('wd_select_r_over');			

	});	
	
var _g_date = new Date();
var _g_keydown_time = _g_date.getTime();

	$(".wd_select").keydown(function(event){	
		
		var Loading_Overly = $('.LightningUpdating').overlay({oneInstance:false,expose: '#333333',api:true,closeOnClick:false,closeOnEsc:false});		
		if (typeof (Loading_Overly) != "undefined" && Loading_Overly!= null)
		{
			if (Loading_Overly.isOpened() == true) return;
		}	
		
					
		var i = this.id;
	
		//i = i.substring(0,i.length-5);		
		
		i = $("#"+this.id).find(".sBody").attr("id");
		//console.log("code name = %s \n",i);	
		
		var select_array = new Array();
		var select_v_array = new Array();
		var event_array = new Array();
		var now_rel = $("#"+i).attr("rel");
		//$("#"+i+"_li li").each(function(index){
		$("#"+this.id).parent().find("li").each(function(index){
			var v = $(this).attr('rel');
			var t = $(this).find("a").html();		
			select_v_array[index] = v;
			select_array[index] = t;		
			if (index == 0)
			{
				if ($("#"+i).attr("rel") == "") now_rel = t;
			}	
			var onClick = $(this).find("a").attr("onclick");
			if (onClick !== undefined)
				event_array[index] = $(this).find("a").attr("onclick");
		});
		var d = new Date();
		var dt = d.getTime();
	
	if (event.keyCode == 40 || event.keyCode == 38)
	{			
		$("#"+i+"_main").parent().parent().parent().parent().next().find('.select_button').show()				
		var x = document.getElementById(i);
    if (isElementVisible(x))
        // prevent page to be scrolled up or down
        event.preventDefault();
	
		for (var q = 0;q<select_v_array.length;q++)
		{
	//console.log("value = %s,rel=%s",select_v_array[q],$("#"+i).attr("rel"));	
			if (select_v_array[q] == now_rel)
			{
				if (event.keyCode == 40)
				{
					if (q == select_v_array.length-1)
					{
						$("#"+i).attr("rel",select_v_array[0]);;
						$("#"+i).html(select_array[0]);
						if (event_array.length != 0)
						{		
							eval(	event_array[0]);
						}	
					}
					else
					{	
						if (now_rel == "")
						{
							$("#"+i).attr("rel",select_v_array[q]);;
							$("#"+i).html(select_array[q]);
							if (event_array.length != 0)
							{
								eval(	event_array[q]);
							}
						}
						else
						{	
						$("#"+i).attr("rel",select_v_array[q+1]);;
						$("#"+i).html(select_array[q+1]);
						if (event_array.length != 0)
						{
							eval(	event_array[q+1]);
						}	
					        }	
				          }
				}
				else
				{
					if (q == 0)
					{
						$("#"+i).attr("rel",select_v_array[select_v_array.length-1]);;
						$("#"+i).html(select_array[select_v_array.length-1]);
						if (event_array.length != 0)
							eval(	event_array[select_v_array.length-1]);
					}
					else
					{
						$("#"+i).attr("rel",select_v_array[q-1]);;
						$("#"+i).html(select_array[q-1]);
						if (event_array.length != 0)
							eval(	event_array[q-1]);
					}	
				}									
				return;
			}
		}				
	}
	
	
	var code = 48;
	if (event.keyCode >= 96)
	{
			code = 96 //first 0:96  1:97 ->NumPad event code
	if (parseInt(select_v_array[0],10) == 1)
	{
		code = 97
	}
	}
	else
	{
			code = 48 //first 0:48  1:49
			if (parseInt(select_v_array[0],10) == 1)
			{
				code = 49
			}
	}	
	
	
		if (dt - _g_keydown_time <=1*1000)
		{		
			var k = parseInt($("#"+i).attr('rel'),10);	
			if (k >= 1 && k<=5)		
				reset_sel_item("#"+this.id,select_array[event.keyCode-code+k*10],select_v_array[event.keyCode-code+k*10]);			
			else
				reset_sel_item("#"+this.id,select_array[event.keyCode-code],select_v_array[event.keyCode-code]);		
		}
		else
		{	
			_g_keydown_time = dt;
			reset_sel_item("#"+this.id,select_array[event.keyCode-code],select_v_array[event.keyCode-code]);
		}
	
	
		
	});
	
					
	}
	
	function init_select()
	{
		init_select_once();
		
			$('.select_menu').each(function(){
			var $this = $(this), 
				$subMenu = $this.find("> ul li ul");

			$subMenu.attr('o_margin_top', $subMenu.css("margin-top"));

			$this.find(".wd_select").attr("tabindex","0");
					
			$this.find(".option_selected").click(function(){
				if ($(this).hasClass("gray_out")) return;
				var $selected = $(this), 
					$nowSelected = $('.selected');
				$nowSelected.removeClass('selected').parents('.select_menu').find('ul li ul').hide();
				if($selected[0] != $nowSelected[0]) {
					$subMenu.toggle($selected.toggleClass('selected').hasClass('selected'));

					if ($this.find(".option_selected").attr("id") == "id_alert")
					{
						get_alert_list();
					}

					if ($this.find(".ul_obj div").attr("class"))
					{
						var t = $this.find(".ul_obj div").attr("class");
						if (t.indexOf("scroll")!= -1 )
						{
							$("."+t).jScrollPane();
						}	
					}

					/* [+] ALPHA_CUSTOMIZE, Fix dropdowns in web UI should adapt to window limits issue, Add by Ben, 2014-07-08 */
					var subMenu_li_h = 0;
					var subMenu_w = Math.max($this.find("> ul li").width(), $this.find("> ul li ul").width());
					$subMenu.find("li").each(function(){
						subMenu_li_h += $(this).height() + 2; //2 is border height
						$(this).css("min-width", subMenu_w+"px");
					});
					var obj_h = $this.find(".ul_obj div div").height();
					if (!obj_h) //null
						obj_h = $this.find(".ul_obj div").height();
					if (obj_h == 0 || !obj_h)
						obj_h = $this.find(".ul_obj").height();

					var v_height = Math.min(obj_h, subMenu_li_h);
					$subMenu.css({"margin-top": $subMenu.attr('o_margin_top')});
					if (!isElementVisibleWD($(this).get(0), v_height + parseInt($subMenu.attr('o_margin_top'), 10)))
						$subMenu.css({"margin-top": String.format("-{0}px", v_height)});
					/* [-] ALPHA_CUSTOMIZE, Fix dropdowns in web UI should adapt to window limits issue, Add by Ben, 2014-07-08 */
				}
				return false;
			});
		
			$this.find(".option_list ul li a").click(function() {
				usb_icon_reset();
				var current = $(this),
					menuname = current.html();

				var menurel = $(this).parent().attr('rel');
				//???
				//location.href = current.attr("href");

				//$this.find('.selected').removeClass('selected').end().find(".option_list .sBody").text(menuname);								
				$this.find('.selected').removeClass('selected').end().find(".option_list .text").html(menuname).attr('rel',menurel);
				
				$subMenu.hide();
				return false;

			}).hover(function(){
				$this.find('.hovered_item').removeClass('hovered_item');
				$(this).addClass('hovered_item');
			});
		});
	}
function reset_sel_item(obj,val,rel)
{
	$(obj).find(".sBody").html(val);
	$(obj).find(".sBody").attr('rel',rel);
}

function isElementVisible(element)
{
    var posTop = 0;
    var temp = element;
    while (temp)
    {
        posTop += temp.offsetTop;
        temp = temp.offsetParent;
    }
    var posBottom = posTop + element.offsetHeight;
    var visibleTop = $(window).scrollTop();
    var visibleBottom = visibleTop + window.innerHeight;
    return ((posBottom >= visibleTop) && (posTop <= visibleBottom));
}

/* [+] ALPHA_CUSTOMIZE, Fix dropdowns in web UI should adapt to window limits issue, Add by Ben, 2014-07-08 */
function isElementVisibleWD(element, select_h)
{
	var posTop = 0;
	var temp = element;
	while (temp)
	{
		posTop += temp.offsetTop;
		temp = temp.offsetParent;
	}

	/*[+] For Debug */
	var str = "posTop = " + posTop;
	str += "\nelement.offsetHeight = " + element.offsetHeight;
	str += "\ndocument.body.scrollTop = " + $(window).scrollTop();
	str += "\nwindow.innerHeight = " + window.innerHeight;
	str += "\nselect_h = " + select_h;
	/*[-] For Debug */
	
	var posBottom = posTop + element.offsetHeight;
	var visibleTop = $(window).scrollTop();
	var visibleBottom = visibleTop + window.innerHeight;

	/* ALPHA_CUSTOMIZE, Fix dropdowns in web UI should adapt to window limits issue, Add by Ben, 2014-07-08 */
	var pos_to_visibleBottom =  window.innerHeight - (posTop - $(window).scrollTop()); 

	/*[+] For Debug */
	str += "\nposBottom = " + posBottom;
	str += "\nvisibleTop = " + visibleTop;
	str += "\nvisibleBottom = " + visibleBottom;
	str += "\npos_to_visibleBottom = " + pos_to_visibleBottom;
	str += "\nreturn = " + ((posBottom >= visibleTop) && (posTop <= visibleBottom) && (pos_to_visibleBottom >= select_h));
	//alert(str);
	/*[-] For Debug */

	//return ((posBottom >= visibleTop) && (posTop <= visibleBottom));
	return ((posBottom >= visibleTop) && (posTop <= visibleBottom) && (pos_to_visibleBottom >= select_h));
}
/* [-] ALPHA_CUSTOMIZE, Fix dropdowns in web UI should adapt to window limits issue, Add by Ben, 2014-07-08 */

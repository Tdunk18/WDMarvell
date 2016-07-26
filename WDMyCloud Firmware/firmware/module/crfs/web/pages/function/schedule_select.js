function set_pm(rel)
{
	//0:AM
	//1:PM
	var j = $("#id_sch_hour").attr('rel');
	
	if (rel == 0 && j <=11) return;
	if (rel == 1 && j >11) return;
	
	//change to AM
	if (rel == 0 )
	{
		var k = parseInt(j,10)-12;
		$("#id_sch_hour").attr('rel',k);
		$("#id_sch_hour_li").find('li').each(function(e){
		 k = parseInt($(this).attr('rel'),10)-12;
		 $(this).attr('rel',k)
	});
	}
	else
	{
		var k = parseInt(j,10)+12;
		$("#id_sch_hour").attr('rel',k);
		
		$("#id_sch_hour_li").find('li').each(function(e){
		 k = parseInt($(this).attr('rel'),10)+12;
		 $(this).attr('rel',k)
	});
		
	}
	
	//alert(k);
}

function sch_hour_select(id,rel)
{	
	if(TIME_FORMAT == "12")
	{
		var select_array = new Array(
		"1:00","2:00","3:00","4:00","5:00","6:00","7:00","8:00","9:00","10:00","11:00","12:00"
		//"1PM","2PM","3PM","4PM","5PM","6PM","7PM","8PM","9PM","10PM","11PM","12PM"
		
			);
			
			if (rel <= 11)
			{
				var select_v_array = new Array(
				1,2,3,4,5,6,7,8,9,10,11,0
				//13,14,15,16,17,18,19,20,21,22,23,12
			);
	}
	else
	{
				var select_v_array = new Array(				
				13,14,15,16,17,18,19,20,21,22,23,12
				);
			}	
			SIZE = 12;
			SIZE2 = 2;
	}
	else
	{
			var select_array = new Array(			
		"0:00","1:00","2:00","3:00","4:00","5:00","6:00","7:00","8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"
		,"19:00","20:00","21:00","22:00","23:00"
			);		

	var select_v_array = new Array(
			0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23
			);
			
			SIZE = 24;
			SIZE2 = 2;
	}	


	


			var a = new Array(SIZE);
			
			for(var i=0;i<SIZE;i++)
			{
				a[i] = new Array(SIZE2);
			}



			for(var i = 0; i < SIZE; i++)
				for(var j = 0; j < SIZE2; j++)
				{
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
				}



			$('#id_sch_hour_top_main').empty();								
				var my_html_options="";				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\""+id+"_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_hour\" rel='"+rel+"'>"+map_table(rel)+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_sch_hour_li'>"
				my_html_options+="<div class='scrollbar_time_hour'>";
				my_html_options+="<li id=\""+id+"Li1_select\" class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";									
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\""+id+(i+1)+"_select\" rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\""+id+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				$("#id_sch_hour_top_main").append(my_html_options);	
				$("#id_sch_hour_top_main .option_list ul").css("width","90px");
				$("#id_sch_hour_top_main .option_list ul li").css("width","80px");				
				function map_table(rel)
				{
					for(var i = 0; i < SIZE; i++)
							for(var j = 0; j < SIZE2; j++)
							{
								a[i][0] = select_array[i];
								a[i][1] = select_v_array[i];
								if (a[i][1] == rel)
								{									
								 return a[i][0];
								}
							}					
				}
	
}
function sch_pm_select(id,rel) {
		var select_array = new Array(
		//0,1,2,3,4
		"AM", "PM");
		var select_v_array = new Array(
			0, 1);

		SIZE = 2;
		SIZE2 = 2;

		var a = new Array(SIZE);

		for (var i = 0; i < SIZE; i++) {
			a[i] = new Array(SIZE2);
		}
		for (var i = 0; i < SIZE; i++)
			for (var j = 0; j < SIZE2; j++) {
				a[i][0] = select_array[i];
				a[i][1] = select_v_array[i];
		}

		$('#id_pm_top_main').empty();


		var my_html_options = "";

		my_html_options += "<ul>";
		my_html_options += "<li class='option_list'>";
		my_html_options += "<div id=\""+id+"_select\" class=\"wd_select option_selected\">";
		my_html_options += "<div class=\"sLeft wd_select_l\"></div>";
		my_html_options += "<div class=\"sBody text wd_select_m\" id=\"id_pm\" rel='" + rel + "'>" + map_table(rel) + "</div>";

		my_html_options += "<div class=\"sRight wd_select_r\"></div>";
		my_html_options += "</div>";
		my_html_options += "<ul class='ul_obj' id='id_pm_li' style='height:auto;width:90px;'><div>"
		my_html_options += "<li id=\""+id+"Li1_select\" class=\"li_start\" rel=\"" + select_v_array[0] + "\" style='width:80px;' ><a onclick=\"set_pm(0)\" href='#'>" + select_array[0] + "</a>";
		my_html_options += "<li id=\""+id+"Li2_select\"  class=\"li_end\" rel='" + select_v_array[1] + "' style='width:80px;'><a onclick=\"set_pm(1)\" href='#'>" + select_array[1] + "</a>";
		my_html_options += "</div></ul>";
		my_html_options += "</li>";
		my_html_options += "</ul>";

		$("#id_pm_top_main").append(my_html_options);

		function map_table(rel) {
			for (var i = 0; i < SIZE; i++)
				for (var j = 0; j < SIZE2; j++) {
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
					if (a[i][1] == rel) {
						return a[i][0];
					}
			}
		}
		
}

function sch_day_select(id,rel)
{
	var select_array = new Array(			
			);



	var select_v_array = new Array(			
			);

			SIZE = 28;
			SIZE2 = 2;
			
			for (var i=0;i<SIZE;i++)
			{
				var j= i+1;
				select_v_array[i] = j;
			}
			for (var i=0;i<SIZE;i++)
			{
				var j = i+1;
				if (i<9)				
					select_array[i] = "0"+ j;
				else 	
					select_array[i] = j;
			}
			
			var a = new Array(SIZE);
			
			for(var i=0;i<SIZE;i++)
			{
				a[i] = new Array(SIZE2);
			}



			for(var i = 0; i < SIZE; i++)
				for(var j = 0; j < SIZE2; j++)
				{
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
				}




			$('#id_sch_day_top_main').empty();
				var my_html_options="";
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\""+id+"_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_day\" rel='"+rel+"'>"+map_table(rel)+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_sch_day_li'>"
				my_html_options+="<div class='scrollbar_time_day'>";
				my_html_options+="<li id=\""+id+"Li1_select\" class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";									
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\""+id+"Li"+(i+1)+"_select\" rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\""+id+"Li"+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				$("#id_sch_day_top_main").append(my_html_options);	
				$("#id_sch_day_top_main .option_list ul").css("width","90px");
				$("#id_sch_day_top_main .option_list ul li").css("width","80px");				
				function map_table(rel)
				{
					for(var i = 0; i < SIZE; i++)
							for(var j = 0; j < SIZE2; j++)
							{
								a[i][0] = select_array[i];
								a[i][1] = select_v_array[i];
								if (a[i][1] == rel)
								{									
								 return a[i][0];
								}
							}					
				}
	
}

function sch_week_select(id,rel)
{
	var select_array = new Array(
			//0,1,2,3,4
			
			_T('_mail','mon'),
_T('_mail','tue'),
_T('_mail','wed'),
_T('_mail','thu'),
_T('_mail','fri'),
_T('_mail','sat'),
_T('_mail','sun')

			);



	var select_v_array = new Array(
			1,2,3,4,5,6,0
			);

			SIZE = 7;
			SIZE2 = 2;
			
			var a = new Array(SIZE);
			
			for(var i=0;i<SIZE;i++)
			{
				a[i] = new Array(SIZE2);
			}



			for(var i = 0; i < SIZE; i++)
				for(var j = 0; j < SIZE2; j++)
				{
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
				}




			$('#id_sch_week_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\""+id+"_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_week\" rel='"+rel+"'>"+map_table(rel)+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_sch_week_li'>"
				my_html_options+="<div class='scrollbar_time_week'>";
				my_html_options+="<li id=\""+id+"1_select\" class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";									
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\""+id+""+(i+1)+"_select\" rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\""+id+""+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				$("#id_sch_week_top_main").append(my_html_options);	
				$("#id_sch_week_top_main .option_list ul").css("width","90px");
				$("#id_sch_week_top_main .option_list ul li").css("width","80px");				
				function map_table(rel)
				{
					for(var i = 0; i < SIZE; i++)
							for(var j = 0; j < SIZE2; j++)
							{
								a[i][0] = select_array[i];
								a[i][1] = select_v_array[i];
								if (a[i][1] == rel)
								{									
								 return a[i][0];
								}
							}					
				}
	
}
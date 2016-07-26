_SELECT_ITEMS  = new Array("backups_s3Region_select","backups_s3Type_select","backups_s3BackupType_select","id_sch_s_type_main","backups_s3Hour_select","id_sch_min_main","backups_s3Day_select","backups_s3Week_select","id_once_hour_main","id_once_min_main","id_once_day_main","id_once_month_main");		
var _g_location = 0;
var _g_dir = 0;
var _g_backuptype = 0;
var _g_sch_s_type = 1;
var _g_sch_day = 1;
var _g_sch_week = 1;
var _g_sch_min = 1;
var _g_sch_hour = 1;

var _g_once_day = 1;
var _g_once_min = 1;
var _g_once_hour = 1;
var _g_once_month = 1;

function draw_select()
{
	location_select();
	dir_select();
	backuptype_select();
	sch_s_type_select();
	sch_hour_select();
	sch_min_select();
	sch_day_select();
	sch_week_select();
	once_hour_select();
	once_min_select();
	once_day_select();
	once_month_select();
}
function location_select()
{
	var select_array = new Array(
			//0,1,2,3,4
			_T('_s3','united_states'),_T('_s3','northern_california'),_T('_s3','ireland'),_T('_s3','singapore'),_T('_s3','tokyo')
			,_T('_s3','oregon'),	_T('_s3','sydney'),	_T('_s3','sao_paulo')
			);



	var select_v_array = new Array(
			0,1,2,3,4,5,6,7	
			);

			SIZE = 5;
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




			$('#id_location_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"backups_s3Region_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_location\" rel='"+_g_location+"'>"+map_table(_g_location)+"</div>";
				//my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_location\" rel='1'>1</div>";//for test
				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_location_li'><div>"
				my_html_options+="<li id=\"backups_s3RegionLi1_select\" class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\"backups_s3RegionLi"+(i+1)+"_select\" rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\"backups_s3RegionLi"+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_location_top_main").append(my_html_options);	
				
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

/*dir select*/
function dir_select()
{
	var select_array = new Array(
			//0,1
			_T('_wfs','upload'),_T('_wfs','download')
			);



	var select_v_array = new Array(
			0,1
			);

			SIZE = 2;
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




			$('#id_dir_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				
				if (S3_MODIFY == 1)				
					my_html_options+="<div id=\"backups_s3Type_select\" class=\"wd_select option_selected gray_out\">";
				else
					my_html_options+="<div id=\"backups_s3Type_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_dir\" rel='"+_g_dir+"'>"+map_table(_g_dir)+"</div>";
				//my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_dir\" rel='1'>1</div>";//for test
				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_dir_li'>"
				my_html_options+="<li id=\"backups_s3TypeLi1_select\" class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#' onclick='check_dir("+select_v_array[0]+");'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\"backups_s3TypeLi"+(i+1)+"_select\" rel=\""+select_v_array[i]+"\"><a href='#' onclick='check_dir("+select_v_array[i]+");'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\"backups_s3TypeLi"+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#' onclick='check_dir("+select_v_array[j]+");' >"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_dir_top_main").append(my_html_options);	
				
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
/*backuptype*/
function backuptype_select()
{
	var select_array = new Array(
			//0,1,2
			_T('_s3','overwrite'),_T('_s3','fullbackup'),_T('_s3','incremental_backup')
			);



	var select_v_array = new Array(
			0,1,2
			);

			SIZE = 3;
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




			$('#id_backuptype_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				
				if (S3_MODIFY == 1)				
					my_html_options+="<div id=\"backups_s3BackupType_select\" class=\"wd_select option_selected gray_out\">";
				else				
					my_html_options+="<div id=\"backups_s3BackupType_select\" class=\"wd_select option_selected\">";
					
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_backuptype\" rel='"+_g_backuptype+"'>"+map_table(_g_backuptype)+"</div>";				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_backuptype_li' ><div>"
				my_html_options+="<li id=\"backups_s3BackupTypeLi1_select\" class=\"li_start\" rel=\""+select_v_array[0]+"\" ><a href='#'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\"backups_s3BackupTypeLi"+(i+1)+"_select\" rel=\""+select_v_array[i]+"\" ><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\"backups_s3BackupTypeLi"+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"' ><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_backuptype_top_main").append(my_html_options);	
				
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

/*sch type*/
function sch_s_type_select()
{
	$(".sch_s_type").removeClass("buttonSel");
		
		if (_g_sch_s_type == 1)
			$("#id_sch_s_type1").addClass("buttonSel");
		else if (index ==2 )
			$("#id_sch_s_type2").addClass("buttonSel");	
		else if (index ==3 )
			$("#id_sch_s_type3").addClass("buttonSel");		
	
	return;
	
	var select_array = new Array(
			//0,1,2,3,4
			_T('_mail','daily'),_T('_mail','weekly'),_T('_mail','monthly')
			);



	var select_v_array = new Array(
			1,2,3
			);

			SIZE = 3;
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




			$('#id_sch_s_type_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"id_sch_s_type_main\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_s_type\" rel='"+_g_sch_s_type+"'>"+map_table(_g_sch_s_type)+"</div>";
				//my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_s_type\" rel='1'>1</div>";//for test
				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_sch_s_type_li' ><div>"
				my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\" ><a href='#' onclick='s3_set_schedule("+select_v_array[0]+");'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li rel=\""+select_v_array[i]+"\" ><a href='#' onclick='s3_set_schedule("+select_v_array[i]+");'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"' ><a href='#' onclick='s3_set_schedule("+select_v_array[j]+");'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_sch_s_type_top_main").append(my_html_options);	
				
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


function sch_hour_select()
{	
	if(TIME_FORMAT == "12")
	{
		var select_array = new Array(
			//0,1,2,3,4
		"12AM","1AM","2AM","3AM","4AM","5AM","6AM","7AM","8AM","9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM"
		,"7PM","8PM","9PM","10PM","11PM"
			);
	}
	else
	{
			var select_array = new Array(
			//0,1,2,3,4
		"0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18"
		,"19","20","21","22","23"
			);		
	}	


	var select_v_array = new Array(
			0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23
			);
			
			SIZE = 24;
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



			$('#id_sch_hour_top_main').empty();								
				var my_html_options="";				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"backups_s3Hour_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_hour\" rel='"+_g_sch_hour+"'>"+map_table(_g_sch_hour)+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_sch_hour_li'>"
				my_html_options+="<div class='scrollbar_time'>";
				my_html_options+="<li id=\"backups_s3HourLi1_select\" class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";									
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\"backups_s3HourLi"+(i+1)+"_select\" rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\"backups_s3HourLi"+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				$("#id_sch_hour_top_main").append(my_html_options);	
//				$("#id_sch_hour_top_main .option_list ul").css("width","90px");
//				$("#id_sch_hour_top_main .option_list ul li").css("width","80px");				
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
function sch_min_select()
{
	var select_array = new Array();
	var select_v_array = new Array();
			
			SIZE = 60;
			SIZE2 = 2;
			
			for (var i=0;i<SIZE;i++)
			{
				select_v_array[i] = i;
			}
			for (var i=0;i<SIZE;i++)
			{
				if (i<=9)				
					select_array[i] = "0"+i;
				else 	
					select_array[i] = i;
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




			$('#id_sch_min_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"id_sch_min_main\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_min\" rel='"+_g_sch_min+"'>"+map_table(_g_sch_min)+"</div>";
				//my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_min\" rel='1'>1</div>";//for test
				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_sch_min_li'><div>"
				my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\" ><a href='#'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li rel=\""+select_v_array[i]+"\" ><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"' ><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_sch_min_top_main").append(my_html_options);	
				
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
/*
day
*/
function sch_day_select()
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
				my_html_options+="<div id=\"backups_s3Day_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_day\" rel='"+_g_sch_day+"'>"+map_table(_g_sch_day)+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_sch_day_li'>"
				my_html_options+="<div class='scrollbar_time'>";
				my_html_options+="<li id=\"backups_s3DayLi1_select\" class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";									
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\"backups_s3DayLi"+(i+1)+"_select\" rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\"backups_s3DayLi"+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				$("#id_sch_day_top_main").append(my_html_options);	
//				$("#id_sch_day_top_main .option_list ul").css("width","90px");
//				$("#id_sch_day_top_main .option_list ul li").css("width","80px");				
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
/*week*/
function sch_week_select()
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
				my_html_options+="<div id=\"backups_s3Week_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_week\" rel='"+_g_sch_week+"'>"+map_table(_g_sch_week)+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_sch_week_li'>"
				my_html_options+="<div class='scrollbar_time'>";
				my_html_options+="<li id=\"backups_s3WeekLi1_select\" class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";									
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\"backups_s3WeekLi"+(i+1)+"_select\" rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\"backups_s3WeekLi"+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				$("#id_sch_week_top_main").append(my_html_options);	
				//$("#id_sch_week_top_main .option_list ul").css("width","90px");
				//$("#id_sch_week_top_main .option_list ul li").css("width","80px");				
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




/*once------------------------------------*/
function once_hour_select()
{
	var select_array = new Array(
			//0,1,2,3,4
		"12AM","1AM","2AM","3AM","4AM","5AM","6AM","7AM","8AM","9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM"
		,"7PM","8PM","9PM","10PM","11PM"
			);



	var select_v_array = new Array(
			0,1,2,3,4,5,6,7,8,9,0,11,12,13,14,15,16,17,18,19,20,21,22,23
			);
			
			SIZE = 24;
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




			$('#id_once_hour_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"id_once_hour_main\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_once_hour\" rel='"+_g_once_hour+"'>"+map_table(_g_once_hour)+"</div>";
				//my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_once_hour\" rel='1'>1</div>";//for test
				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_once_hour_li' ><div>"
				my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\" ><a href='#'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li rel=\""+select_v_array[i]+"\" ><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"' ><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_once_hour_top_main").append(my_html_options);	
				
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
function once_min_select()
{
	var select_array = new Array();
	var select_v_array = new Array();
			
			SIZE = 60;
			SIZE2 = 2;
			
			for (var i=0;i<SIZE;i++)
			{
				select_v_array[i] = i;
			}
			for (var i=0;i<SIZE;i++)
			{
				if (i<=9)				
					select_array[i] = "0"+i;
				else 	
					select_array[i] = i;
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




			$('#id_once_min_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"id_once_min_main\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_once_min\" rel='"+_g_once_min+"'>"+map_table(_g_once_min)+"</div>";
				//my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_once_min\" rel='1'>1</div>";//for test
				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_once_min_li' ><div>"
				my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\" ><a href='#'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li rel=\""+select_v_array[i]+"\" ><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"' ><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_once_min_top_main").append(my_html_options);	
				
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
/*
day
*/
function once_day_select()
{
	var select_array = new Array(			
			);



	var select_v_array = new Array(			
			);

			SIZE = 31;
			SIZE2 = 2;
			
			for (var i=0;i<SIZE;i++)
			{
				var j= i+1;
				select_v_array[i] = j;
			}
			for (var i=0;i<SIZE;i++)
			{
				var j = i+1;
				if (j<=9)				
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




			$('#id_once_day_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"id_once_day_main\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_once_day\" rel='"+_g_once_day+"'>"+map_table(_g_once_day)+"</div>";
				//my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_once_day\" rel='1'>1</div>";//for test
				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_once_day_li' ><div>"
				my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\" ><a href='#'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li rel=\""+select_v_array[i]+"\" ><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"' ><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_once_day_top_main").append(my_html_options);	
				
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
function once_month_select()
{
	var select_array = new Array(			
			);



	var select_v_array = new Array(			
			);

			SIZE = 12;
			SIZE2 = 2;
			
			for (var i=0;i<SIZE;i++)
			{
				var j= i+1;
				select_v_array[i] = j;
			}
			for (var i=0;i<SIZE;i++)
			{
				var j = i+1;
				if (j<=9)				
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




			$('#id_once_month_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"id_once_month_main\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_once_month\" rel='"+_g_once_month+"'>"+map_table(_g_once_month)+"</div>";
				//my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_once_month\" rel='1'>1</div>";//for test
				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_once_month_li' ><div>"
				my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\" ><a href='#'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li rel=\""+select_v_array[i]+"\" ><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"' ><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_once_month_top_main").append(my_html_options);	
				
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

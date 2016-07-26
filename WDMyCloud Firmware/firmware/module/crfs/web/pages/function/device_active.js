var flag_mem = 1;
var flag_cpu = 1;
var flag_lan = 0;
var _init = 0;


var loop_main=0;	
var loop_process = 0;
var loop_memory = 0;
var loop_network = 0;
var loop_cpu = 0;


var old_time_main = 1;
var old_time_memory = 1;
var old_time_network = 1;
var old_time_cpu = 1;

var _g_memory_level = 0;
var _g_cpu_level = 0;
var _g_network = 0;
var _g_tx = 0;
var _g_rx = 0;
var _g_rx2 = 0;
var _g_tx2 = 0;

var count_main = 0;	
var count_network = 0;
var count_cpu = 0;
var count_memory = 0;
	
var plot2 = 0;	
var _g_bond = 0;

function ready_device_active()
{
	count_main = 0;
	lan_rx_init = -1;
	lan_tx_init = -1;
	lan2_rx_init = -1;
	lan2_tx_init = -1;
	
		getdata_network_main();
    
		var previousPoint2 = null;
    $("#home_networkActivity_link").bind("plothover", function (event, pos, item) {
        $("#x").empty().text(pos.x.toFixed(2));
        $("#y").empty().text(pos.y.toFixed(2));
      
       if (1){
            if (item) {
                if (previousPoint2 != item.datapoint) {
                    previousPoint2 = item.datapoint;
                    
                    $("#home_tooltip").remove();
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);
                    
                   showTooltip(item.pageX+10, item.pageY,
                                item.series.label + " = "+ y + "MB/s","home_tooltip");
                }
            }
            else {
                $("#home_tooltip").remove();
                previousPoint2 = null;            
            }
        }
    });
  
  
    	
    
    
    
   
    
}

function init_network()
{
	//show('placeholder1')
	//return;
	clearTimeout(loop_network);
//	getdata_network();


    var previousPoint = null;
    $("#placeholder_network").bind("plothover", function (event, pos, item) {
        $("#x").empty().text(pos.x.toFixed(2));
        $("#y").empty().text(pos.y.toFixed(2));
       // if ($("#enableTooltip:checked").length > 0) {
       if (1){
            if (item) {
                if (previousPoint != item.datapoint) {
                    previousPoint = item.datapoint;
                    
                    $("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);
                    
                    showTooltip(item.pageX+10, item.pageY,
                                item.series.label + " = "+ y + "MB/s");
                                
                }
            }
            else {
                $("#tooltip").remove();
                previousPoint = null;            
            }
        }
    });
    $("#placeholder_network .legend").children().css("margin-top","-55px").css('right','25px').css('background-color','#dfdfdf');
    draw_network();
}	
function init_cpu()
{	
	
		clearTimeout(loop_cpu);	

    var previousPoint = null;
    $("#placeholder").bind("plothover", function (event, pos, item) {
        $("#x").empty().text(pos.x.toFixed(2));
        $("#y").empty().text(pos.y.toFixed(2));
       // if ($("#enableTooltip:checked").length > 0) {
       if (1){
            if (item) {
                if (previousPoint != item.datapoint) {
                    previousPoint = item.datapoint;
                    
                    $("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);
                    
                    showTooltip(item.pageX+10, item.pageY,
                               "CPU "+ _T('_monitor','utilitazion_ratio')+" = " + y);
                     																		
                                
                }
            }
            else {
                $("#tooltip").remove();
                previousPoint = null;            
            }
        }
    });
    
    $("#placeholder .legend").children().css("margin-top","-47px").css('background-color','#dfdfdf');    
    draw();    
}	
function init_memory()
{
	//show('placeholder1')
	//return;
	clearTimeout(loop_memory);
//	getdata_memory();


    var previousPoint = null;
    $("#placeholder_memory").bind("plothover", function (event, pos, item) {
        $("#x").empty().text(pos.x.toFixed(2));
        $("#y").empty().text(pos.y.toFixed(2));
       // if ($("#enableTooltip:checked").length > 0) {
       if (1){
            if (item) {
                if (previousPoint != item.datapoint) {
                    previousPoint = item.datapoint;
                    
                    $("#tooltip").remove();
                    var x = item.datapoint[0].toFixed(2),
                        y = item.datapoint[1].toFixed(2);
                    
                    showTooltip(item.pageX+10, item.pageY,
                                "Memory "+ _T('_monitor','utilitazion_ratio')+" = " + y);
                    
                                
                }
            }
            else {
                $("#tooltip").remove();
                previousPoint = null;            
            }
        }
    });
    $("#placeholder_memory .legend").children().css("margin-top","-47px").css('background-color','#dfdfdf');
    
     draw_memory();    
}
function init_process()
{
	//return;
	clearTimeout(loop_process);	
	draw_process();

}
var _process_sort_type = 2 /*0: process ; 1:cpu 2:memory*/
function process_sort(type)
{
	_process_sort_type = type;
	init_process();	
}
function draw_process()
{
	wd_ajax({
		type:"POST",
		async:true,
		cache:false,
		url:"/cgi-bin/status_mgr.cgi",
		data:{cmd:"cgi_process"},
		dataType: "xml",	
		success:function(xml){									
			var process_array = new Array();
				
				$(xml).find('process_main').each(function(index){
					 	 var command = $(this).find('command').text();
					 	 var user = $(this).find('user').text();
					 	 var pid = $(this).find('pid').text();
					 	 var cpu = $(this).find('cpu').text();
					 	 var mem = $(this).find('mem').text();						
					 	 process_array[index] = [command,cpu,mem];					
				 });
				 
					 	 
				if (_process_sort_type == 0 )
					 process_array.sort()
				else if (_process_sort_type == 1 )
					process_array.sort(mysort2)
				else if (_process_sort_type == 2 )
					process_array.sort(mysort3)
		 
				var str = "<ul class='proListDiv'>"
				for (var i=0;i<process_array.length;i++)
				{
					 	 str = str+"<li>"					 	
					 	 str = str+"<div class='div1'>"+ process_array[i][0]+"</div>"
					 	 str = str+"<div class='div2'>"+ process_array[i][1]+"</div>"
					 	 str = str+"<div class='div3'>"+ process_array[i][2]+"</div>"					 	 
					 	 str = str+"</li>"
				}
					 	 
			str = str+"</ul>"
				document.getElementById("id_process_list").innerHTML  = str								
				init_scroll('.scrollbar_active');
			}
	});	
				
 	
	loop_process = setTimeout(draw_process,2000);             			
}
function mysort1(a,b)
{	
	return b[0]-a[0];      
}
function mysort2(a,b)
{	
	return b[1]-a[1];       
}
function mysort3(a,b,c)
{	
	return b[2] - a[2];       
}
var lan_rx_init = -1;
var lan_tx_init = -1;
var lan2_rx_init = -1;
var lan2_tx_init = -1;

var array_num = 49;  //origin:49
var rx_stop = 0;
var tx_stop = 0;

var rx2_stop = 0;
var tx2_stop = 0;
//------------------------------------------

var cpu_max = 15;
var box_cpu = [], box_mem = [], box_lan = [],box_rx=[], box_tx=[], box_rx2=[], box_tx2=[];

var new_box_rx = [],new_box_tx = [];
var new_box_rx2 = [],new_box_tx2 = [];

	
for (var i = 0; i <= cpu_max; i += 0.1) {             	 
 var j = i.toFixed(1);   
   box_cpu.push([j, null]);       	   
} 

for (var i = 0; i <= cpu_max; i += 0.1) {             	 
 var j = i.toFixed(1);   
   box_mem.push([j, null]);       	   
} 
//lan1
for (var i = 0; i <= cpu_max; i += 0.1) {             	 
 var j = i.toFixed(1);   
   box_rx.push([j, null]);       	   
} 
for (var i = 0; i <= cpu_max; i += 0.1) {             	 
 var j = i.toFixed(1);   
   box_tx.push([j, null]);       	   
} 


for (var i = 0; i <= cpu_max; i += 0.1) {             	 
 var j = i.toFixed(1);   
   new_box_rx.push([j, null]);       	   
} 
for (var i = 0; i <= cpu_max; i += 0.1) {             	 
 var j = i.toFixed(1);   
   new_box_tx.push([j, null]);       	   
} 

//lan2
for (var i = 0; i <= cpu_max; i += 0.1) {             	 
 var j = i.toFixed(1);   
   box_rx2.push([j, null]);       	   
} 
for (var i = 0; i <= cpu_max; i += 0.1) {             	 
 var j = i.toFixed(1);   
   box_tx2.push([j, null]);       	   
} 

for (var i = 0; i <= cpu_max; i += 0.1) {             	 
 var j = i.toFixed(1);   
   new_box_rx2.push([j, null]);       	   
} 
for (var i = 0; i <= cpu_max; i += 0.1) {             	 
 var j = i.toFixed(1);   
   new_box_tx2.push([j, null]);       	   
} 
var error_count = 0;
function getdata_network_main()
{
	
		wd_ajax({
		type:"POST",
		async:true,
		cache:false,
		url:"/cgi-bin/status_mgr.cgi",
		data:{cmd:"resource"},
		dataType: "xml",	
		success:function(xml){		
				var bonding = $(xml).find('bonding').text();
				_g_bond = bonding;
				var mem_total = $(xml).find('mem_total').text();
				var mem2_total = $(xml).find('mem2_total').text();
				var mem_free =  $(xml).find('mem_free').text();
				var buffers = $(xml).find('buffers').text();
				var cached = $(xml).find('cached').text();		
				var cpu = $(xml).find('xml>cpu').text();						
				var lan_r_speed = $(xml).find('lan_r_speed').text();						
				var lan_t_speed = $(xml).find('lan_t_speed').text();				
				var lan2_r_speed = $(xml).find('lan2_r_speed').text();						
				var lan2_t_speed = $(xml).find('lan2_t_speed').text();				
				var now_time = 	$(xml).find('now_time').text();				
				var str  = "<table border=1 id='id_tb_process'>";
				str = str+"<thead>"								
				str = str+"</tr>"
				str = str+"</thead>"	
				str = str+"<tbody>"				
				
				var process_num = 0;
				
							$(xml).find('process_main').each(function(index){
				 	 process_num = index;
			 });
				process_num = process_num+1;				
			//	$("#id_mem_total").text(_T('_p2p','total')+": " + parseInt(mem_total/1024*100)/100+" MB");
			//	$("#id_mem_used").text(_T('_monitor','used')+": " + (((parseInt(mem_total,10)-parseInt(mem_free,10)-parseInt(buffers,10)-parseInt(cached,10))/1024*100)/100).toFixed(2)+" MB");
			//	$("#id_mem_free").text(_T('_monitor','free')+": " + (((parseInt(mem_free,10)+parseInt(buffers,10)+parseInt(cached,10))/1024*100)/100).toFixed(2)+" MB");
						
				var mem = (parseInt(mem_total,10)-parseInt(mem_free,10)-parseInt(buffers,10)-parseInt(cached,10))/parseInt(mem_total)*100;
				cpu = parseInt(cpu);		
					
				draw_main(cpu,mem.toFixed(2),parseInt(lan_r_speed/1024/1024),parseInt(lan_t_speed/1024/1024),parseInt(lan2_r_speed/1024/1024),parseInt(lan2_t_speed/1024/1024),str,now_time,process_num,bonding,mem2_total);	
				error_count = 0;
		},
		error:function(){			
			
			if (error_count >= 1)
				clear_resource();
			loop_main = setTimeout(function(){error_count++;getdata_network_main()},3000);  				
			
		}
	});
}
function draw_main(cpu,mem,rx,tx,rx2,tx2,process_tb,now_time,process_num,bonding,mem_total)
{
			//cpu		
			for (var i = 0;i<11;i++)
			{
				$("#home_cpuDetail_link tr:eq("+i+") td:eq(0)").removeClass("cpu-v-tb")
			}
				
			if (cpu > 0 )
			{
				var k = Math.round(cpu/10);
				if (cpu>0&&v<cpu)
				{
					k = 0;
				}
				_g_cpu_level = k;
			
				for (var i = 0;i<k;i++)
				{
					$("#home_cpuDetail_link tr:eq("+(9-i)+") td:eq(0)").addClass("cpu-v-tb")
				}
			}			
			//cpu------------------------------------------------------------------------
				if (box_cpu[0][1] != null)
				{
					for(i=0;i<box_cpu.length;i++)
					{
					  	if( i == cpu_max*10 || box_cpu[i][1] == null)
					  	{
					  		for (j =i-1 ;j>=0;j--)
					  		{	  							  
					  			var v = box_cpu[j][1];		
					  			
					  			var k = (j+1)/10;
					  			var k = k.toFixed(1);   
					  			box_cpu[j+1] = [k,v];							  											  							  										
					  		}
					  		break;
					  	}
					}
				}	
				box_cpu[0] = [0,cpu];
									
				
			//memory
			for (var i = 0;i<11;i++)
			{
				$("#home_ramDetail_link tr:eq("+i+") td:eq(0)").removeClass("cpu-v-tb")
			}
			if (mem > 0 )
			{
				var k = Math.round(mem/10);
				if (mem>0&&mem<10)
				{
					k = 1;
				}
				_g_memory_level = k;
				for (var i = 0;i<k;i++)
				{
					$("#home_ramDetail_link tr:eq("+(9-i)+") td:eq(0)").addClass("cpu-v-tb")
				}
			}	
				//memory
				if (box_mem[0][1] != null)
				{
					for(i=0;i<box_mem.length;i++)
					{
					  	if( i == cpu_max*10 ||  box_mem[i][1] == null)
					  	{
					  		for (j =i-1 ;j>=0;j--)
					  		{	  							  
					  			var v = box_mem[j][1];		
					  			
					  			var k = (j+1)/10;
					  			var k = k.toFixed(1);   
					  			box_mem[j+1] = [k,v];							  											  							  										
					  		}
					  		break;
					  	}
					}
				}	
				box_mem[0] = [0,mem];
					
				
		var diff_time = parseInt(now_time,10) - parseInt(old_time_main,10);					
		

		if (diff_time != 0 && now_time != "")
		{					
			var msg = "now_time = "	+now_time;
			msg = msg+ "\nold_time = "+ old_time_main;
			msg = msg+ "\ndiff_time = "+ diff_time;
			
			old_time_main  = parseInt(now_time,10)	
				
	  		//lan1
     	if (box_rx[0][1] != null)
			{
				for(i=0;i<box_rx.length;i++)
				{
				  	if( i == cpu_max*10 ||  box_rx[i][1] == null )
				  	{
				  		for (j =i-1 ;j>=0;j--)
				  		{	  							  
				  			var v = box_rx[j][1];		
				  			
				  			var k = (j+1)/10;
				  			var k = k.toFixed(1);   
				  			box_rx[j+1] = [k,v];							  								  											  							  										
				  		}
				  		break;
				  	}
				}
			}	
													
			if (lan_rx_init  == -1)
			{		
				box_rx[0][1] = null;
				lan_rx_init = rx;		
				_g_rx = rx;
			}
			else
			{		
				
					if (lan_rx_init > rx )
		  		{
             rx_stop =1;
		  			//box_rx[0] = [0,rx/diff_time];	
		  			//_g_rx = rx/diff_time;
		  		}
					else
					{
							var max_lan = 125;
							if (bonding == 1 && LAN_PORT_NUM == 2) max_lan = 250;
							rx_stop = 0;			
							var v_rx = Math.abs(rx-lan_rx_init)/diff_time;
							if (v_rx > max_lan) v_rx = max_lan;
		   				box_rx[0] = [0,v_rx];
		   				_g_rx = v_rx;
	   			}		
	   			lan_rx_init = rx;							
	  	}  								
			if (box_tx[0][1] != null)
			{
				for(i=0;i<box_tx.length;i++)
				{
				  	if(i == cpu_max*10 || box_tx[i][1] == null)
				  	{
				  		for (j =i-1 ;j>=0;j--)
				  		{	  							  
				  			var v = box_tx[j][1];		
				  			
				  			var k = (j+1)/10;
				  			var k = k.toFixed(1);   
				  			box_tx[j+1] = [k,v];							  											  							  										
				  		}
				  		break;
				  	}
				}
			}				
			if (lan_tx_init  == -1)
			{		
				box_tx[0][1] = null;
				lan_tx_init = tx;		
				_g_tx = tx;
			}
			else
			{		
				
				if (lan_tx_init > tx )
	  		{
          tx_stop =1;
	  			//box_tx[0] = [0,tx/diff_time];	
	  			//_g_tx = tx/diff_time;
	  		}
				else
				{	
					var max_lan = 125;
					if (bonding == 1 && LAN_PORT_NUM == 2) max_lan = 250;
					tx_stop =0;
					var v_tx = Math.abs(tx-lan_tx_init)/diff_time;
					if (v_tx > max_lan) v_tx = max_lan;
	   			box_tx[0] = [0,v_tx];		   				   			
	   			_g_tx = v_tx;
	   		}			   			
	   		lan_tx_init = tx;			
	  	}
	  	
	  	//LAN2
	  	if (box_rx2[0][1] != null)
			{
				for(i=0;i<box_rx2.length;i++)
				{
				  	if( i == cpu_max*10 ||  box_rx2[i][1] == null )
				  	{
				  		for (j =i-1 ;j>=0;j--)
				  		{	  							  
				  			var v = box_rx2[j][1];		
				  			
				  			var k = (j+1)/10;
				  			var k = k.toFixed(1);   
				  			box_rx2[j+1] = [k,v];							  								  											  							  										
				  		}
				  		break;
				  	}
				}
			}	
													
			if (lan2_rx_init  == -1)
			{		
				box_rx2[0][1] = null;
				lan2_rx_init = rx2;		
				_g_rx2 = rx2;
			}
			else
			{		
				
					if (lan2_rx_init > rx2 )
		  		{
             rx2_stop =1;
		  			//box_rx[0] = [0,rx/diff_time];	
		  			//_g_rx = rx/diff_time;
		  		}
					else
					{				
							var max_lan = 125;							
							rx2_stop = 0;			
							var v_rx2 = Math.abs(rx2-lan2_rx_init)/diff_time;
							if (v_rx2 > max_lan) v_rx2 = max_lan;	
		   				box_rx2[0] = [0,v_rx2];
		   				_g_rx2 = v_rx2;
	   			}		
	   			lan2_rx_init = rx2;							
	  	}  					
	  	  				
			if (box_tx2[0][1] != null)
			{
				for(i=0;i<box_tx2.length;i++)
				{
				  	if(i == cpu_max*10 || box_tx2[i][1] == null)
				  	{
				  		for (j =i-1 ;j>=0;j--)
				  		{	  							  
				  			var v = box_tx2[j][1];		
				  			
				  			var k = (j+1)/10;
				  			var k = k.toFixed(1);   
				  			box_tx2[j+1] = [k,v];							  											  							  										
				  		}
				  		break;
				  	}
				}
			}				
			if (lan2_tx_init  == -1)
			{		
				box_tx2[0][1] = null;
				lan2_tx_init = tx2;		
				_g_tx2 = tx2;
			}
			else
			{		
				
				if (lan2_tx_init > tx2 )
	  		        {
                                 tx2_stop =1;
	  			//box_tx[0] = [0,tx/diff_time];	
	  			//_g_tx = tx/diff_time;
	  		        }
				else
				{	
					var max_lan = 125;
					tx2_stop =0;
					var v_tx2 = Math.abs(tx2-lan2_tx_init)/diff_time;
					if (v_tx2 > max_lan) v_tx2 = max_lan;
	   			box_tx2[0] = [0,v_tx2];		   				   			
	   			_g_tx2 = v_tx2;
	   		}			   			
	   		lan2_tx_init = tx2;			
	  	}
			$("#id_unit").empty().html("MB/s");
			
			if(_g_bond=="0" && LAN_PORT_NUM==2) //lan1 & lan2					
			{
				if (rx_stop == 0 && tx_stop == 0 && rx2_stop == 0 && tx2_stop == 0)
				{												
					if (count_main == 0)
					{					
												//change_bandwidth(box_rx,box_tx);
													plot2 = $.plot($("#home_networkActivity_link"),					
											  [ { data: box_rx, label: "Rx"}, { data: box_tx, label: "Tx" },{ data: box_rx2, label: "LAN2:Rx"}, { data: box_tx2, label: "LAN2:Tx" }  ], {
										         series: {
							                   lines: { show: true },
							                   points: { show: false }
							               },               
                                                  grid: { hoverable: true, clickable: true, color: "#c3c3c3", backgroundColor: "#dfdfdf"},              
														yaxis: {ticks: range(),tickDecimals:0},
														xaxis: { ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],tickDecimals:0},
                                                        colors: ["#0067A6", "#15ABFF","#FF7F7C", "#EDF4A5"] 
							          });
					}
					else
					{	
								 plot2.setData(	   
						    	[ { data: box_rx, label: "Rx"}, { data: box_tx, label: "Tx" }, { data: box_rx2, label: "LAN2:Rx"}, { data: box_tx2, label: "LAN2:Tx" }  ]
						   		);
					        // since the axes don't change, we don't need to call plot.setupGrid()
					        plot2.setupGrid();
					        plot2.draw();
					}
				}	
			}
			else //lan1
			{			
				if (rx_stop == 0 && tx_stop == 0)
				{												
					if (count_main == 0)
					{					
												//change_bandwidth(box_rx,box_tx);
													plot2 = $.plot($("#home_networkActivity_link"),					
											  [ { data: box_rx, label: "Rx"}, { data: box_tx, label: "Tx" } ], {
										         series: {
									   shadowSize: 0,
							                   lines: { show: true },
							                   points: { show: false }
							               },               
														grid: { hoverable: true, clickable: true, color: "#c3c3c3", backgroundColor: "#dfdfdf" },              
														yaxis: {ticks: range(),tickDecimals:0},
														xaxis: { ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],tickDecimals:0},
                                                        colors: ["#0067a6", "#15ABFF","#FF7F7C", "#EDF4A5"]
							          });
					}
					else
					{	
								 plot2.setData(	   
						    	[ { data: box_rx, label: "Rx"}, { data: box_tx, label: "Tx" } ]
						   		);
					        // since the axes don't change, we don't need to call plot.setupGrid()
					        plot2.setupGrid();
					        plot2.draw();
					}
				}	
			}									
		}		
		if (count_main<2)
				loop_main = setTimeout(getdata_network_main,1000);   
		else
				loop_main = setTimeout(getdata_network_main,6000);   
				
		count_main = count_main+1;		
		
		
				
	
	
		for (var i=0;i<11;i++)
		{
			$("#id_cpu_level_icon").removeClass("div3_"+i)
			$("#id_memory_level_icon").removeClass("div3_"+i)
			$("#id_process_level_icon").removeClass("div3_"+i)
		}
			
			
		$("#id_cpu_level_icon").addClass("div3_"+_g_cpu_level)
		$("#id_memory_level_icon").addClass("div3_"+_g_memory_level)
		$("#id_process_level_icon").addClass("div3_"+_g_memory_level)
		
		
		$("#home_deviceActivityCPU_value").empty().text(cpu);		
		$("#home_deviceActivityMemory_value").empty().text(mem+"% ("+mem_total+" "+_T('_common','installed')+")");
		$("#home_deviceActivityProcess_value").empty().text(parseInt(process_num,10));
		
		if(_g_bond=="0" && LAN_PORT_NUM==2)
		{	
			$("#home_deviceActivityNetwork_value").empty().text("LAN1:"+_g_tx.toFixed(2)+"MB Tx,"+_g_rx.toFixed(2)+"MB Rx; LAN2:"+_g_tx2.toFixed(2)+"MB Tx,"+_g_rx2.toFixed(2)+"MB Rx");		
			$("#home_deviceActivityNetwork_value").css("margin-top","-20px");
		}	
		else
		{
			$("#home_deviceActivityNetwork_value").empty().text(_g_tx.toFixed(2)+"MB Tx,"+_g_rx.toFixed(2)+"MB Rx");		
		}	
//		if (_g_bond == 1)
//			$("#home_deviceActivityNetwork_value").empty().text(_g_tx.toFixed(2)+"MB Tx,"+_g_rx.toFixed(2)+"MB Rx");		
//		else
//		{	
//			$("#home_deviceActivityNetwork_value").empty().text("LAN1:"+_g_tx.toFixed(2)+"MB Tx,"+_g_rx.toFixed(2)+"MB Rx; LAN2:"+_g_tx2.toFixed(2)+"MB Tx,"+_g_rx2.toFixed(2)+"MB Rx");		
//			$("#home_deviceActivityNetwork_value").css("margin-top","-20px");
//		}	
	

    
    $('#home_cpuDetail_link').bind({  
    	mouseout: function() {    // do something on click 
    		  $("#home_tooltip").remove();
    	 },  
    	 mouseover: function(event) {      	 	
    	 	  // do something on mouseenter 
    	 	   $("#home_tooltip").remove();
    	 	  showTooltip(event.pageX+10,event.pageY-20,cpu+"%","home_tooltip");
    	 	 }});
	
	  $('#home_ramDetail_link').bind({  
    	mouseout: function() {    // do something on click 
    		  $("#home_tooltip").remove();
    	 },  
    	 mouseover: function(event) {      	 	
    	 	  // do something on mouseenter 
    	 	   $("#home_tooltip").remove();
    	 	  showTooltip(event.pageX+10,event.pageY-20,mem+"%","home_tooltip");
    	 	 }});
					
		$("#home_networkActivity_link").css('cursor','pointer');
}

function draw_network(cpu,mem,rx,tx,rx2,tx2,process_tb,now_time)
{
	$("#id_unit2").empty().html("MB/s");
						//change_bandwidth2(box_rx2,box_tx2);
		
					if(_g_bond=="0" && LAN_PORT_NUM==2)
					{						
											  var plot3 = $.plot($("#placeholder_network"),               
						           [ { data: box_rx, label: "LAN1:Rx"}, { data: box_tx, label: "LAN1:Tx" },{ data: box_rx2, label: "LAN2:Rx" } ,{ data: box_tx2, label: "LAN2:Tx" }], {
						               series: {
						                   lines: { show: true },
						                   points: { show: false }
						               },               
													//grid: { hoverable: true, clickable: true },              
													//yaxis: {ticks: range(),tickDecimals:0},
													//xaxis: { ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]}
                                       grid: { hoverable: true, clickable: true ,color: "#c3c3c3",backgroundColor: "#dfdfdf",
															borderWidth: 2},              
												yaxis: {ticks: [0,10, 20,30, 40,50, 60,70,80,90,100],tickDecimals:0},
												xaxis: { ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],tickDecimals:0},
                                            colors: ["#0067A6", "#15ABFF","#FF7F7C", "#EDF4A5"] 
						               
						          }); 
                        $("#placeholder_network .legend").children().css('right','25px').css('background-color','#dfdfdf');
                        $("#placeholder_network .legend").children().next().css('top','-38px');                        
					}
					else
					{
						  				var plot3 = $.plot($("#placeholder_network"),               
						           [ { data: box_rx, label: "Rx"}, { data: box_tx, label: "Tx" }], {
						               series: {
						                   shadowSize: 0,
						                   lines: { show: true },
						                   points: { show: false }
						               },               
													//grid: { hoverable: true, clickable: true },              
													//yaxis: {ticks: range(),tickDecimals:0},
													//xaxis: { ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]}
                                       grid: { hoverable: true, clickable: true ,color: "#c3c3c3",backgroundColor: "#dfdfdf",
															borderWidth: 2},              
												yaxis: {ticks: [0,10, 20,30, 40,50, 60,70,80,90,100],tickDecimals:0},
												xaxis: { ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],tickDecimals:0},
                                                  colors: ["#0067A6", "#15ABFF", "#cb4b4b", "#4da74d", "#9440ed"] 
						               
						          }); 

                        $("#placeholder_network .legend").children().css("margin-top","-55px").css('right','25px').css('background-color','#dfdfdf');
                        $("#placeholder_network .legend").children().next().css('top','9px');
					}		          
        

				loop_network = setTimeout(draw_network,6000);   
						
				
}
function draw_memory(cpu,mem,rx,tx,rx2,tx2,process_tb)
{
 	
		if (flag_mem == 1)
		{			
	 				var plot1 = $.plot($("#placeholder_memory"),    
           [ { data: box_mem, label: _T('_monitor','utilitazion_ratio')} ], {
               series: {
                   lines: { show: true },
                   points: { show: false }
               },
               grid: { hoverable: true, clickable: true ,color: "#c3c3c3",backgroundColor: "#dfdfdf",
                      borderWidth: 2, borderColor: "#c3c3c3"},              
							yaxis: {ticks: [0,10, 20,30, 40,50, 60,70,80,90,100],tickDecimals:0},
							xaxis: { ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],tickDecimals:0},
                        colors: ["#0067A6", "#15ABFF", "#cb4b4b", "#4da74d", "#9440ed"]               
							//grid: { hoverable: true, clickable: true },              
							//yaxis: {ticks: [0, 20, 40, 60,80,100],tickDecimals:0},
							//xaxis: { ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]}
               
          });  
            $("#placeholder_memory .legend").children().css("margin-top","-47px").css('background-color','#dfdfdf');    		 
    }  

		loop_memory = setTimeout(draw_memory,6000);   		
}
function draw()
{	
		var plot = $.plot($("#placeholder"),    
     [ { data: box_cpu, label:  _T('_monitor','utilitazion_ratio')} ], {
         series: {
             lines: { show: true },
             points: { show: false }
         },               
         grid: { hoverable: true, clickable: true ,color: "#c3c3c3",backgroundColor: "#dfdfdf",
							borderWidth: 2},              
				yaxis: {ticks: [0,10, 20,30, 40,50, 60,70,80,90,100],tickDecimals:0},
				xaxis: { ticks:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],tickDecimals:0},
            colors: ["#0067A6", "#15ABFF", "#cb4b4b", "#4da74d", "#9440ed"] 
    });
    
    $("#placeholder .legend").children().css("margin-top","-47px").css('background-color','#dfdfdf');
    
	setTimeout(draw,6000);   
		
}	

function check_bandwidth(rx,tx)
{	
		for (var i =0;i<rx.length;i++)
		{
					if( rx[i][1] != null)
					{
						var v =  rx[i][1];						
						 if (v/1024 >50)
						 	return 1;
						 else	if (v/1024 >1)
						 	return 2;
						 else if ( 1024>v && v >= 500)
						 	return 5;	
						 else if ( 500>v && v >= 100) 
						 	return 4;	
						 else if ( 100 > v && v >= 50)
						  return 3;						 						
					}
		}
		
		for (var i =0;i<tx.length;i++)
		{
					if( tx[i][1] != null)
					{
						var v =  tx[i][1];						
						 if (v/1024 >50)
						 	return 1;
						 else	if (v/1024 >1)
						 	return 2;
						 else if ( 1024>v && v >= 500)
						 	return 5;					
						 else if ( 500>v && v >= 100) 
						 	return 4;								
						 else if ( 100 > v && v >= 50)
						  return 3;
						 	
					}
		}
		
		return 0;
}

function change_bandwidth(rx,tx)
{
		var t = 0;	
		for (var i = 0; i <= cpu_max; i += 0.1) {             	 
			if (rx[t][1] == null) {continue;}
		 	var j = i.toFixed(1);    
		 	var v =(rx[t][1]/1024).toFixed(2);
		 	if (v > 100) v = 100;
		   new_box_rx[t] = [j,v];
		   t++;   
		} 
		
		var t = 0;	
		for (var i = 0; i <= cpu_max; i += 0.1) {             	 
			if (tx[t][1] == null) continue;
		 	var j = i.toFixed(1); 		 	  
		 	var v =(tx[t][1]/1024).toFixed(2);
		 	if (v > 100) v = 100; 
		   new_box_tx[t] = [j,v];
		   t++;   
		} 
}
function change_bandwidth2(rx,tx)
{
		var t = 0;	
		for (var i = 0; i <= cpu_max; i += 0.1) {             	 
		 	var j = i.toFixed(1);    
		 	var v =(rx[t][1]/1024).toFixed(2);
		 	if (v > 100) v = 100;
		   new_box_rx2[t] = [j,v];
		   t++;   
		} 
		
		var t = 0;	
		for (var i = 0; i <= cpu_max; i += 0.1) {             	 
		 	var j = i.toFixed(1);   
		 	var v =(tx[t][1]/1024).toFixed(2);
		 	if (v > 100) v = 100; 
		   new_box_tx2[t] = [j,v];
		   t++;   
		} 
}


function range(v)
{
	var ticks = [0,20,40,60,80,100];
	return ticks;
	/*
	 0: kB {0,20,40,50}
	 1: MB {0,20,40,60,80,100}
	 2: MB {0,10,20,30,40,50}
	 3: KB {0,50,100}
	 4: KB {0,100,500}
	 5: KB {0,500, 1000}
	*/
	var ticks = [0,20,40,50]
	if (v == 1)
		ticks = [0,20,40,60,80,100];
	else if(v == 2)
		ticks = [0,10,20,30,40,50];
	else if(v == 3)
		ticks = [0,50,100];
	else if(v == 4)
		ticks = [0,100,500];
	else if(v == 5)		
		ticks = [0,500,1000];
		
	return ticks;
}


 function showTooltip(x, y, contents,id) {
 	if (typeof(id)=="undefined") 
 	{
 		id = "tooltip";
 		z_index = 99999;
 	}	
 	else
 	{
 		z_index = 999;
 	}	 
        $('<div id="'+id+'">' + contents + '</div>').css( {
            position: 'absolute',
            display: 'none',
            top: y + 5,
            left: x + 5,
            border: '0px solid #0067a6',
            padding: '10px',
            'background-color': '#15abff',
            opacity: 0.80,
            'z-index':z_index,
            'color':'#EAEAEA',           
	    'font-size':'10px'
        }).appendTo("body").fadeIn(200);
    }
function clear_resource()
{
		wd_ajax({
		url: '/cgi-bin/status_mgr.cgi',
		type: "POST",
		async:false,
		cache:false,
		dataType:"xml",
		data: {cmd: 'cgi_clear_resource'},
		success: function(xml){
		},
		error: function (xhr, ajaxOptions, thrownError){},
		complete: function() {
		}
	});	
}    
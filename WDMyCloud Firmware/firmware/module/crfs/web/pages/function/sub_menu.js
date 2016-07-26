//defaultStep=4; 
//step=defaultStep 
var TopCurrentIndex = 1;
var currentIndex = 1;
var moveItem = 5;
var columnHeight = 50;
function scrollDivDown(id){
	step = columnHeight*moveItem; 
		
	if($(".ButtonArrowTop").hasClass('gray_out')) return;
	
	if (currentIndex > 1){
	
		document.getElementById(id).scrollTop-=step 
		
		currentIndex--;
		//console.log("down=%s",currentIndex)
		if(currentIndex == 1)
		{
			$(".ButtonArrowTop").addClass('gray_out');
			$(".ButtonArrowBottom").removeClass('gray_out');
		}
		else
			$(".ButtonArrowBottom").removeClass('gray_out');
	}

	timerDown=null;
} 

function scrollDivUp(id){ 
	
	if($(".ButtonArrowBottom").hasClass('gray_out')) return;
	var totalItems = $("#"+ id + " li").length;
	totalItems = Math.ceil(totalItems/moveItem);

	//if (currentIndex < totalItems - 6){
	//console.log("up=%s  total=%s",currentIndex ,totalItems)
	if ( currentIndex < totalItems ){
		step = columnHeight*moveItem;
		document.getElementById(id).scrollTop+=step 
		
		currentIndex++;
		
		if( currentIndex >= totalItems)
		{
			$(".ButtonArrowBottom").addClass('gray_out');
			$(".ButtonArrowTop").removeClass('gray_out');
		}
		else
		{
			$(".ButtonArrowTop").removeClass('gray_out');
		}
	}
	
	timerUp=null;
}

function scrollDivRight(id){ 
	
	var totalItems=3;
	if(id=="main_cloud")
	{
		if($(".CButtonArrowRight").hasClass('gray_out')) return;
		step = 178;
		totalItems = $("#"+ id + " li").length;
		totalItems = totalItems-3;
		//console.log("totalItems=[%d]",totalItems)
	}
	else
	{
	if($(".ButtonArrowRight").hasClass('gray_out')) return;
		step = 147;
	
	
	if( MODEL_NAME == "GLCR" || MODEL_NAME =="BAGX")
		totalItems=2;
	}
		
	
//	if(id=="main_cloud")
//	{
//		totalItems = $("#"+ id + " li").length;
//		totalItems = Math.ceil(totalItems/moveItem);
//	}

	if ( TopCurrentIndex <= totalItems ){			
	document.getElementById(id).scrollLeft+=step
		
		TopCurrentIndex++;
		if( TopCurrentIndex >= totalItems)
		{
			if(id=="main_cloud")
			{
				$(".CButtonArrowRight").addClass('gray_out');
				$(".CButtonArrowLeft").removeClass('gray_out');
			}
			else
			{
			$(".ButtonArrowRight").addClass('gray_out');
			$(".ButtonArrowLeft").removeClass('gray_out');
		}
		}
		else
		{
			if(id=="main_cloud")
			{
				$(".CButtonArrowLeft").removeClass('gray_out');
			}
		else
		{
			$(".ButtonArrowLeft").removeClass('gray_out');
		}
	}
} 
} 

function scrollDivLeft(id){ 
	
	if(id=="main_cloud") 
	{
		if($(".CButtonArrowLeft").hasClass('gray_out')) return;
		step = 178;
	}
	else
	{
		if($(".ButtonArrowLeft").hasClass('gray_out')) return;
		step = 147;
	}
		
	if ( TopCurrentIndex > 1){
		
		document.getElementById(id).scrollLeft-=step;
		
		TopCurrentIndex--;
		if(TopCurrentIndex == 1)
		{
			if(id=="main_cloud")
			{
				$(".CButtonArrowLeft").addClass('gray_out');
				$(".CButtonArrowRight").removeClass('gray_out');
			}
			else
			{
			$(".ButtonArrowLeft").addClass('gray_out');
			$(".ButtonArrowRight").removeClass('gray_out');
		}
		}
		else
		{
			if(id=="main_cloud")
			{
				$(".CButtonArrowRight").removeClass('gray_out');
			}
		else
			{
			$(".ButtonArrowRight").removeClass('gray_out');		
	}
		}
	}
	timerLeft=null;
} 

function scrollDivRight_Special(id){ 
	document.getElementById(id).scrollLeft-=300;	
} 
function scrollDivRight_Special2(id){ 
	document.getElementById(id).scrollTop+=300;	
} 
function scrollDivBottom_User(id){ 
	
	document.getElementById(id).scrollTop+=$(".LightningSubMenu li").length *50;	
}
function scrollDivTop_User(id){ 
	document.getElementById(id).scrollTop-=$(".LightningSubMenu li").length *50 +30;
}

function init_subMenu()
{
	var oBrowser = new detectBrowser();
	var LightningSubMenubg = $(".LightningSubMenubg");
	LightningSubMenubg.find("li:visible").each(function(idx) {
		$(this).removeAttr("class").removeAttr("style");
		if (oBrowser.isIE8)
			if ((idx+1) % 2 == 0) $(this).addClass("LightningSubMenubgBg1");
	});

	/*
	LightningSubMenubg.removeClass("LightningSubMenubg2");
	if (LightningSubMenubg.find("li:visible").length % 2 == 1)
		LightningSubMenubg.addClass("LightningSubMenubg2");
	*/
	LightningSubMenubg = null;
}

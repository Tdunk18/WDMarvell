/*
WD AJAX pool control

Create by Ben, 2013/05/10
*/

$.ajax_pool = [];
function wd_ajax(options) {
	var _ajax = $.ajax(options);
	$.ajax_pool.push(_ajax);
	//console.log($.ajax_pool.length);
	return _ajax;
}

$.ajax_pool.abortAll = function() {
	clearInterval(wd_ajax_Interval_num);
	$(this).each(function(id, xhr) {
		xhr.abort();
	});
	$.ajax_pool.length = 0;
	wd_ajax_Interval_num = setInterval('$.ajax_pool.check()', 2000);
};

$.ajax_pool.check = function() {
	var len = $.ajax_pool.length;
	var i = len - 1;
	for (i; i >= 0; i--)
	{
		if ($.ajax_pool[i].readyState == 4)
			$.ajax_pool.splice(i, 1);
	} 	
	len = null;
	i = null;
};

var wd_ajax_Interval_num = setInterval('$.ajax_pool.check()', 2000);

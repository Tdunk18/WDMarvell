
	window.onclick = function (e)
	{
		var t = e.target || e.srcElement;
		var tagname = t.nodeName.toLowerCase();
		var p_tagname = t.parentNode.nodeName.toLowerCase();
		//alert(tagname + " - " + p_tagname);
		if (tagname == "a" || p_tagname == "a")
			top.restart_web_timeout();
	}


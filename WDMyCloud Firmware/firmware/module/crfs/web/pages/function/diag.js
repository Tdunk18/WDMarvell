function initDiag(url, target_id, callback)
{
	if (typeof(target_id) == "undefined")
		target_id = null;

	if (typeof(callback) != "function")
		callback = null;

	wd_ajax({
		url: url,
		dataType: 'html',
		success: function(data) {
			if (target_id)
				$("#" + target_id).append(data);
			else
				$("#append_diag").append(data);

			init_button();
			language();

			if (callback)
				callback();
		}
	});
}

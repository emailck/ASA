//replace referer
function replaceReferer(request) {
	// Find current referer header in request
	var referer, replace_referer;
	var headers = [];
	for(var i = 0; i < request.requestHeaders.length; ++i) {
		var header = request.requestHeaders[i];
		if(header.name.toLowerCase() === "referer") {
			referer = header;
			headers.push(referer);
		} else if (header.name.toLowerCase() === "replace_referer") {
			replace_referer = header;
		} else {
			headers.push(header);
		}
	}
	if (headers.length == 0 || !referer || !replace_referer) {
		return;
	}
	referer.value = replace_referer.value;
	return {requestHeaders: headers};
}


/*****************
 * Orchestration *
 *****************/

/**
 * Start or stop the HTTP header and JavaScript modifications
 */
function start() {
	chrome.webRequest.onBeforeSendHeaders.addListener(
		replaceReferer,
		{urls: ["<all_urls>"]},
		["blocking", "requestHeaders"]
	);
}

start();
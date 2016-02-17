//Define navigator.CookiesOK, this allows websites to recognize CookiesOK and assume consent
//if we can, we should probably do this differently..
(function(){
	var script = document.createElement('script');
	script.innerHTML = 'navigator.CookiesOK = "I explicitly accept all cookies";';
	document.documentElement.appendChild(script);
	setTimeout(function(){
		document.documentElement.removeChild(script);
	}, 15);
})();

self.port.on("getDomainOrders", function(result){
	if(!result.success)
		return;

	var orders = result.orders;
	if(orders){
		if(orders.action)
			orders = [orders];

		for(var i in orders)
			if(orders[i].action == 'hide' || orders[i].action == 'remove'){
				var ss = document.createElement('style');
				ss.className = "CookiesOK-hide-style";
				ss.innerHTML = orders[i].target + '{display:none !important;}';
				document.documentElement.appendChild(ss);
				hideStyles.push(ss);
			}
	}
});
self.port.emit("getDomainOrders", location.hostname);
(function(){
	var version = self.version;

	var retryTimeout = 500;
	var attemptsLimit = 10;

	function performOrder(orders, attempt){
		if(!attempt)
			attempt = 1;

		var frames = orders.target.split("->");
		var target = document.querySelector(frames[0]);

		for(var i = 1; target && i < frames.length; ++i)
			try{
				target = target.contentWindow.document.querySelector(frames[i])
			}catch(ex){
				target = null;
			}

		if(!target){
			if(attempt < attemptsLimit)
				setTimeout(performOrder, retryTimeout, orders, attempt + 1);
			return;
		}

		switch(orders.action){
			case 'hide':
				target.style.display = 'none';
				break;
			case 'remove':
				target.parentNode.removeChild(target);
				break;
			case 'click':
			case 'submit':
			case 'focus':
			case 'blur':
			case 'select':
				target[orders.action]();
				break;
			case 'removeClasses':
				var classes = target.className.trim().split(/\s+/);
				var index;
				for(var a in orders.args)
					if(-1 !== (index = classes.indexOf(orders.args[a])))
						classes.splice(index, 1);
				target.className = classes.join(" ");
				break;
			case 'addClasses':
				for(var b in orders.args)
					target.className += " " + orders.args[b];
				break;
		}
	}

	//Always Attempt to execute the CookiesOK method, remove from source after execution
	//this allows websites to recognize CookiesOK and assume consent
	var script = document.createElement('script');
	script.innerHTML = 'if(window.CookiesOK) window.CookiesOK("' + version + '");';
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(script);
	setTimeout(function(){
		head.removeChild(script);
	}, 15);

	//retrieve database from background
	self.port.on("getDomainOrders", function(result){
		if(!result.success)
			return;

		var orders = result.orders;

		if(orders){
			if(orders.action)
				orders = [orders];

			for(var i in orders)
				performOrder(orders[i]);
		}else{
			var a = document.getElementsByClassName('CookiesOK');
			a.length && a[0].click();
		}

		var hideStyles = document.getElementsByClassName('CookiesOK-hide-style');
		for(var i=0; i<hideStyles.length; ++i)
			hideStyles[i].parentNode.removeChild(hideStyles[i]);
	});
	self.port.emit("getDomainOrders", location.hostname);
})();
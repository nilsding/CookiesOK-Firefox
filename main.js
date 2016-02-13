var self = require("sdk/self");
var data = self.data;
var pageMod = require("sdk/page-mod");
var ss = require("sdk/simple-storage");
var sp = require("sdk/simple-prefs");
var request = require("sdk/request").Request;
var _ = require("sdk/l10n").get;

var database = {};

var reportContextMenuItem;

function resetContextMenuItem(){
	if(reportContextMenuItem)
		reportContextMenuItem.destroy();

	if(sp.prefs.contextmenu){
		var contextMenu = require("sdk/context-menu");
		reportContextMenuItem = contextMenu.Item({
			label: _("context_menu_report_text"),
			contentScript: 'self.on("click", function () { self.postMessage(location.href); });',
			onMessage: function(url){
				url = url.split(":").join("_-_"); //part 1/2 of ugly workaround, if the url contains a ":" (encoded %5A) firefox will give an error upon loading it. Unsure why, bug?
				require("sdk/tabs").open(data.url("pages/report.html?url=" + encodeURIComponent(url)));
			}
		});
	}
}

function isTooOld(date) {
	date = new Date(date);
	var now = new Date();
	var timePassed = now - date;
	var msInDay = 24 * 3600 * 1000;
	return timePassed > msInDay;
}

function downloadDatabase(callback) {
	request({
		url: "https://cookiesok.com/5/database",
		onComplete: function (response) {
			var result = JSON.parse(response.text);
			if(result.success) {
				database.websites = result.data;
				database.updated = new Date();
				callback && callback();
			}
		}
	}).get();
}

function databaseReady(){
	pageMod.PageMod({
		include: "*",
		contentScriptFile: [
			data.url("scripts/cookiesok.js")
		],
		contentScriptOptions: {
			version: self.version
		},
		onAttach: function(worker){
			worker.port.on('getDomainOrders', function(hostname){
				if(hostname.indexOf('www.') === 0)
					hostname = hostname.substr(4);

				var orders = database.websites[hostname];
				if(!orders && hostname.match('.')){
					var tmpHostname = hostname.split(".");
					tmpHostname[0] = '*';
					tmpHostname = tmpHostname.join('.');
					orders = database.websites[tmpHostname];
				}

				if(orders)
					worker.port.emit('getDomainOrders', {success: true, orders: orders});
				else
					worker.port.emit('getDomainOrders', {success: false});
			});
		}
	});
}

pageMod.PageMod({
	include: "*",
	contentScriptFile: data.url("scripts/pre.js"),
	contentScriptWhen: "start"
});

var {Cc, Ci} = require("chrome");
var httpRequestObserver =
{
	observe: function(subject, topic, data){
		if(topic == "http-on-modify-request"){
			var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
			httpChannel.setRequestHeader("X-CookiesOK", "I explicitly accept all cookies", false);
		}
	},
	get observerService(){
		return Cc["@mozilla.org/observer-service;1"]
			.getService(Ci.nsIObserverService);
	},
	register: function(){
		this.observerService.addObserver(this, "http-on-modify-request", false);
	},
	unregister: function(){
		this.observerService.removeObserver(this, "http-on-modify-request");
	}
};
httpRequestObserver.register();

sp.on("", function(){
	resetContextMenuItem();
});
resetContextMenuItem();

if (!ss.storage.database || isTooOld(ss.storage.database.updated))
	downloadDatabase(databaseReady);
else{
	database = ss.storage.database;
	databaseReady();
}
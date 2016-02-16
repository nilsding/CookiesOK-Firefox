var paused;
self.port.on("getPaused", function(p){
	paused = p;
	if(paused) pause();
	else resume();
});
self.port.emit("getPaused", true);

var btnPause = document.getElementById('btnPause');
var btnResume = document.getElementById('btnResume');
var btnReport = document.getElementById('btnReport');
//var btnSettings = document.getElementById('btnSettings');

function pause(){
	btnPause.style.display = 'none';
	btnResume.style.display = 'block';
}

function resume(){
	btnResume.style.display = 'none';
	btnPause.style.display = 'block';
}

btnPause.addEventListener('click', function(){
	pause();
	self.port.emit("setPause", true);
});

btnResume.addEventListener('click', function(){
	resume();
	self.port.emit("setPause", false);
});

btnReport.addEventListener('click', function(){
	self.port.emit("reportWebsite");
});

//btnSettings.addEventListener('click', function(){
//	chrome.tabs.create({'url': chrome.extension.getURL('pages/options/index.html')});
//});
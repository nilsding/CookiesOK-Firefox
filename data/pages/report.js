if(location.href.indexOf('?url=') !== -1){
	var url = decodeURIComponent(location.href.split("?url=")[1]);
	url = url.split("_-_").join(":"); //part 2/2 of ugly workaround
	document.getElementById("url").value = url;
}

document.getElementById("anotherUrl").addEventListener('click', function(){
	document.getElementById('thankYou').style.display = 'none';
	document.getElementById('formPanel').style.display = 'block';
});

document.getElementById("submitReport").addEventListener('click', function(){
	document.getElementById("submitReport").setAttribute('disabled', 'disabled');

	var notes = document.getElementById('additionalNotes');
	var url = document.getElementById('url');
	var email = document.getElementById('email');

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == 4){
			document.getElementById("submitReport").removeAttribute('disabled');
			document.getElementById('thankYou').style.display = 'block';
			document.getElementById('formPanel').style.display = 'none';
		}
	}
	xmlhttp.open("POST", "http://cookiesok.com/report.php", true);
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xmlhttp.send("url="+escape(url.value)+"&notes="+escape(notes.value)+"&email="+escape(email.value));
	notes.value = '';
	url.value = '';
});
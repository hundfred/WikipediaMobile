function getSettings() {
	$('#settingsList').html('');
	getLanguages(function() {
		PhoneGap.exec(
			function(result){
				markup = '<div class="item"><label><msg key="settings-font-size-label"></msg></label><p><msg key="settings-font-size-desc"></msg><select id="fontSizeSelector">' + 
							'<option value="smaller"><msg key="settings-font-size-smaller">Smaller</msg></option>' + 
							'<option value="normal"><msg key="settings-font-size-normal">Normal</msg></option>' + 
							'<option value="larger"><msg key="settings-font-size-larger">Larger</msg></option>' + 
						'</select></div>' + 
						'<div class="item"><label><msg key="settings-app-version-label"></msg></label><p>' + result.version + '</p></div>';
				$('#settingsList').append(markup).localize();
				var settingsDB = new Lawnchair({name:'settingsDB'}, function() {
					this.get('fontSize', function(fontSize) {
						fontSize = fontSize || {value: 'normal'};
						var size = fontSize.value;
						console.log('fontSize is set to ' + size);
						$("#fontSizeSelector").val(size);
					});
				});
				$("#fontSizeSelector").change(function() {
					var selected = $(this).val();
					console.log('selected  ' + selected);
					var settingsDB = new Lawnchair({name:'settingsDB'}, function() {
						this.save({key: 'fontSize', value: selected});
						adjustFontSize(selected);
					});
				});
			},
			function(error){ $('#settingsList').append(error); },
			'ApplicationVersion', 'getVersion', []
		); 
	});
}

function showSettings() {
	hideOverlayDivs();
	hideContent();
	$('#settings').localize().show();
	setActiveState();                                   
}

function getLanguages(callback) {
  
	//$('#settings').addClass('inProgress');  

	console.log("get languages");          

	var requestUrl = "http://en.wikipedia.org/w/api.php?action=sitematrix&format=json";

	$.ajax({
		type:'Get', 
		url:requestUrl, 
		success:function(data) {
			displayLanguages(data);
			callback();
			showSettings();
		}
	});

}

function displayLanguages(results) {

	var numberOfSites = -1;
	var markup = '';
	markup += "<form class='item'><label><msg key='settings-language-label'></msg></label><p id='settings-language-desc'></p><select id='localeSelector' onchange='javascript:onLocaleChanged(this.options[this.selectedIndex].value);'>";

	if (results != null) {
		results = JSON.parse(results);
		if (results.sitematrix) {       
			numberOfSites = parseInt(results.sitematrix.count);
			for (var i=0;i<numberOfSites;i++) {
				var locale = results.sitematrix[i.toString()];
				if (locale) {
					var len = parseInt(JSON.stringify(locale.site.length));
					for (var j=0;j<len;j++) {
						if (locale.site[j].code == "wiki") {
							if (locale.code == currentLocale.languageCode) {
								markup += "<option value='" + locale.code + "' selected='selected'>"  + locale.name + "</option>";
							} else {
								markup += "<option value='" + locale.code + "'>"  + locale.name + "</option>";
							}
							break;
						}
					} 
				}             
			}
		}         
	}
	
	markup += "</select></form>";  

	$('#settingsList').append(markup).localize();
	$('#settings-language-desc').text(mw.msg('settings-language-desc', mw.msg('sitename')));

	//hideProgressLoader();
	//$('#settings').removeClass('inProgress');
}

function onLocaleChanged(selectedValue) {

	currentLocale.languageCode = selectedValue;
	currentLocale.url = "http://" + selectedValue + ".m.wikipedia.org";

	// save / update currentLocale in LocalStorage
	var settingsDB = new Lawnchair({name:"settingsDB"}, function() {
		this.save({key: "locale", value: currentLocale});
	});
}

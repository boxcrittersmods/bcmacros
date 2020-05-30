// ==UserScript==
// @name         BCMacro API
// @namespace    http://discord.gg/G3PTYPy
// @version      0.3.16.49
// @description  Adds Macro API
// @author       TumbleGamer
// @resource fontAwesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css
// @require      https://code.jquery.com/jquery-3.5.1.slim.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.4.0/umd/popper.min.js
// @require      https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js
// @match        https://play.boxcritters.com/*
// @match        http://play.boxcritters.com/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        unsafeWindow
// @updateURL    https://github.com/boxcritters/BCMacroAPI/raw/master/bcmacro-api.user.js
// ==/UserScript==

window = unsafeWindow || window;
var chatBar = document.getElementsByClassName("input-group")[0];

{
	var fontAwesomeText = GM_getResourceText ("fontAwesome");
	GM_addStyle(fontAwesomeText);
}

//Add Dialogue
{
	let dialogueHTML = `<div id="BCM_modal" class="modal fade" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header"><button type="button" class="close" data-dismiss="BCM_model" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			  </button></div>
                <div class="modal-body"></div>
                <div class="modal-footer"></div>
            </div>
        </div>
	</div>`;
	document.body.insertAdjacentHTML("afterbegin", dialogueHTML);
}


function BCMacro(name, cb, mod) {
	if (typeof cb != "function") return;
	this.name = name;
	this.cb = cb;
	this.button = undefined;
	this.key = undefined;
	if(mod){
		BCMacro.mods.push(this);
	} else {
		BCMacro.macros.push(this);
	}
}
window.BCMacro = BCMacro;
BCMacro.sendMessage = (t)=>{world.message(t)};

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
		if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

function save() {
	GM_setValue("BCMacros_mods", BCMacro.mods.map(m=>m.dataify()));
	if(!BCMacro.macros) {
		GM_setValue("BCMacros_macros", []);
		return;
	}
	GM_setValue("BCMacros_macros", BCMacro.macros.map(m=>m.dataify()));
	console.log("[BCMacros] Macros Saved.");
}
BCMacro.save = save;
function reset() {
	BCMacro.macros = undefined;
	RefreshSettings();
}
BCMacro.reset = reset;


function createButton(name, cb, color = "info", place = "afterend", text) {
	var button = {
		cb:cb,
		color:color,
		place:place,
		text:text,
		html: undefined,
	};
	var btnHTML = `<span class="input-group-btn"><button id="bcmacros${camelize(
		name
	)}" class="btn btn-${color}">${text || name}</button></span>`;
	chatBar.insertAdjacentHTML(place, btnHTML);
	$(`#bcmacros${camelize(name)}`).click(cb);
	button.html = $(`#bcmacros${camelize(name)}`);
	return button;
}
BCMacro.createButton = createButton;
function createDialogue(header, body, footer) {
	$("#BCM_modal").modal();
	$("#BCM_modal").modal("show");
	if (header) $("#BCM_modal .modal-header").html(header);
	if (body) $("#BCM_modal .modal-body").html(body);
	if (footer) $("#BCM_modal .modal-footer").html(footer);
	return $("#BCM_model");
}
BCMacro.createDialogue = createDialogue;

var binding = undefined;
function createSetting(id, macro,mod) {
	var settingHTML = $(`<div class="list-group-item"><div class="input-group" id="bcmSetting${camelize(
		id
	)}">
	<input type="text" class="form-control" value='${macro.name}' disabled>
	<div class="input-group-append">
	  <button class="btn ${
		macro.buttonShowing()
			? "btn-success"
			: "btn-outline-secondary"
		}" type="button" id="bcmSetting${id}-button">Toggle Button</button>
	  <button class="btn ${
		macro.key ? "btn-success" : "btn-outline-secondary"
		}" type="button" id="bcmSetting${id}-key">${
		binding == macro ? "binding..." : macro.key || "Bind Key"
		}</button>
	</div>
  </div></div>`);
	$("#bcm_settingList").append(settingHTML);
	var btnButton = $(`#bcmSetting${id}-button`);
	var btnKey = $(`#bcmSetting${id}-key`);
	btnButton.click(_=> {
		btnButton.toggleClass("btn-success");
		btnButton.toggleClass("btn-outline-secondary");
		macro.toggleButton();
	});
	btnKey.click(_=> {
		if (binding == macro) {
			macro.key = undefined;
			binding = undefined;
			btnKey.removeClass("btn-danger");
			btnKey.addClass("btn-outline-secondary");
			btnKey.text("Bind key");
			return;
		}
		binding = macro;
		console.log("[BCM] Binding " + macro.name + "...");
		btnKey.text("Binding...");
		btnKey.removeClass("btn-outline-secondary");
		btnKey.addClass("btn-danger");
	});
}

function RefreshSettings() {
	$("#bcm_settingList").empty();
	(BCMacro.mods||[]).forEach((a) => {
		createSetting(camelize(a.name), a,true);
	});
	(BCMacro.macros||[]).forEach((a) => {
		createSetting(camelize(a.name), a);
	});
}

function DisplaySettings() {
	//Open Window with dropdown and stuff
	var settingHTML = `
	<h2>Macros</h2>
	<div class="input-group" id="bcmSettingCreate">
		<input type="text" id="bcmSettingName" class="form-control" placeholder="New Macro...">
		<div class="input-group-append">
			<input type="text" id="bcmSettingContent" class="form-control" placeholder="Action/Text">
		  <button class="btn btn-outline-secondary" type="button" id="bcmSettingJS">JS</button>
		  <button class="btn btn-outline-secondary" type="button" id="bcmSettingChat">Chat</button>
		</div>
	  </div>
	<div id="bcm_settingList" class="list-group">
</div>
`;
	createDialogue("Macro Settings", settingHTML, '<button class="btn btn-danger" type="button" id="bcmSettingReset">Reset</button><button class="btn btn-primary" type="button" id="bcmSettingSave">Save</button>');
	var newName = $('#bcmSettingName');
	var newContent = $('#bcmSettingContent');
	$('#bcmSettingJS').click(_=> {
		BCMacro.macros = BCMacro.macros||[];
		var cb = new Function(newContent.val());
		new BCMacro(newName.val(),cb);
		RefreshSettings();
	})
	$('#bcmSettingChat').click(_=> {
		BCMacro.macros = BCMacro.macros||[];
		var cb = new Function("BCMacro.sendMessage("+JSON.stringify(newContent.val())+")");
		new BCMacro(newName.val(),cb);
		RefreshSettings();
	})
	$('#bcmSettingSave').click(_=> {
		BCMacro.save();
	})
	$('#bcmSettingReset').click(_=> {
		BCMacro.reset();
	})
	RefreshSettings();
}

BCMacro.DisplaySettings = DisplaySettings;

BCMacro.prototype.toggleButton = function (color, place, text) {
	if (this.button && this.button.html) {
		this.button.html.toggle();
	} else {
		this.button = createButton(
			this.name,
			this.cb,
			color,
			place,
			text
		);
	}
};
BCMacro.prototype.buttonCreated = function(){return this.button&&this.button.html};
BCMacro.prototype.buttonShowing = function(){return this.buttonCreated()&&this.button.html.is(":visible")};
BCMacro.prototype.bindKey = function (e) {
	this.key = e.which;
};
BCMacro.prototype.dataify = function () {
	var macro = Object.assign({},this);
	macro.cb = macro.cb.toString();
	macro.button = Object.assign({},this.button);
	if(this.buttonCreated()) {
		macro.button.display = this.buttonShowing();
		macro.button.html = undefined;
	}
	return macro;
}

var modSettings = GM_getValue("BCMacros_mods",[]);
BCMacro.macros = GM_getValue("BCMacros_macros", []);
BCMacro.mods = [];
console.log("[BCMacros] Data Loaded.");
if (BCMacro.macros) {
	BCMacro.macros = BCMacro.macros.map(m=>{
		var macro = new BCMacro(m.name,eval("("+m.cb+")"));
		macro.key = m.key;
		if(m.button ) {
			macro.toggleButton(m.button.color,m.button.place,m.button.text);
			if(!m.button.display) macro.toggleButton();
		}
		return macro;
	});
}

BCMacro.prototype.setupMod = function() {
	modSettings.forEach(m=>{
		if(m.name==this.name) {
			this.key = m.key;
			if(this.buttonCreated()) {
				if(this.buttonShowing()!=m.button.display) this.toggleButton();
			} else if(m.button) {
				this.toggleButton(m.button.color,m.button.place,m.button.text);
				if(!m.button.display) this.toggleButton();
			}
		}
	})

}

{
	var settingsMacro = new BCMacro("settings", _=>{
		BCMacro.DisplaySettings()
	},true);
	settingsMacro.toggleButton(
		"primary",
		"beforeend",
		'<i class="fas fa-cog"></i>'
	);
	settingsMacro.setupMod();
	if(!settingsMacro.bindKey&&!settingsMacro.buttonShowing()) {
		DisplaySettings();
	}
}
var macros = BCMacro.macros;
var mods = BCMacro.mods;


// Runs on page load

window.addEventListener(
	"load",
	async function () {
		

	$(document).keydown(function (e) {
		if (binding) {
			binding.bindKey(e);
			binding = undefined;
			RefreshSettings();
			return;
		}
		mods.forEach((a) => {
			if (a.key == e.which) {
				console.log("[BCMacros] Triggering", a.name, "by key...");
				a.cb();
			}
		});
		macros.forEach((a) => {
			if (a.key == e.which) {
				console.log("[BCMacros] Triggering", a.name, "by key...");
				a.cb();
			}
		});
	});
		
	},
	false
);

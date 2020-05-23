// ==UserScript==
// @name         BCMacro API
// @namespace    http://discord.gg/G3PTYPy
// @version      0.2.2.29
// @description  Adds Macro API
// @author       TumbleGamer
// @match        https://play.boxcritters.com/*
// @match        http://play.boxcritters.com/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// ==/UserScript==

window = unsafeWindow || window;
var chatBar = document.getElementsByClassName("input-group")[0];


//Add FontAwsesome
{
	let head = document.head;
	let link = document.createElement("link");

	link.type = "text/css";
	link.rel = "stylesheet";
	link.href =
		"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css";

	head.appendChild(link);
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


function BCMacro(name, cb) {
	if (typeof cb != "function") return;
	this.name = name;
	this.cb = cb;
	this.button = undefined;
	this.key = undefined;
	BCMacro.macros.push(this);
}
window.BCMacro = BCMacro;

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
		if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

function save() {
	if(!BCMacro.macros) {
		if(BCMacro.INITIAL_SETUP) {
			GM_deleteValue("BCMacros_macros");
			GM_deleteValue("BCMacros_initial");
		} else {
			GM_setValue("BCMacros_macros", []);
		}
		return;
	}
	GM_setValue("BCMacros_macros", BCMacro.macros.map(m=>m.dataify()));
	console.log("[BCMacros] Macros Saved.");
}
BCMacro.save = save;
function reset() {
	BCMacro.INITIAL_SETUP = true;
	BCMacro.macros = undefined;
	RefreshSettings();
}
BCMacro.reset = reset;


function createButton(name, cb, color = "info", place = "afterend", text) {
	var button = {
		cb,
		color,
		place,
		text,
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
function createSetting(id, macro) {
	var settingHTML = $(`<div class="list-group-item"><div class="input-group" id="bcmSetting${camelize(
		id
	)}">
	<input type="text" class="form-control" value='${macro.name}' disabled>
	<div class="input-group-append">
	  <button class="btn ${
		macro.button && macro.button.html && macro.button.html.is(":visible")
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
	btnButton.click(() => {
		btnButton.toggleClass("btn-success");
		btnButton.toggleClass("btn-outline-secondary");
		macro.toggleButton();
	});
	btnKey.click(() => {
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
	(BCMacro.macros||[]).forEach((a) => {
		createSetting(camelize(a.name), a);
	});
}

function DisplaySettings() {
	//Open Window with dropdown and stuff
	var settingHTML = `
	<h2>Macros</h2>
	<div id="bcm_settingList" class="list-group">
</div>
<h2>Create Macro</h2>
<div class="input-group" id="bcmSettingCreate">
	<input type="text" id="bcmSettingName" class="form-control" placeholder="Name">
	<div class="input-group-append">
		<input type="text" id="bcmSettingContent" class="form-control" placeholder="Action/Text">
	  <button class="btn btn-outline-secondary" type="button" id="bcmSettingJS">JS</button>
	  <button class="btn btn-outline-secondary" type="button" id="bcmSettingChat">Chat</button>
	</div>
  </div>
`;
	createDialogue("Macro Settings", settingHTML, '<button class="btn btn-danger" type="button" id="bcmSettingReset">Reset</button><button class="btn btn-primary" type="button" id="bcmSettingSave">Save</button>');
	var newName = $('#bcmSettingName');
	var newContent = $('#bcmSettingContent');
	$('#bcmSettingJS').click(() => {
		BCMacro.macros = BCMacro.macros||[];
		var cb = new Function(newContent.val());
		new BCMacro(newName.val(),cb);
		RefreshSettings();
	})
	$('#bcmSettingChat').click(() => {
		BCMacro.macros = BCMacro.macros||[];
		var cb = new Function("world.sendMessage("+JSON.stringify(newContent.val())+")");
		new BCMacro(newName.val(),cb);
		RefreshSettings();
	})
	$('#bcmSettingSave').click(() => {
		BCMacro.save();
	})
	$('#bcmSettingReset').click(() => {
		BCMacro.reset();
	})
	RefreshSettings();
}

BCMacro.DisplaySettings = DisplaySettings;

BCMacro.prototype.toggleButton = function (color, place, text) {
	if (this.button) {
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
BCMacro.prototype.bindKey = function (e) {
	this.key = e.which;
};
BCMacro.prototype.dataify = function () {
	var macro = Object.assign({},this);
	macro.cb = macro.cb.toString();
	if(macro.button && macro.button.html && !macro.button.html.is(":visible")) {
		macro.button = undefined;
	}
	return macro;
}


BCMacro.INITIAL_SETUP = GM_getValue("BCMacros_initial", true);
BCMacro.macros = GM_getValue("BCMacros_macros", undefined);
console.log("[BCMacros] Data Loaded.");
if(BCMacro.macros && BCMacro.INITIAL_SETUP) BCMacro.INITIAL_SETUP = false;
if (BCMacro.macros) {
	BCMacro.macros = BCMacro.macros.map(m=>{
		var macro = new BCMacro(m.name,eval("("+m.cb+")"));
		macro.key = m.key;
		if(m.button) macro.toggleButton(m.button.color,m.button.place,m.button.text);
		return macro;
	});
} else {
	console.log("[BCMacros] Initiating First time setup...");
	BCMacro.INITIAL_SETUP = true;
	BCMacro.macros = [];
	var settingsMacro = new BCMacro("settings", ()=>{
		BCMacro.DisplaySettings()
	});
	settingsMacro.toggleButton(
		"primary",
		"beforeend",
		'<i class="fas fa-cog"></i>'
	);
	BCMacro.save();
}
GM_setValue("BCMacros_initial",BCMacro.INITIAL_SETUP);

var macros = BCMacro.macros;





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

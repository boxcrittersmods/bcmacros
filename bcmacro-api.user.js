// ==UserScript==
// @name         BCMacro API
// @namespace    http://discord.gg/G3PTYPy
// @version      0.5.5.67
// @description  Adds Buttons and Keybinds to Box Critters
// @author       TumbleGamer
// @resource fontAwesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css
// @require      https://github.com/tumble1999/bootstrap.native/raw/master/dist/boostrap-native-model.umd.min.js
// @require      https://github.com/SArpnt/joinFunction/raw/master/script.js
// @require      https://github.com/SArpnt/EventHandler/raw/master/script.js
// @require      https://github.com/SArpnt/cardboard/raw/master/script.user.js
// @match        https://boxcritters.com/play/
// @match        https://boxcritters.com/play/?*
// @match        https://boxcritters.com/play/#*
// @match        https://boxcritters.com/play/index.html
// @match        https://boxcritters.com/play/index.html?*
// @match        https://boxcritters.com/play/index.html#*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @updateURL    https://github.com/boxcritters/BCMacroAPI/raw/master/bcmacro-api.user.js
// @run-at       document-start
// ==/UserScript==
console.log("[BCMacros] by TumbleGamer")
cardboard.register("BCMACROS")
/**
 * bcmacro-api.user.js
 * 
 * Copyright 2020 TumbleGamer <tumblegamer@gmail.com>
 * Copyright 2020 The Box Critters Modding Community
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */
/**
 * @file BCMacro API Userscript
 * @author TumbleGamer <tumblegamer@gmail.com
 * @copyright 2020 TumbleGamer <tumblegamer@gmail.com>
 * @copyright 2020 The Box Critters Modding Community
 * @license Apatche-2.0
 */
/**
 * @external KeyboardEvent
 * @see {@link hhttps://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent}
 */
var DOC_LOADED = false;
window.addEventListener("load", () => {
	DOC_LOADED = true;
	console.log("[BCM] Document Loaded");
})
var BCM_model;
async function runIfDocLoaded(func) {
	if (!DOC_LOADED) {
		return new Promise(async (resolve, reject) => {
			window.addEventListener("load", async () => {
				resolve(await func());
			})
		})
	}
	return await func();
}
runIfDocLoaded(() => {

	//'use strict';
	//Initialisation
	var fontAwesomeText = GM_getResourceText("fontAwesome");
	GM_addStyle(fontAwesomeText);

	//Setup Dialog
	let dialogueHTML = `<div id="BCM_modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
            </div>
        </div>
	</div>`;
	document.body.insertAdjacentHTML("afterbegin", dialogueHTML);

	BCM_model = new BSN.Modal("#BCM_modal")
	if (BCM_model) console.log("[BCM] Created Model");
})


window = unsafeWindow || window;
var modSettings = GM_getValue("BCMacros_mods", []);
var binding = undefined;
var data = GM_getValue("macros") || [];

if (GM_getValue("BCMacros_mods")) GM_setValue("BCMacros_mods", undefined);
if (GM_getValue("BCMacros_macros")) {
	Object.assign(data, GM_getValue("BCMacros_macros"));
}
/**
 * {string,MacroPack}
 */
var packs = {};
/**
 * Array.<MacroPack>
 */
var macros = []

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
		if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

function createDialogue(
	header = `<button type="button" class="close" data-dismiss="BCM_model" aria-label="Close"><span aria-hidden="true">&times;</span></button>`,
	body,
	footer
) {
	/*$("#BCM_modal").modal();
	$("#BCM_modal").modal("show");*/
	var content = `
	<div class="modal-header">${header}</div>
	<div class="modal-body">${body}</div>
	<div class="modal-footer">${footer}</div>`

	BCM_model.setContent(content);
	BCM_model.show();
}


/**
 * This function exists in case the send message function changes again
 * @param {String} t Message to be sent
 */
function sendMessage(t) {
	world.message(t)
}



/**
 * Save the preferences
 */
function save() {
	GM_setValue("macros", macros)
	console.log("[BCM] Macros Saved.");
	RefreshSettings("Settings have been saved");
}

/**
 * Resets all of the preferences **without** saving.
 */
function reset() {
	data = [];
	macros = [];
	packs.custom.macros = [];
	for (let packId in packs) {
		packs[packId].recreateMacros();
	}
	RefreshSettings("Settings have been reset. (this will not take perminant effect untill you save)");
}

function createSetting(macro) {
	var settingHTML = `<input type="text" class="form-control" value='${macro.name}' disabled>
							<button class="btn ${/*macro.button ? "btn-success" :*/ "btn-outline-secondary"}" type="button" id="bcmSetting_${macro.id}-button" data-title="Google" data-content="This system is changing to use a new API" data-toggle="popover" disabled>
							Toggle Button
							</button>
							<button class="btn ${macro.key ? "btn-success" : "btn-outline-secondary"}" type="button" id="bcmSetting_${macro.id}-key">
							${binding == macro ? "Binding.." : macro.key || "Bind Key"}
							</button>`
	var settingItem = document.createElement("div");
	settingItem.id = "bcmSetting_" + macro.id;
	settingItem.classList.add("input-group")
	settingItem.innerHTML = settingHTML;

	var btnButton = settingItem.querySelector(`#bcmSetting_${macro.id}-button`);
	var btnKey = settingItem.querySelector(`#bcmSetting_${macro.id}-key`);
	btnKey.style.width = "90px";
	btnButton.addEventListener("click", function (e) {
		btnButton.classList.toggle("btn-success");
		btnButton.classList.toggle("btn-outline-secondary");
		macro.toggleButton();
		RefreshSettings("There are unsaved changes")
	}, true);
	btnKey.addEventListener("click", (e) => {
		if (binding == macro) {
			if (macro.key) {
				RefreshSettings("There are unsaved changes")
			}
			macro.key = undefined;
			binding = undefined;
			btnKey.classList.remove("btn-success");
			btnKey.classList.remove("btn-danger");
			btnKey.classList.add("btn-outline-secondary");
			btnKey.innerText = "Bind key";
			console.log("[BCM] Binding Canceled for" + macro.name);
			return;
		}
		binding = macro;
		console.log("[BCM] Binding " + macro.name + "...");
		btnKey.innerText = "Binding..";
		btnKey.classList.remove("btn-outline-secondary");
		btnKey.classList.add("btn-danger");
	}, true);

	return settingItem;
}

function RefreshSettings(notice) {
	var settingGroup = document.getElementById("bcm_settingList")
	settingGroup.innerHTML = "";

	if (notice) {
		var box = document.createElement("div")
		box.classList.add("alert", "alert-warning")
		box.setAttribute("role", "alert")
		box.innerText = notice;
		settingGroup.appendChild(box)
	}

	for (let packId in packs) {
		var pack = packs[packId];
		var list = document.createElement("div");
		list.classList.add("card", "card-body");
		var heading = document.createElement("h5");
		heading.classList.add("card-title")
		heading.innerText = pack.name;
		heading.style.margin = 0;
		list.appendChild(heading);
		if (pack.macros.length == 0) {
			var heading = document.createElement("p");
			heading.innerText = "There are no macros in this pack";
			if (pack.id == "custom") heading.innerText = "You have created no custom macros";
			list.appendChild(heading);

		}

		for (let packMacros of pack.macros) {
			var macro = macros[packMacros.id];
			var setting = createSetting(macro)
			list.appendChild(setting);
		}
		settingGroup.appendChild(list);
	}
}


function isSettingsOpen() {
	var settings = document.getElementById("bcm_settingList");
	if(!settings) return;
	return  window.getComputedStyle(settings).display !== "none";
}

/**
 * Brings up the settings window
 */
function displaySettings(notice) {
	runIfDocLoaded(() => {
		//Open Window with dropdown and stuff
		var settingHTML = `
		<h2>Macros</h2>
		<div id="bcmSettingCreate" class="card card-body">
			<div class="input-group">
				<input type="text" id="bcmSettingName" class="form-control" placeholder="New Macro...">
				<button class="btn btn-outline-secondary" type="button" id="bcmSettingJS">JS</button>
				<button class="btn btn-outline-secondary" type="button" id="bcmSettingChat">Chat</button>
			</div>
			<textarea type="text" id="bcmSettingContent" class="form-control" placeholder="Action/Text"></textarea>
		</div>
		<div id="bcm_settingList" class="card-group-vertical"></div>
	`;
		createDialogue("Macro Settings", settingHTML, '<button class="btn btn-danger" type="button" id="bcmSettingReset">Reset</button><button class="btn btn-primary" type="button" id="bcmSettingSave">Save</button>');
		var newNameField = document.getElementById("bcmSettingName")
		var newContentField = document.getElementById("bcmSettingContent")
		var settingJSField = document.getElementById("bcmSettingJS")
		var settingChatField = document.getElementById("bcmSettingChat")
		var settingSave = document.getElementById("bcmSettingSave");
		var settingReset = document.getElementById("bcmSettingReset");


		settingJSField.addEventListener("click", _ => {
			var name = newNameField.value;
			var action = newContentField.value;
			customMacros.createMacro({ name, action })
			RefreshSettings("There are unsaved changes");
		})
		settingChatField.addEventListener("click", _ => {
			var name = newNameField.value;
			var action = "BCMacros.sendMessage(" + JSON.stringify(newContentField.value) + ")";
			customMacros.createMacro({ name, action })
			RefreshSettings("There are unsaved changes");
		})
		settingSave.addEventListener("click", _ => {
			save();
		})
		settingReset.addEventListener("click", _ => {
			reset();
		})
		RefreshSettings(notice);
	})
}


/**
 * @interface btnAPIButton
 * @property {String} text
 * @property {String} type
 * @property {String} size
 * 
 */


class Macro {
	constructor({ name, action, key, button }) {
		this.id = camelize(name);
		this.name = name;

		if (typeof (action) == "string") action = Function(action)
		this.action = action;
		this.key = key;
		this.button = button;
	}

	getPack() {
		if (!this.pack) return;
		return packs[this.pack];
	}

	bindKey(key) {
		this.key = key;
		return this;
	}

	enableButton(button) {
		this.button = button;
		return this;
	}
	disableButton() {
		//remove button from getPack().buttonGroup

		delete this.button;
		return this;
	}
	inaccessible() {
		return !this.key && !this.button;
	}

	toggleButton(options) {
		this.button
			? this.disableButton()
			: this.enableButton(options)
	}
}

/**
 * MacroPack
 */
class MacroPack {
	constructor({ name }) {
		this.id = camelize(name);
		this.name = name;
		this.btnGroup = null;
		this.macros = [];
		this.buttons = [];
	}

	/**
	 * 
	 * @param {BCMacroData} options 
	 */
	createMacro(options) {
		var macro = new Macro(options);
		macro.pack = this.id;
		if (this.id == "custom") macro.actionString = options.action.toString();
		options.id = macros.push(macro) - 1;
		if (!this.macros.find(o => o.io == options.id)) this.macros.push(options);

		//load prreferences
		var preferences = data.find(d => d.pack == this.id && d.id == macro.id)
		if (preferences) {
			if (preferences.key) macro.bindKey(preferences.key);
			if (preferences.button) macro.enableButton(preferences.button);
		}
		return macro;
	}

	recreateMacros() {
		for (let options of this.macros) {
			var macro = new Macro(options);
			if (this.id == "custom") macro.actionString = options.action.toString();
			options.id = macros.push(macro) - 1;
		}
	}
}

/**
 * 
 * @param {String} name Pack name
 */
function createMacroPack(options) {
	if (typeof (options) == "string") options = { name: options };
	var macroPack = new MacroPack(options);
	packs[macroPack.id] = macroPack

	return macroPack;
}

var me = createMacroPack("BCMacros")

//<i class="fas fa-cog"></i>
var settingsMacro = me.createMacro({
	name: "settings",
	action: function () {
		BCMacros.displaySettings()
	}/*,
	button: {
		text: '<i class="fas fa-cog"></i>'
	}*/
})


var customMacros = createMacroPack("Custom");
//Setup custom macros



var BCMacros = {
	packs,
	macros,
	createMacroPack,
	CreateMacroPack: createMacroPack,
	createMacro: customMacros.createMacro,
	displaySettings,
	sendMessage,
	save,
	reset
}

if (settingsMacro.inaccessible()) {
	displaySettings("Please set an activation method for the settings macro.");
}

for (let options of data) {
	if (options.pack != "custom") continue;
	customMacros.createMacro({
		name: options.name,
		action: options.actionString
	})
}

// Runs on page load
runIfDocLoaded(
	async function () {
		document.addEventListener("keydown", function (e) {
			if (binding) {
				binding.bindKey(e.key);
				binding = undefined;
				RefreshSettings("There are unsaved changes")
				return;
			}

			var macro = macros.filter(a => a.key == e.key)
			if (!macro) return;
			if (isSettingsOpen()) {
				var setting = document.getElementById("bcmSetting_" + macro.id);
				[].forEach.call(setting.childNodes, function (child) {
					child.classList.add("bg-light")
				});
			} else {
				console.log("[BCM] Triggering", macro.name, "by key...");
				macro.action();
			}

		});
	});

document.addEventListener("keyup", function (e) {

	var macro = macros.filter(a => a.key == e.key)
	if (!macro) return;
	if (isSettingsOpen()) {
		var setting = document.getElementById("bcmSetting_" + macro.id);
		[].forEach.call(setting.childNodes, function (child) {
			child.classList.add("bg-light")
		});
	}

}, false);


exportFunction(BCMacros, unsafeWindow, {
	defineAs: "BCMacros"
});
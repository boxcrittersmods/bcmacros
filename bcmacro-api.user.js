// ==UserScript==
// @name         BCMacro API
// @namespace    http://discord.gg/G3PTYPy
// @version      0.6.7.89
// @description  Adds Buttons and Keybinds to Box Critters
// @author       TumbleGamer
// @resource fontAwesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css
// @require      https://github.com/tumble1999/mod-utils/raw/master/mod-utils.js
// @require      https://github.com/tumble1999/native-modals/raw/master/native-modal.js
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
(function () {
	'use strict';
	/*mod.log("[BCMacros] by TumbleGamer")
	mod.log = (...p) => {
		p.unshift("[BCM]");
		console.debug(...p)
	};
	
	cardboard.register("BCMACROS")
	mod.log(ctrlPanel)*/
	var mod = BCModUtils.InitialiseMod({
		name: "BCMacros",
		abriv: "BCM",
		author: "TumbleGamer"
	})

	mod.log("Inserting Modal");
	mod.modal = new BSModal();
	mod.modal.setContent({
		header: "Macro Settings" + BSModal.closeButton,
		body: `
<h2>Macros</h2>
<div id="bcmSettingCreate" class="card card-body">
	<div class="input-group">
		<input type="text" id="bcmSettingName" class="form-control" placeholder="New Macro...">
		<button class="btn btn-outline-secondary" type="button" id="bcmSettingJS">JS</button>
		<button class="btn btn-outline-secondary" type="button" id="bcmSettingChat">Chat</button>
	</div>
	<textarea type="text" id="bcmSettingContent" class="form-control" placeholder="Action/Text"></textarea>
</div>
<div id="bcm_settingList" class="card-group-vertical"></div>`,
		footer: '<button class="btn btn-danger" type="button" id="bcmSettingReset">Reset</button><button class="btn btn-primary" type="button" id="bcmSettingSave" data-dismiss="modal"> Save</button>'
	})
	/**
	 * @external KeyboardEvent
	 * @see {@link hhttps://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent}
	 */
	var btnContainer = document.createElement("div");
	btnContainer.id = "bcmButtonGroup"
	window.addEventListener("load", () => {
	})
	//var BCM_modal;

	window = unsafeWindow || window;
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

	/*function createDialogue(
		header = `<button type="button" class="close" data-dismiss="BCM_modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>`,
		body,
		footer
	) {
		var content = `
		<div class="modal-header">${header}</div>
		<div class="modal-body">${body}</div>
		<div class="modal-footer">${footer}</div>`
	
		BCM_modal.setContent(content);
		BCM_modal.show();
	}*/


	/**
	 * This function exists in case the send message function changes again
	 * @param {String} t Message to be sent
	 */
	function sendMessage(t) {
		world.message(t)
	}


	/**
	 * @interface btnAPIButton
	 * @property {String} text
	 * @property {String} type
	 * @property {String} size
	 * 
	 */

	var btnTools = {
		createButton: function ({ text, color = "info", size }) {
			var buttonParent = document.createElement("span")
			buttonParent.classList.add("input-group-btn");
			buttonParent.style.touchAction = "none";
			var btn = document.createElement("button");
			btn.classList.add("btn");
			if (size) btn.classList.add("btn-" + size);
			if (color) btn.classList.add("btn-" + color);
			btn.innerHTML = text;
			buttonParent.appendChild(btn);
			btnContainer.appendChild(buttonParent)
			return buttonParent;
		},

		removeButton: function (btn) {
			btnContainer.removeChild(btn);
		}
	}

	var btnContainerUsed = false;
	function addButton(options) {
		var { location, text, color, size } = options
		if (typeof (ctrlPanel) !== "undefined" && ctrlPanel.addButton) {
			mod.log("Creating Button with Button API", options)
			var btn = ctrlPanel.addButton(text, color, location, size);
			if (!btn) {
				mod.log("There was a error using the button api, switching over to using the built in function");
				BCModUtils.onDocumentLoaded().then(_ => {
					setTimeout(() => {
						mod.log("Clearing button api buttons");
						var btns = document.querySelectorAll(".btn-toolbar");
						for (let btn of btns) {
							btn.remove();
						}
					}, 1000)
				});
				delete ctrlPanel.addButton;
				return addButton(options);
			} else {
				removeButton(btn);
				if (document.body.contains(btnContainer)) {
					btnContainer.remove();
					if (btnContainerUsed) {
						mod.log("Moving buttons to Button API")
						regenerateButtons()
					}
				}
			}
			return btn;
		} else {
			mod.log("Creating Button with built-in function", options)
			btnContainerUsed = true;
			return btnTools.createButton(options);
		}
	}

	function removeButton(btn) {
		mod.log("Removing button", btn)
		btn.remove();
	}

	/**
	 * Save the preferences
	 */
	function save() {
		GM_setValue("macros", BCMacros.macros.filter(m => m.modified).map(m => Object.keys(m).reduce((obj, k) => (k !== "modified" ? obj[k] = m[k] : null, obj), {})))
		mod.log("Macros Saved.");
		RefreshSettings("Settings have been saved","success");
	}

	/**
	 * Resets all of the preferences **without** saving.
	 */
	function reset() {
		data = [];
		for (let macroId in macros) {
			macros[macroId].disableButton();
		}
		macros = [];
		packs.custom.macros = [];
		for (let packId in packs) {
			packs[packId].recreateMacros();
		}
		RefreshSettings("Settings have been reset. (this will not take perminant effect until you save)","danger");
	}

	function createSetting(macro) {
		var settingHTML = `<input type="text" class="form-control" value='${macro.name}'>
							<button class="btn ${macro.button ? "btn-success" : "btn-outline-secondary"}" type="button" id="bcmSetting_${macro.id}-button" >
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
			RefreshSettings("There are unsaved changes","warning")
		}, true);
		btnKey.addEventListener("click", (e) => {
			if (binding == macro) {
				macro.key = undefined;
				binding = undefined;
				btnKey.classList.remove("btn-success");
				btnKey.classList.remove("btn-danger");
				btnKey.classList.add("btn-outline-secondary");
				btnKey.innerText = "Bind key";
				mod.log("[BCM] Binding Canceled for" + macro.name);
				RefreshSettings("There are unsaved changes","warning")
				return;
			}
			binding = macro;
			mod.log("Binding " + macro.name + "...");
			btnKey.innerText = "Binding..";
			btnKey.classList.remove("btn-outline-secondary");
			btnKey.classList.add("btn-danger");
		}, true);

		return settingItem;
	}

	function RefreshSettings(notice,type) {
		var settingGroup = document.getElementById("bcm_settingList")
		settingGroup.innerHTML = "";

		function sendNotice(text,type="info") {
			var box = document.createElement("div")
			box.classList.add("alert", "alert-"+type)
			box.setAttribute("role", "alert")
			box.innerText = text;
			settingGroup.appendChild(box)

		}

		if (notice) sendNotice(notice,type)


		if(settingsMacro.inaccessible()) {
			sendNotice("Please set an activation method for the settings macro.","danger")
			document.getElementById("bcmSettingSave").disabled = true;
			mod.modal.disableClosing()
		} else {
			mod.modal.enableClosing()
			document.getElementById("bcmSettingSave").disabled = false
		}

		for (let packId in packs) {
			var pack = packs[packId];
			var list = document.createElement("div");
			list.classList.add("card", "card-body");
			var heading = document.createElement("h5");
			heading.classList.add("card-title")
			heading.innerText = pack.name;
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
		var settings = mod.modal
		if (!settings) return;
		return window.getComputedStyle(settings.element).display !== "none";
	}

	/**
	 * Brings up the settings window
	 */
	function displaySettings(notice) {
		mod.modal.show();
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
			RefreshSettings("There are unsaved changes","warning");
		})
		settingChatField.addEventListener("click", _ => {
			var name = newNameField.value;
			var action = "BCMacros.sendMessage(" + JSON.stringify(newContentField.value) + ")";
			customMacros.createMacro({ name, action })
			RefreshSettings("There are unsaved changes","warning");
		})
		settingSave.addEventListener("click", _ => {
			save();
		})
		settingReset.addEventListener("click", _ => {
			reset();
		})
		RefreshSettings(notice);
	}

	function regenerateButtons() {
		for (let packId in packs) {
			var pack = packs[packId]
			for (let button of pack.buttons) {
				removeButton(button);
			}
		}
		for (let macro of macros) {
			var btnOptions = macro.button;
			if (!btnOptions) continue;
			delete macro.button;
			macro.enableButton(btnOptions);
		}
	}


	class Macro {
		constructor({ name, pack, action, key, button }) {
			this.id = camelize(name);
			this.name = name;
			this.pack = pack;

			if (typeof (action) == "string") action = Function(action)
			this.action = action;
			if (key) this.bindKey(key);
			if (button) this.enableButton(button)
			this.modified = false;
		}

		getPack() {
			if (!this.pack) return;
			return packs[this.pack];
		}

		getButton() {
			if (!this.button) return;
			return this.getPack().buttons[this.button.id];
		}

		bindKey(key) {
			this.key = key;
			this.modified = true;
			return this;
		}

		enableButton(options = {}) {
			if (this.button) return;
			var mergedOptions = Object.assign({
				location: "bottom",
				text: this.id,
				color: "info",
				size: "md"
			}, options);
			var buttonElement = addButton(mergedOptions)
			if (!buttonElement) {
				mod.log("There was an error creating button", options);
				return this;
			}
			if (buttonElement.tagName == "BTN") {
				buttonElement.addEventListener("click", this.action);
			} else {
				let btn = buttonElement.querySelector("button")
				btn.addEventListener("click", this.action);
			}
			options.id = this.getPack().buttons.push(buttonElement) - 1;
			this.button = options;
			this.modified = true;
			return this;
		}
		disableButton() {
			if (!this.button) return;
			var pack = this.getPack();
			var button = pack.buttons[this.button.id];
			removeButton(button);
			pack.buttons.splice(this.button.id, 1);
			var removedID = this.button.id;
			delete this.button;
			macros.forEach(macro => macro.pack != this.pack || !macro.button || macro.button.id && macro.button.id > removedID && macro.button.id-- && mod.log(macro.id, macro.button, (macro.button.id + 1) + "=>" + macro.button.id))
			this.modified = true;
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
			this.macros = [];
			this.buttons = [];
		}

		/**
		 * 
		 * @param {BCMacroData} options 
		 */
		createMacro(options) {
			options.pack = this.id;
			var macro = new Macro(options);
			if (this.id == "custom") macro.actionString = options.action.toString();
			options.id = macros.push(macro) - 1;
			if (!this.macros.find(o => o.io == options.id)) this.macros.push(options);

			//load prreferences
			var preferences = data.find(d => d.pack == this.id && d.id == macro.id)
			if (preferences) {
				var testToChange = { id: preferences.id, name: options.name, pack: preferences.pack }
				if (macro.button) testToChange.button = macro.button;
				if (macro.key) testToChange.key = macro.key;
				if (JSON.stringify(preferences) != JSON.stringify(testToChange)) {
					mod.log("Loading Preferences for macro " + macro.id)
					if (preferences.key) macro.bindKey(preferences.key);
					if (preferences.button) {
						macro.enableButton(preferences.button);
					} else {
						macro.disableButton();
					}
				}
			}
			return macro;
		}

		recreateMacros() {
			for (let options of this.macros) {
				var macro = new Macro(options);
				macro.pack = this.id;
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
		action: _ => {
			displaySettings()
		},
		button: {
			text: '<i class="fas fa-cog"></i>',
			color: "primary"
		}
	})


	var customMacros = createMacroPack("Custom");
	//Setup custom macros



	var BCMacros = {
		mod,
		packs,
		macros,
		createMacroPack,
		CreateMacroPack: createMacroPack,
		createMacro: customMacros.createMacro,
		displaySettings,
		sendMessage,
		save,
		reset,
		btnContainer
	}


	for (let options of data) {
		if (options.pack != "custom") continue;
		customMacros.createMacro({
			name: options.name,
			action: options.actionString
		})
	}

	// Runs on page load
	BCModUtils.onDocumentLoaded().then(_ => {
		mod.log("Document Loaded");
		//Initialisation
		mod.log("Installing Font Awesome")
		var fontAwesomeText = GM_getResourceText("fontAwesome");
		GM_addStyle(fontAwesomeText);

		//Setup Dialog
		/*let dialogueHTML = `<div id="BCM_modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
				</div>
			</div>
		</div>`;
		document.body.insertAdjacentHTML("afterbegin", dialogueHTML)
		//document.body.insertAdjacentElement("afterbegin",modalContainer)
		BCM_modal = new BSN.Modal("#BCM_modal")*/

		mod.log("Inseting Button Container")
		var chatBar = document.getElementById('menu');
		chatBar.parentElement.insertAdjacentElement("afterend", btnContainer);


		//Setup Inputs
		document.addEventListener("keydown", function (e) {
			if (binding) {
				binding.bindKey(e.key);
				binding = undefined;
				RefreshSettings("There are unsaved changes")
				return;
			}

			var macro = macros.find(a => a.key == e.key)
			if (!macro) return;
			if (isSettingsOpen()) {
				document.querySelectorAll("#bcmSetting_" + macro.id + " > *")[0].classList.add("bg-success", "text-white")
			} else {
				mod.log("Triggering", macro.name, "by key...");
				macro.action();
			}

		});
		document.addEventListener("keyup", function (e) {

			var macro = macros.find(a => a.key == e.key)
			if (!macro) return;
			if (isSettingsOpen()) {
				document.querySelectorAll("#bcmSetting_" + macro.id + " > *")[0].classList.remove("bg-success", "text-white")
			}

		}, false);
	});
	mod.modal.addEventListener("created",()=>{
		mod.log("Modal Created")

		mod.log("Cheacking Accessibiliy of the settings")
		if (settingsMacro.inaccessible()) {
			displaySettings();
		}
	})



	exportFunction(BCMacros, unsafeWindow, {
		defineAs: "BCMacros"
	});
})();
// ==UserScript==
// @name         BCMacro API
// @namespace    http://discord.gg/G3PTYPy
// @version      0.6.13.95
// @description  Adds Buttons and Keybinds to Box Critters
// @author       TumbleGamer
// @resource fontAwesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css
// @require      https://github.com/tumble1999/mod-utils/raw/master/mod-utils.js
// @require      https://github.com/tumble1999/popper/raw/master/popper.js
// @require      https://github.com/SArpnt/ctrl-panel/raw/master/script.user.js
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
 */
/**
 * @file BCMacro API Userscript
 * @author TumbleGamer <tumblegamer@gmail.com>
 * @copyright 2020 TumbleGamer <tumblegamer@gmail.com>
 * @copyright 2020 The Box Critters Modding Community
 * @license Apache-2.0
 */
(function () {
	'use strict';
	window = unsafeWindow || window;
	let btnContainer = document.createElement("div");
	btnContainer.id = "bcmButtonGroup";
	let packs = {},
		macros = [],
		BCMacros = new TumbleMod({
			id: "BCMacros",
			abriv: "BCM",
			packs,
			macros,
			createMacroPack,
			CreateMacroPack: createMacroPack,
			displaySettings,
			sendMessage,
			save,
			reset,
			btnContainer
		});

	BCMacros.log("Inserting Modal");
	BCMacros.modal = new Popper();
	BCMacros.modal.setContent({
		header: `Macro Settings ${Popper.closeButton}`,
		body: `
			<div class="card card-body bcmSettingCreate">
				<div class="input-group">
					<input type="text" class="form-control bcmSettingName" placeholder="New Macro...">
					<button class="btn btn-outline-secondary bcmSettingJS" type="button">JS</button>
					<button class="btn btn-outline-secondary bcmSettingChat" type="button">Chat</button>
				</div>
				<textarea type="text" class="form-control bcmSettingContent" placeholder="Action/Text"></textarea>
			</div>
			<div class="card-group-vertical bcmSettingList"></div>
		`,
		footer: `
			<button class="btn btn-danger bcmSettingReset" type="button">Reset</button>
			<button class="btn btn-primary bcmSettingSave" type="button" data-dismiss="modal">Save</button>
		`,
	});
	{
		let
			mc = BCMacros.modal.element.getElementsByClassName("modal-content")[0],
			newNameField = mc.getElementsByClassName("bcmSettingName")[0],
			newContentField = mc.getElementsByClassName("bcmSettingContent")[0],
			settingJSField = mc.getElementsByClassName("bcmSettingJS")[0],
			settingChatField = mc.getElementsByClassName("bcmSettingChat")[0],
			settingSave = mc.getElementsByClassName("bcmSettingSave")[0],
			settingReset = mc.getElementsByClassName("bcmSettingReset")[0];

		settingJSField.addEventListener("click", _ => {
			customMacros.createMacro({
				name: newNameField.value,
				action: newContentField.value,
			});
			RefreshSettings("There are unsaved changes", "warning");
		});
		settingChatField.addEventListener("click", _ => {
			customMacros.createMacro({
				name: newNameField.value,
				action: `BCMacros.sendMessage(${JSON.stringify(newContentField.value)})`,
			});
			RefreshSettings("There are unsaved changes", "warning");
		});
		settingSave.addEventListener("click", save);
		settingReset.addEventListener("click", reset);
	}

	let data = GM_getValue("macros") || [];

	if (GM_getValue("BCMacros_mods"))
		GM_setValue("BCMacros_mods", undefined);
	if (GM_getValue("BCMacros_macros"))
		Object.assign(data, GM_getValue("BCMacros_macros"));
	/**
	 * This function exists in case the send message function changes again
	 * @param {String} t Message to be sent
	 */
	function sendMessage(t) {
		world.message(t);
	}

	function addButton(options) {
		BCMacros.log("Creating Button with Ctrl Panel", options);
		let { text, color, location, size } = options;
		return ctrlPanel.addButton(text, color, location, size);
	}

	function removeButton(btn) {
		BCMacros.log("Removing button", btn);
		ctrlPanel.removeButton(btn);
	}

	/**
	 * Save the preferences
	 */
	function save() {
		GM_setValue("macros", BCMacros.macros.filter(m => m.modified).map(m => Object.keys(m).reduce((obj, k) => (k !== "modified" ? obj[k] = m[k] : null, obj), {})));
		BCMacros.log("Macros Saved.");
		RefreshSettings("Settings have been saved", "success");
	}

	/**
	 * Resets all of the preferences **without** saving.
	 */
	function reset() {
		data = [];
		for (let macroId in macros)
			macros[macroId].disableButton();
		macros = [];
		packs.custom.macros = [];
		for (let packId in packs)
			packs[packId].recreateMacros();
		RefreshSettings("Settings have been reset. (This will not take permanent effect until you save)", "danger");
	}

	/**
	 * @external KeyboardEvent
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent}
	 */
	let binding = undefined;

	function createSetting(macro) {
		let settingItem = document.createElement("div");
		settingItem.id = `bcmSetting_${macro.id}`;
		settingItem.classList.add("input-group");
		settingItem.innerHTML = `
		<input type="text" class="form-control" value='${macro.name}'>
		<button class="btn ${macro.button ? "btn-success" : "btn-outline-secondary"} bcm-button" type="button" >
			Toggle Button
		</button>
		<button class="btn ${macro.keyCode ? "btn-success" : "btn-outline-secondary"} bcm-key" type="button" style="width:90px">
			${binding == macro ? "Binding.." : macro.keyName || "Bind Key"}
		</button>`;

		let btnButton = settingItem.getElementsByClassName(`bcm-button`)[0];
		btnButton.addEventListener("click", function (e) {
			btnButton.classList.toggle("btn-success");
			btnButton.classList.toggle("btn-outline-secondary");
			macro.toggleButton();
			RefreshSettings("There are unsaved changes", "warning");
		}, true);

		let btnKey = settingItem.getElementsByClassName(`bcm-key`)[0];
		btnKey.addEventListener("click", function (e) {
			if (binding == macro) {
				macro.keyCode = undefined;
				macro.keyName = undefined;
				binding = undefined;
				btnKey.classList.remove("btn-success");
				btnKey.classList.remove("btn-danger");
				btnKey.classList.add("btn-outline-secondary");
				btnKey.innerText = "Bind key";
				BCMacros.log(`Binding cancelled for ${macro.name}`);
				RefreshSettings("There are unsaved changes", "warning");
			} else {
				binding = macro;
				BCMacros.log(`Binding ${macro.name}...`);
				btnKey.innerText = `Binding..`;
				btnKey.classList.remove("btn-outline-secondary");
				btnKey.classList.add("btn-danger");
			}
		}, true);

		return settingItem;
	}

	function RefreshSettings(notice, type) {
		let settingGroup = BCMacros.modal.element.getElementsByClassName("bcmSettingList")[0];
		settingGroup.innerHTML = "";

		function sendNotice(text, type = "info") {
			let box = document.createElement("div");
			box.className = `mb-0 py-1 alert alert-${type}`;
			box.setAttribute("role", "alert");
			box.innerText = text;
			settingGroup.append(box);
		}

		if (notice) sendNotice(notice, type || "warning");

		if (settingsMacro.inaccessible()) {
			sendNotice(`Please set an activation method for the settings macro.`, "danger");
			BCMacros.modal.element.getElementsByClassName("bcmSettingSave")[0].disabled = true;
			BCMacros.modal.disableClosing();
		} else {
			BCMacros.modal.element.getElementsByClassName("bcmSettingSave")[0].disabled = false;
			BCMacros.modal.enableClosing();
		}

		for (let packId in packs) {
			let pack = packs[packId];
			let list = document.createElement("div");
			list.classList.add("card", "card-body");
			let heading = document.createElement("h5");
			heading.classList.add("card-title");
			heading.innerText = pack.name;
			list.append(heading);
			if (pack.macros.length == 0) {
				let disclaimer = document.createElement("p");
				disclaimer.innerText = "There are no macros in this pack";
				if (pack.id == "custom") disclaimer.innerText = "You have created no custom macros";
				list.append(disclaimer);
			}

			for (let packMacros of pack.macros)
				list.append(createSetting(macros[packMacros.id]));

			settingGroup.append(list);
		}
	}


	function isSettingsOpen() {
		if (!BCMacros.modal) return;
		return window.getComputedStyle(BCMacros.modal.element).display !== "none";
	}

	/**
	 * Brings up the settings window
	 */
	function displaySettings(notice) {
		BCMacros.modal.show();
		RefreshSettings(notice);
	}


	class Macro {
		constructor({ name, pack, action, key, button }) {
			this.id = TumbleMod.camelize(name);
			this.name = name;
			this.pack = pack;

			if (typeof action == "string") action = Function(action);
			this.action = action;
			if (key) this.bindKey(key);
			if (button) this.enableButton(button);
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

		bindKey(keyCode, keyName) {
			this.keyCode = keyCode;
			this.keyName = this.getKeyName(keyCode, keyName);
			this.modified = true;
			return this;
		}

		getKeyName(keyCode, keyName) {
			if (/^Numpad/.test(keyCode))
				if (/^Numpad\d$/.test(keyCode))
					return `Num ${keyCode[6]}`;
				else
					return `Num ${this.getKeyName(keyCode.replace('Numpad', ''), keyName)}`;

			if (/^Key\w$/.test(keyCode))
				return keyName ? keyName.toUpperCase() : keyCode[3];
			if (/^Digit\d$/.test(keyCode))
				return keyCode[5];
			if (/^Arrow/.test(keyCode))
				return keyName.replace('Arrow', '');
			if (/^\s*$/.test(keyName))
				return keyCode;

			let md = /(?:Bracket)?(?:Left|Right)$/.exec(keyCode);
			if (md && !/^Bracket/.test(md))
				return `${md[0]} ${keyName}`;

			return (keyName && keyName != "Unidentified") ? keyName : keyCode;
		}

		enableButton(options = {}) {
			if (this.button) return;
			let mergedOptions = Object.assign({
				location: "bottom",
				text: this.id,
				color: "info",
				size: "md"
			}, options);
			let buttonElement = addButton(mergedOptions);
			if (!buttonElement) {
				BCMacros.log("There was an error creating button", options);
				return this;
			}
			buttonElement.addEventListener("click", this.action);
			options.id = this.getPack().buttons.push(buttonElement) - 1;
			this.button = options;
			this.modified = true;
			return this;
		}
		disableButton() {
			if (!this.button) return;
			let pack = this.getPack();
			let button = pack.buttons[this.button.id];
			removeButton(button);
			delete pack.buttons[this.button.id];
			delete this.button;
			this.modified = true;
			return this;
		}
		inaccessible() {
			return !this.keyCode && !this.button;
		}

		toggleButton(options) {
			this.button
				? this.disableButton()
				: this.enableButton(options);
		}
	}

	/**
	 * MacroPack
	 */
	class MacroPack {
		constructor({ name }) {
			this.id = TumbleMod.camelize(name);
			this.name = name;
			this.macros = [];
			this.buttons = []; // DO NOT ITERATE OVER THIS WITH "of"
		}

		/**
		 * 
		 * @param {BCMacroData} options 
		 */
		createMacro(options) {
			options.pack = this.id;
			let macro = new Macro(options);
			if (this.id == "custom") macro.actionString = options.action.toString();
			options.id = macros.push(macro) - 1;
			if (!this.macros.find(o => o.io == options.id)) this.macros.push(options);

			// load preferences
			let pref = data.find(d => d.pack == this.id && d.id == macro.id);
			if (pref) {
				let diffTest = { id: pref.id, name: options.name, pack: pref.pack };
				if (macro.button) diffTest.button = macro.button;
				if (macro.keyCode) {
					diffTest.keyCode = macro.keyCode;
					diffTest.keyName = macro.keyName;
				}
				if (JSON.stringify(pref) != JSON.stringify(diffTest)) {
					BCMacros.log(`Loading Preferences for macro ${macro.id}`);
					if (pref.keyCode) macro.bindKey(pref.keyCode, pref.keyName);
					if (pref.button)
						macro.enableButton(pref.button);
					else
						macro.disableButton();
				}
			}
			return macro;
		}

		recreateMacros() {
			for (let options of this.macros) {
				let macro = new Macro(options);
				macro.pack = this.id;
				if (this.id == "custom") macro.actionString = options.action.toString();
				options.id = macros.push(macro) - 1;
			}
		}
	}

	/**
	 * @param {String} name Pack name
	 */
	function createMacroPack(options) {
		if (typeof options == "string") options = { name: options };
		let macroPack = new MacroPack(options);
		packs[macroPack.id] = macroPack;

		return macroPack;
	}

	let me = createMacroPack("BCMacros");

	let settingsMacro = me.createMacro({
		name: "settings",
		action: _ => displaySettings(),
		button: {
			text: `<i class="fas fa-cog"></i>`,
			color: "primary"
		},
	});

	let customMacros = createMacroPack("Custom");
	// Setup custom macros

	for (let options of data) {
		if (options.pack != "custom") continue;
		customMacros.createMacro({
			name: options.name,
			action: options.actionString,
		});
	}
	BCMacros.createMacro = customMacros.createMacro;

	// Runs on page load
	TumbleMod.onDocumentLoaded().then(_ => {
		BCMacros.log("Document Loaded");
		// Initialisation
		BCMacros.log("Installing Font Awesome");
		let fontAwesomeText = GM_getResourceText("fontAwesome");
		GM_addStyle(fontAwesomeText);

		BCMacros.log("Inseting Button Container");
		let chatBar = document.getElementById('menu');
		chatBar.parentElement.insertAdjacentElement("afterend", btnContainer);


		// Setup Inputs
		document.addEventListener("keydown", function ({ code: keyCode, key: keyName }) {
			if (binding) {
				binding.bindKey(keyCode, keyName);
				binding = undefined;
				RefreshSettings("There are unsaved changes");
				return;
			}

			let macro = macros.find(a => a.keyCode == keyCode);
			if (!macro) return;
			if (isSettingsOpen())
				document.getElementById(`bcmSetting_${macro.id}`).firstElementChild.classList.add("bg-success", "text-white");
			else {
				BCMacros.log("Triggering", macro.name, "by key...");
				macro.action();
			}

		});
		document.addEventListener("keyup", function ({ code: keyCode, key: keyName }) {
			let macro = macros.find(a => a.keyCode == keyCode);
			if (!macro) return;
			if (isSettingsOpen())
				document.getElementById(`bcmSetting_${macro.id}`).firstElementChild.classList.remove("bg-success", "text-white");
		}, false);
	});
	BCMacros.modal.addEventListener("created", () => {
		BCMacros.log("Modal Created");
		BCMacros.log("Checking settings accessibility");
		if (settingsMacro.inaccessible())
			displaySettings();
	});

	exportFunction(BCMacros, unsafeWindow, {
		defineAs: "BCMacros",
	});
})();
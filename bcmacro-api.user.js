// ==UserScript==
// @name         BCMacro API
// @namespace    https://bcmc.ga/authors/tumblegamer/
// @supportURL   http://discord.gg/D2ZpRUW
// @version      0.11.6.116
// @description  Adds Buttons and Keybinds to Box Critters
// @author       Tumble
// @icon         https://github.com/boxcrittersmods/bcmacros/raw/master/icon.png
// @require      https://kit.fontawesome.com/efb91a96ed.js
// @require      https://github.com/tumble1999/mod-utils/raw/master/mod-utils.js
// @require      https://github.com/tumble1999/modial/raw/master/modial.js
// @require      https://github.com/SArpnt/ctrl-panel/raw/master/script.user.js
// @require      https://github.com/tumble1999/critterguration/raw/master/critterguration.user.js
// @match        https://boxcritters.com/play/
// @match        https://boxcritters.com/play/?*
// @match        https://boxcritters.com/play/#*
// @match        https://boxcritters.com/play/index.html
// @match        https://boxcritters.com/play/index.html?*
// @match        https://boxcritters.com/play/index.html#*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
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
	const uWindow = typeof unsafeWindow != 'undefined' ? unsafeWindow : window;

	if (uWindow.BCMacros) return;
	let deps = [
		{
			obj: "TumbleMod",
			text: "// @require      https://github.com/tumble1999/mod-utils/raw/master/mod-utils.js"
		},
		{
			obj: "Modial",
			text: "// @require      https://github.com/tumble1999/modial/raw/master/modial.js"
		},
		{
			obj: "ctrlPanel",
			text: "// @require      https://github.com/SArpnt/ctrl-panel/raw/master/script.user.js"
		},
		{
			obj: "Critterguration",
			text: "// @require      https://github.com/tumble1999/critterguration/raw/master/critterguration.user.js"
		},
		{
			obj: "GM_getValue",
			text: "// @grant        GM_getValue"
		},
		{
			obj: "GM_setValue",
			text: "// @grant        GM_setValue"
		},
		{
			obj: "GM_deleteValue",
			text: "// @grant        GM_deleteValue"
		}
	];
	if (deps.map(dep => eval("typeof " + dep.obj)).includes("undefined")) throw "\nATTENTION MOD DEVELOPER:\nPlease add the following to your code:\n" + deps.map(dep => {
		if (eval("typeof " + dep.obj) == "undefined") return dep.text;
	}).filter(d => !!d).join("\n");
	let packs = {},
		macros = [],
		macroChord = [],
		typing = false,
		BCMacros = new TumbleMod({
			id: "BCMacros",
			name: "BCMacros",
			abriv: "BCM",
			author: "Tumble",
			packs,
			macros,
			macroChord,
			createMacroPack,
			CreateMacroPack: createMacroPack,
			sendMessage,
			save,
			reset,
			//btnContainer
		});
	//let btnContainer = document.createElement("div");
	//btnContainer.id = "bcmButtonGroup";

	BCMacros.log("Inserting Modal");
	BCMacros.settingsPage = Critterguration.registerSettingsMenu(BCMacros, _ => RefreshSettings());
	if (!BCMacros.settingsPage) throw "No settings page was made";
	BCMacros.settingsPage.innerHTML = `
	<div class="card card-body bcmSettingCreate">
		<div class="input-group">
			<input type="text" class="form-control bcmSettingName" placeholder="New Macro...">
			<button class="btn btn-outline-secondary bcmSettingJS" type="button">JS</button>
			<button class="btn btn-outline-secondary bcmSettingChat" type="button">Chat</button>
		</div>
		<textarea type="text" class="form-control bcmSettingContent" placeholder="Action/Text"></textarea>
	</div>
	<div class="card-group-vertical bcmSettingList">
	</div>
	<button class="btn btn-danger bcmSettingReset" type="button">Reset</button>
	<button class="btn btn-primary bcmSettingSave" type="button">Save</button>
`;
	{
		let
			mc = BCMacros.settingsPage,
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
		//ctrlPanel.removeButton(btn);
		btn.parentElement.removeChild(btn);
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
		<input type="text" class="form-control" value='${macro.name}' disabled>
		<button class="btn ${macro.buttonEnabled() ? "btn-success" : "btn-outline-secondary"} bcm-button" type="button" >
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
		BCMacros.log(BCMacros);
		let settingGroup = BCMacros.settingsPage.getElementsByClassName("bcmSettingList")[0];
		BCMacros.log("BEEP", settingGroup);
		settingGroup.innerHTML = "";

		function sendNotice(text, type = "info") {
			let box = document.createElement("div");
			box.className = `mb-0 py-1 alert alert-${type}`;
			box.setAttribute("role", "alert");
			box.innerText = text;
			settingGroup.append(box);
		}

		if (notice) sendNotice(notice, type || "warning");

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
		return Critterguration.isOpen();
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

		registerButton(button) {
			if (!this.button) this.button = {};
			let pack = this.getPack(),
				id = this.button.id;
			if (id) {
				pack.buttons[id] = button;
			} else {
				id = this.button.id = pack.buttons.push(button) - 1;
			}
			if (button.onclick) {
				//this.action = button.onclick;
				this.setAction(button.onclick);
				delete button.removeAttribute("onclick");
			}
			this.button.enabled = true;
		}

		setAction(action) {
			this.action = action;
			if (this.button && this.button.id) {
				let button = this.getPack().buttons[this.button.id];
				button.addEventListener("click", action);
			}
		}

		enableButton(options = {}) {
			if (this.button && this.button.enabled) return;

			let pack = this.getPack();

			if (!this.button || typeof this.button.id != "number") {
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
				options.id = pack.buttons.push(buttonElement) - 1;
				pack.parents[options.id] = buttonElement.parentElement;
				this.button = options;
			}
			let element = pack.buttons[this.button.id],
				parent = pack.parents[this.button.id];
			this.modified = true;
			this.button.enabled = true;
			if (!element.parentElement && parent) {
				parent.appendChild(element);
			}
			return this;
		}
		disableButton() {
			if (!this.buttonEnabled()) return;
			let pack = this.getPack(),
				button = pack.buttons[this.button.id];
			pack.parents[this.button.id] = button.parentElement;
			removeButton(button);

			this.button.enabled = false;
			this.modified = true;
			return this;
		}
		inaccessible() {
			return !this.keyCode && !this.button;
		}

		buttonEnabled() {
			return this.button && this.button.enabled;
		}

		toggleButton(options) {
			(this.button && this.button.enabled)
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
			this.parents = [];
			this.buttons = []; // DO NOT ITERATE OVER THIS WITH "of"
		}

		/**
		 *
		 * @param {BCMacroData} options
		 */
		createMacro(options, button) {
			options.pack = this.id;
			let macro = new Macro(options);
			if (this.id == "custom") macro.actionString = options.action.toString();
			options.id = macros.push(macro) - 1;
			if (!this.macros.find(o => o.io == options.id)) this.macros.push(options);

			//register existing button
			if (button) {
				BCMacros.log("Registering an existing button", button, macro);
				macro.registerButton(button);
			}

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
					if (pref.button && pref.button.enabled)
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

	// Setup BoxCritters macros
	let snailMacros = createMacroPack("Box Critters");

	// Setup custom macros
	let customMacros = createMacroPack("Custom");
	for (let options of data) {
		if (options.pack != "custom") continue;
		customMacros.createMacro({
			name: options.name,
			action: options.actionString,
		});
	}
	BCMacros.createMacro = customMacros.createMacro;


	function isChording(macros = []) {
		if (macros.length !== macroChord.length) return false;
		for (let i = 0; i < macros.length; i++) {
			if (macros[i] !== macroChord[i]) return false;
		}
		return true;
	}
	BCMacros.isChording = isChording;


	// Runs on page load
	TumbleMod.onDocumentLoaded().then(_ => {
		BCMacros.log("Document Loaded");

		// Setup BC Buttons
		let menu = document.getElementById("menu");
		snailMacros.createMacro({
			name: "chat"
		}, menu.children[0].children[0]);
		snailMacros.createMacro({
			name: "cards"
		}, menu.children[1].children[0]);
		snailMacros.createMacro({
			name: "items"
		}, menu.children[2].children[0]);
		snailMacros.createMacro({
			name: "shop"
		}, menu.children[3].children[0]);
		snailMacros.createMacro({
			name: "misc"
		}, menu.children[4].children[0]);

		// Setup Inputs
		document.addEventListener("keydown", function ({ code: keyCode, key: keyName }) {
			if (typing) return;
			if (binding) {
				binding.bindKey(keyCode, keyName);
				binding = undefined;
				RefreshSettings("There are unsaved changes");
				return;
			}

			let macroList = macros.filter(a => a.keyCode == keyCode);
			macroList.forEach(macro => {
				if (!macro) return;
				if (isSettingsOpen())
					document.getElementById(`bcmSetting_${macro.id}`).firstElementChild.classList.add("bg-success", "text-white");
				else {
					BCMacros.log("Triggering", macro.name, "by key...");
					if (macro.action) {
						macro.action();
						BCMacros.macroChord = macroChord = [];
					}
					else if (!macroChord.includes(macro.id)) macroChord.push(macro.id);
				}
			});

		});
		document.addEventListener("keyup", function ({ code: keyCode, key: keyName }) {
			if (typing) return;
			let macroList = macros.filter(a => a.keyCode == keyCode);
			macroList.forEach(macro => {
				if (!macro) return;
				if (isSettingsOpen())
					document.getElementById(`bcmSetting_${macro.id}`).firstElementChild.classList.remove("bg-success", "text-white");
			});
		}, false);



		document.getElementById("message").addEventListener("focusin", () => {
			typing = true;
		});
		document.getElementById("message").addEventListener("focusout", () => {
			typing = false;
		});
	});

	uWindow.BCMacros = BCMacros;
})();
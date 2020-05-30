// ==UserScript==
// @name         BCMacro API
// @namespace    http://discord.gg/G3PTYPy
// @version      0.4.0.x
// @description  Adds Buttons and Keybinds to Box Critters
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
//@ts-check
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
 * @version 0.4.0.x
 */
/**
 * jQuery object
 * @external JQuery
 * @see {@link https://api.jquery.com/Types/#jQuery|jQuery}
 */
/**
 * Jquery Event
 * @external JQueryEvent
 * @see {@link https://api.jquery.com/category/events/event-object/}
 */
/**
 * The position of a Dom Element to be inserted. Here are the available positions:
 * * "beforebegin"
 * * "afterbegin"
 * * "beforeend"
 * * "afterend"
 * @typedef {String} InsertPosition
 */
/**
 * Predefined color pallete created by bootstrao. Here are the available colors:
 * * ![#007bff](https://via.placeholder.com/15/007bff/000000?text=+) "primary"
 * * ![#6c757](https://via.placeholder.com/15/6c757/000000?text=+) "secondary"
 * * ![#28a745](https://via.placeholder.com/15/28a745/000000?text=+) "success"
 * * ![#dc3545](https://via.placeholder.com/15/dc3545000000?text=+) "danger"
 * * ![#ffc107](https://via.placeholder.com/15/ffc107/000000?text=+) "warning
 * * ![#17a2b8](https://via.placeholder.com/15/17a2b8/000000?text=+) "info"
 * * ![#f8f9fa](https://via.placeholder.com/15/f8f9fa/000000?text=+) "light"
 * * ![#343a40](https://via.placeholder.com/15/343a40/000000?text=+) "dark"
 * * ![#ffffff](https://via.placeholder.com/15/ffffff/000000?text=+) "white"
 * * "transparent"
 * @see {@link https://getbootstrap.com/docs/4.5/utilities/colors/}
 * @typedef {String} BootstrapColor
 */
{
	'use strict';
	//Initialisation
	var fontAwesomeText = GM_getResourceText("fontAwesome");
	GM_addStyle(fontAwesomeText);

	//Setup Dialog
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

window = unsafeWindow || window;
// Place to use for buttons
var chatBar = document.getElementsByClassName('input-group')[0];

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
		if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

function createButton(name, cb, color = "info", place = "afterend", text) {
	var button = {
		cb:cb,
		color:color,
		place:place,
		text:text,
		html: undefined,
		display:true
	};
	var btnHTML = `<span class="input-group-btn"><button id="bcmacros${camelize(
		name
	)}" class="btn btn-${color}">${text || name}</button></span>`;
	chatBar.insertAdjacentHTML(place, btnHTML);
	$(`#bcmacros${camelize(name)}`).click(cb);
	button.html = $(`#bcmacros${camelize(name)}`);
	return button;
}

function createDialogue(header, body, footer) {
	$("#BCM_modal").modal();
	$("#BCM_modal").modal("show");
	if (header) $("#BCM_modal .modal-header").html(header);
	if (body) $("#BCM_modal .modal-body").html(body);
	if (footer) $("#BCM_modal .modal-footer").html(footer);
	return $("#BCM_model");
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
/**
 * @interface BCMacroButton
 * @property {Function} cb Action for the button to perform
 * @property {BootstrapColor} color The Bootstrap color of the button
 * @property {InsertPosition} place The polace of the button
 * @property {String} text
 * @property {external:JQuery} html
 * 
 */

 
/**
 * 
 * @name BCMacro.mods
 * @type {Array<BCMacro>}
 */
/**
 * 
 * @name BCMacro.macros
 * @type {Array<BCMacro>}
 */

/**
 * BCMacro Class
 */
class BCMacro {
	/**
	 * Creates a new macro
	 * @param {String} name The name of the macro
	 * @param {Function} cb The action the macro should perform.
	 * @param {Boolean} [mod=false] Stop the automatic recreation of the macro after refresh.
	 */
	constructor(name, cb, mod) {
		/**
		 * @type {String}
		 */
		this.name = name;
		if(typeof(cb)=="function") {
			/**
			 * @type {Function}
			 */
			this.cb = cb;
		} else {
			throw cb + "is not a function";
		}
	}

	/**
	 * This function exists in case the send message function changes again
	 * @param {String} t Message to be sent
	 */
	static sendMessage(t) {
		world.message(t)
	}

	/**
	 * Save the preferences
	 */
	static save() {
		GM_setValue("BCMacros_mods", BCMacro.mods.map(m=>m.dataify()));
		if(!BCMacro.macros) {
			GM_setValue("BCMacros_macros", []);
			return;
		}
		GM_setValue("BCMacros_macros", BCMacro.macros.map(m=>m.dataify()));
		console.log("[BCMacros] Macros Saved.");
	}

	/**
	 * Resets all of the preferences **without** saving.
	 */
	static reset() {
		BCMacro.macros = undefined;
		RefreshSettings();
	}

	/**
	 * Brings up the settings window
	 */
	static DisplaySettings() {
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

	/**
	 * The status of weather or not a button has been created for this macro.
	 * @returns {Boolean}
	 */
	buttonCreated() {
		return this.button && this.button.html;
	}

	/**
	 * The status of weather or not a button is showing for this macro.
	 * @returns {Boolean}
	 */
	buttonShowing() {
		return this.buttonCreated() && this.button.html.is(":visible");
	}

	/**
	 * Toogles weather the visibility of the macro's button.
	 * @param {BootstrapColor} [color="info"] The color of the button.
	 * @param {InsertPosition} [place="afterend"] The placement of the button on the page.
	 * @param {String} [text] The text to be displayed on the button. *defaults to the name of the macro*
	 */
	toggleButton(color,place,text) {
		if(this.buttonCreated()) {
			this.button.html.toggle();
		} else {
			/**
			 * @type {BCMacroButton}
			 */
			this.button = createButton(
				this.name,
				this.cb,
				color,
				place,
				text
			);
		}
	}
	/**
	 * 
	 * @param {external:JQueryEvent} e 
	 * @param {Number} e.type
	 */
	bindKey(e) {
		this.key = e.which;
	}
}
window.BCMacro = BCMacro;
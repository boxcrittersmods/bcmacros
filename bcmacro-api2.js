// ==UserScript==
// @name         BCMacro API
// @namespace    http://discord.gg/G3PTYPy
// @version      0.3.16.49
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
{
	//Initialisation
	var fontAwesomeText = GM_getResourceText ("fontAwesome");
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

/**
 * @module
 * @name BCMacro
 * @Author TumbleGamer <tumblegamer@gmail.com>
 */
class BCMacro {
	/**
	 * Creates a macro
	 * @param {string} name 
	 * @param {Function} cb 
	 * @param {boolean} mod 
	 */
	constructor(name, cb, mod) {
		this.name = name;
		if (typeof cp == "function") {
			this.cb = cb;
		} else {
			throw cb + "is not a function.";
		}
	}

	static sendMessage(t) {
		world.message(t);
	}

	static save() {
		GM_setValue(GM_SLOTS.mods, BCMacro.mods.map(m=>m.dataify()));
		if(!BCMacro.macros) {
			GM_setValue(GM_SLOTS.macros, []);
			return;
		}
		GM_setValue(GM_SLOTS.macros, BCMacro.macros.map(m=>m.dataify()));
		console.log("[BCMacros] Macros Saved.");
	}

	static DisplaySettings() {

	}
	
	toggleButton(color,place,text) {

	}

	/**
	 * 
	 * @param {number} key 
	 */
	bindKey(key) {

	}

	/**
	 * @returns {boolean}
	 */
	buttonCreated() {
		return false;
	}

	/**
	 * @returns {boolean}
	 */
	buttonShowing() {
		return false;
	}
	setupMod() {
		
	}

	/**
	 * @returns {Object}
	 */
	dataify() {

	}
}
// ==UserScript==
// @name         BC MacroAPI
// @namespace    http://discord.gg/G3PTYPy
// @version      1.0.1
// @description  Adds Macro API
// @author       TumbleGamer
// @match        https://boxcritters.com/play/*
// @match        http://boxcritters.com/play/*
// @icon         https://raw.githubusercontent.com/boxcritters/CrittersPlus/master/icon.png
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

window = unsafeWindow || window;

function BCMacro(name, cb) {
	if (typeof cb != "function") return;
	this.name = name;
	this.cb = cb;
	this.button = undefined;
	this.key = undefined;
	macros.push(this);
}
window.BCMacro = BCMacro;

BCMacro.data = GM_getValue("BCMacro_data", undefined);
console.log("[BCMacros] Data Loaded.");
if (!BCMacro) {
	console.log("[BCMacros] Initiating First time setup...");
	BCMacro.data = {
		macros: undefined,
	};
}
var macros = BCMacro.macros;

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
		if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

function save() {
	GM_setValue("BCMacro_data", {
		macros:BCMacro.data.macros.map(m=>m.dataify())
	});
	console.log("[BCMacros] Data Saved.");
}
BCMacro.save = save;

var binding = undefined;

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
	var chatBar = document.getElementsByClassName("input-group")[0];
	chatBar.insertAdjacentHTML(place, btnHTML);
	$(`#bcmacros${camelize(name)}`).click(cb);
	button.html = $(`#bcmacros${camelize(name)}`);
	return button;
}
BCMacro.createButton = createButton;
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

$(document).keydown(function (e) {
	if (binding) {
		binding.bindKey(e);
		binding = undefined;
		save();
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



// Runs on page load

window.addEventListener(
	"load",
	async function () {
		if(BCMacro.macros && BCMacro.INITIAL_SETUP) BCMacro.INITIAL_SETUP = false;
		if (BCMacro.macros) {
			BCMacro.macros = BCMacro.macros.map(m=>{
				var macro = new BCMacro(m.name,eval("("+m.cb+")"));
				macro.key = m.key;
				if(m.button) macro.toggleButton(m.button.color,m.button.place,m.button.text);
				return macro;
			})
			macros = BCMacro.macros;
		} else {
			BCMacro.INITIAL_SETUP = true;
		}
		
	},
	false
);

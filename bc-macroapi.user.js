// ==UserScript==
// @name         BC MacroAPI
// @namespace    http://discord.gg/G3PTYPy
// @version      0.1.0.25
// @description  Adds Macro API
// @author       TumbleGamer
// @match        https://boxcritters.com/play/*
// @match        http://boxcritters.com/play/*
// @icon         https://raw.githubusercontent.com/boxcritters/CrittersPlus/master/icon.png
// @run-at        document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// ==/UserScript==

window = unsafeWindow || window;
var chatBar = document.getElementsByClassName("input-group")[0];


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
}
GM_setValue("BCMacros_initial",BCMacro.INITIAL_SETUP);

var macros = BCMacro.macros;





// Runs on page load

window.addEventListener(
	"load",
	async function () {
		

	$(document).keydown(function (e) {
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

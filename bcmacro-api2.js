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

var GM_SLOTS = {
	mods:"BCMacros_mods",
	macros:"BCMacros_macros"
}

function BCMacroLog(...t) {
	console.log("[BCMacros]",...t);
}

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
		if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
		return index === 0 ? match.toLowerCase() : match.toUpperCase();
	});
}

class BCMacro {
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
}

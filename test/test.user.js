// ==UserScript==
// @name Test
// @namespace https://boxcrittersmods.ga
// @version 0.1.0
// @description Test
// @author TumbleGamer
// @match https://boxcritters.com/play/index.html
// @require      https://code.jquery.com/jquery-3.5.1.slim.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/modial.js/2.4.0/umd/modial.min.js
// @require      https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js
// @grant unsafeWindow
// @run-at document-end
// ==/UserScript==


var BCMacro = window.BCMacro;
if (!BCMacro) {
	// Dialog box from critters+
	// https://github.com/boxcritters/CrittersPlus
	{
		let dialogueHTML = `<div id="CP_modal" class="modal fade" tabindex="-1" role="dialog">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header"><button type="button" class="close" data-dismiss="CP_model" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				  </button></div>
					<div class="modal-body"></div>
					<div class="modal-footer"></div>
				</div>
			</div>
		</div>`;
		document.body.insertAdjacentHTML("afterbegin", dialogueHTML);
	}

	function createDialogue(header, body, footer) {
		$("#CP_modal").modal();
		$("#CP_modal").modal("show");
		if (header) $("#CP_modal .modal-header").html(header);
		if (body) $("#CP_modal .modal-body").html(body);
		if (footer) $("#CP_modal .modal-footer").html(footer);
		return $("#CP_model");
	}
	createDialogue("Macro Info", `You Will need the Macro API inorder to use this mod.`,
		'<a class="btn btn-primary" href="https://boxcrittersmods.ga/mods/bcmacro-api/">Install Macro API</a>');
}

// Runs on page load
window.addEventListener("load", async function () {
	var testPack = BCMacros.CreateMacroPack("test");
	testPack.createMacro({
		name: "Hello",
		action: function () {
			BCMacro.sendMessage("Hello World");
		},
		button: {}
	});
});
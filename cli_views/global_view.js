"use strict";

const prompt = require("prompts");

// Menus
const monitored_menu = require("./monitoring/monitored_websites");
const settingsMenu = require("./settings/settings");
const globalDisplayMenu = require("./display/display_menu");
const displayLogs = require("./display_logs");


let interval;

function globalViewMenu (token) {
	const loginMenu = require("./login/login");
	(async function() {
		const globalViewMenu =
			{
				type: "select",
				name: "globalViewMenu",
				message: "What do you want to do?",
				choices: [
					{ title: "Display monitored websites", value: "display", disabled: false },
					{ title: "Display logs", value: "logs", disabled: false },
					{ title: "Manage monitored websites", value: "manage", disabled: false },
					{ title: "Settings", value: "settings", disabled: false},
					{ title: "Logout", value: "logout", disabled: false }
				]
			};

		const answer = await prompt(globalViewMenu, {
			onCancel: cleanup,
			onSubmit: cleanup
		});
		console.clear();
		switch (answer.globalViewMenu) {
		case "display":
			globalDisplayMenu(token);
			break;
		case "logs":
			displayLogs(token);
			break;
		case "manage":
			monitored_menu(token);
			break;
		case "settings":
			settingsMenu(token);
			break;
		case "logout":
			loginMenu(token);
			break;
		}
	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = globalViewMenu;
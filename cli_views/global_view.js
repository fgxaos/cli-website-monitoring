"use strict";

const prompt = require("prompts");

// Menus
const monitored_menu = require("./monitoring/monitored_websites");
const settingsMenu = require("./settings/settings");


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
					{ title: "Manage monitored websites", value: "manage", disabled: false },
					{ title: "Settings", value: "settings", disabled: false},
					{ title: "Logout", value: "logout", disabled: false }
				]
			};

		const answer = await prompt(globalViewMenu, {
			onCancel: cleanup,
			onSubmit: cleanup
		});
		console.log(answer);
		switch (answer.globalViewMenu) {
		case "display":
			console.log("Global display");
			console.clear();
			break;
		case "manage":
			console.log("Manage time");
			console.clear();
			// Start `monitored_websites.js`
			monitored_menu(token);
			break;
		case "settings":
			console.log("Settings");
			console.clear();
			// Start `settings.js`
			settingsMenu(token);
			break;
		case "logout":
			console.log("Logged out!");
			console.clear();
			loginMenu(token);
			break;
		}
	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = globalViewMenu;
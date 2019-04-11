"use strict";

const prompt = require("prompts");

// Menus
const monitored_menu = require("./monitored_websites");
const settingsMenu = require("./settings/settings");

let interval;

function globalViewMenu () {
	const loginMenu = require("./login/login").default;

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
				break;
			case "manage":
				console.log("Manage time");
				// Start `monitored_websites.js`
				monitored_menu();
				break;
			case "settings":
				console.log("Settings");
				// Start `settings.js`
				settingsMenu();
				break;
			case "logout":
				console.log("Logged out!");
				loginMenu();
				break;
		}
		
		// console.log(answer);
	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = globalViewMenu;
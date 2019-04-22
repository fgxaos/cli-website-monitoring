"use strict";

const prompt = require("prompts");

let interval;

// Menus
const addMonitoredWebsiteMenu = require("./add_monitored_websites");
const removeMonitoredWebsiteMenu = require("./remove_monitored_websites");

function launchMenu (token) {
	const globalViewMenu = require("../global_view");
	(async function () {
		const monitored_websites_menu =
			{
				type: "select",
				name: "monitored_websites_menu",
				message: "What do you want to do?",
				choices: [
					{ title: "Add a monitored website", value: "", disabled: false },
					{ title: "Remove a monitored website", value: "", disabled: false },
					{ title: "Change statistics of a website", value: "", disabled: true },
					{ title: "Back", value: "", disabled: false }
				]
			};
	
		const answer = await prompt(monitored_websites_menu, {
			onCancel: cleanup,
			onSubmit: cleanup
		});
		console.clear();
		switch (answer.monitored_websites_menu) {
		case 0:
			// Access monitored DB and add one
			addMonitoredWebsiteMenu(token);
			break;
		case 1:
			// Access monitored DB and remove one
			removeMonitoredWebsiteMenu(token);
			break;
		case 2:
			// Change statistics of a website
			break;
		case 3:
			// Go back to `global_view.js`
			globalViewMenu(token);
			break;
		}
		
	})();	
}

function cleanup() {
	clearInterval(interval);
};

module.exports = launchMenu;
"use strict";

const prompt = require("prompts");

let interval;

function launchMenu () {
	(async function () {
		const monitored_websites_menu =
			{
				type: "select",
				name: "monitored_websites_menu",
				message: "What do you want to do?",
				choices: [
					{ title: "Add a monitored website", value: "", disabled: false },
					{ title: "Remove a monitored website", value: "", disabled: false },
					{ title: "Back", value: "", disabled: false }
				]
			};
	
		const answer = await prompt(monitored_websites_menu, {
			onCancel: cleanup,
			onSubmit: cleanup
		});
		switch (answer.monitored_websites_menu) {
			case 0:
				console.log("Add a monitored website");
				// Access monitored DB and add one
				break;
			case 1:
				console.log("Remove a monitored website");
				// Access monitored DB and remove one
				break;
			case 2:
				console.log("Back");
				// Go back to `global_view.js`
				break;
		}
		
		console.log(answer);
	})();	
}

function cleanup() {
	clearInterval(interval);
};

module.exports = launchMenu;
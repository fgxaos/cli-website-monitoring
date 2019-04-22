"use strict";

const prompt = require("prompts");
const jwt_decode = require("jwt-decode");
const userService = require("../../users/userService");


// Menus
const displayStats = require("./display_stats");

let interval;

function displayMenu (token) {
	(async function() {
		const globalViewMenu = require("../global_view");
		let userID = jwt_decode(token).sub;
		const runningMonitors = await userService.getAllMonitorsUser(userID);
		let listMonitorNames = [];
		runningMonitors.map(monitor => listMonitorNames.push(monitor.website_url));
		listMonitorNames.push("Back");
		const displayMenu =
			{
				type: "select",
				name: "displayChoiceMenu",
				message: "What do you want to display?",
				choices: listMonitorNames
			};

		const answer = await prompt(displayMenu, {
			onCancel: cleanup,
			onSubmit: cleanup
		});
        
		if (answer === "Back") {
			console.clear();
			// Back to global view menu
			globalViewMenu(token);
		} else {
			console.clear();
			// Display the stats!
			// Answer is the monitor itself
			displayStats(token, listMonitorNames[answer.displayChoiceMenu], false);
		}
	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = displayMenu;
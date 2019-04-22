"use strict";

const prompt = require("prompts");
const validURL = require("valid-url");
const fs = require("fs");
const userService = require("../../users/userService");
const jwt_decode = require("jwt-decode");

let interval;

// Menu

function launchMenu(token) {
	const monitoredWebsitesMenu = require("./monitored_websites");
	(async function() {
		const questions = [
			{
				type: "text",
				name: "website_url",
				message: "What website do you want to monitor (URL)?",
				validate: text => (validURL.isUri(text) ? true : "Please enter a valid URL")
			},
			{
				type: "number",
				name: "checkTimeInterval",
				message: "Check intervals (in milliseconds, higher than 100)? ",
				validate: number => (number >= 100 ? true : "Please enter a valid check time interval")
			}
		];

		const answers = await prompt(questions, {
			onCancel: cleanup,
			onSubmit: cleanup
		});
		
		// Add the object to the user's monitoredWebsites
		let userID = jwt_decode(token).sub;
		let changed = await userService.addMonitoredWebsite(userID, answers);

		
		// Go back to monitored websites menu
		console.clear();
		if (changed) {
			console.log("\x1b[32m", "Website added!");
		} else {
			console.log("\x1b[31m", "Website already monitored");
		}
		monitoredWebsitesMenu(token);

	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = launchMenu;

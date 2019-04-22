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
		let userID = await jwt_decode(token).sub;
		const list_monitored = await userService.getMonitoredWebsites(userID);

		if (list_monitored.length > 0) {
			const questions = [
				{
					type: "multiselect",
					name: "removed_objects",
					message: "What website do you want to stop monitoring? ",
					choices: list_monitored.map(element => JSON.stringify(element))
				}
			];
	
			const answers = await prompt(questions, {
				onCancel: cleanup,
				onSubmit: cleanup
			});
			
			// Remove the object(s) to the user's monitoredWebsites
			await answers.removed_objects.map(element => userService.removeMonitoredWebsite(userID, list_monitored[element]));
	
			// Go back to monitored websites menu
			console.clear();
			console.log("Monitored websited updated!");
			monitoredWebsitesMenu(token);
		} else {
			console.clear();
			console.log("There is no monitored website!");
			monitoredWebsitesMenu(token);
		}

		
	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = launchMenu;

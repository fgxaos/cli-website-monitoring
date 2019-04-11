"use strict";

/*
TODO list
    - Get username (accept only if the username exists)
    - Get password (accept only if it's correct)
        => Possible improvement: restrain access if more than 5 mistakes
    - If everything's alright, go to `global_view.js` and keep in mind the username
*/

const prompt = require("prompts");


const userController = require("../../users/userController");
const globalViewMenu = require("../global_view");

let interval;

function credentialsInfo (countIterations) {
    const loginMenu = require("./login.js").default;

	(async function () {
		const questions = [
			{
				type: "text",
				name: "username",
				message: "Username:",
				initial: "username"
			},
			{
				type: "password",
				name: "password",
				message: "Password: "
			}
		];

		const answers = await prompt(questions, {
			onCancel: cleanup,
			onSubmit: cleanup
			// When you have the username and the password, check in the database if those are correct
		});
        
		userController
			.authenticate(answers)
			.then(correctCredentials => {
				if (correctCredentials) {
					console.log("Successfully connected");
					globalViewMenu();
				} else if (countIterations < 2) {
					console.log("ERROR: Wrong username or wrong password");
					credentialsInfo(countIterations + 1);
				} else {
					// Write this in red
					console.log("ERROR: Too many mistakes");
					loginMenu();
				}
			})
			.catch(error => console.log(error));
	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = credentialsInfo;
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

let interval;

function credentialsInfo (countIterations) {
	const globalViewMenu = require("../global_view");
    const loginMenu = require("./login.js");

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
		});
        
		userController
			.authenticate(answers)
			.then(token => {
				if (token) {
					console.clear();
					console.log("\x1b[32m", "Successfully connected");
					globalViewMenu(token);
				} else if (countIterations < 2) {
					console.clear();
					console.log("\x1b[31m", "ERROR: Wrong username or wrong password");
					credentialsInfo(countIterations + 1);
				} else {
					console.log("\x1b[31m", "ERROR: Too many mistakes");
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
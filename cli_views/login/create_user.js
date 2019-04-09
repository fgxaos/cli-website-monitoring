"use strict";

/*
TODO: 
    - Make sure that the username doesn't already exist
    - Make sure that the password is correct
    - [Optional] Add email address, to recover forgotten passwords (or change them on this interface)
*/

const prompt = require("prompts");

let interval;

function userCreation () {
	// Modules
	const loginMenu = require("./login.js");

	(async function() {
		const questions = [
			{
				type: "text",
				name: "username",
				message: "What it your username?",
				initial: "username",
				// TODO: Create `isCorrectForm(value)`, that returns if the username only has numbers and ASCII letters
				// validate: value => (isCorrectForm(value) ? "Please, use only numbers and ASCII letters" : true)
			},
			{
				type: "password",
				name: "password",
				message: "What is your password?"
				// TODO: Add a validation step, by making the user type their password one more time
			},
		];

		const answers = await prompt(questions, {
			onCancel: cleanup,
			onSubmit: cleanup
		});
		console.log(answers);
		console.log("Account created!");
		loginMenu();

	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = userCreation;
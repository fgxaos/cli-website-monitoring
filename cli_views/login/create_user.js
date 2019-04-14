"use strict";

/*
TODO: 
    - Make sure that the username doesn't already exist
    - Make sure that the password is correct
    - [Optional] Add email address, to recover forgotten passwords (or change them on this interface)
*/

const prompt = require("prompts");

const userController = require("../../users/userController");

let interval;

function userCreation () {
	// Modules
	const loginMenu = require("./login.js").default;

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
			{
				type: "text",
				name: "firstName",
				message: "What is your first name?",
				initial: "John"
			},
			{
				type: "text",
				name: "lastName",
				message: "What is your last name?",
				initial: "Doe"
			},
			{
				type: "text",
				name: "email",
				message: "What is your email address?"
			}
		];

		const answers = await prompt(questions, {
			onCancel: cleanup,
			onSubmit: cleanup
		});
		
		// Create the user with the answer
		userController.register(answers);
		console.clear();
		console.log("Account created!");
		loginMenu();

	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = userCreation;
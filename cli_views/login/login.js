"use strict";

// Libraries
const prompt = require("prompts");


// Modules
const signUp = require("./create_user");
const enterCredentials = require("./enter_credentials");
const passwordRecover = require("./password_recover");

let interval;

function loginMenu () {
	(async function() {
		const loginMenu =
			{
				type: "select",
				name: "loginMenu",
				message: "What do you want to do?",
				choices: [
					{ title: "Log in", value: "login", disabled: false },
					{ title: "Sign up", value: "signup", disabled: false },
					{ title: "Forgot your password?", value: "forgot_password", disabled: true },
					{ title: "Quit", value: "quit", disabled: false }
				]
			};

		const answer = await prompt(loginMenu, {
			onCancel: cleanup,
			onSubmit: cleanup
		});

		// console.log(answer);

		const closeServer = require("../../app");

		switch (answer.loginMenu) {
		case "login":
			console.clear();
			enterCredentials(0);
			break;
				
		case "signup":
			console.clear();
			signUp();
			break;
				
		case "forgot_password":
			console.log("Forgot your password....");
			console.clear();
			passwordRecover();
			break;
				
		case "quit":
			// Exit program
			try {
				console.clear();
				closeServer();
			} catch (error) {
				console.log(error);
			}
			process.exit();
			break;
		}
	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = loginMenu;
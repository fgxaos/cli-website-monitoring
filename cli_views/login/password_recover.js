"use strict";

/*
TODO list: 
    1\ Get email address
    2\ Check if the email address already exists in the DB
    3\ Create temporary password (save password in DB + creation time)
    4\ Send email to email address with temporary password
    5\ Ask the user to enter the password in the CLI
    6\ Check if the password was given less than an hour ago
    7\ If yes, let the user change the password
    8\ Redirect the user to login
*/

const prompt = require("prompts");

let interval;


function requestPassword () {
	(async function() {
		const main_menu =
			{
				type: "select",
				name: "login_menu",
				message: "What do you want to do?",
				choices: [
					{ title: "Log in", value: "login", disabled: false },
					{ title: "Forgot your password?", value: "forgot_password", disabled: false },
					{ title: "Quit", value: "quit", disabled: false }
				]
			};

		const answer = await prompt(main_menu, {
			onCancel: cleanup,
			onSubmit: cleanup
		});
		switch (main_menu) {
			case "login":
				console.log("Log in");
				// Start `enter_credentials.js`
				break;
				
			case "forgot_password":
				console.log("Forgot your password....");
				// Start `password_recover.js`
				break;
				
			case "Quit":
				console.log("I quit!");
				// Exit program
				break;
		}
	})();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = requestPassword;
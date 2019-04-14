/*
TODO list: 
    - Change username (if the username isn't already taken)
    - Change password (check that the password is correct)
    - Set/change an email address to send an email with the password to this address
*/

// Libraries
const prompt = require("prompts");


let interval;

function launchSettingsMenu () {

    // Modules
    const globalViewMenu = require("../global_view.js");

	(async function () {
		const settingsMenu = 
        {      	
        	type: "select",
        	name: "settingsMenu",
        	message: "What do you want to do?",
        	choices: [
        		{ title: "Change username", value: "changeUsername", disabled: false }, 
        		{ title: "Change password", value: "changePassword", disabled: false },
        		{ title: "Set email address", value: "email", disabled: false},
        		{ title: "Go back", value: "back", disabled: false}
        	]
        };
        
		const answer = await prompt(settingsMenu, {
			onCancel: cleanup,
			onSubmit: cleanup
		});
		switch (answer.settingsMenu) {
		case "changeUsername":
			console.log("Change username");
			break;

		case "changePassword": 
			console.log("Change password");
			break;
            
		case "email":
			console.log("Set email address");
			break;
            
		case "back":
            console.log("Go back");
            console.clear();
			globalViewMenu();
			break;
		}
	})();
}

function cleanup() {
    clearInterval(interval)
}

module.exports = launchSettingsMenu;
const userService = require("../users/userService");
const jwt_decode = require("jwt-decode");
const prompt = require("prompts");

let interval;

let displayLogs = async function (token) {
	const globalViewMenu = require("./global_view");

	let userID = jwt_decode(token).sub;
	let listLogs = await userService.getListLogs(userID);
	listLogs.map(logLine => {
		let isUpMessage = logLine.split(" ")[3];
		if (isUpMessage === "up") {
			console.log("\x1b[32m", logLine);
		} else {
			console.log("\x1b[31m", logLine);
		}
	});
    
	// Display "Back button"
	const displayBackButton =
    {
    	type: "confirm",
    	name: "goBack",
    	message: "Do you want to go back?",
    	validate: value => (value == "y" ? true : "To continue, press y")
    };

	const answer = await prompt(displayBackButton, {
		onCancel: cleanup,
		onSubmit: cleanup
	});

	if (answer.goBack === true) {
		console.clear();
		globalViewMenu(token);
	} else {
		console.clear();
		displayLogs(token);
	}
};


function cleanup() {
	clearInterval(interval);
}

module.exports = displayLogs;
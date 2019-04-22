const userService = require("../users/userService");

async function defineRules (monitor) {
	let userID = await userService.getUserID(monitor.name);

	global[monitor.name].on("alertDown", function (website, averageAvailability, timeNow) {
		// Add a line to the logs: site is down
		userService.addNewLineLog(userID, `Website ${website} is down. Availability = ${averageAvailability}, time = ${timeNow}`);
	});

	global[monitor.name].on("alertUp", function (website, averageAvailability, timeNow) {
		// Add a line to the logs: site is up again
		userService.addNewLineLog(userID, `Website ${website} is up again. Availability = ${averageAvailability}, time = ${timeNow}`);
	});
		
	global[monitor.name].on("stop", function (website) {
		console.log(website + " monitor has stopped. ");
	});
		
	global[monitor.name].on("error", function (error) {
		console.log(error);
	});
}

module.exports = defineRules;
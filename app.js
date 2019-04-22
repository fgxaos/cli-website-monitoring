// Modules
const loginScreen = require("./cli_views/login/login");

//require("rootpath")();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("./users/_helpers/jwt");
const errorHandler = require("./users/_helpers/errorHandler");
const CLI = require("clui");
const Spinner = CLI.Spinner;
const userService = require("./users/userService");
const Monitor = require("./compute_statistics/monitor");
const alertRules = require("./compute_statistics/alert_rules");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Use JWT auth to secure the api
app.use(jwt());

// API routes
// app.use("/users", require("./users/userController"));

// Global error handler
app.use(errorHandler);

// Start server
const port = process.env.NODE_ENV === "production" ? (process.env.PORT || 80) : 4000;
const server = app.listen(port, function () {
});


// Start the background monitoring process
async function startMonitors () {
	// Start loading spinner
	let loadingSpinner = new Spinner("Loading: Starting monitoring", ["⣾","⣽","⣻","⢿","⡿","⣟","⣯","⣷"]);
	loadingSpinner.start();

	// Get all the monitors
	let listMonitors = await userService.getAllMonitors();

	// Start all of them to get data in real time
	await listMonitors.map(monitor => {
		let newMonitor = {
			website: monitor.website_url,
			title: monitor.website_url,
			interval: monitor.checkTimeInterval,
			name: monitor.name
		};

		global[monitor.name] = new Monitor(newMonitor);
		alertRules(global[monitor.name]);

	});

	// Display loginScreen and stop loading spinner
	loadingSpinner.stop();
	loginScreen();
}

startMonitors();


function closeServer () {
	server.close(() => {
		console.log("Process terminated");
	});
}

module.exports = closeServer;

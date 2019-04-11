// Modules
const loginScreen = require("./cli_views/login/login");

//require("rootpath")();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("./users/_helpers/jwt");
const errorHandler = require("./users/_helpers/errorHandler");

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
	console.log("Server listening on port " + port);
});

loginScreen();

function closeServer () {
	server.close(() => {
		console.log('Process terminated');
	});
}

module.exports = closeServer;

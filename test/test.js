const userController = require("../users/userController");
const userService = require("../users/userService");

// Create a new user
let testUser = {
	username: "test4test",
	password: "stillBidon",
	firstName: "John",
	lastName: "Doe",
	email: "jd@gmail.com"
};

userController.register(testUser);

// This user monitors https://www.google.fr
userService.addMonitoredWebsite(testUser._id, {
	website_url: "https://www.google.fr",
	checkTimeInterval: 1000
});

// False data has been entered: 30 "false" in the timeline
userService.testAddDownEvents(testUser.id);

// Let it go

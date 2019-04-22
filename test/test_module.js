const Monitor = require("../compute_statistics/monitor");

const myMonitor1 = new Monitor({
	website: "https://www.datadoghq.com/",
	title: "Datadog",
	interval: 500
});


const myMonitor2 = new Monitor({
	website: "https://www.google.fr",
	title: "Google",
	interval: 1000
});

myMonitor1.on("up", function(res) {
	console.log(res.website + " is up!");
});

myMonitor1.on("down", function(res) {
	console.log(res.website + " is down!");
});

myMonitor1.on("stop", function (website) {
	console.log(website + " monitor has stopped. ");
});

myMonitor1.on("error", function (error) {
	console.log(error);
});

myMonitor2.on("up", function(res) {
	console.log(res.website + " is up!");
});

myMonitor2.on("down", function(res) {
	console.log(res.website + " is down!");
});

myMonitor2.on("stop", function (website) {
	console.log(website + " monitor has stopped. ");
});

myMonitor2.on("error", function (error) {
	console.log(error);
});
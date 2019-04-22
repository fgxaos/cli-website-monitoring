const util = require("util");
const EventEmitter = require("events").EventEmitter;
const httpMonitor = require("./http");
const tcpMonitor = require("./tcp");
const utils = require("./utils");

function Monitor(options, state) {
	EventEmitter.call(this);
	this.id = null;
	this.created_at = null;
	this.title = "";
	this.name = "";
	this.method = "GET";
	this.consecutiveDowns = 0;
	this.consecutiveUps = 0;
	this.alertedDown = false;
	this.website = null;
	this.address = null;
	this.host = null;
	this.interval = 5;
	this.port = null;
	this.handle = null;
	this.active = true;
	this.isUp = true;
	this.totalRequests = 0;
	this.totalDownTimes = 0;
	this.lastDownTime = null;
	this.lastRequest = null;
	this.httpOptions = {};
	this.expect = {
		statusCode: 200
	};
	// TODO: Monitoring variables
	// this.availability = (this.totalRequests - this.totalDownTimes) / this.totalRequests;

	// Initialize the app
	this.init(options, state);
	return this;
}

// Inherit from EventEmitter
util.inherits(Monitor, EventEmitter);

Monitor.prototype.init = function(options, state) {
	this.setProperties(options, state);

	if (!this.active) {
		// Monitor not active
		return console.log(`${this.title} monitor is off`);
	}

	if (!this.website && !this.address) {
		// Website not specified
		return this.emit(
			"error",
			new Error("You did not specify a website to monitor")
		);
	} else if (this.website && this.address) {
		return this.emit(
			"error",
			new Error("You can only specify either a website, or a TCP address")
		);
	}

	// Start monitoring
	if (this.website) {
		this.start("http");
	} else {
		this.start("tcp");
	}
};

Monitor.prototype.setProperties = function(options, state) {
	const defaultState = this.getState();
	const currentState = Object.assign(defaultState, options, state || {});

	currentState.host = currentState.website || currentState.address;

	if (!currentState.created_at) {
		currentState.created_at = Date.now();
	}
	this.setState(currentState);
};

Monitor.prototype.setState = function(state) {
	Object.keys(state).forEach(key => {
		this[key] = state[key];
	});
};

Monitor.prototype.getState = function() {
	return {
		id: this.id,
		title: this.title,
		created_at: this.created_at,
		isUp: this.isUp,
		website: this.website,
		address: this.address,
		host: this.host,
		port: this.port,
		totalRequests: this.totalRequests,
		totalDownTimes: this.totalDownTimes,
		lastDownTime: this.lastDownTime,
		lastRequest: this.lastRequest,
		interval: this.interval,
		active: this.active,
		httpOptions: this.httpOptions,
		expect: this.expect
	};
};

Monitor.prototype.start = function (method) {
	let host = this.website || this.address + ":" + this.port;
	let startTime = utils.getFormatedDate();

	const INTERVAL = this.interval;

	// console.log(`\nMonitoring: ${host}\nTime: ${startTime}\n`);

	if (method === "http") {
		// Create an interval for pings
		this.handle = setInterval(() => {
			this.pingHTTP();
		}, INTERVAL);
	}
	else {
		// Create an interval for pings
		this.handle = setInterval(() => {
			this.pingTCP();
		}, INTERVAL);
	}
};

Monitor.prototype.restart = function () {
	if (this.website) {
		this.start("http");
	} else {
		this.start("tcp");
	}
	this.active = true;
	return this;
};

Monitor.prototype.pingHTTP = function () {
	this.totalRequests += 1;
	this.lastRequest = Date.now();

	const options = {
		website: this.website,
		method: this.method,
		httpOptions: this.httpOptions
	};

	process.nextTick(() => {
		httpMonitor(options, async (error, data, res) => {
			if (res.statusCode == 200 || res.statusCode == 302 || res.statusCode == this.expect.statusCode) {
				this.isUp = true;
			} else {
				this.isUp = false;
				this.lastDownTime = Date.now();
				this.totalDownTimes += 1;
			}

			data.error = error;

			// Save this new in the DB
			// An hour need to be saved there
			const userService = require("../users/userService");
			userService.updateMonitorHistory(this.name, this.website, this.isUp, this.interval);
			userService.updateResponseTime(this.name, this.website, data.responseTime, this.interval);

			// Compute availability over the last 2 minutes
			let averageAvailability = await userService.computeAvailability(this, 2 * 60 * 1000);
			if (averageAvailability < 0.8 && this.consecutiveDowns > (2 * 60 * 1000 / this.interval)) {
				// Raise alert: website down
				let currentDate = new Date();
				this.emit("alertDown", this.website, this.averageAvailability, currentDate);
				this.alertedDown = true;
				this.consecutiveDowns = 0;
			} else if (averageAvailability > 0.8 && this.consecutiveUps > (2 * 60 * 1000 / this.interval)) {
				// Raise alert: website back up
				let currentDate = new Date();
				this.emit("alertUp", this.website, this.averageAvailability, currentDate);
				this.alertedDown = false;
				this.consecutiveUps = 0;
			} else if (averageAvailability > 0.8 && this.alertedDown === true) {
				this.consecutiveDowns = 0;
				this.consecutiveUps = this.consecutiveUps + 1;
			} else if (averageAvailability < 0.8 && this.alertedDown === false) {
				this.consecutiveDowns = this.consecutiveDowns + 1;
				this.consecutiveUps = 0;
			}

			this.response(this.isUp, res.statusCode, data);
		});
	});
};

Monitor.prototype.pingTCP = function () {
	this.totalRequests += 1;
	this.lastRequest = Date.now();

	process.nextTick(() => {
		tcpMonitor({
			address: this.address,
			port: this.port
		}, (error, data) => {
			if (error) {
				this.isUp = false;
				this.lastDownTime = Date.now();
				this.totalDownTimes += 1;

				data.error = error;

				this.response(this.isUp, 500, data);
			}
		});
	});
};


Monitor.prototype.response = function (isUp, statusCode, data) {
	let responseData = utils.responseData(statusCode, this.website, data.responseTime, this.address, this.port);

	if (isUp) {
		this.emit("up", responseData, this.getState());
	} else {
		this.emit("down", responseData, this.getState());
	}
};

module.exports = Monitor;
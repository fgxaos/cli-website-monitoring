/*
TODO: Should we add functions to change email address + lastPasswordReset ?
*/

const config = require("../config/config.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("./_helpers/db");
const User = db.User;
const deepEqual = require("deep-equal");

const Monitor = require("../compute_statistics/monitor");

async function authenticate ({ username, password }) {
	const user = await User.findOne({ username });
	if (user && bcrypt.compareSync(password, user.hash)) {
		const { hash, ...userWithoutHash } = user.toObject();
		const token = jwt.sign({ sub: user.id }, config.secret);
		return {
			...userWithoutHash,
			token
		};
	}
}

async function getAll () {
	return await User.find().select("-hash");
}

async function getById (id) {
	return await User.findById(id).select("-hash");
}

async function create (userParam) {
	// Check if the username exists
	if (await User.findOne({ username: userParam.username })) {
		throw "Username " + userParam.username + " is already taken";
	}

	const user = new User(userParam);

	// Hash password
	if (userParam.password) {
		user.hash = bcrypt.hashSync(userParam.password, 10);
	}

	// Save user
	await user.save();
}

async function update (id, userParam) {
	const user = await User.findById(id);

	// Validate
	if (!user) throw "User not found";
	if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
		throw "Username " + userParam.username + " is already taken";
	}

	// Hash password if it was entered
	if (userParam.password) {
		userParam.hash = bcrypt.hashSync(userParam.password, 10);
	}

	// Copy userParam properties to user
	Object.assign(user, userParam);

	await user.save();
}

async function addMonitoredWebsite (id, monitoredWebsite) {
	const user = await User.findById(id);
	console.log("ID: ", id);
	let changed = false;
	console.log("USER: ", user);
	// Get previous monitored websites
	let prevMonitored = user.monitoredWebsites;

	// Check if the website is already monitored
	let prevWebsite = prevMonitored.filter(object => object.website_url === monitoredWebsite.website_url);
	if (prevWebsite.length > 0) {
		let prevWebCheckTime = prevWebsite.filter(object => object.checkTimeInterval === monitoredWebsite.checkTimeInterval);
		if (prevWebCheckTime.length === 0) {
			// If the check intervals are not the same, build two different objects
			prevMonitored.push(monitoredWebsite);
			user.historyMonitored.push({
				websiteName: monitoredWebsite.website_url,
				timeline: []
			});
			changed = true;
			// Note: To change stats, use a different menu
		} 
	} 
	else {
		prevMonitored.push(monitoredWebsite);
		user.historyMonitored.push({
			websiteName: monitoredWebsite.website_url,
			timeline: []
		});
		user.responseTimeHistory.push({
			websiteName: monitoredWebsite.website_url,
			timeline: []
		});
		changed = true;
	}

	// Add the new monitor to the list of active monitors
	let newMonitor = {
		name: user.username + "_" + user.monitoredWebsites.indexOf(monitoredWebsite),
		website: monitoredWebsite.website_url,
		title: monitoredWebsite.website_url,
		interval: monitoredWebsite.checkTimeInterval
	};
	global[newMonitor.name] = new Monitor(newMonitor);
	// TODO: Define alerts on the new monitor: 
	/*
	global[newMonitor.name].on("up", function(res, state) {
		console.log("Yay, " + res.website + " is up!");
	});
	
	global[newMonitor.name].on("down", function(res) {
		console.log("Top 10 sad stories for " + res.website + " ! " + res.statusMessage);
	});
	
	global[newMonitor.name].on("stop", function (website) {
		console.log(website + " monitor has stopped. ");
	});
	
	global[newMonitor.name].on("error", function (error) {
		console.log(error);
	});
	*/
	// Save
	user.save();
	return changed;
}

async function getMonitoredWebsites (id) {
	const user = await User.findById(id);
	return user.monitoredWebsites;
}

async function removeMonitoredWebsite (id, monitoredWebsite) {
	const user = await User.findById(id);
	// Get monitored websites
	let prevMonitored = user.monitoredWebsites;
	let prevHistoryMonitored = user.historyMonitored;

	// Remove monitored websites from the launched ones
	/*
	let monitorName = user.username + "_" + user.monitoredWebsites.indexOf(monitoredWebsite);
	console.log("MONITOR NAME: ", )
	global[monitorName].active = false;
	*/

	// Remove monitored website from list, if it exists
	prevMonitored = prevMonitored.filter(monitorObj => !deepEqual(monitorObj, monitoredWebsite));
	prevHistoryMonitored = prevHistoryMonitored.filter(monitorHist => monitorHist.websiteName !== monitoredWebsite.website_url);

	user.monitoredWebsites = prevMonitored;
	user.prevHistoryMonitored = prevHistoryMonitored;

	user.save();
}

async function _delete (id) {
	await User.findByIdAndRemove(id);
}


async function getAllMonitors () {
	let usersList = await getAll();
	let monitorsList = [];
	await usersList.map(user => {
		user.monitoredWebsites.map(webItem => {
			webItem.name = user.username + "_" + user.monitoredWebsites.indexOf(webItem);
			monitorsList.push(webItem);
		});
	});
	return monitorsList;
}

async function getAllMonitorsUser (userID) {
	let user = await User.findById(userID);
	let monitorsList = [];
	user.monitoredWebsites.map(webItem => {
		webItem.name = user.username + "_" + user.monitoredWebsites.indexOf(webItem);
		monitorsList.push(webItem);
	});
	return monitorsList;
}

async function getUserID (monitorName) {
	let userMonitorName = monitorName.split("_")[0];
	return await User.find({ username: userMonitorName }, function (err, user) {
		if (err) throw err;
		return user[0]._id;
	});
}

async function updateMonitorHistory (monitorName, monitoredWebsite, isUp, checkTimeInterval) {
	let userID = await getUserID(monitorName);
	let user = await User.findById(userID);

	if (user) {
		let indexSelected = user.monitoredWebsites.findIndex(element => element.website_url === monitoredWebsite);
		if (indexSelected > -1) {
			// Push the new value
			user.historyMonitored[indexSelected].timeline.push(isUp);
			if (user.historyMonitored[indexSelected].timeline.length > parseInt(60 * 60 * 1000 / checkTimeInterval) + 1) {
				// Remove the last value, so the first one in the list
				user.historyMonitored[indexSelected].timeline.shift();
			}
			// Update the values

			
			// Save the new DB
			user.save();
		}
	}
}

async function updateResponseTime(monitorName, monitoredWebsite, responseTime, checkTimeInterval) {
	let userID = await getUserID(monitorName);
	let user = await User.findById(userID);

	if (user) {
		let indexSelected = user.monitoredWebsites.findIndex(element => element.website_url === monitoredWebsite);
		if (indexSelected > -1) {
			// Push the new value
			user.responseTimeHistory[indexSelected].timeline.push(responseTime);
			if (user.responseTimeHistory[indexSelected].timeline.length > parseInt(60 * 60 * 1000 / checkTimeInterval) + 1) {
				// Remove the last value, so the first one is in the list
				user.responseTimeHistory[indexSelected].timeline.shift();
			}
			// Update the values

			// Save the new DB
			user.save();
		}
	}
}

async function getStatHistory (userID, monitorIndex, timeTotal) {
	let user = await User.findById(userID);
	try {
		// Get the timeline
		let userTimelineUp = user.historyMonitored[monitorIndex].timeline;
		let userTimelineResponseTime = user.responseTimeHistory[monitorIndex].timeline;
		let checkTimeInterval = user.monitoredWebsites[monitorIndex].checkTimeInterval;

		// Gather the needed number of stats
		let numberStatsNeeded = parseInt(timeTotal / checkTimeInterval);
		let numberItemsMaxUp = userTimelineUp.length;
		// Only take the minimum of the maximum number possible, and the number of points available
		let numberItemsUp = Math.min(numberItemsMaxUp, numberStatsNeeded);

		let numberItemsMaxResponse = userTimelineResponseTime.length;
		let numberItemsResponse = Math.min(numberItemsMaxResponse, userTimelineResponseTime.length); 

		let dataUp = userTimelineUp.slice(numberItemsUp - numberStatsNeeded, numberItemsUp);
		let dataResponse = userTimelineResponseTime.slice(numberItemsResponse - numberStatsNeeded, numberItemsResponse);
		return { 
			yValuesUp: dataUp, 
			yValuesResponseTime: dataResponse,
			interval: checkTimeInterval 
		};
	} catch (error) {
		console.log("ERROR: ", error);
	}
}


async function computeAvailability(monitor, timeInterval) {
	let username = monitor.name.split("_")[0];
	let userID = await getUserID(monitor.name);
	let user = await User.findById(userID);

	if (user) {
		let indexMonitor = monitor.name.split("_")[1];
		let listUps = user.historyMonitored[parseInt(indexMonitor)].timeline;
		let checkTimeInterval = user.monitoredWebsites[parseInt(indexMonitor)].checkTimeInterval;

		// Gather the needed number of stats
		let numberStatsNeeded = parseInt(timeInterval / checkTimeInterval);
		let numberItemsMaxUp = listUps.length;
		// Only take the minimum of the maximum number possible, and the number of points available
		let numberItemsUp = Math.min(numberItemsMaxUp, numberStatsNeeded);

		let dataUp = listUps.slice(numberItemsUp - numberStatsNeeded, numberItemsUp);
		let countUps = 0;
		await dataUp.map(element => {
			if (element === true) {
				countUps = countUps + 1;
			}
		});
		return countUps / numberItemsUp;
	}
}


async function getMonitoredObject (userID, monitorName) {
	let user = await User.findById(userID);
	let indexMonitor = monitorName.split("_")[1];
	return user.monitoredWebsites[indexMonitor];
}

async function addNewLineLog (userID, text) {
	let user = await User.findById(userID);
	user.logs.push(text);
	user.save();
}

async function getListLogs (userID) {
	let user = await User.findById(userID);
	return user.logs;
}

async function testAddDownEvents (userID) {
	let user = await User.findById(userID);
	for (let i = 0 ; i < 30 ; i++) {
		user.historyMonitored[0].timeline.push(false);
	}
	user.save();
}


module.exports = {
	authenticate, 
	getAll, 
	getById,
	create,
	update,
	delete: _delete,
	addMonitoredWebsite,
	getMonitoredWebsites,
	removeMonitoredWebsite,
	getAllMonitors,
	getAllMonitorsUser,
	updateMonitorHistory,
	getStatHistory,
	getMonitoredObject,
	updateResponseTime,
	computeAvailability,
	addNewLineLog,
	getListLogs, 
	getUserID,
	testAddDownEvents
};
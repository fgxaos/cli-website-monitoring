/*
TODO: Should we add functions to change email address + lastPasswordReset ?
*/

const config = require("../config/config.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("./_helpers/db");
const User = db.User;

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
	let changed = false;
	// Get previous monitored websites
	let prevMonitored = user.monitoredWebsites;
	// Check if the website is already monitored
	let prevWebsite = prevMonitored.filter(object => object.website_url === monitoredWebsite.website_url);
	if (prevWebsite.length > 0) {
		let prevWebCheckTime = prevWebsite.filter(object => object.checkTimeInterval === monitoredWebsite.checkTimeInterval);
		if (prevWebCheckTime.length === 0) {
			// If the check intervals are not the same, build two different objects
			prevMonitored.push(monitoredWebsite);
			changed = true;
			// Note: To change stats, use a different menu
		} 
	} 
	else {
		prevMonitored.push(monitoredWebsite);
		changed = true;
	}
	// Save
	user.save();
	return changed;
}

async function _delete (id) {
	await User.findByIdAndRemove(id);
}

module.exports = {
	authenticate, 
	getAll, 
	getById,
	create,
	update,
	delete: _delete,
	addMonitoredWebsite
};
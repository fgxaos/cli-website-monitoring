"use strict";

const statusCodes = require("http").STATUS_CODES;

function getFormatedDate () {
	let currentDate = new Date();

	currentDate =  currentDate.toISOString();
	currentDate = currentDate.replace(/T/, " ");
	currentDate = currentDate.replace(/\...+/, "");

	return currentDate;
}

function responseData (statusCode, website, responseTime, address, port) {
	let data = {
		time: responseTime, 
		statusCode: statusCode,
		statusMessage: statusCodes[statusCode],
		website: website,
		responseTime: responseTime,
		address: address, 
		port: port
	};
	return data;
}

module.exports = {
	getFormatedDate,
	responseData
};
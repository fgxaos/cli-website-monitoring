"use strict";
const http = require("http");
const https = require("https");
const url = require("url");
const NS_PER_SEC = 1e9;

module.exports = function (opts, callback) {
	const options = Object.assign(url.parse(opts.website), opts.httpOptions);
	let req;
	let startTime = process.hrtime();

	if (opts.website.indexOf("https:") === 0) {
		req = https.request(options, (res) => {
			let diff = process.hrtime(startTime);
			let responseTime = (diff[0] * NS_PER_SEC + diff[1]) / 1e6;

			let data = {
				website: opts.website,
				responseTime: responseTime
			};

			callback(false, data, res);
		});
	} else {
		req = http.request(options, (res) => {
			let diff = process.hrtime(startTime);
			let responseTime = (diff[0] * NS_PER_SEC + diff[1]) / 1e6;

			let data = {
				website: opts.website,
				responseTime: responseTime
			};

			callback(false, data, res);
		});
	}

	req.on("error", (err) => {
		let diff = process.hrtime(startTime);
		let responseTime = (diff[0] * NS_PER_SEC + diff[1]) / 1e6;

		let data = {
			website: opts.website, 
			responseTime: responseTime
		};

		callback(err, data, {
			statusCode: 500
		});
	});

	req.end();
};
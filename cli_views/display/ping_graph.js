const babar = require("babar");
const userService = require("../../users/userService");
const jwt_decode = require("jwt-decode");

async function displayGraph (token, monitorObject, overTime) {
	let displayDate = Date.now();
	let userID = jwt_decode(token).sub;
	let monitorIndex = monitorObject.split("_")[1];
	let result = await userService.getStatHistory(userID, monitorIndex, overTime);
	let yValuesUp = result.yValuesUp;
	let yValuesResponseTime = result.yValuesResponseTime;
	let xTimeValues = [];
    

	let countUp = 0;

	for (let i = yValuesUp.length ; i > 0 ; i--) {
		let datePoint = displayDate - i * result.interval;
		xTimeValues.push(new Date(+datePoint));
		if (yValuesUp[i] === true) {
			countUp = countUp + 1;
		}
	}
	let points = [];
	let pointsResponseTime = [];
	for (let i = 0 ; i < yValuesUp.length ; i++) {
		points.push([xTimeValues[i], yValuesUp[i]]);
		pointsResponseTime.push([xTimeValues[i], yValuesResponseTime[i]]);
	}


	return { 
		graphUp: babar(points, {
			color: "green"
		}),
		graphResponseTime: babar(pointsResponseTime, {
			color: "blue"
		}),
		totalUp: countUp,
		totalRequests: yValuesUp.length
	};
}

module.exports = displayGraph;
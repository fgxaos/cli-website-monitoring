const computePingGraph = require("./ping_graph");
const delay = require("delay");
const userService = require("../../users/userService");
const jwt_decode = require("jwt-decode");

const prompt = require("prompts");

let interval;

async function showPingGraph (token, monitorName, completed) {
	const displayMenu = require("./display_menu");
	if (!completed) {
		// Graph over the last 10 minutes
		let stats10Minutes = await computePingGraph(token, monitorName, 2 * 60 * 1000);
		// let pingGraph10Minutes = stats10Minutes.graph;
	    // Graph over the last hour
	    let statsHour = await computePingGraph(token, monitorName, 60 * 60 * 1000);

        console.log("*** AVAILABILITY GRAPHS ***");
		console.log("Last 10 minutes");
		console.log(stats10Minutes.graphUp);
		console.log("Last hour");
        console.log(statsHour.graphUp);
        
        console.log("*** RESPONSE TIME GRAPHS ***");
        console.log("Last 10 minutes");
        console.log(stats10Minutes.graphResponseTime);
        console.log("Last hour");
        console.log(statsHour.graphResponseTime);
        
        
        let availability10Minutes = stats10Minutes.totalUp / stats10Minutes.totalRequests;
        
		let availabilityHour = statsHour.totalUp / statsHour.totalRequests;

		console.log("AVAILABILITY LAST 10 MINUTES: ", availability10Minutes);
        console.log("AVAILABILITY LAST HOUR: ", availabilityHour);
        


		return delay(10000).then(() => {
			// Reset the page
            console.clear();
            console.log("****************************");
			showPingGraph (token, monitorName, false);
		});
	} else {
		console.clear();
		displayMenu(token);
	}
    
	// Display "Back button"
	const displayBackButton =
    {
    	type: "toggle",
    	name: "goBack",
    	message: "Do you want to go back?",
    };

	const answer = await prompt(displayBackButton, {
		onCancel: cleanup,
		onSubmit: cleanup
	});

	if (answer.goBack === true) {
		completed = true;
	}
}


function cleanup() {
	clearInterval(interval);
}

module.exports = showPingGraph;
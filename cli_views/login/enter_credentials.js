"use strict";

/*
TODO list
    - Get username (accept only if the username exists)
    - Get password (accept only if it's correct)
        => Possible improvement: restrain access if more than 5 mistakes
    - If everything's alright, go to `global_view.js` and keep in mind the username
*/

const prompt = require("prompts");

let interval;

function credentialsInfo () {
    (async function () {
        const questions = [
            {
                type: "text",
                name: "username",
                message: "Username:",
                initial: "username"
            },
            {
                type: "password",
                name: "password",
                message: "Password: "
            }
        ];

        const answers = await prompt(questions, {
            onCancel: cleanup,
            onSubmit: cleanup
            // When you have the username and the password, check in the database if those are correct

        });
        console.log(answers);
    })();
}

function cleanup() {
	clearInterval(interval);
}

module.exports = credentialsInfo;
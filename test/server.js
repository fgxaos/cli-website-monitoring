const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req, res) => res.sendStatus(200).send("Hello World!"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
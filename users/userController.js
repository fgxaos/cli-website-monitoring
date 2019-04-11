/*
TODO: Add functions to update email + lastPasswordReset
*/

// const express = require("express");
// const router = express.Router();
const userService = require("./userService");

/*
// Routes
router.post("/authenticate", authenticate);
router.post("/register", register);
router.get("/", getAll);
router.get("/current", getCurrent);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", _delete);

module.exports = router;
*/
module.exports = {
	authenticate, 
	register,
	getAll,
	getCurrent,
	getById,
	update,
	_delete
};

async function authenticate(req) {
	let tryAuth = await userService.authenticate(req);
	if (tryAuth) {
		return true;
	} else {
		return false;
	}
}

function register(res) {
	userService
		.create(res)
		.catch(err => console.log(err));
}

function getAll (req, res, next) {
	userService.getAll()
		.then(users => res.json(users))
		.catch(err => next(err));
}

function getCurrent (req, res, next) {
	userService.getById(req.user.sub)
		.then(user => user ? res.json(user) : res.sendStatus(404))
		.catch(err => next(err));
}

function getById (req, res, next) {
	userService.getById(req.params.id)
		.then(user => user ? res.json(user) : res.sendStatus(404))
		.catch(err => next(err));
}

function update (req, res, next) {
	userService.update(req.params.id, req.body) 
		.then(() => res.json({}))
		.catch(err => next(err));
}

function _delete (req, res, next) {
	userService.delete(req.params.id)
		.then(() => res.json({}))
		.catch(err => next(err));
}

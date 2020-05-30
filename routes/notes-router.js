const { User, Note } = require("../models");
const isAuth = require("../middleware/isAuth");

module.exports = (app) => {
	app.get("/api/notes", isAuth, async (req, res) => {
		try {
			let notes = await Note.findAll({
				where: {
					UserId: req.user.id
				}
            });
            if (notes) res.json(notes).end();
            else res.json({}).end();
		} catch (error) {
			console.log(error);
			res.send("Server error.").end();
		}
	});
	// Notes by ID
	app.get("/api/notes/:id", isAuth, async (req, res) => {
		let note = await Note.findOne({
			where: {
				UserId: req.user.id
			}
		});
		res.json(note).end();
	});
	// POST
	app.post("/api/notes", isAuth, async ({ body, user }, res) => {
		let note = await Note.create({
            UserId: user.id,
			title: body.title,
			body: body.body
		});
		res.json(note).end();
	});
	app.put("/api/notes/:id", isAuth, async (req, res) => {
		let note = await Note.update(req.body, {
			where: {
				id: req.params.id
			}
		});
		res.json(note).end();
	});
	// DELETE
	app.delete("/api/notes/:id", isAuth, async (req, res) => {
		let note = await Note.destroy({
			where: {
				id: req.params.id
			}
		});
		res.json(note).end();
	});
};

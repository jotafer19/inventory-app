const { Router } = require("express");
const genresController = require("../controllers/genresController");
const router = Router();

router.get("/", genresController.genresGet);
router.get("/:id", genresController.gamesPerGenreGet);

module.exports = router;

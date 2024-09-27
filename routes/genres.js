const { Router } = require("express");
const genresController = require("../controllers/genresController");
const router = Router();

router.get("/", genresController.genresGet);
router.get("/new", genresController.createGenreGet);
router.post("/new", genresController.createGenrePost);
router.get("/:id", genresController.gamesPerGenreGet);
router.delete("/:id", genresController.genreDelete);
router.get("/:id/edit", genresController.editGenreGet)
router.put("/:id/edit", genresController.editGenrePut)

module.exports = router;

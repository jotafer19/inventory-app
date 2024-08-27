const { Router } = require("express");
const gamesController = require("../controllers/gamesController");
const router = Router();

router.get("/", gamesController.gamesGet);
router.get("/new", gamesController.newGameGet)
router.post("/new", gamesController.newGamePost)

module.exports = router;

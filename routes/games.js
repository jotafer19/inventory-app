const { Router } = require("express");
const gamesController = require("../controllers/gamesController");
const router = Router();

router.get("/", gamesController.gamesGet);
router.get("/:id", gamesController.idGameGet);
router.get("/new", gamesController.createGameGet);
router.post("/new", gamesController.createGamePost);

module.exports = router;

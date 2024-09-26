const { Router } = require("express");
const gamesController = require("../controllers/gamesController");
const router = Router();

router.get("/", gamesController.gamesGet);
router.get("/new", gamesController.createGameGet);
router.post("/new", gamesController.createGamePost);
router.get("/:id", gamesController.idGameGet);
router.delete("/:id", gamesController.gameDelete);
router.get("/:id/edit", gamesController.editGameGet);
router.put("/:id/edit", gamesController.editGamePut)

module.exports = router;

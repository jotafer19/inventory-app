const {Router} = require("express")
const developersController = require("../controllers/developersController")
const router = Router()

router.get("/", developersController.developersGet)
router.get("/:id", developersController.gamesPerDeveloperGet)

module.exports = router;
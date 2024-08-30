const {Router} = require("express")
const genresController = require("../controllers/genresController")
const router = Router()

router.use("/", genresController.genresGet)

module.exports = router;

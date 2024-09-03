const asyncHandler = require("express-async-handler")
const query = require("../db/query")

exports.developersGet = asyncHandler(async (req, res) => {
    const allDevelopers = await query.getAllDevelopers()
    console.log(allDevelopers)

    if (!allDevelopers) {
        throw new Error("Developers not found")
    }

    res.render("layout", {
        title: "Developers",
        view: "developers",
        tab: "developers",
        add: "developer",
        developers: allDevelopers
    })
})

exports.gamesPerDeveloperGet = asyncHandler(async (req, res) => {
    const developerId = req.params.id
    const gamesPerDeveloper = await query.getGamesByDevelopers(developerId)

    if (!gamesPerDeveloper) {
        throw new Error("Games not found")
    }

    res.render("layout", {
        title: `${gamesPerDeveloper[0].developer} games`,
        view: "games",
        tab: "developers",
        add: "game",
        games: gamesPerDeveloper
    })
})
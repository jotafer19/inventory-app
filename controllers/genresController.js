const asyncHandler = require("express-async-handler")
const query = require("../db/query")

exports.genresGet = asyncHandler(async (req, res) => {
    const allGenres = await query.getAllGenres()

    if (!allGenres) {
        throw new Error("Genres not found")
    }

    res.render("layout", {
        title: "Genres",
        view: "genres",
        tab: "genres",
        add: "genre",
        genres: allGenres
    })
})
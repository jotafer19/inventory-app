const asyncHandler = require("express-async-handler")
const query = require("../db/query");

exports.homeGet = asyncHandler(async (req, res) => {
  const featuredGames = await query.getFeaturedGames();
  const featuredGenres = await query.getFeaturedGenres();
  const featuredDevelopers = await query.getFeaturedDevelopers();

  if (!featuredGames || !featuredGenres || !featuredDevelopers) {
    throw new Error("Data not found")
  }

  res.render("layout", {
    title: "Home",
    view: "home",
    games: featuredGames,
    developers: featuredDevelopers,
    genres: featuredGenres,
  });
})

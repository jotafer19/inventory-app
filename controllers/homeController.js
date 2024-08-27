const query = require("../db/query");

exports.homeGet = async (req, res) => {
  const featuredGames = await query.getFeaturedGames();
  const featuredGenres = await query.getFeaturedGenres();
  const featuredDevelopers = await query.getFeaturedDevelopers();
  res.render("layout", {
    title: "Home",
    view: "home",
    games: featuredGames,
    developers: featuredDevelopers,
    genres: featuredGenres,
  });
};

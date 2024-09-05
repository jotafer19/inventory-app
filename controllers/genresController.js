const asyncHandler = require("express-async-handler");
const query = require("../db/query");

exports.genresGet = asyncHandler(async (req, res) => {
  const allGenres = await query.getAllGenres();

  if (!allGenres) {
    throw new Error("Genres not found");
  }

  res.render("layout", {
    title: "Genres",
    view: "genres",
    tab: "genres",
    add: "genre",
    genres: allGenres,
  });
});

exports.gamesPerGenreGet = asyncHandler(async (req, res) => {
  const genreId = req.params.id;
  const gamesByGenre = await query.getGamesByGenre(genreId);

  if (!gamesByGenre) {
    throw new Error("Games not found");
  }

  res.render("layout", {
    title: `${gamesByGenre[0].genre} games`,
    view: "games",
    tab: "genres",
    add: "game",
    games: gamesByGenre,
  });
});

const asyncHandler = require("express-async-handler");
const query = require("../db/query");

exports.gamesGet = asyncHandler(async (req, res) => {
  const allGames = await query.getAllGames();

  if (!allGames) {
    throw new Error("Games not found");
  }

  res.render("layout", {
    title: "Games",
    view: "games",
    tab: "games",
    add: "game",
    games: allGames,
  });
});

exports.idGameGet = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const requestedGame = await query.getGame(id);

  if (!requestedGame) {
    throw new Error("Game not found");
  }

  console.log(requestedGame);

  res.render("layout", {
    title: requestedGame.title,
    view: "gameItem",
    tab: "games",
    game: requestedGame,
  });
});

exports.createGameGet = (req, res) => {
  res.render("layout", {
    title: "New game",
    view: "createGame",
    tab: "games",
  });
};

exports.createGamePost = (req, res) => {
  const body = req.body;
  console.log(body);
  res.redirect("/games");
};

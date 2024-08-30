const asyncHandler = require("express-async-handler")
const query = require("../db/query");

exports.gamesGet = asyncHandler(async (req, res) => {
  const allGames = await query.getAllGames();

  if (!allGames) {
    throw new Error("Games not found")
  }
  
  res.render("layout", {
    title: "Games",
    view: "games",
    add: "game",
    games: allGames,
  });
})

exports.newGameGet = (req, res) => {
  res.render("layout", {
    title: "Add game",
    view: "createGame"
  })
}

exports.newGamePost = (req, res) => {
  const body = req.body;
  console.log(body)
  res.redirect("/")
}
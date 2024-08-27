const query = require("../db/query");

exports.gamesGet = async (req, res) => {
  const allGames = await query.getAllGames();
  console.log(allGames);
  res.render("layout", {
    title: "Games",
    view: "games",
    games: allGames,
  });
};

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
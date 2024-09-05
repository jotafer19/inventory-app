const asyncHandler = require("express-async-handler");
const path = require("node:path");
const multer = require("multer");
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

exports.createGamePost = asyncHandler(async (req, res) => {
  const { title, date, rating, description } = req.body;
  const imagePath = req.file ? `uploads/${req.file.filename}` : null;
  console.log(req.file);
  res.redirect("/games");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

exports.upload = upload.single("image");

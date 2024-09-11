const asyncHandler = require("express-async-handler");
const path = require("node:path");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
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

exports.createGameGet = asyncHandler(async (req, res) => {
  const allGenres = await query.getAllGenres();
  const allDevelopers = await query.getAllDevelopers();

  if (!allGenres || !allDevelopers) {
    throw new Error("Data not found");
  }

  res.render("layout", {
    title: "New game",
    view: "createGame",
    tab: "games",
    genres: allGenres,
    developers: allDevelopers,
  });
});

const validateGame = [
  body("title")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title must be less than 255 characters"),
  body("date")
    .trim()
    .notEmpty()
    .withMessage("Date is required")
    .isDate()
    .withMessage("Invalid date"),
  body("rating")
    .trim()
    .escape()
    .notEmpty()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating should be a float number between 1 and 5"),
  body("description").optional().trim().escape().isLength({ max: 500 }),
  body("genres")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Add at least one genre"),
  body("developers")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Add at least one developer"),
];

exports.createGamePost = [
  validateGame,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const allGenres = await query.getAllGenres();
    const allDevelopers = await query.getAllDevelopers();

    if (!errors.isEmpty()) {
      return res.status(400).render("layout", {
        title: "New game",
        view: "createGame",
        tab: "games",
        errors: errors.array(),
        genres: allGenres,
        developers: allDevelopers,
      });
    }
    const { title, date, rating, description, genres, developers } = req.body;
    const imagePath = req.file
      ? req.file.filename
      : "public/images/no_image.jpg";
    const arrGenres = genres.split(",").map((genre) => genre.trim());
    const arrDevelopers = developers
      .split(",")
      .map((developer) => developer.trim());

    await query.addGame(
      title,
      date,
      description,
      rating,
      imagePath,
      arrGenres,
      arrDevelopers,
    );
    res.redirect("/games");
  }),
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const fileTypes = /jpeg|jpg|png|webp/;
    const extName = fileTypes.test(
      path.extname(file.originalname).toLocaleLowerCase(),
    );
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb("Error: images only!");
    }
  },
});

exports.upload = upload.single("image");

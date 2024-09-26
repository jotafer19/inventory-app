const asyncHandler = require("express-async-handler");
const path = require("node:path");
const multer = require("multer");
const fs = require("fs");
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/games");
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

const validateGame = [
  body("title")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title must be less than 255 characters")
    .custom(async (name, {req}) => {
      // skip duplication check when editing games
      const game = await query.getGame(req.params.id)
      if (game && game.title.toLowerCase() === name.toLowerCase()) {
        return true;
      }
      // check duplication
      const allGames = await query.getAllGames();
      const isGameInDB = allGames.some(
        (item) => item.title.toLowerCase() === name.toLowerCase(),
      );

      if (isGameInDB) {
        throw new Error("Game already is in the database");
      }

      return true;
    }),
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
  body("description")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9'_\-.,!?@#$%^&*()+=\[\]{}|\\:;"\/~`\n\r ]*$/)
    .withMessage(
      "The field contains invalid characters (e.g., <, > are not allowed).",
    ),
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
  upload.single("image"),
  validateGame,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(`public/uploads/games/${req.file.filename}`, (err) => {
          if (err) console.log("Failed to delete file", err);
        });
      }

      const allGenres = await query.getAllGenres();
      const allDevelopers = await query.getAllDevelopers();

      if (!allGenres || !allDevelopers) {
        throw new Error("Data not found");
      }

      return res.status(400).render("layout", {
        title: "New game",
        view: "createGame",
        tab: "games",
        errors: errors.array(),
        genres: allGenres,
        developers: allDevelopers,
      });
    }

    next();
  }),
  async (req, res) => {
    const { title, date, rating, description, genres, developers } = req.body;
    const imagePath = req.file
      ? req.file.filename
      : "public/images/no_image.jpg";
    const formattedRating = parseFloat(rating).toFixed(1);
    const formattedDate = new Date(date).toISOString().split("T")[0];
    const arrGenres = genres.split(",").map((genre) => genre.trim());
    const arrDevelopers = developers
      .split(",")
      .map((developer) => developer.trim());

    await query.addGame(
      title,
      formattedDate,
      description,
      formattedRating,
      imagePath,
      arrGenres,
      arrDevelopers,
    );
    res.redirect("/games");
  },
];

exports.gameDelete = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log("Received DELETE request for game ID:", id);
  const gameGet = await query.getGame(id);
  const gameDeleted = await query.deleteGame(id);

  if (!gameGet) {
    throw new Error("Game not found!");
  }

  if (gameDeleted.rowCount === 0) {
    throw new Error("Game has not been deleted!");
  }

  if (gameGet.url != "public/images/no_image.jpg") {
    fs.unlink(`public/uploads/games/${gameGet.url}`, (err) => {
      if (err) console.log("Failed to delete file", err);
    });
  }

  res.status(200).send("Game delete");
});

exports.editGameGet = async (req, res) => {
  const id = req.params.id;
  const game = await query.getGame(id);
  const allGenres = await query.getAllGenres();
  const allDevelopers = await query.getAllDevelopers();
  const formattedDate = new Date(game.release_date);
  formattedDate.setDate(formattedDate.getDate() + 1);

  res.render("layout", {
    title: `Edit ${game.title}`,
    view: "editGame",
    tab: "games",
    game: game,
    date: formattedDate,
    genres: allGenres,
    developers: allDevelopers,
  });
};

exports.editGamePut = [
  upload.single("image"),
  validateGame,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(`public/uploads/games/${req.file.filename}`, (err) => {
          if (err) console.log("Failed to delete file", err);
        });
      }
      const game = await query.getGame(req.params.id)
      const allGenres = await query.getAllGenres();
      const allDevelopers = await query.getAllDevelopers();
      const formattedDate = new Date(game.release_date);
      formattedDate.setDate(formattedDate.getDate() + 1);
      
      if (!game || !allGenres || !allDevelopers) {
        throw new Error("Data not found");
      }
      
      return res.status(400).render("layout", {
        title: `Edit ${game.title}`,
        view: "editGame",
        tab: "games",
        game: game,
        date: formattedDate,
        genres: allGenres,
        developers: allDevelopers,
        errors: errors.array()
      });
    }

    next();
  }),
  asyncHandler(async (req, res) => {
    const game = await query.getGame(req.params.id)

    if (!game) {
      throw new Error ("Couldn't retrieve data")
    }

    const { title, date, rating, description, genres, developers } = req.body;
    const imagePath = req.file
      ? req.file.filename
      : game.url;

    if (req.file && game.url != "public/images/no_image.jpg") {
      fs.unlink(`public/uploads/games/${game.url}`, (err) => {
        if (err) console.log("Failed to delete file", err)
      })
    }

    const formattedRating = parseFloat(rating).toFixed(1);
    const formattedDate = new Date(date).toISOString().split("T")[0];
    const arrGenres = genres.split(",").map((genre) => genre.trim());
    const arrDevelopers = developers
      .split(",")
      .map((developer) => developer.trim());

    await query.editGame(
      game.id,
      title,
      formattedDate,
      description,
      formattedRating,
      imagePath,
      arrGenres,
      arrDevelopers
    )
    res.redirect(`/games/${game.id}`);
  })
]

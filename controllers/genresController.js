const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("node:path");
const { body, validationResult } = require("express-validator");
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

exports.createGenreGet = asyncHandler(async (req, res) => {
  const allGenres = await query.getAllGenres();

  if (!allGenres) {
    throw new Error("Genres not found");
  }

  res.render("layout", {
    title: "New genre",
    view: "createGenre",
    tab: "genres",
    category: allGenres,
  });
});

const validateGenre = [
  body("genreName")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("You should add a genre")
    .custom(async (genre) => {
      const allGenres = await query.getAllGenres();
      const genreExists = allGenres.some(
        (item) => item.name.toLowerCase() === genre.toLowerCase(),
      );

      if (genreExists) {
        throw new Error("Genre is already in the database");
      }
      return true;
    }),
];

exports.createGenrePost = [
  validateGenre,
  asyncHandler(async (req, res) => {
    const allGenres = await query.getAllGenres();
    const errors = validationResult(req);
    const { genreName } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    if (!errors.isEmpty()) {
      return res.status(400).render("layout", {
        title: "New genre",
        view: "createGenre",
        tab: "genres",
        category: allGenres,
        errors: errors.array(),
      });
    }

    await query.addGenre(genreName, imagePath);
    res.redirect("/genres");
  }),
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/genres");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images files (jpg, png or webp) are allowed"), false);
    }
  },
});

exports.upload = upload.single("image");

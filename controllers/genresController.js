const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("node:path");
const fs = require("fs")
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
    const fileType = path.extname(file.originalname).toLocaleLowerCase()
    const validExtensions = /jpg|jpeg|webp|png/;
    const isValidExtension = validExtensions.test(fileType)
    const isValidMimeType = validExtensions.test(file.mimetype)

    if (!isValidExtension || !isValidMimeType) {
      return cb(new Error("Only images allowed"))
    }

    cb(null, true)
  },
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
  upload.single("genreImage"),
  validateGenre,
  async (req, res, next) => {
    const errors = validationResult(req)

    if (!req.file) {
      errors.errors.push({ msg: "Image is required" })
    }

    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(`public/uploads/genres/${req.file.filename}`, (err) => {
          if (err) console.log("Failed to delete the file", err)
        })
      }

      return res.status(400).render("layout", {
        title: "New genre",
        view: "createGenre",
        tab: "genres",
        errors: errors.array()
      })
    }

    next()
  },
  async (req, res) => {
    const { genreName } = req.body
    const imagePath = req.file.filename

    await query.addGenre(genreName, imagePath)
    console.log(genreName, imagePath)
    res.redirect("/genres")
  }
];

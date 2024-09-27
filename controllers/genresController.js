const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("node:path");
const fs = require("fs");
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
  const getGenre = await query.getGenre(genreId);
  const gamesByGenre = await query.getGamesByGenre(genreId);

  if (!gamesByGenre) {
    throw new Error("Games not found");
  }

  res.render("layout", {
    title: `${getGenre[0].name} games`,
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
    const fileType = path.extname(file.originalname).toLocaleLowerCase();
    const validExtensions = /jpg|jpeg|webp|png/;
    const isValidExtension = validExtensions.test(fileType);
    const isValidMimeType = validExtensions.test(file.mimetype);

    if (!isValidExtension || !isValidMimeType) {
      return cb(new Error("Only images allowed"));
    }

    cb(null, true);
  },
});

const validateGenre = [
  body("genreName")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("You should add a genre")
    .custom(async (name, { req }) => {
      const genre = await query.getGenre(req.params.id)
      
      if (genre && genre[0].name.toLowerCase() === name.toLowerCase()) {
        return true;
      }

      const allGenres = await query.getAllGenres();
      const genreExists = allGenres.some(
        (item) => item.name.toLowerCase() === name.toLowerCase(),
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
    const errors = validationResult(req);

    if (!req.file) {
      errors.errors.push({ msg: "Image is required" });
    }

    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(`public/uploads/genres/${req.file.filename}`, (err) => {
          if (err) console.log("Failed to delete the file", err);
        });
      }

      return res.status(400).render("layout", {
        title: "New genre",
        view: "createGenre",
        tab: "genres",
        errors: errors.array(),
      });
    }

    next();
  },
  async (req, res) => {
    const { genreName } = req.body;
    const imagePath = req.file.filename;

    await query.addGenre(genreName, imagePath);
    res.redirect("/genres");
  },
];

exports.genreDelete = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const genreGet = await query.getGenre(id);
  if (!genreGet) {
    throw new Error("Genre not found!");
  }

  const gamesByGenre = await query.getGamesByGenre(id);
  if (!gamesByGenre) {
    throw new Error("Games not found!");
  }

  const genreDeleted = await query.deleteGenre(id);
  if (genreDeleted.rowCount === 0) {
    throw new Error("Genre has not been deleted!");
  }

  fs.unlink(`public/uploads/genres/${genreGet[0].logo}`, (err) => {
    if (err) console.log("Failed to delete the file", err);
  });

  if (gamesByGenre.length != 0) {
    gamesByGenre.forEach(async (game) => {
      const gameDeleted = await query.deleteGame(game.id);
      if (gameDeleted.rowCount === 0)
        throw new Error("Game has not been deleted");
      if (game.url != "public/images/no_image.jpg") {
        fs.unlink(`public/uploads/games/${game.url}`, (err) => {
          if (err) console.log("Failed to delete file", err);
        });
      }
    });
  }

  res.status(200).send("Genre deleted");
});

exports.editGenreGet = asyncHandler(async (req, res) => {
  const id = req.params.id
  const genre = await query.getGenre(id)
  
  if (!genre) {
    throw new Error("Genre not found")
  }
  
  res.render("layout", {
    title: "New genre",
    view: "editGenre",
    tab: "genres",
    genre: genre[0]
  })
})

exports.editGenrePut = [
  upload.single("genreImage"),
  validateGenre,
  asyncHandler(async (req, res, next) => {
    const genre = await query.getGenre(req.params.id)

    if (!genre) {
      throw new Error("Genre could not been retrieved")
    }

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(`public/uploads/genres/${req.file.filename}`, (err) => {
          if (err) console.log("Failed to delete the file", err);
        })
      }

      return res.status(400).render("layout", {
        title: "New genre",
        view: "editGenre",
        tab: "genres",
        genre: genre[0],
        errors: errors.array()
      })
    }

    next()
  }),
  asyncHandler(async(req, res) => {
    const genre = await query.getGenre(req.params.id)

    if (!genre) {
      throw new Error("Genre could not been retrieved")
    }

    if (req.file) {
      fs.unlink(`public/uploads/genres/${genre[0].logo}`, (err) => {
        if (err) console.log("Failed to delete the file", err);
      })
    }

    const { genreName } = req.body;
    const imagePath = req.file ? req.file.filename : genre[0].logo;
   
    await query.editGenre(genre[0].id, genreName, imagePath)
    res.redirect(`/genres`)
  })
]

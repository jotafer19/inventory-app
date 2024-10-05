const asyncHandler = require("express-async-handler");
const multer = require("multer");
const path = require("node:path");
const { body, validationResult } = require("express-validator");
const fs = require("fs");
const query = require("../db/query");

exports.developersGet = asyncHandler(async (req, res) => {
  const allDevelopers = await query.getAllDevelopers();

  if (!allDevelopers) {
    throw new Error("Developers not found");
  }

  res.render("layout", {
    title: "Developers",
    view: "developers",
    tab: "developers",
    add: "developer",
    developers: allDevelopers,
  });
});

exports.gamesPerDeveloperGet = asyncHandler(async (req, res) => {
  const developerId = req.params.id;
  const gamesPerDeveloper = await query.getGamesByDevelopers(developerId);

  if (!gamesPerDeveloper) {
    throw new Error("Games not found");
  }

  res.render("layout", {
    title: `${gamesPerDeveloper[0].developer} games`,
    view: "games",
    tab: "developers",
    add: "game",
    games: gamesPerDeveloper,
  });
});

exports.createDeveloperGet = (req, res) => {
  res.render("layout", {
    title: "New developer",
    view: "createDeveloper",
    tab: "developers",
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/developers");
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

const validateDeveloper = [
  body("developerName")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Developer name required")
    .custom(async (name, { req }) => {
      const developer = await query.getDeveloper(req.params.id)
      
      if (developer.length && developer[0].name.toLowerCase() === name.toLowerCase()) {
        return true;
      }

      const allDevelopers = await query.getAllDevelopers();
      const developerExists = allDevelopers.some(
        (item) => item.name.toLowerCase() === name.toLowerCase(),
      );

      if (developerExists) {
        throw new Error("Developer is already in the database");
      }
      return true;
    }),
];

exports.createDeveloperPost = [
  upload.single("developerImage"),
  validateDeveloper,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!req.file) {
      errors.errors.push({ msg: "Image is required" });
    }

    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(`public/uploads/developers/${req.file.filename}`, (err) => {
          if (err) console.log("Failed to delete file", err);
        });
      }

      return res.status(400).render("layout", {
        title: "New developer",
        view: "createDeveloper",
        tab: "developers",
        errors: errors.array(),
      });
    }

    next();
  },
  async (req, res) => {
    const { developerName } = req.body;
    const imagePath = req.file.filename;

    await query.addDeveloper(developerName, imagePath);
    res.redirect("/developers");
  },
];

exports.developerDelete = asyncHandler(async (req, res) => {
  const id = req.params.id;
  
  const developer = await query.getDeveloper(id)
  if (!developer) {
    throw new Error("Could not retrieve developer")
  }

  const gamesByDeveloper = await query.getGamesByDevelopers(id)
  if (!gamesByDeveloper) {
    throw new Error("Games not found")
  }

  const developerDeleted = await query.deleteDeveloper(id)
  if (developerDeleted.rowCount === 0) {
    throw new Error("Developer has not been deleted.")
  }
  fs.unlink(`public/uploads/developers/${developer[0].logo}`, (err) => {
    if (err) console.log("Failed to delete the file", err);
  })

  if (gamesByDeveloper.length != 0) {
    gamesByDeveloper.forEach( async (game) => {
      const gameDeleted = await query.deleteGame(game.id)
      if (gameDeleted.rowCount === 0) {
        throw new Error("Game has not been deleted");
      }
      if (game.url != "public/images/no_image.jpg") {
        fs.unlink(`public/uploads/games/${game.url}`, (err) => {
          if (err) console.log("Failed to delete file", err);
        });
      }
    })
  }

  res.status(200).send("Developer deleted")
});

exports.editDeveloperGet = asyncHandler(async (req, res) => {
  const id = req.params.id
  const developer = await query.getDeveloper(id)
  
  if (!developer) {
    throw new Error("Developer not found")
  }
  
  res.render("layout", {
    title: `Edit ${developer[0].name}`,
    view: "editDeveloper",
    tab: "developers",
    developer: developer[0]
  })
})

exports.editDeveloperPut = [
  upload.single("developerImage"),
  validateDeveloper,
  asyncHandler(async (req, res, next) => {
    const developer = await query.getDeveloper(req.params.id)

    if (!developer) {
      throw new Error("Developer could not been retrieved")
    }

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(`public/uploads/developers/${req.file.filename}`, (err) => {
          if (err) console.log("Failed to delete the file", err);
        })
      }

      return res.status(400).render("layout", {
        title: `Edit ${developer[0].name}`,
        view: "editDeveloper",
        tab: "developers",
        developer: developer[0],
        errors: errors.array()
      })
    }

    next()
  }),
  asyncHandler(async(req, res) => {
    const developer = await query.getDeveloper(req.params.id)

    if (!developer) {
      throw new Error("Developer could not been retrieved")
    }

    if (req.file) {
      fs.unlink(`public/uploads/developers/${developer[0].logo}`, (err) => {
        if (err) console.log("Failed to delete the file", err);
      })
    }

    const { developerName } = req.body;
    const imagePath = req.file ? req.file.filename : developer[0].logo;
    
    await query.editDeveloper(developer[0].id, developerName, imagePath)
    res.redirect(`/developers`)
  })
]

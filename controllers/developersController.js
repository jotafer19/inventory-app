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
    .custom(async (developer) => {
      const allDevelopers = await query.getAllDevelopers();
      const developerExists = allDevelopers.some(
        (item) => developer.toLowerCase() === item.name.toLowerCase(),
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
    console.log(developerName, imagePath);

    await query.addDeveloper(developerName, imagePath);
    res.redirect("/developers");
  },
];

exports.developerDelete = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const developerGet = await query.getDeveloper(id);
  console.log(developerGet);
});

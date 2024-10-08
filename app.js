const express = require("express");
const path = require("node:path");
require("dotenv").config();
const methodOverride = require("method-override")
const indexRouter = require("./routes/index");
const gamesRouter = require("./routes/games");
const genresRouter = require("./routes/genres");
const developersRouter = require("./routes/developers");
const PORT = process.env.PORT || 3000;

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride('_method'));

app.use("/", indexRouter);
app.use("/games", gamesRouter);
app.use("/genres", genresRouter);
app.use("/developers", developersRouter);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).send(err.message);
});

app.listen(PORT, () => console.log(`App listening at port ${PORT}.`));

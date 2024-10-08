const pool = require("./pool");

async function getAllGames() {
  const { rows } = await pool.query(`
    SELECT
      games.*,
      ARRAY_AGG(DISTINCT developers.name) AS developers,
      ARRAY_AGG(DISTINCT genres.name) AS genres
    FROM 
      developers
    JOIN
      developers_games dg ON developers.id = dg.developer_id
    JOIN
      games ON dg.game_id = games.id
    JOIN
      games_genres gg ON games.id = gg.game_id
    JOIN
      genres ON gg.genre_id = genres.id
    GROUP BY
      games.id
    ORDER BY
      games.title
  `);

  return rows;
}

async function getAllGenres() {
  const { rows } = await pool.query(
    "SELECT * FROM genres ORDER BY genres.name;",
  );
  return rows;
}

async function getAllDevelopers() {
  const { rows } = await pool.query(
    "SELECT * FROM developers ORDER BY developers.name;",
  );
  return rows;
}

async function getFeaturedGames() {
  const { rows } = await pool.query(`
    SELECT
      games.*,
      ARRAY_AGG(DISTINCT developers.name) AS developers,
      ARRAY_AGG(DISTINCT genres.name) AS genres
    FROM 
      developers
    JOIN
      developers_games dg ON developers.id = dg.developer_id
    JOIN
      games ON dg.game_id = games.id
    JOIN
      games_genres gg ON games.id = gg.game_id
    JOIN
      genres ON gg.genre_id = genres.id
    GROUP BY
      games.id
    ORDER BY
      games.rating DESC
    LIMIT 3
  `);

  return rows;
}

async function getFeaturedGenres() {
  const { rows } = await pool.query(`
    SELECT 
      genres.*,
      COUNT(genres.id) AS number_games
    FROM 
      genres
    JOIN
      games_genres ON genres.id = games_genres.genre_id
    JOIN
      games ON games_genres.game_id = games.id
    GROUP BY
      genres.id
    ORDER BY
      number_games DESC, genres.name ASC
    LIMIT 3
  `);

  return rows;
}

async function getFeaturedDevelopers() {
  const { rows } = await pool.query(`
    SELECT 
      developers.*,
      COUNT(developers.id) AS number_games
    FROM 
      developers
    JOIN
      developers_games ON developers.id = developers_games.developer_id
    JOIN
      games ON developers_games.game_id = games.id
    GROUP BY
      developers.id
    ORDER BY
      number_games DESC, developers.name ASC
    LIMIT 3
  `);

  return rows;
}

async function getGame(id) {
  const query = `
    SELECT
      games.*,
      JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', developers.id, 'name', developers.name)) AS developers,
      JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', genres.id, 'name', genres.name)) AS genres
    FROM
      developers
    JOIN
      developers_games ON developers.id = developers_games.developer_id
    JOIN
      games ON developers_games.game_id = games.id
    JOIN
      games_genres ON games.id = games_genres.game_id
    JOIN
      genres ON games_genres.genre_id = genres.id
    WHERE
      games.id = ($1)
    GROUP BY
      games.id
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

async function getGenre(id) {
  const { rows } = await pool.query(
    "SELECT * FROM genres WHERE genres.id = ($1)",
    [id],
  );
  return rows;
}

async function getDeveloper(id) {
  const { rows } = await pool.query(
    "SELECT * FROM developers WHERE developers.id = ($1)",
    [id],
  );
  return rows;
}

async function getGamesByGenre(genreId) {
  const query = `
    SELECT 
      games.*,
      genres.name AS genre
    FROM
      genres
    JOIN
      games_genres ON genres.id = games_genres.genre_id
    JOIN
      games ON games_genres.game_id = games.id
    WHERE
      genres.id = ($1)
    ORDER BY
      games.title
  `;
  const { rows } = await pool.query(query, [genreId]);
  return rows;
}

async function getGamesByDevelopers(developerId) {
  const query = `
    SELECT
      games.*,
      developers.name AS developer
    FROM
      developers
    JOIN
      developers_games ON developers.id = developers_games.developer_id
    JOIN
      games ON developers_games.game_id = games.id
    WHERE
      developers.id = ($1)
    ORDER BY
      games.title
  `;

  const { rows } = await pool.query(query, [developerId]);
  return rows;
}

async function addGame(
  title,
  date,
  description,
  rating,
  url,
  genres,
  developers,
) {
  const insertGameQuery =
    "INSERT INTO games (title, release_date, description, rating, url) VALUES ($1, $2, $3, $4, $5) RETURNING id";
  const res = await pool.query(insertGameQuery, [
    title,
    date,
    description,
    rating,
    url,
  ]);
  const gameId = res.rows[0].id;

  const genreQuery =
    "INSERT INTO games_genres (game_id, genre_id) VALUES ($1, $2)";
  for (const genre of genres) {
    const genreRes = await pool.query(
      "SELECT id FROM genres WHERE name LIKE ($1)",
      [genre],
    );
    const genreId = genreRes.rows[0].id;
    await pool.query(genreQuery, [gameId, genreId]);
  }

  const developerQuery =
    "INSERT INTO developers_games (developer_id, game_id) VALUES ($1, $2)";
  for (const developer of developers) {
    const developersRes = await pool.query(
      "SELECT id FROM developers WHERE name LIKE ($1)",
      [developer],
    );
    const developerId = developersRes.rows[0].id;
    await pool.query(developerQuery, [developerId, gameId]);
  }
}

async function addGenre(name, imagePath) {
  await pool.query("INSERT INTO genres (name, logo) VALUES ($1, $2)", [
    name,
    imagePath,
  ]);
}

async function addDeveloper(name, imagePath) {
  await pool.query("INSERT INTO developers (name, logo) VALUES ($1, $2)", [
    name,
    imagePath,
  ]);
}

async function deleteGame(id) {
  const result = await pool.query("DELETE FROM games WHERE games.id = ($1)", [
    id,
  ]);
  return result;
}

async function deleteGenre(id) {
  const result = await pool.query("DELETE FROM genres WHERE genres.id = ($1)", [
    id,
  ]);
  return result;
}

async function deleteGamesByGenre(gamesArray) {
  const result = await pool.query(
    "DELETE FROM games WHERE games.id = ANY($1)",
    [gamesArray],
  );
  return result;
}

async function editGame(
  gameId,
  title,
  date,
  description,
  rating,
  url,
  genres,
  developers
) {
  const query = "UPDATE games SET title = $1, release_date = $2, description = $3, rating = $4, url = $5 WHERE id = $6"
  await pool.query(query, [title, date, description, rating, url, gameId])

  await pool.query("DELETE FROM games_genres WHERE games_genres.game_id = $1", [gameId])
  const genreQuery = "INSERT INTO games_genres (game_id, genre_id) VALUES ($1, $2)";
  for (const genre of genres) {
    const genreRes = await pool.query("SELECT id FROM genres WHERE name LIKE $1", [genre]);
    const genreId = genreRes.rows[0].id;
    await pool.query(genreQuery, [gameId, genreId]);
  }

  await pool.query("DELETE FROM developers_games WHERE developers_games.game_id = $1", [gameId])
  const developerQuery = "INSERT INTO developers_games (developer_id, game_id) VALUES ($1, $2)";
  for (const developer of developers) {
    const developerRes = await pool.query("SELECT id FROM developers WHERE name LIKE $1", [developer]);
    const developerId = developerRes.rows[0].id;
    await pool.query(developerQuery, [developerId, gameId]);
  }
}

async function editGenre(id, name, logo) {
  await pool.query("UPDATE genres SET name = $1, logo = $2 WHERE genres.id = $3", [name, logo, id])
}

module.exports = {
  getAllGames,
  getAllGenres,
  getAllDevelopers,
  getFeaturedGames,
  getFeaturedGenres,
  getFeaturedDevelopers,
  getGame,
  getGenre,
  getGamesByGenre,
  getDeveloper,
  getGamesByDevelopers,
  addGame,
  addGenre,
  addDeveloper,
  deleteGame,
  deleteGenre,
  deleteGamesByGenre,
  editGame,
  editGenre
};

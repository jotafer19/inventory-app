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
  `);

  return rows;
}

async function getAllGenres() {
  const { rows } = await pool.query("SELECT * FROM genres;");
  return rows;
}

async function getAllDevelopers() {
  const { rows } = await pool.query("SELECT * FROM developers;");
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

async function addGame(params) {
  //
}

module.exports = {
  getAllGames,
  getAllGenres,
  getAllDevelopers,
  getFeaturedGames,
  getFeaturedGenres,
  getFeaturedDevelopers,
};

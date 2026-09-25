import pool from "../config/db.js";

export const getSpotifyAccessToken = async (userId) => {
  const result = await pool.query(
    `
      SELECT access_token
      FROM spotify_connections
      WHERE user_id = $1
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("Spotify account is not connected.");
  }

  return result.rows[0].access_token;
};
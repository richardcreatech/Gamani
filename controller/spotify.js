import crypto from "crypto";
import dotenv from "dotenv";
import pool from "../config/db.js";
import axios from "axios";

dotenv.config();

export const connect_to_spotify = async (req, res) => {
  try {
    const userId = req.user.id;

    const state = crypto.randomBytes(32).toString("hex");

    // Store state temporarily in a cookie.
    res.cookie("spotify_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60 * 1000,
    });

    const spotifyAuthUrl = new URL("https://accounts.spotify.com/authorize");

    spotifyAuthUrl.searchParams.set("client_id", process.env.SPOTIFY_CLIENT_ID);

    spotifyAuthUrl.searchParams.set("response_type", "code");

    spotifyAuthUrl.searchParams.set("redirect_uri", process.env.REDIRECT_URI);

    spotifyAuthUrl.searchParams.set(
      "scope",
      "user-read-private user-read-email user-read-currently-playing user-read-playback-state user-modify-playback-state",
    );

    spotifyAuthUrl.searchParams.set("state", state);

    res.redirect(spotifyAuthUrl.toString());
  } catch (error) {
    res.status(500).json({
      message: "Unable to connect Spotify.",
    });
  }
};

export const spotify_callback = async (req, res) => {
  const { code, state } = req.query;

  try {
    if (!code) {
      return res.status(400).json({
        message: "Spotify authorization code is missing.",
      });
    }

    // Your authenticated Gamani user
    const userId = req.user.id;

    // -----------------------------
    // 1. Exchange code for tokens
    // -----------------------------

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
            ).toString("base64"),
        },
      },
    );

    const { access_token, refresh_token, token_type, scope, expires_in } =
      response.data;

    // -----------------------------
    // 2. Calculate token expiry
    // -----------------------------

    const accessTokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    // -----------------------------
    // 3. Get Spotify user
    // -----------------------------

    const profileResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const spotifyAccountId = profileResponse.data.account_id;

    // -----------------------------
    // 4. Save connection
    // -----------------------------

    await pool.query(
      `
        INSERT INTO spotify_connections (
          user_id,
          spotify_account_id,
          access_token,
          refresh_token,
          token_type,
          scope,
          access_token_expires_at,
          authorized_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        )

        ON CONFLICT (user_id)
        DO UPDATE SET
          spotify_account_id = EXCLUDED.spotify_account_id,
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          token_type = EXCLUDED.token_type,
          scope = EXCLUDED.scope,
          access_token_expires_at = EXCLUDED.access_token_expires_at,
          updated_at = NOW()
      `,
      [
        userId,
        spotifyAccountId,
        access_token,
        refresh_token,
        token_type,
        scope,
        accessTokenExpiresAt,
      ],
    );

    // -----------------------------
    // 5. Send user back to Gamani
    // -----------------------------

    // res.redirect("http://localhost:5173/app/spotify");
    res.redirect("http://127.0.0.1:5173/app/spotify");
  } catch (error) {
    console.error(
      "Spotify callback failed:",
      error.response?.data || error.message,
    );

    res.status(500).json({
      message: "Failed to connect Spotify.",
    });
  }
};

export const discover_artists = async (req, res) => {
  try {
    // 1. Get the logged-in Gamani user's ID
    const userId = req.user.id;

    // 2. Get that user's Spotify connection
    const result = await pool.query(
      `
        SELECT access_token
        FROM spotify_connections
        WHERE user_id = $1
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Spotify account is not connected.",
      });
    }

    const accessToken = result.rows[0].access_token;

    // 3. Generate a random search term
    const letters = "abcdefghijklmnopqrstuvwxyz";

    const randomLetter = letters[Math.floor(Math.random() * letters.length)];

    // 4. Search Spotify
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      params: {
        q: `artist:${randomLetter}`,
        type: "artist",
        limit: 10,
      },
    });

    // 5. Shuffle the returned artists
    const artists = response.data.artists.items
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        image: artist.images?.[0]?.url || null,
        genres: artist.genres || [],
        spotifyUrl: artist.external_urls?.spotify || null,
      }));

    // 6. Send only what the frontend needs
    return res.status(200).json({
      artists,
    });
  } catch (error) {
    console.error(
      "Discover artists error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Unable to discover artists.",
    });
  }
};

export const search_artists = async (req, res) => {
  try {
    // Get the search term from the URL
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: "Search term is required.",
      });
    }

    // Identify the logged-in Gamani user
    const userId = req.user.id;

    // Get that user's Spotify access token
    const result = await pool.query(
      `
        SELECT access_token
        FROM spotify_connections
        WHERE user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Spotify account is not connected.",
      });
    }

    const accessToken = result.rows[0].access_token;

    // Ask Spotify to search for artists
    const response = await axios.get(
      "https://api.spotify.com/v1/search",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },

        params: {
          q: q.trim(),
          type: "artist",
          limit: 10,
        },
      }
    );

    // Return only the information your frontend needs
    const artists = response.data.artists.items.map((artist) => ({
      id: artist.id,
      name: artist.name,
      image: artist.images?.[0]?.url || null,
      genres: artist.genres || [],
      spotifyUrl: artist.external_urls?.spotify || null,
    }));

    return res.status(200).json({
      artists,
    });

  } catch (error) {
    console.error(
      "Artist search error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Unable to search for artists.",
    });
  }
};

export const get_artist = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!artistId) {
      return res.status(400).json({
        message: "Artist ID is required.",
      });
    }

    // Identify the logged-in Gamani user
    const userId = req.user.id;

    // Get this user's Spotify access token
    const result = await pool.query(
      `
        SELECT access_token
        FROM spotify_connections
        WHERE user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Spotify account is not connected.",
      });
    }

    const accessToken = result.rows[0].access_token;

    const spotifyHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };


    // =========================
    // GET ARTIST
    // =========================

    const artistResponse = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: spotifyHeaders,
      }
    );


    // =========================
    // GET ARTIST'S ALBUMS
    // =========================

    const albumsResponse = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}/albums`,
      {
        headers: spotifyHeaders,

        params: {
          include_groups: "album,single",
          limit: 5,
        },
      }
    );


    // =========================
    // GET TRACKS FROM ALBUMS
    // =========================

    const albums = albumsResponse.data.items;

    const trackResponses = await Promise.all(
      albums.map((album) =>
        axios.get(
          `https://api.spotify.com/v1/albums/${album.id}/tracks`,
          {
            headers: spotifyHeaders,

            params: {
              limit: 50,
            },
          }
        )
      )
    );


    // =========================
    // BUILD SONG LIST
    // =========================

    const songs = [];

    for (let i = 0; i < trackResponses.length; i++) {
      const tracks = trackResponses[i].data.items;
      const album = albums[i];

      for (const track of tracks) {

        // Make sure the artist is actually one
        // of the artists on the track
        const belongsToArtist = track.artists.some(
          (artist) => artist.id === artistId
        );

        if (!belongsToArtist) {
          continue;
        }

        songs.push({
          id: track.id,
          name: track.name,
          album: album.name,
          albumCover: album.images?.[0]?.url || null,
          durationMs: track.duration_ms,
          spotifyUrl:
            track.external_urls?.spotify || null,
          uri: track.uri,
        });
      }
    }


    // Remove duplicate songs
    const uniqueSongs = Array.from(
      new Map(
        songs.map((song) => [song.id, song])
      ).values()
    );


    // Your UI currently needs about 9 songs
    const limitedSongs = uniqueSongs.slice(0, 9);


    // =========================
    // SEND CLEAN RESPONSE
    // =========================

    return res.status(200).json({
      artist: {
        id: artistResponse.data.id,
        name: artistResponse.data.name,
        image:
          artistResponse.data.images?.[0]?.url || null,
        genres: artistResponse.data.genres || [],
        spotifyUrl:
          artistResponse.data.external_urls?.spotify || null,

        // Spotify does not provide an artist biography
        bio: null,
      },

      songs: limitedSongs,
    });

  } catch (error) {
    console.error(
      "Get artist error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Unable to get artist information.",
    });
  }
};
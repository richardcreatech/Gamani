import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import pool from "../config/db.js";
import { getSpotifyAccessToken } from "../util/spotifyAccess.js";

import { getRandomSeedArtist } from "./seedArtists.js";

dotenv.config();

export const connect_to_spotify = async (req, res) => {
  try {
    const scope = [
      "user-read-private",
      "user-read-email",
      "user-read-currently-playing",
      "user-read-playback-state",
      "user-modify-playback-state",
      "playlist-read-private",
      "playlist-modify-public",
      "playlist-modify-private",
    ].join(" ");
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
      `
    user-read-private
    user-read-email
    user-read-currently-playing
    user-read-playback-state
    user-modify-playback-state
    playlist-read-private
    playlist-modify-public
    playlist-modify-private
  `
        .replace(/\s+/g, " ")
        .trim(),
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

    // 3. Pick a fun, intentional seed artist instead of a random letter
    const seedArtist = getRandomSeedArtist();

    // 4. Search Spotify using the seed artist as the query
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      params: {
        q: seedArtist,
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
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Spotify account is not connected.",
      });
    }

    const accessToken = result.rows[0].access_token;

    // Ask Spotify to search for artists
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      params: {
        q: q.trim(),
        type: "artist",
        limit: 10,
      },
    });

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
      error.response?.data || error.message,
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
      [userId],
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
      },
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
      },
    );

    // =========================
    // GET TRACKS FROM ALBUMS
    // =========================

    const albums = albumsResponse.data.items;

    const trackResponses = await Promise.all(
      albums.map((album) =>
        axios.get(`https://api.spotify.com/v1/albums/${album.id}/tracks`, {
          headers: spotifyHeaders,

          params: {
            limit: 50,
          },
        }),
      ),
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
          (artist) => artist.id === artistId,
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
          spotifyUrl: track.external_urls?.spotify || null,
          uri: track.uri,
        });
      }
    }

    // Remove duplicate songs
    const uniqueSongs = Array.from(
      new Map(songs.map((song) => [song.id, song])).values(),
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
        image: artistResponse.data.images?.[0]?.url || null,
        genres: artistResponse.data.genres || [],
        spotifyUrl: artistResponse.data.external_urls?.spotify || null,

        // Spotify does not provide an artist biography
        bio: null,
      },

      songs: limitedSongs,
    });
  } catch (error) {
    console.error("Get artist error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Unable to get artist information.",
    });
  }
};

export const search_artist_song = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { q } = req.query;

    if (!artistId) {
      return res.status(400).json({
        message: "Artist ID is required.",
      });
    }

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: "Song search is required.",
      });
    }

    const userId = req.user.id;

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

    /*
      First get the artist so we know the artist's name.
    */
    const artistResponse = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const artistName = artistResponse.data.name;

    /*
      Now search Spotify for tracks by that artist.
    */
    const searchResponse = await axios.get(
      "https://api.spotify.com/v1/search",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: `artist:"${artistName}" track:"${q.trim()}"`,
          type: "track",
          limit: 10,
        },
      },
    );

    /*
      Only keep tracks whose Spotify artist ID
      actually matches the artist being viewed.
    */
    const songs = searchResponse.data.tracks.items
      .filter((track) => track.artists.some((artist) => artist.id === artistId))
      .map((track) => ({
        id: track.id,
        name: track.name,
        album: track.album.name,
        albumCover: track.album.images?.[0]?.url || null,
        durationMs: track.duration_ms,
        spotifyUrl: track.external_urls?.spotify || null,
        uri: track.uri,
      }));

    return res.status(200).json({
      songs,
    });
  } catch (error) {
    console.error(
      "Artist song search error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Unable to search for this artist's songs.",
    });
  }
};

export const get_currently_playing = async (req, res) => {
  try {
    const userId = req.user.id;

    const accessToken = await getSpotifyAccessToken(userId);

    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    // Spotify can return 204 when there is nothing currently playing
    if (response.status === 204 || !response.data) {
      return res.status(200).json({
        playing: false,
        track: null,
      });
    }

    const data = response.data;

    if (data.currently_playing_type !== "track") {
      return res.status(200).json({
        playing: false,
        track: null,
      });
    }

    const track = data.item;

    return res.status(200).json({
      playing: data.is_playing,
      progressMs: data.progress_ms,
      track: {
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist) => ({
          id: artist.id,
          name: artist.name,
        })),
        album: track.album.name,
        albumCover: track.album.images?.[0]?.url || null,
        durationMs: track.duration_ms,
        uri: track.uri,
      },
    });
  } catch (error) {
    console.error(
      "Get currently playing error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Unable to get current playback.",
    });
  }
};

export const skip_previous = async (req, res) => {
  try {
    const userId = req.user.id;

    const accessToken = await getSpotifyAccessToken(userId);

    await axios.post("https://api.spotify.com/v1/me/player/previous", null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error(
      "Skip previous error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Unable to play the previous song.",
    });
  }
};

export const seek_track = async (req, res) => {
  try {
    const { positionMs } = req.body;

    if (typeof positionMs !== "number" || positionMs < 0) {
      return res.status(400).json({
        message: "A valid position is required.",
      });
    }

    const userId = req.user.id;

    const accessToken = await getSpotifyAccessToken(userId);

    await axios.put("https://api.spotify.com/v1/me/player/seek", null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      params: {
        position_ms: Math.floor(positionMs),
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error("Seek error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Unable to change playback position.",
    });
  }
};

export const mute_playback = async (req, res) => {
  try {
    const userId = req.user.id;

    const accessToken = await getSpotifyAccessToken(userId);

    await axios.put("https://api.spotify.com/v1/me/player/volume", null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      params: {
        volume_percent: 0,
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error(
      "Mute playback error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Unable to mute playback.",
    });
  }
};

export const skip_next = async (req, res) => {
  try {
    const userId = req.user.id;

    const accessToken = await getSpotifyAccessToken(userId);

    await axios.post("https://api.spotify.com/v1/me/player/next", null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    console.error("Skip next error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Unable to play the next song.",
    });
  }
};

export const get_playback_queue = async (req, res) => {
  try {
    const userId = req.user.id;

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

    const response = await axios.get(
      "https://api.spotify.com/v1/me/player/queue",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const nextSongs = response.data.queue
      .filter((item) => item.type === "track")
      .slice(0, 3)
      .map((track) => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map((artist) => artist.name).join(", "),
        album: track.album.name,
        albumCover: track.album.images?.[0]?.url || null,
        uri: track.uri,
      }));

    return res.status(200).json({
      songs: nextSongs,
    });
  } catch (error) {
    console.error(
      "Get playback queue error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Unable to get playback queue.",
    });
  }
};

export const play_song = async (req, res) => {
  try {
    const { uri } = req.body;

    if (!uri) {
      return res.status(400).json({
        message: "Song URI is required.",
      });
    }

    if (!uri.startsWith("spotify:track:")) {
      return res.status(400).json({
        message: "Invalid Spotify track URI.",
      });
    }

    const userId = req.user.id;

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

    await axios.put(
      "https://api.spotify.com/v1/me/player/play",
      {
        uris: [uri],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.sendStatus(204);
  } catch (error) {
    console.error("Play song error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Unable to play song.",
    });
  }
};

export async function add_song_to_playlist(req, res) {
  const userId = req.user.id;
  const { playlistId } = req.params;
  const { trackUri } = req.body;

  // Validate playlist ID
  if (!playlistId) {
    return res.status(400).json({
      message: "Playlist ID is required.",
    });
  }

  // Validate track URI
  if (!trackUri) {
    return res.status(400).json({
      message: "Track URI is required.",
    });
  }

  if (!trackUri.startsWith("spotify:track:")) {
    return res.status(400).json({
      message: "Invalid Spotify track URI.",
    });
  }

  try {
    // Get the user's current Spotify access token
    const accessToken = await getSpotifyAccessToken(userId);

    if (!accessToken) {
      return res.status(401).json({
        message: "Spotify is not connected.",
      });
    }

    // Ask Spotify to add the track
    const response = await axios.post(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(
        playlistId,
      )}/items`,
      {
        uris: [trackUri],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.status(201).json({
      message: "Song added to playlist.",
      snapshotId: response.data.snapshot_id,
    });
  } catch (error) {
    console.error(
      "Add song to playlist error:",
      error.response?.data || error.message,
    );

    const spotifyStatus = error.response?.status;
    const spotifyMessage =
      error.response?.data?.error?.message || "Unable to add song to playlist.";

    return res.status(spotifyStatus || 500).json({
      message: spotifyMessage,
    });
  }
}

export const get_playback_state = async (req, res) => {
  try {
    const userId = req.user.id;

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

    const response = await axios.get("https://api.spotify.com/v1/me/player", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Playback state error:",
      error.response?.data || error.message,
    );

    return res.status(error.response?.status || 500).json({
      message:
        error.response?.data?.error?.message || "Unable to get playback state.",
    });
  }
};

export const play_queue_song = async (req, res) => {
  try {
    const { uri } = req.body;

    if (!uri) {
      return res.status(400).json({
        message: "Song URI is required.",
      });
    }

    if (!uri.startsWith("spotify:track:")) {
      return res.status(400).json({
        message: "Invalid Spotify track URI.",
      });
    }

    const userId = req.user.id;

    const accessToken = await getSpotifyAccessToken(userId);

    const spotifyHeaders = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // --------------------------------
    // 1. Get the REAL Spotify queue
    // --------------------------------

    const queueResponse = await axios.get(
      "https://api.spotify.com/v1/me/player/queue",
      {
        headers: spotifyHeaders,
      },
    );

    const spotifyQueue = queueResponse.data.queue.filter(
      (item) => item.type === "track",
    );

    // --------------------------------
    // 2. Find the song user selected
    // --------------------------------

    const selectedIndex = spotifyQueue.findIndex((track) => track.uri === uri);

    if (selectedIndex === -1) {
      return res.status(404).json({
        message: "Song is not in the current queue.",
      });
    }

    // Everything AFTER the selected song
    const remainingSongs = spotifyQueue
      .slice(selectedIndex + 1)
      .map((track) => track.uri);

    // --------------------------------
    // 3. Play the selected song
    // --------------------------------

    await axios.put(
      "https://api.spotify.com/v1/me/player/play",
      {
        uris: [uri],
      },
      {
        headers: spotifyHeaders,
      },
    );

    // --------------------------------
    // 4. Rebuild the queue after it
    // --------------------------------

    for (const nextUri of remainingSongs) {
      await axios.post("https://api.spotify.com/v1/me/player/queue", null, {
        headers: spotifyHeaders,
        params: {
          uri: nextUri,
        },
      });
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error(
      "Play queue song error:",
      error.response?.data || error.message,
    );

    return res.status(error.response?.status || 500).json({
      message:
        error.response?.data?.error?.message || "Unable to play queue song.",
    });
  }
};

export async function get_user_playlists(req, res) {
  const userId = req.user.id;

  try {
    const accessToken = await getSpotifyAccessToken(userId);

    const response = await axios.get(
      "https://api.spotify.com/v1/me/playlists?limit=50",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const playlists = response.data.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      songs: playlist.items.total,
      cover: playlist.images?.[0]?.url || null,
    }));

    return res.status(200).json({
      playlists,
    });
  } catch (error) {
    console.error(
      "Get user playlists error:",
      error.response?.data || error.message,
    );

    return res.status(error.response?.status || 500).json({
      message:
        error.response?.data?.error?.message || "Unable to get playlists.",
    });
  }
}

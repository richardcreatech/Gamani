import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js"
import { add_song_to_playlist, connect_to_spotify, discover_artists, get_artist, get_currently_playing, get_playback_queue, get_playback_state, mute_playback, play_queue_song, play_song, search_artist_song, search_artists, seek_track, skip_next, skip_previous, spotify_callback } from "../controller/spotify.js";

const spotifyRouter = express.Router();

spotifyRouter.get(
  "/auth/spotify",
  verifyToken,
  connect_to_spotify
);

spotifyRouter.get(
  "/auth/spotify/callback",
  verifyToken,
  spotify_callback
);

spotifyRouter.get(
  "/discover/artists",
  verifyToken,
  discover_artists
);

spotifyRouter.get(
  "/search/artists",
  verifyToken,
  search_artists
);

spotifyRouter.get(
  "/artists/:artistId",
  verifyToken,
  get_artist
);

spotifyRouter.get(
  "/artists/:artistId/search",
  verifyToken,
  search_artist_song
);

spotifyRouter.get("/playback/current", verifyToken, get_currently_playing);

spotifyRouter.post("/playback/next", verifyToken, skip_next);

spotifyRouter.post("/playback/previous", verifyToken, skip_previous);

spotifyRouter.put("/playback/seek", verifyToken, seek_track);

spotifyRouter.put("/playback/mute", verifyToken, mute_playback);

spotifyRouter.get(
  "/playback/queue",
  verifyToken,
  get_playback_queue
);
spotifyRouter.post(
  "/playback/play",
  verifyToken,
  play_song
);

spotifyRouter.post(
  "/playlists/:playlistId/items",
  verifyToken,
  add_song_to_playlist
);

spotifyRouter.get(
  "/playback/state",
  verifyToken,
  get_playback_state
);

spotifyRouter.post(
  "/playback/queue/play",
  verifyToken,
  play_queue_song
);

export default spotifyRouter;
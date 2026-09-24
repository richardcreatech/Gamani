import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js"
import { connect_to_spotify, discover_artists, get_artist, search_artists, spotify_callback } from "../controller/spotify.js";

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


export default spotifyRouter;
import { faXmark, faPlus } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useEffect, useState } from "react";

function AddToPlaylistPopup({ song, onClose }) {
  const [addingPlaylistId, setAddingPlaylistId] = useState(null);
  const [error, setError] = useState("");

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = "http://127.0.0.1:3000";

  useEffect(() => {
    const getPlaylists = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/playlists`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to get playlists.");
        }

        setPlaylists(data.playlists);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getPlaylists();
  }, []);

  const addSongToPlaylist = async (playlistId) => {
    try {
      setAddingPlaylistId(playlistId);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/playlists/${playlistId}/items`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            trackUri: song.uri,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add song.");
      }

      // Successfully added
      onClose();
    } catch (error) {
      console.error("Add song to playlist error:", error);

      setError(error.message);
    } finally {
      setAddingPlaylistId(null);
    }
  };

  return (
    <div id="add_playlist_overlay">
      <section id="add_playlist_popup">
        {/* Close */}

        <button
          type="button"
          className="close_playlist_popup"
          aria-label="Close"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {/* Heading */}

        <div className="add_playlist_header">
          <p>ADD TO PLAYLIST</p>

          <h2>Where should this one go?</h2>

          <span>
            Adding <strong>{song.name}</strong> by{" "}
            <strong>
              {song.artist ||
                song.artists?.map((artist) => artist.name).join(", ")}
            </strong>
          </span>
        </div>

        {/* Error */}

        {error && <p className="playlist-popup-error">{error}</p>}

        {/* Playlists */}

        <div className="popup_playlist_list">
          {playlists.map((playlist) => (
            <button
              type="button"
              className="popup_playlist"
              key={playlist.id}
              onClick={() => addSongToPlaylist(playlist.id)}
              disabled={addingPlaylistId !== null}
            >
              <div className="popup_playlist_cover">
                <img src={playlist.cover} alt="" />

                <span className="popup_playlist_add">
                  <FontAwesomeIcon icon={faPlus} />
                </span>
              </div>

              <div className="popup_playlist_info">
                <strong>{playlist.name}</strong>
                <small>{playlist.songs} songs</small>
              </div>
            </button>
          ))}
        </div>

        {/* Create playlist */}

        <button type="button" className="create_playlist_button">
          <FontAwesomeIcon icon={faPlus} />
          Create a new playlist
        </button>
      </section>
    </div>
  );
}

export default AddToPlaylistPopup;

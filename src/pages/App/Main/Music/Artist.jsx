import {
  faAdd,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import AddToPlaylistPopup from "./AddToPlaylistPopup";

function Artist() {
  const { artistId } = useParams();

  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [defaultSongs, setDefaultSongs] = useState([]);

  const [songSearch, setSongSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSong, setSelectedSong] = useState(null);
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);

  const BACKEND_URL = "http://127.0.0.1:3000";


  /* =========================
     GET ARTIST
  ========================= */

  useEffect(() => {
    const getArtist = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${BACKEND_URL}/artists/${artistId}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to get artist."
          );
        }

        setArtist(data.artist);

        setSongs(data.songs);

        // Important:
        // keep the original songs for restoring
        // them after a search is cleared
        setDefaultSongs(data.songs);

      } catch (error) {
        console.error("Get artist error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (artistId) {
      getArtist();
    }
  }, [artistId]);


  /* =========================
     SEARCH ARTIST'S SONGS
  ========================= */

  useEffect(() => {
    const trimmedSearch = songSearch.trim();

    // Empty search → restore original songs
    if (!trimmedSearch) {
      setSongs(defaultSongs);
      setSearchLoading(false);

      return;
    }

    const controller = new AbortController();

    const searchSong = async () => {
      try {
        setSearchLoading(true);

        const response = await fetch(
          `${BACKEND_URL}/artists/${artistId}/search?q=${encodeURIComponent(
            trimmedSearch
          )}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to search for song."
          );
        }

        setSongs(data.songs);

      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Song search error:", error);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      searchSong();
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };

  }, [songSearch, artistId, defaultSongs]);


  /* =========================
     PLAY SONG
  ========================= */

  const playSong = async (uri) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/playback/play`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            uri,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message || "Unable to play song."
        );
      }

    } catch (error) {
      console.error("Play song error:", error);
    }
  };


  /* =========================
     OPEN PLAYLIST POPUP
  ========================= */

  const openPlaylistPopup = (song) => {
    setSelectedSong(song);
    setShowPlaylistPopup(true);
  };


  /* =========================
     CLOSE PLAYLIST POPUP
  ========================= */

  const closePlaylistPopup = () => {
    setSelectedSong(null);
    setShowPlaylistPopup(false);
  };


  if (loading) {
    return (
      <section id="artist_page">
        <p>Finding the artist...</p>
      </section>
    );
  }


  if (error) {
    return (
      <section id="artist_page">
        <p>{error}</p>
      </section>
    );
  }


  if (!artist) {
    return null;
  }


  return (
    <section id="artist_page">

      {/* =========================
          ARTIST
      ========================= */}

      <section id="the_arist">

        <img
          src={artist.image}
          alt={artist.name}
        />

        <span>@{artist.name}</span>

        <p className="about_artist">
          {artist.bio ||
            `${artist.name} has a collection of music waiting for you to discover.`}
        </p>


        <span className="search_for_song">

          <FontAwesomeIcon icon={faSearch} />

          <input
            type="text"
            value={songSearch}
            onChange={(event) => {
              setSongSearch(event.target.value);
            }}
            placeholder={`Search ${artist.name}'s songs...`}
          />

        </span>

      </section>


      {/* =========================
          SONGS
      ========================= */}

      <section id="artists_songs">

        {searchLoading && (
          <p>Looking for that song...</p>
        )}


        {!searchLoading && songs.length === 0 && (
          <p>No songs found.</p>
        )}


        {!searchLoading &&
          songs.map((song) => (

            <article
              className="an_artists_song"
              key={song.id}
              onClick={() => playSong(song.uri)}
            >

              <div className="song_cover">

                <img
                  src={song.albumCover}
                  alt={song.album}
                />

              </div>


              <div className="song_info">

                <h3 className="song_name">
                  {song.name}
                </h3>

                <p className="song_something">
                  {song.album}
                </p>


                <button
                  type="button"
                  className="add_to_playlist"
                  aria-label={`Add ${song.name} to a playlist`}
                  onClick={(event) => {
                    event.stopPropagation();

                    openPlaylistPopup(song);
                  }}
                >
                  <FontAwesomeIcon icon={faAdd} />
                </button>

              </div>

            </article>

          ))}

      </section>


      {/* =========================
          PLAYLIST POPUP
      ========================= */}

      {showPlaylistPopup && selectedSong && (
        <AddToPlaylistPopup
          song={selectedSong}
          onClose={closePlaylistPopup}
        />
      )}

    </section>
  );
}

export default Artist;
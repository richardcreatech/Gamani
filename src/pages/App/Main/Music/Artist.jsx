import { faAdd } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Artist() {
  const { artistId } = useParams();

  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getArtist = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://127.0.0.1:3000/artists/${artistId}`,
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

      </section>


      {/* =========================
          SONGS
      ========================= */}

      <section id="artists_songs">

        {songs.map((song) => (

          <article
            className="an_artists_song"
            key={song.id}
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

              <span className="add_to_playlist">
                <FontAwesomeIcon icon={faAdd} />
              </span>

            </div>

          </article>

        ))}

      </section>

    </section>
  );
}

export default Artist;
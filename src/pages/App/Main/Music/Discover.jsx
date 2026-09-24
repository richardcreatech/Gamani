import {
  faArrowUpRightFromSquare,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Discover() {
  const navigate = useNavigate();

  const [artists, setArtists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const getArtists = async () => {
      try {
        setLoading(true);
        setError("");

        const trimmedSearch = searchTerm.trim();

        let url;

        // Blank input → discover artists
        if (!trimmedSearch) {
          url = "http://127.0.0.1:3000/discover/artists";
        }

        // Search input → search artists
        else {
          url = `http://127.0.0.1:3000/search/artists?q=${encodeURIComponent(
            trimmedSearch
          )}`;
        }

        const response = await fetch(url, {
          credentials: "include",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to get artists."
          );
        }

        setArtists(data.artists);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Artist request error:", error);
        setError(error.message);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    // Wait a little after typing before searching
    const timeout = setTimeout(() => {
      getArtists();
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchTerm]);

  return (
    <section id="discover_new_taste">

      <header className="discover-header">

        <div>
          <p className="discover-eyebrow">
            DISCOVERY MODE
          </p>

          <h1>
            Find something
            <span>new.</span>
          </h1>

          <p>
            Artists you might not know yet.
            <br />
            Maybe you'll like them. Maybe you'll find your new obsession.
          </p>
        </div>

        <div className="spotify-search">

          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search for an artist..."
          />

        </div>

        <div className="discover-doodle">
          ♪
        </div>

      </header>


      <div className="artist-list">

        {loading && (
          <p>
            {searchTerm.trim()
              ? "Looking for them..."
              : "Finding some music for you..."}
          </p>
        )}


        {!loading && error && (
          <p>{error}</p>
        )}


        {!loading &&
          !error &&
          artists.map((artist) => (

            <article
              className="an_artist"
              key={artist.id}
            >

              <div className="artist-image">

                <img
                  src={artist.image}
                  alt={artist.name}
                />

                <button
                  className="explore_artist"
                  onClick={() =>
                    navigate(
                      `/app/spotify/artist/${artist.id}`
                    )
                  }
                >
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                  />
                </button>

              </div>


              <div className="artist-info">

                <h3>{artist.name}</h3>

                <span>
                  {artist.genres?.length > 0
                    ? artist.genres
                        .slice(0, 2)
                        .join(" • ")
                    : "Artist"}
                </span>

              </div>

            </article>

          ))}

      </div>

    </section>
  );
}

export default Discover;
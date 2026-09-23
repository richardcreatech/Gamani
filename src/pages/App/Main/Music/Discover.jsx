import {
  faArrowUpRightFromSquare,
  faMagnifyingGlass
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

function Discover() {
   const navigate = useNavigate();
  return (
    <section id="discover_new_taste">
      <header className="discover-header">
        <div>
          <p className="discover-eyebrow">DISCOVERY MODE</p>

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
    placeholder="Search for an artist..."
  />
</div>
        <div className="discover-doodle">
          ♪
        </div>
      </header>

      <div className="artist-list">
   
        <article className="an_artist">
          <div className="artist-image">
            <img
              src="https://i.pinimg.com/1200x/d1/3c/7d/d13c7d79cc864d2cd45fd831e864bbb2.jpg"
              alt="Artist"
            />

            <button onClick={() => navigate("/app/spotify/artist")}className="explore_artist">
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </button>
          </div>

          <div className="artist-info">
            <h3>Artists Name</h3>
            <span>Pop • Electronic</span>
          </div>
        </article>
        <article className="an_artist">
          <div className="artist-image">
            <img
              src="https://i.pinimg.com/736x/38/42/ee/3842ee395320ce6d6bfbe85ebc6585df.jpg"
              alt="Artist"
            />

            <button  onClick={() => navigate("/app/spotify/artist")}
 className="explore_artist">
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </button>
          </div>

          <div className="artist-info">
            <h3>Artists Name</h3>
            <span>Alternative • Indie</span>
          </div>
        </article>

      </div>
    </section>
  );
}

export default Discover;

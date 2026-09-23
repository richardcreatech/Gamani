import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faHouse,
  faCompass,
  faMusic,
  faHeart,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

function Spotify_Main() {
  return (
    <main id="spotify_main">
      <section id="current_spotify_page">
        <Outlet />
      </section>

      <aside id="spotify_navigation">
        <div className="gamani-mark">G</div>

        <nav>
          <NavLink to="home" className="spotify-nav-item">
            <FontAwesomeIcon icon={faHouse} />
            <span>Home</span>
          </NavLink>

          <NavLink to="discover" className="spotify-nav-item">
            <FontAwesomeIcon icon={faCompass} />
            <span>Discover</span>
          </NavLink>

          <NavLink to="playlists" className="spotify-nav-item">
            <FontAwesomeIcon icon={faMusic} />
            <span>Playlists</span>
          </NavLink>

          <NavLink to="saved" className="spotify-nav-item">
            <FontAwesomeIcon icon={faHeart} />
            <span>Saved</span>
          </NavLink>
        </nav>

        <NavLink to="profile" className="spotify-nav-item spotify-nav-profile">
          <FontAwesomeIcon icon={faUser} />
          <span>Profile</span>
        </NavLink>
      </aside>
    </main>
  );
}

export default Spotify_Main;

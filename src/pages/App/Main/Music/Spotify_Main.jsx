import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCompass,
  faMusic,
  faUser,
  faVolume,
  faPhoneAlt
} from "@fortawesome/free-solid-svg-icons";

function Spotify_Main() {
  return (
    <main id="spotify_main">
      <section id="current_spotify_page">
        <Outlet />
      </section>

      <aside id="spotify_navigation">
        <div className="gamani-mark"><FontAwesomeIcon icon={faVolume}/></div>

        <nav>
      

          <NavLink to="" className="spotify-nav-item">
            <FontAwesomeIcon icon={faCompass} />
            <span>Discover</span>
          </NavLink>

          <NavLink to="playlists" className="spotify-nav-item">
            <FontAwesomeIcon icon={faMusic} />
            <span>Playlists</span>
          </NavLink>

          <NavLink to="listen" className="spotify-nav-item">
            <FontAwesomeIcon icon={faPhoneAlt} />
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

import { Outlet, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../../../../../public/s_logo.png"
import {
  faCompass,
  faMusic,
  faUser,
  faMobile
} from "@fortawesome/free-solid-svg-icons";

function Spotify_Main() {
  return (
    <main id="spotify_main">
      <section id="current_spotify_page">
        <Outlet />
      </section>

      <aside id="spotify_navigation">

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
            <FontAwesomeIcon icon={faMobile} />
            <span>Saved</span>
          </NavLink>
        </nav>

        <NavLink to="profile" className="spotify-nav-item spotify-nav-profile">
       <img width={30} src={logo} alt="" />
          <span>Profile</span>
        </NavLink>
      </aside>
    </main>
  );
}

export default Spotify_Main;

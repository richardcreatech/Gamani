import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faSpotify,
} from "@fortawesome/free-brands-svg-icons";

import {
  faEnvelope,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";

import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer id="footer">
      <nav>
        <ul>

            <li>
            <Link to="">
              <FontAwesomeIcon icon={faSpotify} />
              <span>Spotify</span>
            </Link>
          </li>

          <li>
            <Link to="">
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Mail</span>
            </Link>
          </li>

          <li>
            <Link to="">
              <FontAwesomeIcon icon={faCalendarDays} />
              <span>Calendar</span>
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default Footer;
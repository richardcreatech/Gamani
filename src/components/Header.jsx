import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import { faSun, faUser } from "@fortawesome/free-solid-svg-icons";
import logo from "./../assets/logo_2.png";

function Header() {
  return (
    <header id="header">
      <div className="logo-container">
        <img
          src={logo}
          alt="Gamani Logo"
          className="header__logo"
        />

        {/* <span className="brand-name">Gamani</span> */}
      </div>

      <div className="me_links">
        <FontAwesome icon={faSun} />
        <FontAwesome icon={faUser} />
      </div>
    </header>
  );
}

export default Header;
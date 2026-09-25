import { useState } from "react";
import { FontAwesomeIcon as FontAwesome } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import logo from "./../assets/logo_2.png";

function Header() {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark-mode")
  );

  const toggleTheme = () => {
    const newMode = !darkMode;

    setDarkMode(newMode);

    document.documentElement.classList.toggle("dark-mode", newMode);
  };

  return (
    <header id="header">
      <div className="logo-container">
        <img
          src={logo}
          alt="Gamani Logo"
          className="header__logo"
        />
      </div>

      <div className="me_links">
        <span
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          <FontAwesome icon={darkMode ? faMoon : faSun} />
        </span>

        <FontAwesome icon={faUser} />
      </div>
    </header>
  );
}

export default Header;
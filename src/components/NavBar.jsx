import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Navbar.css";

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          MOVIE<span className="brand-accent">BASS</span>
        </Link>
        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/favorites"
            className={`nav-link ${location.pathname === "/favorites" ? "active" : ""}`}
          >
            My List
          </Link>
        </div>
      </div>
      <div className="navbar-right">
        <span className="netflix-badge">STREAM HD</span>
      </div>
    </nav>
  );
}

export default NavBar;

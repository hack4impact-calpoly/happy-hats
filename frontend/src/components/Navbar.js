import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import styles from "./Navbar.css";
import logo from "../imgs/logo.png";

function NavBar() {
  return (
    <Navbar style={{styles}} expand="md">
      <Navbar.Brand>
        <Link to="/"><img
          src={logo}
          width="320"
          height="80"
          className="d-inline-block align-top"
          alt="Happy Logo"
        /></Link>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Link style={{textDecoration: 'none'}} className="link_text" to ="/announcements">
            Announcements
          </Link>
          <Link style={{textDecoration: 'none'}} className="link_text" to="/calendar">
            Calendar
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;

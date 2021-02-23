import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <Navbar bg="light" expand="lg">
      <Link to="/">Happy Hats</Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Link to ="/announcements">
            Announcements
          </Link>
          <Link to="/login">
            Calendar
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;

import { Navbar, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

function NavBar() {
  return (
    <Navbar bg="light" expand="lg">
      <Nav.Link as={NavLink} to="/">Happy Hats</Nav.Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link component={NavLink} to="/login">
            Announcements
          </Nav.Link>
          <Nav.Link component={NavLink} to="/login">
            Calendar
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;

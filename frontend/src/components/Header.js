import { Navbar, Nav } from "react-bootstrap";
import { Link } from 'react-router-dom';

function Header() {
  return (
    <Navbar bg="light">
      <Navbar.Brand href="#home"><Link to="/">Happy Hats</Link></Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Link to='/announcements'>Announcement</Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function MainNavbar() {
  return (
    <Navbar className='MainNavbar' variant="dark">
      <Container>
        <Navbar.Brand href="#home"><h2>NDZ-Tracker</h2></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
           
            <NavDropdown title="Sort pilots by" id="collasible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Distance</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Name
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Time</NavDropdown.Item>
           
            </NavDropdown>
          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search pilots"
              className="me-2"
              aria-label="Search"
            />
            <Button >Search</Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavbar;
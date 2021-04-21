import './Footer.css';
import title from "../../imgs/footerLogo.png";
import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  return (
    <footer className="main-footer">
        <Container>
            <Row>
                <Col> 
                    <div className="contact-num">
                        <h1 className="Contact">Contact: </h1>
                        <h2 className="number"> (310) 7887-0970 </h2>
                    </div>
                </Col>
                <Col> 
                    <p className="middle-info"> &copy; 2019 Happy Hats for Kids in Hospitals</p>
                    <p className="middle-info"> Happy hats For Kids In Hospitals is a California 501(C)(3) Nonprofit Organization</p>
                    <p className="middle-info"> Founded in 1991 by Sheri Schrier</p>
                </Col>
                <Col> 
                    <div className="title"> 
                        <img
                        src={title}
                        width="100%"
                        height="50%"
                        alt="Happy Hats"
                        />
                    </div>
                    <p className="hack"> Made with &hearts; by Hack4Impact </p>
                </Col>
            </Row>
        </Container>
    </footer>
        
  );
}

export default Footer;

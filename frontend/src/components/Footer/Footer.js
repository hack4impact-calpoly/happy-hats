import './Footer.css';
import title from "../../imgs/footerLogo.png";

function Footer() {
  return (
    <div className="main-footer">
        <div className="row">
            <div className="column"> 
                <div className="contact-num">
                    <h1 className="Contact">Contact: </h1>
                    <h2 className="number"> (310) 7887-0970 </h2>
                </div>
            </div>
            <div className="column"> 
                <p className="middle-info"> &copy; 2019 Happy Hats for Kids in Hospitals</p>
                <p className="middle-info"> Happy hats For Kids In Hospitals is a California 501(C)(3) Nonprofit Organization</p>
                <p className="middle-info"> Founded in 1991 by Sheri Schrier</p>
            </div>
            <div className="column"> 
                <div className="title"> 
                    <img
                    src={title}
                    width="350"
                    height="100"
                    alt="Happy Hats"
                    />
                </div>
                <p className="hack"> Made with love by Hack4Impact &hearts; </p>
            </div>
        </div>
    </div>
        
        
  );
}

export default Footer;

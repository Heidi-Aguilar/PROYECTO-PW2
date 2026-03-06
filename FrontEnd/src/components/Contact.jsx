import logo_facebook from "../assets/images/facebook_logo.png";
import logo_x from "../assets/images/x_logo.png";
import logo_instagram from "../assets/images/instagram_logo.png";
import "./Contact.css";

function Contact (){
    return(
        <section id="contacto" className="section-contact">
            <div className="container">
                <h2>Contáctanos</h2>
                <div className="redes-sociales">
                    <a href="https://www.facebook.com/oyevaquero" target="_blank" rel="noopener" aria-label="Facebook">
                        <img src={logo_facebook} alt="Icono de Facebook" />
                    </a>
                    <a href="https://www.twitter.com/oyevaquero" target="_blank" rel="noopener" aria-label="Twitter">
                        <img src={logo_x} alt="Icono de Twitter" />
                    </a>
                    <a href="https://www.instagram.com/oyevaquero" target="_blank" rel="noopener" aria-label="Instagram">
                        <img src={logo_instagram} alt="Icono de Instagram" />
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Contact;
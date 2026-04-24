import { useEffect, useRef, useState } from "react";
import logo from "../assets/images/logo.png";
import './Header.css';

function Header(){

    const headerRef = useRef(null);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const updateRevealStates = () => {
        const header = headerRef.current;
        const currentScrollY = window.scrollY;

        if (!header) return;

        if (currentScrollY <= 8) {
            header.classList.remove("header-hidden");
        } 
        else if (currentScrollY > lastScrollY + 4) {
            header.classList.add("header-hidden");
        } 
        else if (currentScrollY < lastScrollY - 4) {
            header.classList.remove("header-hidden");
        }

        setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", updateRevealStates);

        return () => {
        window.removeEventListener("scroll", updateRevealStates);
        };
    }, [lastScrollY]);

    return(
        <header ref={headerRef} className="header">
            <div className="marca">
                <img className='logo' src={logo} alt="logo" />
            </div>

            <nav className="nav">
                <a href="#catalogo">Catalogo</a>
                <a aria-disabled="true">Renta</a>
                <a href="#ventajas">Nosotros</a>
                <a href="#contacto">Cuenta</a>
            </nav>

        </header>
    )
}

export default Header;


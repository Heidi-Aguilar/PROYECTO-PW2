import { useEffect } from "react"
import { Link } from "react-router-dom"
import "./Principal.css"

function Principal(){
    useEffect(() => {
        const existingScript = document.getElementById("principal-effects-script")
        if (existingScript) {
            existingScript.remove()
        }

        // Reset the singleton guard so the latest script can initialize again.
        delete window.__principalEffectsInitialized

        const script = document.createElement("script")
        script.id = "principal-effects-script"
        script.src = `/principal-main.js?v=${Date.now()}`
        script.defer = true
        document.body.appendChild(script)

        return () => {
            script.remove()
            delete window.__principalEffectsInitialized
        }
    }, [])

    return(
        <>
            <header className="header">
                <div className="header-top">
                    <img className="brand-logo" src="/img/logo.png" alt="Oye Vaquero" />
                </div>

                <div className="header-nav-row">
                    <div className="nav-social" aria-label="Redes sociales">
                        <a href="https://www.facebook.com/oyevaquero" target="_blank" rel="noopener" aria-label="Facebook">f</a>
                        <a href="https://x.com/oyevaquero" target="_blank" rel="noopener" aria-label="X">x</a>
                        <a href="https://www.instagram.com/oyevaquero" target="_blank" rel="noopener" aria-label="Instagram">i</a>
                        <a href="#contacto" aria-label="Contacto">o</a>
                    </div>

                    <nav className="nav">
                        <a href="#catalogo">Catalogo</a>
                        <Link to="/renta">Renta</Link>
                    </nav>

                    <a className="nav-search" href="#" aria-label="Buscar">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M15.8 14.4h-.74l-.26-.25a6.2 6.2 0 1 0-.66.66l.25.26v.74L19 20.5 20.5 19l-4.7-4.6zm-5.6 0a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4z"/>
                        </svg>
                    </a>
                </div>
            </header>

            <section className="hero" aria-labelledby="hero-title">
                <div className="hero-inner">
                    <h1 id="hero-title" className="hero-title" aria-live="polite">
                        <span className="word">Renta.</span>
                        <span className="word">Explora.</span>
                        <span className="word">Muévete.</span>
                    </h1>
                    <p className="hero-sub">
                        Renta en minutos, sin complicaciones.
                    </p>
                </div>

                <div className="hero-bg" role="presentation" aria-hidden="true">
                    <img className="hero-video" src="/img/1e.jpg" alt="" />
                </div>
            </section>

            <section id="catalogo" className="section-catalogo">
                <div className="container">
                    <div className="catalogo-intro">
                        <p className="catalogo-kicker">Catalogo</p>
                        <h2>Encuentra tu proximo ride</h2>
                        <p className="catalogo-copy">Elige el vehiculo ideal para tu dia, desde trayectos cortos hasta recorridos largos por la ciudad.</p>
                    </div>

                    <div className="catalogo-grid">
                        <article className="catalogo-card">
                            <div className="catalogo-card-image" style={{ backgroundImage: "url('/img/patin.jpeg')" }} role="img" aria-label="Scooter electrico"></div>
                            <div className="catalogo-card-body">
                                <h3>Scooter Electrico</h3>
                                <p>Agil, rapido y perfecto para moverte entre avenidas con estilo.</p>
                                <Link to="/renta" className="catalogo-card-link">Reservar</Link>
                            </div>
                        </article>

                        <article className="catalogo-card featured">
                            <div className="catalogo-card-image" style={{ backgroundImage: "url('/img/bici.jpeg')" }} role="img" aria-label="Bicicleta electrica"></div>
                            <div className="catalogo-card-body">
                                <h3>Bicicleta Electrica</h3>
                                <p>Comoda para recorridos largos y paseos con una conduccion suave.</p>
                                <Link to="/renta" className="catalogo-card-link">Reservar</Link>
                            </div>
                        </article>

                        <article className="catalogo-card">
                            <div className="catalogo-card-image" style={{ backgroundImage: "url('/img/88.png')" }} role="img" aria-label="Patineta electrica"></div>
                            <div className="catalogo-card-body">
                                <h3>Patineta Electrica</h3>
                                <p>Compacta y divertida para trayectos urbanos cortos y rapidos.</p>
                                <Link to="/renta" className="catalogo-card-link">Reservar</Link>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

        </>
    )
}

export default Principal;



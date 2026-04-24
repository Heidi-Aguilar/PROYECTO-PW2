import { useEffect } from "react"
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
                        <a href="../Renta/renta.html">Renta</a>
                        <a href="#contacto">Contacto</a>
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
                                <a href="../Renta/renta.html" className="catalogo-card-link">Reservar</a>
                            </div>
                        </article>

                        <article className="catalogo-card featured">
                            <div className="catalogo-card-image" style={{ backgroundImage: "url('/img/bici.jpeg')" }} role="img" aria-label="Bicicleta electrica"></div>
                            <div className="catalogo-card-body">
                                <h3>Bicicleta Electrica</h3>
                                <p>Comoda para recorridos largos y paseos con una conduccion suave.</p>
                                <a href="../Renta/renta.html" className="catalogo-card-link">Reservar</a>
                            </div>
                        </article>

                        <article className="catalogo-card">
                            <div className="catalogo-card-image" style={{ backgroundImage: "url('/img/88.png')" }} role="img" aria-label="Patineta electrica"></div>
                            <div className="catalogo-card-body">
                                <h3>Patineta Electrica</h3>
                                <p>Compacta y divertida para trayectos urbanos cortos y rapidos.</p>
                                <a href="../Renta/renta.html" className="catalogo-card-link">Reservar</a>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section id="contacto" className="section-contact">
                <div className="container">
                    <h2>Contáctanos</h2>
                    <div className="redes-sociales">
                        <a href="https://www.facebook.com/oyevaquero" target="_blank" rel="noopener" aria-label="Facebook">
                            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.2c0-.9.3-1.5 1.6-1.5h1.2V5.1c-.2 0-.9-.1-1.8-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.6v7h2.9z"/>
                            </svg>
                        </a>
                        <a href="https://x.com/oyevaquero" target="_blank" rel="noopener" aria-label="X">
                            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M18.9 3h2.8l-6.2 7.1L23 21h-6l-4.7-6.1L7 21H4.2l6.7-7.6L2 3h6.2l4.2 5.6L18.9 3zm-1 16h1.6L7.2 4.9H5.5L17.9 19z"/>
                            </svg>
                        </a>
                        <a href="https://www.instagram.com/oyevaquero" target="_blank" rel="noopener" aria-label="Instagram">
                            <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8zm9.1 1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Principal;



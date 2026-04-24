import { useEffect } from "react"
import "./Principal.css"

function Principal(){
    useEffect(() => {
        const existingScript = document.getElementById("principal-effects-script")
        if (existingScript) {
            return
        }

        const script = document.createElement("script")
        script.id = "principal-effects-script"
        script.src = "/principal-main.js"
        script.defer = true
        document.body.appendChild(script)
    }, [])

    return(
        <>
            <header className="header">
                <div className="marca">
                    <img className="logo" src="/img/logo.png" alt="Logo" />
                </div>

                <nav className="nav">
                    <a href="#como-funciona">Cómo funciona</a>
                    <a href="../Renta/renta.html">Renta</a>
                    <a href="#ventajas">Nosotros</a>
                    <a href="../Perfil/Perfil.html">Cuenta</a>
                </nav>
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

                    <div className="hero-cta">
                            <a href="#como-funciona">Ver cómo funciona</a>
                            <a href="#tipos">Ver catálogo</a>
                    </div>
                </div>

                <div className="hero-bg" role="presentation" aria-hidden="true">
                    <img className="hero-video" src="/img/1e.jpg" alt="" />
                </div>
            </section>

            <section id="como-funciona" className="section-howto">
                <div className="container">
                    <h2>Cómo funciona</h2>
                    <ol className="steps">
                        <li className="step-elige">
                            <span className="elige-center-photo elige-center-top" aria-hidden="true"></span>
                            <span className="elige-center-photo elige-center-mid" aria-hidden="true"></span>
                            <span className="elige-tower elige-tower-left" aria-hidden="true">
                                <span className="elige-tower-photo elige-left-top"></span>
                                <span className="elige-tower-photo elige-left-mid"></span>
                                <span className="elige-tower-photo elige-left-bottom"></span>
                            </span>
                            <span className="elige-tower elige-tower-right" aria-hidden="true">
                                <span className="elige-tower-photo elige-right-top"></span>
                                <span className="elige-tower-photo elige-right-mid"></span>
                                <span className="elige-tower-photo elige-right-bottom"></span>
                            </span>
                            <span className="elige-stack-third" aria-hidden="true"></span>
                            <h3>Elige</h3>
                            <p>Escoge el vehículo que necesitas y la duración de tu renta.</p>
                        </li>
                        <li className="step-reserva">
                            <h3>Reserva</h3>
                            <p>Selecciona fecha y hora, realiza tu pago al instante.</p>
                        </li>
                        <li className="step-disfruta">
                            <h3>Disfruta</h3>
                            <p>Escanea el código QR del vehículo y comienza tu viaje.</p>
                        </li>
                    </ol>
                    <div className="note">
                        <h3>¡Arráncate, compadre!</h3>
                    </div>
                </div>
            </section>

            <section id="tipos" className="section-types">
                <div className="container">
                    <h2>En stock</h2>
                    <div className="types-grid">
                        <article className="type-card">
                            <div className="type-image" style={{ backgroundImage: "url('/img/patin.jpeg')" }} role="img" aria-label="Scooter eléctrico"></div>
                            <h3>Scooter Eléctrico</h3>
                            <p>Perfecto para moverte por la ciudad de forma rápida y ecológica.</p>
                        </article>
                        <article className="type-card">
                            <div className="type-image" style={{ backgroundImage: "url('/img/bici.jpeg')" }} role="img" aria-label="Bicicleta eléctrica"></div>
                            <h3>Bicicleta Eléctrica</h3>
                            <p>Ideal para paseos relajados o desplazamientos más largos sin esfuerzo.</p>
                        </article>
                        <article className="type-card">
                            <div className="type-image" style={{ backgroundImage: "url('/img/88.png')" }} role="img" aria-label="Patineta eléctrica"></div>
                            <h3>Patineta Eléctrica</h3>
                            <p>Divertida y compacta, perfecta para trayectos cortos y urbanos.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section id="ventajas" className="section-benefits">
                <div className="container">
                    <h3>Después de todo, aún te preguntarás</h3>
                    <h2>¿Por qué rentar con nosotros?</h2>
                    <ul className="benefits-list">
                        <li>
                            <strong>Fácil y rápido:</strong>
                            <p>Reserva en 3 simples pasos.</p>
                        </li>
                        <li>
                            <strong>Variedad de opciones:</strong>
                            <p>¡Tenemos el vehículo perfecto para ti, rey!</p>
                        </li>
                        <li>
                            <strong>Precios competitivos:</strong>
                            <p>Disfruta de tarifas accesibles y promociones especiales para que moverte sea aún más económico.</p>
                        </li>
                    </ul>
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
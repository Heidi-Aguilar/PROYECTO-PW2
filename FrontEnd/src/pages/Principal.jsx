import Header from "../components/Header.jsx"
import Contact from "../components/Contact.jsx"
import videoHero from "../assets/videos/1.mp4"
import "./Principal.css"

function Principal(){
    return(
        <>
            <Header />
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
                    <video className="hero-video" autoPlay muted loop playsInline preload="auto">
                        <source src={videoHero} type="video/mp4" />
                    </video>
                </div>
            </section>
            <Contact />
        </>
    )
}

export default Principal;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/LOGO2.png";
import avatarVaquero from "../assets/images/AVATAR_USER.jpg.jpeg";
import userpng from "../assets/images/user1.png";
import "./Perfil.css";

function Perfil() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const stats = [
    { label: "Rutas", value: "24", icon: "bx-map-alt" },
    { label: "Kms", value: "158", icon: "bx-run" },
    { label: "Rango", value: "Sheriff", icon: "bx-star" }
  ];

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

  const goToPayment = () => {
    showToast("Te llevamos a Renta para gestionar tu pago.");
    window.setTimeout(() => navigate("/renta?from=perfil&focus=pago"), 300);
  };

  const goToStations = () => {
    showToast("Te llevamos a Renta para ver estaciones.");
    window.setTimeout(() => navigate("/renta?from=perfil&focus=estaciones"), 300);
  };

  const logout = () => {
    window.sessionStorage.removeItem("renta-active-trip");
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="perfil-page">
      <header className="perfil-header">
        <div className="perfil-header-top">
          <img className="perfil-brand-logo" src="/img/logo.png" alt="Oye Vaquero" />
        </div>

        <div className="perfil-header-nav-row">
          <div className="perfil-nav-social" aria-label="Redes sociales">
            <a href="https://www.facebook.com/oyevaquero" target="_blank" rel="noopener" aria-label="Facebook">f</a>
            <a href="https://x.com/oyevaquero" target="_blank" rel="noopener" aria-label="X">x</a>
            <a href="https://www.instagram.com/oyevaquero" target="_blank" rel="noopener" aria-label="Instagram">i</a>
            <Link to="/login" aria-label="Login">o</Link>
          </div>

          <nav className="perfil-nav">
            <Link to="/">Catalogo</Link>
            <Link to="/renta">Renta</Link>
            <Link to="/manual">Manual</Link>
            <Link to="/perfil">Perfil</Link>
          </nav>

          <Link to="/perfil" className="perfil-nav-user" aria-label="Perfil">
            <img src={userpng} alt="Perfil" />
          </Link>
        </div>
      </header>

      <div className="perfil-body">
        <div className="perfil-card-container anim-slide-up">
          <div className="profile-sidebar">
            <div className="avatar-frame">
              <img src={avatarVaquero} alt="Avatar" className="user-photo" />
              <div className="badge-rank icon-sway">
                <i className="bx bxs-star"></i>
              </div>
            </div>
            <h2 className="rye-font user-name">Juan "El Rapido"</h2>
            <p className="since-text">Desde: Abril 2026</p>
            <div className="status-pill">
              <span className="dot pulse-green"></span> EN RUTA
            </div>
          </div>

          <div className="profile-main">
            <header className="profile-header">
              <img src={logo} alt="Logo" className="mini-logo anim-float" />
              <h3 className="card-title-vaquero">Expediente</h3>
            </header>

            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item anim-pop-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <i className={`bx ${stat.icon} stat-icon`}></i>
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="actions-column">
              <button className="leather-btn" type="button" onClick={goToPayment}>
                <i className="bx bxs-credit-card"></i> METODOS DE PAGO
              </button>
              <button className="leather-btn" type="button" onClick={goToStations}>
                <i className="bx bxs-map-pin"></i> MIS ESTACIONES
              </button>
              <button className="leather-btn danger" type="button" onClick={logout}>
                <i className="bx bx-log-out"></i> CERRAR SESION
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`perfil-toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

export default Perfil;

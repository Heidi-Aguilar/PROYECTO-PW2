import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/LOGO2.png";
import avatarVaquero from "../assets/images/AVATAR_USER.jpg.jpeg";
import "./Perfil.css";

function Perfil() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Si no hay sesión, redirigir al login
      navigate("/auth");
      return;
    }

    const datosUsuario = localStorage.getItem("usuario");
    if (datosUsuario) {
      setUsuario(JSON.parse(datosUsuario));
    }
  }, [navigate]);

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
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/auth");
  };

  // Mientras carga el usuario no renderizar nada
  if (!usuario) return null;

  return (
    <div className="perfil-page">
      <div className="perfil-body">
        <div className="perfil-card-container anim-slide-up">
          <div className="profile-sidebar">
            <div className="avatar-frame">
              <img src={avatarVaquero} alt="Avatar" className="user-photo" />
              <div className="badge-rank icon-sway">
                <i className="bx bxs-star"></i>
              </div>
            </div>

            {/* Nombre real del usuario */}
            <h2 className="rye-font user-name">
              {usuario.nombre} {usuario.apellido}
            </h2>

            {/* Correo del usuario */}
            <p className="since-text">{usuario.correo}</p>

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
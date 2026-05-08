import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/LOGO2.png";
import avatarVaquero from "../assets/images/AVATAR_USER.jpg.jpeg";
import "./Perfil.css";

function Perfil() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const datosBasicos = JSON.parse(localStorage.getItem("usuario"));
    if (!datosBasicos?.id) return;

    // Traer perfil completo desde el backend
    fetch(`http://localhost:5000/api/usuarios/${datosBasicos.id}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setUsuario(data))
      .catch(err => console.error("Error al cargar perfil:", err));

  }, [navigate]);

  // --- CAMBIAR FOTO ---
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  // --- CAMBIAR CONTRASEÑA ---
  const handleSavePassword = async () => {
    if (newPassword.trim() === "") {
      showToast("La contraseña no puede estar vacía.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Las contraseñas no coinciden.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (res.ok) {
        showToast("¡Contraseña actualizada con éxito!");
        setNewPassword("");
        setConfirmPassword("");
        setShowModal(false);
      } else {
        showToast("Error al actualizar la contraseña en el servidor.");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Error de conexión con el servidor.");
    }
  };

  // --- CERRAR SESIÓN ---
  const logout = () => {
    window.sessionStorage.removeItem("renta-active-trip");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const goToPayment = () => {
    showToast("Te llevamos a Renta para gestionar tu pago.");
    window.setTimeout(() => navigate("/renta?from=perfil&focus=pago"), 300);
  };

  const goToStations = () => {
    showToast("Te llevamos a Renta para ver estaciones.");
    window.setTimeout(() => navigate("/renta?from=perfil&focus=estaciones"), 300);
  };

  const stats = [
    { label: "Rutas", value: "24", icon: "bx-map-alt" },
    { label: "Kms", value: "158", icon: "bx-run" },
    { label: "Rango", value: "Sheriff", icon: "bx-star" }
  ];

  if (!usuario) return null;

  return (
    <div className="perfil-page">
      <div className="perfil-body">
        <div className="perfil-card-container anim-slide-up">

          {/* SIDEBAR IZQUIERDO */}
          <div className="profile-sidebar">

            {/* Foto de perfil con botón de edición */}
            <div
              className="avatar-frame"
              style={{ position: "relative", cursor: "pointer" }}
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={photo || avatarVaquero}
                alt="Avatar"
                className="user-photo"
                style={{ transition: "transform 0.3s" }}
              />
              <div className="badge-rank icon-sway" style={{ position: "absolute", bottom: 0, right: 0 }}>
                <i className="bx bxs-camera"></i>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
            </div>

            <h2 className="rye-font user-name">
              {usuario.nombre} {usuario.apellido}
            </h2>
            <p className="since-text">{usuario.correo}</p>

            <div className="status-pill">
              <span className="dot pulse-green"></span> EN RUTA
            </div>

            {/* Cambiar contraseña */}
            <button
              className="leather-btn"
              type="button"
              style={{ marginTop: "16px" }}
              onClick={() => setShowModal(true)}
            >
              <i className="bx bxs-lock-alt"></i> CAMBIAR CONTRASEÑA
            </button>

            {/* Panel admin — solo si el rol es admin */}
            {usuario.rol === "admin" && (
              <button
                className="leather-btn"
                type="button"
                style={{ marginTop: "10px" }}
                onClick={() => navigate("/admin")}
              >
                <i className="bx bxs-cog"></i> PANEL DE CONTROL
              </button>
            )}

            {/* Cerrar sesión */}
            <button
              className="leather-btn danger"
              type="button"
              style={{ marginTop: "10px" }}
              onClick={logout}
            >
              <i className="bx bx-log-out"></i> CERRAR SESIÓN
            </button>
          </div>

          {/* PANEL DERECHO */}
          <div className="profile-main">
            <header className="profile-header">
              <img src={logo} alt="Logo" className="mini-logo anim-float" />
            </header>

            <div className="info-grid">
              <div className="field">
                <span className="label">País</span>
                <p className="value">{usuario.pais}</p>
              </div>
              <div className="field">
                <span className="label">Fecha de nacimiento</span>
                <p className="value">{new Date(usuario.fechaNacimiento).toLocaleDateString('es-MX')}</p>
              </div>
              <div className="field full">
                <span className="label">Correo electrónico</span>
                <p className="value">{usuario.correo}</p>
              </div>
            </div>

            <div className="actions-column">
              <button className="leather-btn" type="button" onClick={goToPayment}>
                <i className="bx bxs-credit-card"></i> MÉTODOS DE PAGO
              </button>
              <button className="leather-btn" type="button" onClick={goToStations}>
                <i className="bx bxs-map-pin"></i> MIS ESTACIONES
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CAMBIAR CONTRASEÑA */}
      {showModal && (
        <div
          className="modal active"
          style={{ display: "grid" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="modal-box">
            <h3>Actualizar Seguridad</h3>
            <input
              type="password"
              className="mod-input"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              className="mod-input"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="mod-btns">
              <button className="btn-save" type="button" onClick={handleSavePassword}>Guardar</button>
              <button className="btn-close" type="button" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className={`perfil-toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

export default Perfil;
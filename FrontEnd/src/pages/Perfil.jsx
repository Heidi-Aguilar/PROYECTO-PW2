import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/LOGO2.png";
import avatarVaquero from "../assets/images/AVATAR_USER.jpg.jpeg";
import "./Perfil.css";

function Perfil() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // (Nota de seguridad: Recuerda migrar esto a la BD pronto como hicimos en Renta)
  const [walletMethods, setWalletMethods] = useState(() => {
    const raw = localStorage.getItem("perfil-wallet-methods");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        localStorage.removeItem("perfil-wallet-methods");
      }
    }
    return [
      { id: 1, brand: "Visa", alias: "Principal", last4: "4242", preferred: true },
      { id: 2, brand: "Mastercard", alias: "Respaldo", last4: "7821", preferred: false }
    ];
  });
  
  const [newWalletMethod, setNewWalletMethod] = useState({ brand: "Visa", alias: "", cardNumber: "" });
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

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
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsuario(data);
        // ✅ Cargar la foto guardada en la BD si existe
        if (data.fotoPerfil) {
          setPhoto(data.fotoPerfil);
        }
      })
      .catch(err => console.error("Error al cargar perfil:", err));
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("perfil-wallet-methods", JSON.stringify(walletMethods));
  }, [walletMethods]);

  // --- CAMBIAR FOTO (PASO 5: Límite de peso y guardar en BD) ---
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ VALIDACIÓN: Peso máximo de 2MB
    if (file.size > 2 * 1024 * 1024) {
      showToast("⚠️ La imagen pesa demasiado. El límite es de 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Image = ev.target.result;
      setPhoto(base64Image);

      // ✅ GUARDAR en la base de datos
      try {
        await fetch(`http://localhost:5000/api/usuarios/${usuario._id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${localStorage.getItem("token")}` 
          },
          body: JSON.stringify({ fotoPerfil: base64Image })
        });
        showToast("📸 Foto de perfil guardada con éxito.");
      } catch (error) {
        showToast("Error al guardar la foto en el servidor.");
      }
    };
    reader.readAsDataURL(file);
  };

  // --- EDITAR INFORMACIÓN (PASO 5: Modificar datos) ---
  const editarInformacion = async () => {
    const nuevoNombre = prompt("Nuevo nombre:", usuario.nombre);
    const nuevoApellido = prompt("Nuevo apellido:", usuario.apellido);
    const nuevoPais = prompt("Nuevo país:", usuario.pais);

    // Si le da cancelar o deja vacíos los datos, no hacemos nada
    if (!nuevoNombre?.trim() || !nuevoApellido?.trim() || !nuevoPais?.trim()) {
      return showToast("⚠️ Operación cancelada o campos vacíos.");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/usuarios/${usuario._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ nombre: nuevoNombre, apellido: nuevoApellido, pais: nuevoPais })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsuario(data); // Actualizamos la vista instantáneamente
        showToast("✨ ¡Información actualizada!");
      }
    } catch (error) {
      showToast("Error al actualizar la información.");
    }
  };

  // --- CAMBIAR CONTRASEÑA ---
  const handleSavePassword = async () => {
    if (newPassword.trim() === "") return showToast("La contraseña no puede estar vacía.");
    if (newPassword !== confirmPassword) return showToast("Las contraseñas no coinciden.");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return showToast("Debe tener al menos 8 caracteres, una mayúscula, minúscula y un número.");
    }

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/usuarios/${usuario._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ password: newPassword })
      });

      if (res.ok) {
        showToast("¡Contraseña actualizada con éxito!");
        setNewPassword(""); setConfirmPassword(""); setShowModal(false);
      } else {
        showToast("Error al actualizar la contraseña en el servidor.");
      }
    } catch (error) { showToast("Error de conexión con el servidor."); }
  };

  // --- CERRAR SESIÓN ---
  const logout = () => {
    window.sessionStorage.removeItem("renta-active-trip");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const goToPayment = () => setShowWalletModal(true);
  const goToStations = () => {
    showToast("Te llevamos a Renta para ver estaciones.");
    window.setTimeout(() => navigate("/renta?from=perfil&focus=estaciones"), 300);
  };

  const setPreferredMethod = (methodId) => {
    setWalletMethods((prev) => prev.map((method) => ({ ...method, preferred: method.id === methodId })));
    showToast("Método predeterminado actualizado.");
  };

  const removeWalletMethod = (methodId) => {
    setWalletMethods((prev) => {
      const filtered = prev.filter((method) => method.id !== methodId);
      if (filtered.length === 0) return filtered;
      if (filtered.some((method) => method.preferred)) return filtered;
      return filtered.map((method, index) => ({ ...method, preferred: index === 0 }));
    });
    showToast("Método eliminado de la cartera.");
  };

  const addWalletMethod = (event) => {
    event.preventDefault();
    const cleanAlias = newWalletMethod.alias.trim();
    const digitsOnly = newWalletMethod.cardNumber.replace(/\D/g, "");
    if (cleanAlias.length < 2) return showToast("Agrega un alias válido para la tarjeta.");
    if (digitsOnly.length < 12) return showToast("Número de tarjeta inválido.");

    const newItem = { id: Date.now(), brand: newWalletMethod.brand, alias: cleanAlias, last4: digitsOnly.slice(-4), preferred: walletMethods.length === 0 };
    setWalletMethods((prev) => [...prev, newItem]);
    setNewWalletMethod({ brand: "Visa", alias: "", cardNumber: "" });
    showToast("Método agregado a tu cartera virtual.");
  };

  if (!usuario) return null;

  return (
    <div className="perfil-page">
      <div className="perfil-body">
        <div className="perfil-card-container anim-slide-up">

          {/* SIDEBAR IZQUIERDO */}
          <div className="profile-sidebar">
            <div className="avatar-frame" style={{ position: "relative", cursor: "pointer" }} onClick={() => fileInputRef.current.click()}>
              <img src={photo || avatarVaquero} alt="Avatar" className="user-photo" style={{ transition: "transform 0.3s" }} />
              <div className="badge-rank icon-sway" style={{ position: "absolute", bottom: 0, right: 0 }}>
                <i className="bx bxs-camera"></i>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handlePhotoChange} />
            </div>

            <h2 className="rye-font user-name">{usuario.nombre} {usuario.apellido}</h2>
            <p className="since-text">{usuario.correo}</p>

            <div className="status-pill">
              <span className="dot pulse-green"></span> EN RUTA
            </div>

            <button className="leather-btn" type="button" style={{ marginTop: "16px" }} onClick={() => setShowModal(true)}>
              <i className="bx bxs-lock-alt"></i> CAMBIAR CONTRASEÑA
            </button>

            {usuario.rol === "admin" && (
              <button className="leather-btn" type="button" style={{ marginTop: "10px" }} onClick={() => navigate("/admin")}>
                <i className="bx bxs-cog"></i> PANEL DE CONTROL
              </button>
            )}

            <button className="leather-btn danger" type="button" style={{ marginTop: "10px" }} onClick={logout}>
              <i className="bx bx-log-out"></i> CERRAR SESIÓN
            </button>
          </div>

          {/* PANEL DERECHO */}
          <div className="profile-main">
            {/* ✅ PASO 5: Botón integrado en la cabecera */}
            <header className="profile-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <img src={logo} alt="Logo" className="mini-logo anim-float" style={{ margin: 0 }} />
              <button className="leather-btn" type="button" onClick={editarInformacion} style={{ width: "auto", padding: "8px 15px", fontSize: "0.85rem", margin: 0 }}>
                <i className="bx bxs-edit"></i> EDITAR DATOS
              </button>
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
        <div className="modal active" style={{ display: "grid" }} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-box">
            <h3>Actualizar Seguridad</h3>
            <input type="password" className="mod-input" placeholder="Nueva contraseña" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <input type="password" className="mod-input" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <div className="mod-btns">
              <button className="btn-save" type="button" onClick={handleSavePassword}>Guardar</button>
              <button className="btn-close" type="button" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARTERA VIRTUAL */}
      {showWalletModal && (
        <div className="modal active" style={{ display: "grid" }} onClick={(e) => { if (e.target === e.currentTarget) setShowWalletModal(false); }}>
          <div className="modal-box wallet-modal-box">
            <h3>Cartera virtual</h3>
            <p className="wallet-subtitle">Administra tus metodos de pago guardados.</p>

            <div className="wallet-list">
              {walletMethods.length === 0 ? (
                <p className="wallet-empty">No tienes metodos guardados.</p>
              ) : (
                walletMethods.map((method) => (
                  <article className="wallet-item" key={method.id}>
                    <div>
                      <p className="wallet-brand">{method.brand} •••• {method.last4}</p>
                      <p className="wallet-alias">{method.alias}</p>
                    </div>
                    <div className="wallet-item-actions">
                      <button className="wallet-action" type="button" disabled={method.preferred} onClick={() => setPreferredMethod(method.id)}>
                        {method.preferred ? "Predeterminada" : "Marcar principal"}
                      </button>
                      <button className="wallet-action danger" type="button" onClick={() => removeWalletMethod(method.id)}>Eliminar</button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <form className="wallet-form" onSubmit={addWalletMethod}>
              <label>
                Marca
                <select value={newWalletMethod.brand} onChange={(e) => setNewWalletMethod((prev) => ({ ...prev, brand: e.target.value }))}>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">Amex</option>
                </select>
              </label>
              <label>
                Alias
                <input type="text" placeholder="Ejemplo: Nomina" value={newWalletMethod.alias} onChange={(e) => setNewWalletMethod((prev) => ({ ...prev, alias: e.target.value }))} />
              </label>
              <label>
                Tarjeta
                <input type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" value={newWalletMethod.cardNumber} onChange={(e) => setNewWalletMethod((prev) => ({ ...prev, cardNumber: e.target.value }))} />
              </label>
              <button className="btn-save" type="submit">Agregar metodo</button>
            </form>

            <div className="mod-btns" style={{ marginTop: "12px" }}>
              <button className="btn-close" type="button" onClick={() => setShowWalletModal(false)}>Cerrar</button>
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
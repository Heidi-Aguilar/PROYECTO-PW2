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
  
  // ESTADOS DE LA CARTERA VIRTUAL
  const [walletMethods, setWalletMethods] = useState([]);
  
  // ¡AQUÍ REGRESAMOS TODOS TUS CAMPOS!
  const [newWalletMethod, setNewWalletMethod] = useState({ 
    brand: "Visa", 
    alias: "", 
    cardNumber: "", 
    exp: "" 
  });
  
  const fileInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

  const cargarTarjetas = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/usuarios/metodos-pago", {
        headers: { "Authorization": `Bearer ${token}`}
      });
      if (res.ok) {
        setWalletMethods(await res.json());
      }
    } catch (error) {
      console.error("Error al cargar tarjetas:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const datosBasicos = JSON.parse(localStorage.getItem("usuario"));
    if (!datosBasicos?.id) return;

    fetch(`http://localhost:5000/api/usuarios/${datosBasicos.id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsuario(data);
        if (data.fotoPerfil) setPhoto(data.fotoPerfil);
      })
      .catch(err => console.error("Error al cargar perfil:", err));

    cargarTarjetas(token);
  }, [navigate]);

  // --- AGREGAR NUEVA TARJETA ---
  const addWalletMethod = async (event) => {
    event.preventDefault();
    const digitsOnly = newWalletMethod.cardNumber.replace(/\D/g, "");
    
    if (digitsOnly.length < 15) return showToast("⚠️ Número de tarjeta inválido.");
    if (!newWalletMethod.exp) return showToast("⚠️ Falta la fecha de expiración.");

    try {
      const res = await fetch("http://localhost:5000/api/usuarios/metodos-pago", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ 
          numeroTarjeta: digitsOnly, 
          expiracion: newWalletMethod.exp 
        })
      });

      if (res.ok) {
        showToast("💳 ¡Tarjeta agregada a tu Cartera Virtual de forma segura!");
        setNewWalletMethod({ brand: "Visa", alias: "", cardNumber: "", exp: "" });
        cargarTarjetas(localStorage.getItem("token"));
      } else {
        showToast("Error al guardar la tarjeta.");
      }
    } catch (error) {
      showToast("Error de conexión al guardar.");
    }
  };

  // --- ELIMINAR TARJETA (Solo visual para el usuario por ahora) ---
  const removeWalletMethod = (id) => {
    setWalletMethods(prev => prev.filter(m => m._id !== id));
    showToast("🗑️ Método de pago eliminado.");
  };

  // --- CAMBIAR FOTO ---
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("⚠️ La imagen pesa demasiado. El límite es de 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Image = ev.target.result;
      setPhoto(base64Image);

      try {
        await fetch(`http://localhost:5000/api/usuarios/${usuario._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify({ fotoPerfil: base64Image })
        });
        showToast("📸 Foto de perfil guardada con éxito.");
      } catch (error) {
        showToast("Error al guardar la foto.");
      }
    };
    reader.readAsDataURL(file);
  };

  // --- EDITAR INFORMACIÓN ---
  const editarInformacion = async () => {
    const nuevoNombre = prompt("Nuevo nombre:", usuario.nombre);
    const nuevoApellido = prompt("Nuevo apellido:", usuario.apellido);
    const nuevoPais = prompt("Nuevo país:", usuario.pais);

    if (!nuevoNombre?.trim() || !nuevoApellido?.trim() || !nuevoPais?.trim()) {
      return showToast("⚠️ Operación cancelada o campos vacíos.");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/usuarios/${usuario._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ nombre: nuevoNombre, apellido: nuevoApellido, pais: nuevoPais })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsuario(data); 
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

    const passwordRegex = /^(?=.[a-z])(?=.[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return showToast("Debe tener al menos 8 caracteres, una mayúscula, minúscula y un número.");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/usuarios/${usuario._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
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
            
            {usuario.adeudo > 0 ? (
               <div className="status-pill" style={{background: '#ffebeb', color: '#a84b3c', borderColor: '#a84b3c'}}>
                 🚨 ADEUDO: ${usuario.adeudo} MXN
               </div>
            ) : (
              <div className="status-pill">
                <span className="dot pulse-green"></span> ACTIVO
              </div>
            )}

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
              <button className="leather-btn" type="button" onClick={() => setShowWalletModal(true)}>
                <i className="bx bxs-credit-card"></i> MÉTODOS DE PAGO
              </button>
              <button className="leather-btn" type="button" onClick={() => navigate("/renta")}>
                <i className="bx bxs-map-pin"></i> IR A RENTAR
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
          
          {/* Aquí le damos un max-width más grande (650px) para que los 3 campos quepan bien */}
          <div className="modal-box wallet-modal-box" style={{ maxWidth: "650px", width: "90%" }}>
            
            <h3>Cartera virtual</h3>
            <p className="wallet-subtitle" style={{marginBottom: "15px", color: "#6f604f"}}>Administra tus métodos de pago guardados.</p>

            {/* LISTA DE TARJETAS */}
            <div className="wallet-list" style={{marginBottom: "20px"}}>
              {walletMethods.length === 0 ? (
                <div style={{padding: "15px", background: "#e8ddca", borderRadius: "10px", textAlign: "center", border: "1px dashed rgba(109,87,61,.4)"}}>
                  <p className="wallet-empty" style={{margin: 0, color: "#6f604f"}}>No tienes tarjetas guardadas.</p>
                </div>
              ) : (
                walletMethods.map((method) => (
                  <article className="wallet-item" key={method._id} style={{padding: "15px", border: "1px solid rgba(109,87,61,.2)", borderRadius: "10px", marginBottom: "10px", background: "#fdf5e6", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <div style={{textAlign: "left"}}>
                      <p className="wallet-brand" style={{margin: 0, fontWeight: "bold", color: "#2f2419"}}>💳 {method.marca} •••• {method.ultimos4}</p>
                      <p className="wallet-alias" style={{margin: "4px 0 0", fontSize: "0.85em", color: "#6f604f"}}>Tarjeta Guardada</p>
                    </div>
                    <button type="button" onClick={() => removeWalletMethod(method._id)} style={{background: "transparent", border: "1px solid #a84b3c", color: "#a84b3c", padding: "6px 12px", borderRadius: "8px", cursor: "pointer"}}>
                      Eliminar
                    </button>
                  </article>
                ))
              )}
            </div>

            <div style={{ borderTop: "1px dashed rgba(109,87,61,.3)", margin: "20px 0" }}></div>

            {/* FORMULARIO */}
            <form className="wallet-form" onSubmit={addWalletMethod} style={{ width: "100%", boxSizing: "border-box" }}>
              
              <div style={{ display: "flex", gap: "10px", width: "100%", marginBottom: "15px" }}>
                <label style={{ flex: "1", textAlign: "left", fontSize: "0.85rem", color: "#6f604f" }}>
                  Marca
                  <select className="mod-input" style={{ width: "100%", margin: "5px 0 0", padding: "12px", boxSizing: "border-box" }} value={newWalletMethod.brand} onChange={(e) => setNewWalletMethod((prev) => ({ ...prev, brand: e.target.value }))}>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">Amex</option>
                  </select>
                </label>
                
                <label style={{ flex: "1.2", textAlign: "left", fontSize: "0.85rem", color: "#6f604f" }}>
                  Alias
                  <input className="mod-input" type="text" placeholder="Ejemplo: Nomina" style={{ width: "100%", margin: "5px 0 0", padding: "12px", boxSizing: "border-box" }} value={newWalletMethod.alias} onChange={(e) => setNewWalletMethod((prev) => ({ ...prev, alias: e.target.value }))} />
                </label>
                
                <label style={{ flex: "2", textAlign: "left", fontSize: "0.85rem", color: "#6f604f" }}>
                  Tarjeta
                  <input className="mod-input" type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" style={{ width: "100%", margin: "5px 0 0", padding: "12px", boxSizing: "border-box" }} value={newWalletMethod.cardNumber} onChange={(e) => setNewWalletMethod((prev) => ({ ...prev, cardNumber: e.target.value }))} />
                </label>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button className="btn-save" type="submit" style={{ width: "100%", background: "#3f7069" }}>Agregar metodo</button>
                <button className="btn-close" type="button" onClick={() => setShowWalletModal(false)} style={{ width: "100%" }}>Cerrar</button>
              </div>

            </form>
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
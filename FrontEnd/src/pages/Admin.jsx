import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const API_URL = "http://localhost:5000/api";

function Admin() {
  const navigate = useNavigate();

  const [estaciones, setEstaciones] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [toast, setToast] = useState("");

  const [estForm, setEstForm] = useState({ nombre: "", capacidadMaxima: "", lat: "", lng: "" });
  const [vehForm, setVehForm] = useState({ estacionActual: "", codigoVehiculo: "", tipo: "Bicicleta", precioPorMinuto: "" });

  const getHeaders = (withContent = false) => {
    const token = localStorage.getItem("token");
    return {
      ...(withContent && { "Content-Type": "application/json" }),
      "Authorization": `Bearer ${token}`
    };
  };

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3000);
  };

  const cargarDatos = async () => {
    try {
      const [resEst, resVeh] = await Promise.all([
        fetch(`${API_URL}/estaciones`, { headers: getHeaders() }),
        fetch(`${API_URL}/vehiculos`, { headers: getHeaders() })
      ]);

      if (resEst.status === 401 || resEst.status === 403) {
        navigate("/login");
        return;
      }

      setEstaciones(await resEst.json());
      setVehiculos(await resVeh.json());
    } catch (error) {
      console.error("Error al cargar datos:", error);
      showToast("Error de conexión con el servidor.");
    }
  };

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.rol !== "admin") {
      navigate("/");
      return;
    }
    cargarDatos();
  }, []);

  // --- GUARDAR ESTACIÓN ---
  const guardarEstacion = async () => {
    const { nombre, capacidadMaxima, lat, lng } = estForm;
    if (!nombre || !capacidadMaxima || !lat || !lng) {
      showToast("Llena todos los campos de la estación.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/estaciones`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ nombre, capacidadMaxima, coordenadas: { lat: Number(lat), lng: Number(lng) } })
      });
      if (res.ok) {
        showToast("¡Estación creada con éxito!");
        setEstForm({ nombre: "", capacidadMaxima: "", lat: "", lng: "" });
        cargarDatos();
      } else {
        showToast("Error al guardar la estación.");
      }
    } catch {
      showToast("Error de conexión.");
    }
  };

  // --- GUARDAR VEHÍCULO ---
  const guardarVehiculo = async () => {
    const { estacionActual, codigoVehiculo, tipo, precioPorMinuto } = vehForm;
    if (!estacionActual || !codigoVehiculo || !precioPorMinuto) {
      showToast("Faltan datos para el vehículo.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/vehiculos`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ codigoVehiculo, tipo, precioPorMinuto: Number(precioPorMinuto), estacionActual, bateria: 100, estado: "Disponible" })
      });
      if (res.ok) {
        showToast("¡Vehículo registrado con éxito!");
        setVehForm({ estacionActual: "", codigoVehiculo: "", tipo: "Bicicleta", precioPorMinuto: "" });
        cargarDatos();
      } else {
        showToast("Error al registrar vehículo.");
      }
    } catch {
      showToast("Error de conexión.");
    }
  };

  // --- ELIMINAR VEHÍCULO ---
  const eliminarVehiculo = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este vehículo?")) return;
    try {
      const res = await fetch(`${API_URL}/vehiculos/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        showToast("Vehículo eliminado correctamente.");
        cargarDatos();
      } else {
        showToast("No se pudo eliminar el vehículo.");
      }
    } catch {
      showToast("Error de conexión.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">

        <button className="admin-back-btn" onClick={() => navigate("/perfil")}>
          <i className="bx bx-left-arrow-alt"></i> Volver al Perfil
        </button>

        <h1 className="admin-title">Panel Administrativo</h1>

        <div className="admin-grid">

          {/* NUEVA ESTACIÓN */}
          <div className="admin-section-box">
            <h3><i className="bx bxs-map-pin"></i> Nueva Estación</h3>

            <div className="admin-input-group">
              <label>Nombre de la Estación</label>
              <input
                type="text"
                placeholder="Ej. Metro Centro"
                value={estForm.nombre}
                onChange={(e) => setEstForm({ ...estForm, nombre: e.target.value })}
              />
            </div>

            <div className="admin-input-group">
              <label>Capacidad Máxima</label>
              <input
                type="number"
                placeholder="Ej. 20"
                value={estForm.capacidadMaxima}
                onChange={(e) => setEstForm({ ...estForm, capacidadMaxima: e.target.value })}
              />
            </div>

            <div className="admin-coords-row">
              <div className="admin-input-group">
                <label>Coord X (10–90)</label>
                <input
                  type="number"
                  placeholder="X"
                  value={estForm.lat}
                  onChange={(e) => setEstForm({ ...estForm, lat: e.target.value })}
                />
              </div>
              <div className="admin-input-group">
                <label>Coord Y (10–90)</label>
                <input
                  type="number"
                  placeholder="Y"
                  value={estForm.lng}
                  onChange={(e) => setEstForm({ ...estForm, lng: e.target.value })}
                />
              </div>
            </div>

            <button className="admin-btn-save" type="button" onClick={guardarEstacion}>
              <i className="bx bx-plus-circle"></i> Guardar Estación
            </button>
          </div>

          {/* NUEVO VEHÍCULO */}
          <div className="admin-section-box">
            <h3><i className="bx bxs-car"></i> Nuevo Vehículo</h3>

            <div className="admin-input-group">
              <label>Asignar a Estación</label>
              <select
                value={vehForm.estacionActual}
                onChange={(e) => setVehForm({ ...vehForm, estacionActual: e.target.value })}
              >
                <option value="" disabled>Selecciona estación</option>
                {estaciones.map((est) => (
                  <option key={est._id} value={est._id}>{est.nombre}</option>
                ))}
              </select>
            </div>

            <div className="admin-input-group">
              <label>Código de Serie</label>
              <input
                type="text"
                placeholder="Ej. BICI-101"
                value={vehForm.codigoVehiculo}
                onChange={(e) => setVehForm({ ...vehForm, codigoVehiculo: e.target.value })}
              />
            </div>

            <div className="admin-input-group">
              <label>Tipo de Vehículo</label>
              <select
                value={vehForm.tipo}
                onChange={(e) => setVehForm({ ...vehForm, tipo: e.target.value })}
              >
                <option value="Bicicleta">Bicicleta</option>
                <option value="Electrica">Bici Eléctrica</option>
                <option value="Scooter electrico">Scooter Eléctrico</option>
                <option value="Auto">Auto</option>
              </select>
            </div>

            <div className="admin-input-group">
              <label>Precio por minuto ($)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej. 1.5"
                value={vehForm.precioPorMinuto}
                onChange={(e) => setVehForm({ ...vehForm, precioPorMinuto: e.target.value })}
              />
            </div>

            <button className="admin-btn-save" type="button" onClick={guardarVehiculo}>
              <i className="bx bx-plus-circle"></i> Registrar Vehículo
            </button>
          </div>

          {/* GESTIONAR VEHÍCULOS */}
          <div className="admin-section-box admin-full-width">
            <h3><i className="bx bxs-trash"></i> Gestionar Vehículos</h3>
            <div className="admin-vehicle-list">
              {vehiculos.length === 0 ? (
                <p className="admin-empty">No hay vehículos registrados todavía.</p>
              ) : (
                vehiculos.map((v) => (
                  <div key={v._id} className="admin-item">
                    <div className="admin-item-info">
                      <strong>{v.codigoVehiculo}</strong> — {v.tipo}
                      <span className="admin-item-sub">
                        <i className="bx bxs-map-pin"></i>
                        {v.estacionActual ? v.estacionActual.nombre : "Sin estación"} &nbsp;·&nbsp; Estado: {v.estado}
                      </span>
                    </div>
                    <button
                      className="admin-btn-delete"
                      type="button"
                      onClick={() => eliminarVehiculo(v._id)}
                    >
                      <i className="bx bx-trash"></i> Quitar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* TOAST */}
      <div className={`admin-toast ${toast ? "show" : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}

export default Admin;

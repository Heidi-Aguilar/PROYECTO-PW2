import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Renta.css";

const RENTA_TRIP_STORAGE_KEY = "renta-active-trip";
const money = (value) => `$${value.toFixed(2)} MXN`;

const getAuthHeaders = (withContent = false) => {
  const token = localStorage.getItem("token");
  return {
    ...(withContent && { "Content-Type": "application/json" }),
    "Authorization": `Bearer ${token}`
  };
  
};

function Renta() {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState("map");
  const [stations, setStations] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [paidOrder, setPaidOrder] = useState(null);
  const [tripStartedAt, setTripStartedAt] = useState(null);
  const [tripElapsed, setTripElapsed] = useState(0);
  const [toast, setToast] = useState("");
  
  // --- ESTADOS NUEVOS PARA PAGOS ---
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("new"); // "new" = Nueva tarjeta
  const [guardarTarjeta, setGuardarTarjeta] = useState(false);
  const [payment, setPayment] = useState({ holder: "", card: "", exp: "", cvv: "", terms: false });

  const showToast = (msg) => { setToast(msg); window.setTimeout(() => setToast(""), 3000); };
  const goTo = (nextStep) => { setStep(nextStep); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const cargarDatos = useCallback(async () => {
    setLoadingMap(true);
    try {
      const [resEstaciones, resVehiculos, resTarjetas] = await Promise.all([
        fetch("http://localhost:5000/api/estaciones", { headers: getAuthHeaders() }),
        fetch("http://localhost:5000/api/vehiculos", { headers: getAuthHeaders() }),
        fetch("http://localhost:5000/api/usuarios/metodos-pago", { headers: getAuthHeaders() })
      ]);

      if (resEstaciones.status === 401) return navigate("/login");

      const estacionesData = await resEstaciones.json();
      const vehiculosData = await resVehiculos.json();
      if (resTarjetas.ok) setSavedCards(await resTarjetas.json());

      const lats = estacionesData.map(e => e.coordenadas.lat);
      const lngs = estacionesData.map(e => e.coordenadas.lng);
      const minLat = Math.min(...lats), maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

      const stationsMapped = estacionesData.map((est) => ({
        id: est._id, name: est.nombre, line: `Capacidad: ${est.capacidadMaxima}`,
        x: maxLng === minLng ? 50 : ((est.coordenadas.lng - minLng) / (maxLng - minLng)) * 80 + 10,
        y: maxLat === minLat ? 50 : ((maxLat - est.coordenadas.lat) / (maxLat - minLat)) * 80 + 10,
        vehicles: vehiculosData
          .filter((v) => v.estacionActual && v.estacionActual._id === est._id && v.estado === "Disponible")
          .map((v) => ({ id: v._id, type: v.tipo, serial: v.codigoVehiculo, price30: v.precioPorMinuto * 30, precioReal: v.precioPorMinuto }))
      }));

      setStations(stationsMapped);
    } catch (error) {
      showToast("Error al conectar con el servidor.");
    } finally {
      setLoadingMap(false);
    }
  }, [navigate]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // TIMER Y PERSISTENCIA
  useEffect(() => {
    if (!tripStartedAt) return undefined;
    const tick = () => setTripElapsed(Math.floor((Date.now() - tripStartedAt) / 1000));
    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [tripStartedAt]);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(RENTA_TRIP_STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (!saved?.tripStartedAt || !saved?.paidOrder) return;
      setSelectedStation(saved.selectedStation);
      setSelectedVehicle(saved.selectedVehicle);
      setPaidOrder(saved.paidOrder);
      setTripStartedAt(saved.tripStartedAt);
      setStep("trip");
    } catch { window.sessionStorage.removeItem(RENTA_TRIP_STORAGE_KEY); }
  }, []);

  const qrUrl = useMemo(() => {
    if (!paidOrder) return "";
    const payload = `${paidOrder.id}|${paidOrder.serial}|${paidOrder.station}|${paidOrder.total}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`;
  }, [paidOrder]);

  const tripTimeLabel = useMemo(() => {
    const mm = String(Math.floor(tripElapsed / 60)).padStart(2, "0");
    const ss = String(tripElapsed % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [tripElapsed]);

  const onPaymentChange = (event) => {
    const { name, value, type, checked } = event.target;
    setPayment((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  //VALIDACIONES DE TARJETA
  const validarLuhn = (num) => {
    let arr = (num + '').split('').reverse().map(x => parseInt(x, 10));
    let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
    return sum % 10 === 0;
  };

  const validarExpiracion = (exp) => {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
    const [mm, yy] = exp.split('/').map(Number);
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const currentYear = parseInt(now.getFullYear().toString().slice(-2));
    const currentMonth = now.getMonth() + 1;
    if (yy < currentYear) return false;
    if (yy === currentYear && mm < currentMonth) return false;
    return true;
  };

  const procesarPago = async (event) => {
    event.preventDefault();

    // 1. Validar el CVV (Siempre es requerido, ya sea tarjeta nueva o guardada)
    if (payment.cvv.length < 3 || isNaN(payment.cvv)) {
      return showToast("CVV inválido (deben ser 3 o 4 números).");
    }

    // 2. Si es una tarjeta nueva, validamos todo a fondo
    if (selectedCardId === "new") {
      const cardClean = payment.card.replace(/\s/g, '');
      if (cardClean.length < 15 || isNaN(cardClean) || !validarLuhn(cardClean)) {
        return showToast("Número de tarjeta inválido. Revisa los dígitos.");
      }
      if (!validarExpiracion(payment.exp)) {
        return showToast("Fecha de expiración inválida o tarjeta vencida (Usa MM/AA).");
      }

      // Si el usuario marcó "Guardar Tarjeta", mandamos petición al BackEnd
      if (guardarTarjeta) {
        try {
          await fetch("http://localhost:5000/api/usuarios/metodos-pago", {
            method: "POST", headers: getAuthHeaders(true),
            body: JSON.stringify({ numeroTarjeta: cardClean, expiracion: payment.exp })
          });
          showToast("Tarjeta encriptada y guardada con éxito.");
        } catch (error) {
          console.error("Error guardando tarjeta:", error);
        }
      }
    }

    // Proceso de generar la orden de renta
    const now = new Date();
    const orderId = `RV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    setPaidOrder({
      id: orderId, station: selectedStation.name, vehicleType: selectedVehicle.type, serial: selectedVehicle.serial, total: selectedVehicle.price30, paidAt: now
    });
    goTo("ticket");
  };

  const onStartTrip = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/rentas/iniciar", {
        method: "POST", headers: getAuthHeaders(true), body: JSON.stringify({ vehiculoId: selectedVehicle.id })
      });
      const data = await res.json();

      if (res.ok) {
        const startedAt = Date.now();
        localStorage.setItem("rentaActivaId", data.renta._id);
        setTripStartedAt(startedAt);
        window.sessionStorage.setItem(RENTA_TRIP_STORAGE_KEY, JSON.stringify({ selectedStation, selectedVehicle, paidOrder, tripStartedAt: startedAt }));
        goTo("trip");
        showToast("Viaje iniciado. Vehículo desbloqueado.");
      } else showToast(`Error: ${data.message}`);
    } catch (error) { showToast("Error al comunicarse con el servidor."); }
  };

  const onStopTrip = async () => {
    const rentaId = localStorage.getItem("rentaActivaId");
    if (rentaId) {
      try {
        const res = await fetch(`http://localhost:5000/api/rentas/finalizar/${rentaId}`, { method: "PUT", headers: getAuthHeaders() });
        const data = await res.json();
        if (res.ok) {
          showToast(`Viaje finalizado. Cobro final: $${data.total.toFixed(2)} MXN`);
          localStorage.removeItem("rentaActivaId");
        } else showToast(`Error al finalizar: ${data.message}`);
      } catch (error) { showToast("Error de conexión al finalizar el viaje."); }
    }

    setTripStartedAt(null); setTripElapsed(0); setPaidOrder(null); setSelectedVehicle(null); setSelectedStation(null);
    window.sessionStorage.removeItem(RENTA_TRIP_STORAGE_KEY);
    await cargarDatos(); 
    goTo("map");
  };

  return (
    <div className="renta-page">
      <main className="renta-main">
        {step === "map" && (
          <section className="renta-step is-active">
            <div className="renta-container">
              <p className="renta-kicker">Paso 1</p>
              <h1>Selecciona ubicacion y vehiculo</h1>
              <div className="renta-dashboard">
                <div className="renta-left-column">
                  <div className="renta-map-layout">
                    <div className="renta-metro-map">
                      {loadingMap ? <p style={{padding:"20px"}}>Cargando estaciones...</p> : stations.map((station) => (
                        <button key={station.id} className={`renta-station-pin ${selectedStation?.id === station.id ? "active" : ""}`} style={{ left: `${station.x}%`, top: `${station.y}%` }} onClick={() => { setSelectedStation(station); setSelectedVehicle(null); }}>
                          {station.name.replace("Metro ", "")}
                        </button>
                      ))}
                    </div>
                    <aside className="renta-station-panel">
                      <h2>Estacion seleccionada</h2>
                      <p className="renta-station-name">{selectedStation ? selectedStation.name : "Ninguna aun"}</p>
                    </aside>
                  </div>
                  <article className="renta-card renta-summary-inline">
                    <h2>Resumen de compra</h2>
                    <p><strong>Costo (30 min):</strong> {selectedVehicle ? money(selectedVehicle.price30) : "-"}</p>
                    <button className="renta-btn renta-btn-primary" disabled={!selectedStation || !selectedVehicle} onClick={() => goTo("payment")}>Continuar con el pago</button>
                  </article>
                </div>
                <section className="renta-vehicles-panel renta-vehicles-panel-side">
                  <h2>Catalogo de vehiculos</h2>
                  {selectedStation ? (
                    <div className="renta-vehicle-grid">
                      {selectedStation.vehicles.map((v) => (
                        <article key={v.serial} className={`renta-vehicle-card ${selectedVehicle?.serial === v.serial ? "selected" : ""}`}>
                          <h3>{v.type}</h3>
                          <p><strong>Serie:</strong> {v.serial}</p>
                          <p><strong>Costo:</strong> {money(v.price30)}</p>
                          <button className="renta-btn renta-btn-primary" onClick={() => setSelectedVehicle(v)}>Elegir</button>
                        </article>
                      ))}
                    </div>
                  ) : <p>Primero selecciona una estacion en el mapa.</p>}
                </section>
              </div>
            </div>
          </section>
        )}

        {step === "payment" && (
          <section className="renta-step is-active">
            <div className="renta-container renta-container-narrow">
              <p className="renta-kicker">Paso 2</p>
              <h2>Pago Seguro</h2>
              
              <form className="renta-card renta-payment-form" onSubmit={procesarPago}>
                
                {/* Menú de tarjetas guardadas */}
                {savedCards.length > 0 && (
                  <label>Selecciona tu método de pago
                    <select style={{padding: '12px', borderRadius: '12px', border: '1px solid #c8955d', outline:'none'}} value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)}>
                      <option value="new">➕ Usar una nueva tarjeta</option>
                      {savedCards.map(c => (
                        <option key={c._id} value={c._id}>💳 {c.marca} terminada en {c.ultimos4} (Exp: {c.expiracion})</option>
                      ))}
                    </select>
                  </label>
                )}

                {/* Formulario que se oculta si elige una tarjeta guardada */}
                {selectedCardId === "new" && (
                  <>
                    <label>Nombre del titular<input name="holder" required placeholder="Nombre como aparece en tarjeta" value={payment.holder} onChange={onPaymentChange} /></label>
                    <div className="renta-cols-3" style={{gridTemplateColumns: '1fr 1fr'}}>
                      <label>Número de Tarjeta<input name="card" required placeholder="0000 0000 0000 0000" maxLength={19} value={payment.card} onChange={onPaymentChange} /></label>
                      <label>Vencimiento<input name="exp" required placeholder="MM/AA" maxLength={5} value={payment.exp} onChange={onPaymentChange} /></label>
                    </div>
                    <label className="renta-check">
                      <input type="checkbox" checked={guardarTarjeta} onChange={(e) => setGuardarTarjeta(e.target.checked)} />
                      Guardar esta tarjeta de forma segura para futuros viajes
                    </label>
                  </>
                )}

                {/* El CVV SIEMPRE se pide por seguridad */}
                <label style={{width: '150px', marginTop: '10px'}}>
                  Código de Seguridad (CVV)
                  <input name="cvv" required type="password" inputMode="numeric" maxLength={4} placeholder="***" value={payment.cvv} onChange={onPaymentChange} />
                </label>

                <label className="renta-check" style={{marginTop: '15px'}}>
                  <input type="checkbox" name="terms" required checked={payment.terms} onChange={onPaymentChange} />
                  Acepto los términos y condiciones de renta
                </label>
                
                <button className="renta-btn renta-btn-primary" type="submit">Validar Pago Seguro</button>
              </form>

              <div className="renta-actions-row">
                <button className="renta-btn renta-btn-ghost" type="button" onClick={() => goTo("map")}>Regresar al mapa</button>
              </div>
            </div>
          </section>
        )}

        {/* PASO 3 Y 4 SE MANTIENEN IGUAL (Tickets y Timer) */}
        {step === "ticket" && paidOrder && (
          <section className="renta-step is-active">
            <div className="renta-container renta-container-narrow">
              <h2 id="ticket-title">Ticket generado</h2>
              <article className="renta-ticket">
                <p>Folio: {paidOrder.id}</p>
                <div className="renta-qr-wrap"><img src={qrUrl} alt="QR" /></div>
              </article>
              <div className="renta-actions-row">
                <button className="renta-btn renta-btn-primary" type="button" onClick={onStartTrip}>Iniciar viaje</button>
              </div>
            </div>
          </section>
        )}

        {step === "trip" && paidOrder && (
          <section className="renta-step is-active">
            <div className="renta-container renta-container-narrow">
              <h2>Viaje activo</h2>
              <article className="renta-card">
                <div className="renta-timer">{tripTimeLabel}</div>
              </article>
              <div className="renta-trip-actions">
                <button className="renta-btn renta-btn-danger" type="button" onClick={onStopTrip}>Parar viaje</button>
              </div>
            </div>
          </section>
        )}
      </main>
      <div className={`renta-toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </div>
  );
}

export default Renta;
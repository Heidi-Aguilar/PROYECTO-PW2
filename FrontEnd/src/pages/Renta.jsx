import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Renta.css";
import userpng from '../assets/images/user1.png';

const RENTA_TRIP_STORAGE_KEY = "renta-active-trip";

const money = (value) => `$${value.toFixed(2)} MXN`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
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
  const [payment, setPayment] = useState({
    holder: "",
    email: "",
    card: "",
    exp: "",
    cvv: "",
    terms: false
  });

  // --- CARGA DE ESTACIONES Y VEHÍCULOS DESDE EL BACKEND ---
  const cargarDatos = useCallback(async () => {
    setLoadingMap(true);
    try {
      const [resEstaciones, resVehiculos] = await Promise.all([
        fetch("http://localhost:5000/api/estaciones", { headers: getAuthHeaders() }),
        fetch("http://localhost:5000/api/vehiculos", { headers: getAuthHeaders() })
      ]);

      // Si el token expiró o no hay sesión, redirigir al login
      if (resEstaciones.status === 401 || resEstaciones.status === 403) {
        navigate("/login");
        return;
      }

      const estacionesData = await resEstaciones.json();
      console.log("Estaciones recibidas:", estacionesData.length, estacionesData);
      const vehiculosData = await resVehiculos.json();

      //Obtener los extremos de las coordenadas
      const lats = estacionesData.map(e => e.coordenadas.lat);
      const lngs = estacionesData.map(e => e.coordenadas.lng);
      const minLat = Math.min(...lats), maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

      // Mapeamos al formato que usa el JSX
      const stationsMapped = estacionesData.map((estacion) => ({
        id: estacion._id,
        name: estacion.nombre,
        line: `Capacidad: ${estacion.capacidadMaxima}`,
        // Normalizamos lat a eje Y (invertido porque Y crece hacia abajo en CSS)
        x: maxLng === minLng ? 50 : ((estacion.coordenadas.lng - minLng) / (maxLng - minLng)) * 80 + 10,
        y: maxLat === minLat ? 50 : ((maxLat - estacion.coordenadas.lat) / (maxLat - minLat)) * 80 + 10,
        vehicles: vehiculosData
          .filter((v) =>
            v.estacionActual &&
            v.estacionActual._id === estacion._id &&
            v.estado === "Disponible"
          )
          .map((v) => ({
            id: v._id,
            type: v.tipo,
            serial: v.codigoVehiculo,
            price30: v.precioPorMinuto * 30,
            precioReal: v.precioPorMinuto
          }))
      }));

      setStations(stationsMapped);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      showToast("Error al conectar con el servidor.");
    } finally {
      setLoadingMap(false);
    }
  }, [navigate]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // --- TIMER DEL VIAJE ---
  useEffect(() => {
    if (!tripStartedAt) return undefined;
    const tick = () => setTripElapsed(Math.floor((Date.now() - tripStartedAt) / 1000));
    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [tripStartedAt]);

  // --- REANUDAR VIAJE ACTIVO ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("resumeTrip") !== "1") return;

    const raw = window.sessionStorage.getItem(RENTA_TRIP_STORAGE_KEY);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      if (!saved?.tripStartedAt || !saved?.paidOrder) return;
      setSelectedStation(saved.selectedStation || null);
      setSelectedVehicle(saved.selectedVehicle || null);
      setPaidOrder(saved.paidOrder || null);
      setTripStartedAt(saved.tripStartedAt);
      goTo("trip");
    } catch {
      window.sessionStorage.removeItem(RENTA_TRIP_STORAGE_KEY);
    }
  }, [location.search]);

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

  const goTo = (nextStep) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const saveTripState = () => {
    if (!selectedStation || !selectedVehicle || !paidOrder || !tripStartedAt) return;
    window.sessionStorage.setItem(RENTA_TRIP_STORAGE_KEY, JSON.stringify({
      selectedStation, selectedVehicle, paidOrder, tripStartedAt
    }));
  };

  const onChooseVehicle = (vehicle) => setSelectedVehicle(vehicle);

  const onPaymentChange = (event) => {
    const { name, value, type, checked } = event.target;
    setPayment((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onPay = (event) => {
    event.preventDefault();
    if (!selectedStation || !selectedVehicle) {
      showToast("Primero selecciona estacion y vehiculo.");
      goTo("map");
      return;
    }
    const now = new Date();
    const orderId = `RV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    setPaidOrder({
      id: orderId,
      station: selectedStation.name,
      vehicleType: selectedVehicle.type,
      serial: selectedVehicle.serial,
      total: selectedVehicle.price30,
      paidAt: now
    });
    goTo("ticket");
    showToast("Pago realizado con exito.");
  };

  // --- INICIAR VIAJE (conectado al backend) ---
  const onStartTrip = async () => {
    if (!paidOrder) {
      showToast("No hay ticket valido para iniciar.");
      return;
    }
    try {
      const respuesta = await fetch("http://localhost:5000/api/rentas/iniciar", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ vehiculoId: selectedVehicle.id })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        localStorage.setItem("rentaActivaId", data.renta._id);
        setTripStartedAt(Date.now());
        setTripElapsed(0);
        goTo("trip");
        showToast("Viaje iniciado. Vehículo desbloqueado.");
      } else {
        showToast(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      showToast("Error al comunicarse con el servidor.");
    }
  };

  // --- PARAR VIAJE (conectado al backend) ---
  const onStopTrip = async () => {
    const rentaId = localStorage.getItem("rentaActivaId");

    if (rentaId) {
      try {
        const respuesta = await fetch(`http://localhost:5000/api/rentas/finalizar/${rentaId}`, {
          method: "PUT",
          headers: getAuthHeaders()
        });
        const data = await respuesta.json();

        if (respuesta.ok) {
          showToast(`Viaje finalizado. Cobro final: $${data.total.toFixed(2)} MXN`);
          localStorage.removeItem("rentaActivaId");
        } else {
          showToast(`Error al finalizar: ${data.message}`);
        }
      } catch (error) {
        console.error(error);
        showToast("Error de conexión al finalizar el viaje.");
      }
    } else {
      showToast(`Viaje finalizado. Tiempo total: ${tripTimeLabel}`);
    }

    // Limpiar estado local siempre
    setTripStartedAt(null);
    setTripElapsed(0);
    setPaidOrder(null);
    setSelectedVehicle(null);
    setSelectedStation(null);
    window.sessionStorage.removeItem(RENTA_TRIP_STORAGE_KEY);
    await cargarDatos(); // Recargar mapa para que el vehículo vuelva a aparecer disponible
    goTo("map");
  };

  return (
    <div className="renta-page">
      <main className="renta-main">
        {step === "map" && (
          <section className="renta-step is-active" aria-labelledby="map-title">
            <div className="renta-container">
              <p className="renta-kicker">Paso 1</p>
              <h1 id="map-title">Selecciona ubicacion y vehiculo</h1>
              <p className="renta-lead">A la derecha tienes el catalogo. A la izquierda eliges estacion y revisas el resumen antes de pagar.</p>

              <div className="renta-dashboard">
                <div className="renta-left-column">
                  <div className="renta-map-layout">
                    <div className="renta-metro-map" aria-label="Mapa de estaciones">
                      {loadingMap ? (
                        <p className="renta-muted">Cargando estaciones...</p>
                      ) : stations.length === 0 ? (
                        <p className="renta-muted">No hay estaciones disponibles.</p>
                      ) : (
                        stations.map((station) => (
                          <button
                            key={station.id}
                            className={`renta-station-pin ${selectedStation?.id === station.id ? "active" : ""}`}
                            type="button"
                            style={{ left: `${station.x}%`, top: `${station.y}%` }}
                            onClick={() => {
                              setSelectedStation(station);
                              setSelectedVehicle(null);
                            }}
                          >
                            {station.name.replace("Metro ", "")}
                          </button>
                        ))
                      )}
                    </div>

                    <aside className="renta-station-panel">
                      <h2>Estacion seleccionada</h2>
                      <p className="renta-station-name">{selectedStation ? selectedStation.name : "Ninguna aun"}</p>
                      <p className="renta-muted">
                        {selectedStation
                          ? `${selectedStation.line} • ${selectedStation.vehicles.length} vehiculos disponibles`
                          : "Toca una estacion para continuar."}
                      </p>
                    </aside>
                  </div>

                  <article className="renta-card renta-summary-inline">
                    <h2>Resumen de compra</h2>
                    <p><strong>Estacion:</strong> {selectedStation ? selectedStation.name : "-"}</p>
                    <p><strong>Vehiculo:</strong> {selectedVehicle ? selectedVehicle.type : "-"}</p>
                    <p><strong>Serie:</strong> {selectedVehicle ? selectedVehicle.serial : "-"}</p>
                    <p><strong>Costo (30 min):</strong> {selectedVehicle ? money(selectedVehicle.price30) : "-"}</p>
                    <p className="renta-total"><strong>Total a pagar:</strong> {selectedVehicle ? money(selectedVehicle.price30) : "-"}</p>

                    <button
                      className="renta-btn renta-btn-primary"
                      type="button"
                      disabled={!selectedStation || !selectedVehicle}
                      onClick={() => goTo("payment")}
                    >
                      Continuar con el pago
                    </button>
                  </article>
                </div>

                <section className="renta-vehicles-panel renta-vehicles-panel-side">
                  <h2>Catalogo de vehiculos</h2>
                  <p className="renta-muted">Elige uno del catalogo para cargar el resumen automaticamente.</p>
                  {selectedStation ? (
                    selectedStation.vehicles.length === 0 ? (
                      <p className="renta-muted">No hay vehiculos disponibles en esta estacion.</p>
                    ) : (
                      <div className="renta-vehicle-grid">
                        {selectedStation.vehicles.map((vehicle) => (
                          <article
                            key={vehicle.serial}
                            className={`renta-vehicle-card ${selectedVehicle?.serial === vehicle.serial ? "selected" : ""}`}
                          >
                            <h3>{vehicle.type}</h3>
                            <p><strong>Serie:</strong> {vehicle.serial}</p>
                            <p><strong>Costo:</strong> {money(vehicle.price30)} / 30 min</p>
                            <button type="button" className="renta-btn renta-btn-primary" onClick={() => onChooseVehicle(vehicle)}>
                              Elegir vehiculo
                            </button>
                          </article>
                        ))}
                      </div>
                    )
                  ) : (
                    <p className="renta-muted">Primero selecciona una estacion en el mapa de la izquierda.</p>
                  )}
                </section>
              </div>
            </div>
          </section>
        )}

        {step === "payment" && (
          <section className="renta-step is-active" aria-labelledby="payment-title">
            <div className="renta-container renta-container-narrow">
              <p className="renta-kicker">Paso 2</p>
              <h2 id="payment-title">Pago</h2>

              <form className="renta-card renta-payment-form" onSubmit={onPay}>
                <label>
                  Nombre del titular
                  <input name="holder" required placeholder="Nombre completo" value={payment.holder} onChange={onPaymentChange} />
                </label>
                <label>
                  Correo
                  <input name="email" type="email" required placeholder="tucorreo@ejemplo.com" value={payment.email} onChange={onPaymentChange} />
                </label>
                <div className="renta-cols-3">
                  <label>
                    Tarjeta
                    <input name="card" required inputMode="numeric" maxLength={19} placeholder="1234 5678 9012 3456" value={payment.card} onChange={onPaymentChange} />
                  </label>
                  <label>
                    Vence
                    <input name="exp" required placeholder="MM/AA" maxLength={5} value={payment.exp} onChange={onPaymentChange} />
                  </label>
                  <label>
                    CVV
                    <input name="cvv" required inputMode="numeric" maxLength={4} placeholder="123" value={payment.cvv} onChange={onPaymentChange} />
                  </label>
                </div>
                <label className="renta-check">
                  <input type="checkbox" name="terms" required checked={payment.terms} onChange={onPaymentChange} />
                  Acepto terminos y condiciones
                </label>
                <button className="renta-btn renta-btn-primary" type="submit">Pagar ahora</button>
              </form>

              <div className="renta-actions-row">
                <button className="renta-btn renta-btn-ghost" type="button" onClick={() => goTo("map")}>Regresar al paso anterior</button>
              </div>
            </div>
          </section>
        )}

        {step === "ticket" && paidOrder && (
          <section className="renta-step is-active" aria-labelledby="ticket-title">
            <div className="renta-container renta-container-narrow">
              <p className="renta-kicker">Paso 3</p>
              <h2 id="ticket-title">Ticket generado</h2>

              <article className="renta-ticket">
                <p className="renta-ticket-id">Folio: {paidOrder.id}</p>
                <p><strong>Estacion:</strong> {paidOrder.station}</p>
                <p><strong>Vehiculo:</strong> {paidOrder.vehicleType}</p>
                <p><strong>Serie:</strong> {paidOrder.serial}</p>
                <p><strong>Monto:</strong> {money(paidOrder.total)}</p>
                <p><strong>Hora pago:</strong> {paidOrder.paidAt.toLocaleString("es-MX")}</p>
                <div className="renta-qr-wrap">
                  <img src={qrUrl} alt="Codigo QR del viaje" />
                </div>
                <p className="renta-muted">Escanea este QR en el vehiculo para iniciar tu tiempo.</p>
              </article>

              <div className="renta-actions-row">
                <button className="renta-btn renta-btn-ghost" type="button" onClick={() => goTo("payment")}>Regresar al paso anterior</button>
                <button className="renta-btn renta-btn-primary" type="button" onClick={onStartTrip}>Ya escanee, iniciar viaje</button>
              </div>
            </div>
          </section>
        )}

        {step === "trip" && paidOrder && (
          <section className="renta-step is-active" aria-labelledby="trip-title">
            <div className="renta-container renta-container-narrow">
              <p className="renta-kicker">Paso 4</p>
              <h2 id="trip-title">Viaje activo</h2>

              <article className="renta-card renta-trip-card">
                <p><strong>Vehiculo:</strong> {paidOrder.vehicleType}</p>
                <p><strong>Serie:</strong> {paidOrder.serial}</p>
                <p><strong>Estacion origen:</strong> {paidOrder.station}</p>
                <div className="renta-timer" aria-live="polite">{tripTimeLabel}</div>
              </article>

              <div className="renta-actions-row">
                <button className="renta-btn renta-btn-ghost" type="button" onClick={() => goTo("ticket")}>Regresar al paso anterior</button>
              </div>

              <div className="renta-trip-actions">
                <button className="renta-btn renta-btn-danger" type="button" onClick={onStopTrip}>Parar viaje</button>
                <Link className="renta-btn renta-btn-ghost" to="/manual" onClick={saveTripState}>Obtener ayuda</Link>
                <button className="renta-btn renta-btn-ghost" type="button" onClick={() => showToast("Soporte: 55-1234-5678")}>Soporte</button>
                <button className="renta-btn renta-btn-emergency" type="button" onClick={() => showToast("Emergencia activada: contactando asistencia.")}>Emergencias</button>
              </div>
            </div>
          </section>
        )}
      </main>

      <div className={`renta-toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

export default Renta;

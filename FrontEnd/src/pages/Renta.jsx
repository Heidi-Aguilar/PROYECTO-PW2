import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Renta.css";

const STATIONS = [
  {
    id: "norte",
    name: "Metro Norte",
    line: "Linea Verde",
    x: 18,
    y: 28,
    vehicles: [
      { type: "Bicicleta", serial: "BIC-NR-1021", price30: 35 },
      { type: "Electrica", serial: "ELE-NR-5581", price30: 49 },
      { type: "Scooter electrico", serial: "SCO-NR-4412", price30: 55 },
      { type: "Patin", serial: "PAT-NR-3004", price30: 42 }
    ]
  },
  {
    id: "centro",
    name: "Metro Centro",
    line: "Linea Dorada",
    x: 46,
    y: 42,
    vehicles: [
      { type: "Bicicleta", serial: "BIC-CT-7840", price30: 37 },
      { type: "Electrica", serial: "ELE-CT-1097", price30: 50 },
      { type: "Scooter electrico", serial: "SCO-CT-6618", price30: 57 },
      { type: "Patin", serial: "PAT-CT-8891", price30: 44 }
    ]
  },
  {
    id: "sur",
    name: "Metro Sur",
    line: "Linea Azul",
    x: 74,
    y: 60,
    vehicles: [
      { type: "Bicicleta", serial: "BIC-SR-2190", price30: 34 },
      { type: "Electrica", serial: "ELE-SR-5500", price30: 48 },
      { type: "Scooter electrico", serial: "SCO-SR-1180", price30: 54 },
      { type: "Patin", serial: "PAT-SR-4421", price30: 41 }
    ]
  },
  {
    id: "oriente",
    name: "Metro Oriente",
    line: "Linea Naranja",
    x: 62,
    y: 22,
    vehicles: [
      { type: "Bicicleta", serial: "BIC-OR-1090", price30: 36 },
      { type: "Electrica", serial: "ELE-OR-9922", price30: 51 },
      { type: "Scooter electrico", serial: "SCO-OR-2140", price30: 56 },
      { type: "Patin", serial: "PAT-OR-7774", price30: 45 }
    ]
  }
];

const money = (value) => `$${value.toFixed(2)} MXN`;

function Renta() {
  const [step, setStep] = useState("map");
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

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    if (!tripStartedAt) {
      return undefined;
    }

    const tick = () => setTripElapsed(Math.floor((Date.now() - tripStartedAt) / 1000));
    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [tripStartedAt]);

  const qrUrl = useMemo(() => {
    if (!paidOrder) {
      return "";
    }
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

  const onChooseVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    goTo("summary");
  };

  const onPaymentChange = (event) => {
    const { name, value, type, checked } = event.target;
    setPayment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
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
    const order = {
      id: orderId,
      station: selectedStation.name,
      vehicleType: selectedVehicle.type,
      serial: selectedVehicle.serial,
      total: selectedVehicle.price30,
      paidAt: now
    };

    setPaidOrder(order);
    goTo("ticket");
    showToast("Pago realizado con exito.");
  };

  const onStartTrip = () => {
    if (!paidOrder) {
      showToast("No hay ticket valido para iniciar.");
      return;
    }
    setTripStartedAt(Date.now());
    setTripElapsed(0);
    goTo("trip");
    showToast("Viaje iniciado. Maneja con precaucion.");
  };

  const onStopTrip = () => {
    const total = tripTimeLabel;
    setTripStartedAt(null);
    setTripElapsed(0);
    setPaidOrder(null);
    setSelectedVehicle(null);
    setSelectedStation(null);
    goTo("map");
    showToast(`Viaje finalizado. Tiempo total: ${total}`);
  };

  return (
    <div className="renta-page">
      <header className="renta-header">
        <div className="renta-header-top">
          <img className="renta-brand-logo" src="/img/logo.png" alt="Oye Vaquero" />
        </div>

        <div className="renta-header-nav-row">
          <div className="renta-nav-social" aria-label="Redes sociales">
            <a href="https://www.facebook.com/oyevaquero" target="_blank" rel="noopener" aria-label="Facebook">f</a>
            <a href="https://x.com/oyevaquero" target="_blank" rel="noopener" aria-label="X">x</a>
            <a href="https://www.instagram.com/oyevaquero" target="_blank" rel="noopener" aria-label="Instagram">i</a>
            <Link to="/login" aria-label="Login">o</Link>
          </div>

          <nav className="renta-nav">
            <a href="/#catalogo">Catalogo</a>
            <Link to="/renta">Renta</Link>
          </nav>

          <a className="renta-nav-search" href="#" aria-label="Buscar">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15.8 14.4h-.74l-.26-.25a6.2 6.2 0 1 0-.66.66l.25.26v.74L19 20.5 20.5 19l-4.7-4.6zm-5.6 0a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4z"/>
            </svg>
          </a>
        </div>
      </header>

      <main className="renta-main">
        {step === "map" && (
          <section className="renta-step is-active" aria-labelledby="map-title">
            <div className="renta-container">
              <p className="renta-kicker">Paso 1</p>
              <h1 id="map-title">Elige una estacion sede</h1>
              <p className="renta-lead">Selecciona una estacion del mapa para ver que vehiculos hay disponibles en tiempo real.</p>

              <div className="renta-map-layout">
                <div className="renta-metro-map" aria-label="Mapa de estaciones">
                  {STATIONS.map((station) => (
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
                  ))}
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

              {!!selectedStation && (
                <section className="renta-vehicles-panel">
                  <h2>Vehiculos disponibles</h2>
                  <p className="renta-muted">Costo mostrado por cada 30 minutos.</p>
                  <div className="renta-vehicle-grid">
                    {selectedStation.vehicles.map((vehicle) => (
                      <article key={vehicle.serial} className="renta-vehicle-card">
                        <h3>{vehicle.type}</h3>
                        <p><strong>Serie:</strong> {vehicle.serial}</p>
                        <p><strong>Costo:</strong> {money(vehicle.price30)} / 30 min</p>
                        <button type="button" className="renta-btn renta-btn-primary" onClick={() => onChooseVehicle(vehicle)}>
                          Elegir vehiculo
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </section>
        )}

        {step === "summary" && selectedStation && selectedVehicle && (
          <section className="renta-step is-active" aria-labelledby="summary-title">
            <div className="renta-container renta-container-narrow">
              <p className="renta-kicker">Paso 2</p>
              <h2 id="summary-title">Resumen de tu compra</h2>

              <article className="renta-card renta-summary-card">
                <p><strong>Estacion:</strong> {selectedStation.name}</p>
                <p><strong>Vehiculo:</strong> {selectedVehicle.type}</p>
                <p><strong>Serie:</strong> {selectedVehicle.serial}</p>
                <p><strong>Costo (30 min):</strong> {money(selectedVehicle.price30)}</p>
                <p className="renta-total"><strong>Total a pagar:</strong> {money(selectedVehicle.price30)}</p>
              </article>

              <div className="renta-actions-row">
                <button className="renta-btn renta-btn-ghost" type="button" onClick={() => goTo("map")}>Cambiar vehiculo</button>
                <button className="renta-btn renta-btn-primary" type="button" onClick={() => goTo("payment")}>Continuar al pago</button>
              </div>
            </div>
          </section>
        )}

        {step === "payment" && (
          <section className="renta-step is-active" aria-labelledby="payment-title">
            <div className="renta-container renta-container-narrow">
              <p className="renta-kicker">Paso 3</p>
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
            </div>
          </section>
        )}

        {step === "ticket" && paidOrder && (
          <section className="renta-step is-active" aria-labelledby="ticket-title">
            <div className="renta-container renta-container-narrow">
              <p className="renta-kicker">Paso 4</p>
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

              <button className="renta-btn renta-btn-primary" type="button" onClick={onStartTrip}>Ya escanee, iniciar viaje</button>
            </div>
          </section>
        )}

        {step === "trip" && paidOrder && (
          <section className="renta-step is-active" aria-labelledby="trip-title">
            <div className="renta-container renta-container-narrow">
              <p className="renta-kicker">Paso 5</p>
              <h2 id="trip-title">Viaje activo</h2>

              <article className="renta-card renta-trip-card">
                <p><strong>Vehiculo:</strong> {paidOrder.vehicleType}</p>
                <p><strong>Serie:</strong> {paidOrder.serial}</p>
                <p><strong>Estacion origen:</strong> {paidOrder.station}</p>
                <div className="renta-timer" aria-live="polite">{tripTimeLabel}</div>
              </article>

              <div className="renta-trip-actions">
                <button className="renta-btn renta-btn-danger" type="button" onClick={onStopTrip}>Parar viaje</button>
                <button className="renta-btn renta-btn-ghost" type="button" onClick={() => showToast("Ayuda enviada: operador en camino.")}>Obtener ayuda</button>
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

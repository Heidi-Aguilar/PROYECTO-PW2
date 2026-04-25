document.addEventListener('DOMContentLoaded', () => {
  const steps = {
    map: document.getElementById('step-map'),
    payment: document.getElementById('step-payment'),
    ticket: document.getElementById('step-ticket'),
    trip: document.getElementById('step-trip')
  };

  const stationName = document.getElementById('station-name');
  const stationLine = document.getElementById('station-line');
  const metroMap = document.getElementById('metro-map');
  const vehicleList = document.getElementById('vehicle-list');

  const summaryStation = document.getElementById('summary-station');
  const summaryType = document.getElementById('summary-type');
  const summarySerial = document.getElementById('summary-serial');
  const summaryPrice = document.getElementById('summary-price');
  const summaryTotal = document.getElementById('summary-total');
  const goPayment = document.getElementById('go-payment');
  const paymentForm = document.getElementById('payment-form');

  const ticketId = document.getElementById('ticket-id');
  const ticketStation = document.getElementById('ticket-station');
  const ticketVehicle = document.getElementById('ticket-vehicle');
  const ticketSerial = document.getElementById('ticket-serial');
  const ticketTotal = document.getElementById('ticket-total');
  const ticketTime = document.getElementById('ticket-time');
  const ticketQr = document.getElementById('ticket-qr');
  const startTripBtn = document.getElementById('start-trip');

  const tripVehicle = document.getElementById('trip-vehicle');
  const tripSerial = document.getElementById('trip-serial');
  const tripStation = document.getElementById('trip-station');
  const tripTimer = document.getElementById('trip-timer');
  const stopTripBtn = document.getElementById('stop-trip');
  const helpTripBtn = document.getElementById('help-trip');
  const supportTripBtn = document.getElementById('support-trip');
  const emergencyTripBtn = document.getElementById('emergency-trip');
  const toast = document.getElementById('toast');

  const stations = [
    {
      id: 'norte',
      name: 'Metro Norte',
      line: 'Linea Verde',
      x: 18,
      y: 28,
      vehicles: [
        { type: 'Bicicleta', serial: 'BIC-NR-1021', price30: 35 },
        { type: 'Electrica', serial: 'ELE-NR-5581', price30: 49 },
        { type: 'Scooter electrico', serial: 'SCO-NR-4412', price30: 55 },
        { type: 'Patin', serial: 'PAT-NR-3004', price30: 42 }
      ]
    },
    {
      id: 'centro',
      name: 'Metro Centro',
      line: 'Linea Dorada',
      x: 46,
      y: 42,
      vehicles: [
        { type: 'Bicicleta', serial: 'BIC-CT-7840', price30: 37 },
        { type: 'Electrica', serial: 'ELE-CT-1097', price30: 50 },
        { type: 'Scooter electrico', serial: 'SCO-CT-6618', price30: 57 },
        { type: 'Patin', serial: 'PAT-CT-8891', price30: 44 }
      ]
    },
    {
      id: 'sur',
      name: 'Metro Sur',
      line: 'Linea Azul',
      x: 74,
      y: 60,
      vehicles: [
        { type: 'Bicicleta', serial: 'BIC-SR-2190', price30: 34 },
        { type: 'Electrica', serial: 'ELE-SR-5500', price30: 48 },
        { type: 'Scooter electrico', serial: 'SCO-SR-1180', price30: 54 },
        { type: 'Patin', serial: 'PAT-SR-4421', price30: 41 }
      ]
    },
    {
      id: 'oriente',
      name: 'Metro Oriente',
      line: 'Linea Naranja',
      x: 62,
      y: 22,
      vehicles: [
        { type: 'Bicicleta', serial: 'BIC-OR-1090', price30: 36 },
        { type: 'Electrica', serial: 'ELE-OR-9922', price30: 51 },
        { type: 'Scooter electrico', serial: 'SCO-OR-2140', price30: 56 },
        { type: 'Patin', serial: 'PAT-OR-7774', price30: 45 }
      ]
    }
  ];

  let selectedStation = null;
  let selectedVehicle = null;
  let paidOrder = null;
  let tripStartedAt = null;
  let tripTimerId = null;

  const money = (value) => `$${value.toFixed(2)} MXN`;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 2200);
  };

  const setStep = (name) => {
    Object.values(steps).forEach((step) => {
      step.classList.remove('is-active');
      step.hidden = true;
    });
    steps[name].hidden = false;
    steps[name].classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fillSummary = () => {
    if (!selectedStation || !selectedVehicle) {
      summaryStation.textContent = '-';
      summaryType.textContent = '-';
      summarySerial.textContent = '-';
      summaryPrice.textContent = '-';
      summaryTotal.textContent = '-';
      goPayment.disabled = true;
      return;
    }

    summaryStation.textContent = selectedStation.name;
    summaryType.textContent = selectedVehicle.type;
    summarySerial.textContent = selectedVehicle.serial;
    summaryPrice.textContent = money(selectedVehicle.price30);
    summaryTotal.textContent = money(selectedVehicle.price30);
    goPayment.disabled = false;
  };

  const renderVehicles = (vehicles) => {
    vehicleList.innerHTML = '';

    vehicles.forEach((vehicle) => {
      const card = document.createElement('article');
      card.className = `vehicle-card${selectedVehicle && selectedVehicle.serial === vehicle.serial ? ' selected' : ''}`;
      card.innerHTML = `
        <h3>${vehicle.type}</h3>
        <p><strong>Serie:</strong> ${vehicle.serial}</p>
        <p><strong>Costo:</strong> ${money(vehicle.price30)} / 30 min</p>
      `;

      const chooseBtn = document.createElement('button');
      chooseBtn.type = 'button';
      chooseBtn.className = 'btn primary';
      chooseBtn.textContent = 'Elegir vehiculo';
      chooseBtn.addEventListener('click', () => {
        selectedVehicle = vehicle;
        fillSummary();
        renderVehicles(vehicles);
      });

      card.appendChild(chooseBtn);
      vehicleList.appendChild(card);
    });
  };

  const renderMap = () => {
    stations.forEach((station) => {
      const btn = document.createElement('button');
      btn.className = 'station-pin';
      btn.type = 'button';
      btn.dataset.stationId = station.id;
      btn.style.left = `${station.x}%`;
      btn.style.top = `${station.y}%`;
      btn.textContent = station.name.replace('Metro ', '');

      btn.addEventListener('click', () => {
        selectedStation = station;
        selectedVehicle = null;
        fillSummary();

        [...metroMap.querySelectorAll('.station-pin')].forEach((pin) => pin.classList.remove('active'));
        btn.classList.add('active');

        stationName.textContent = station.name;
        stationLine.textContent = `${station.line} • ${station.vehicles.length} vehiculos disponibles`;
        renderVehicles(station.vehicles);
      });

      metroMap.appendChild(btn);
    });
  };

  const generateOrder = () => {
    const now = new Date();
    const orderId = `RV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      id: orderId,
      station: selectedStation.name,
      vehicleType: selectedVehicle.type,
      serial: selectedVehicle.serial,
      total: selectedVehicle.price30,
      paidAt: now
    };
  };

  const fillTicket = () => {
    ticketId.textContent = paidOrder.id;
    ticketStation.textContent = paidOrder.station;
    ticketVehicle.textContent = paidOrder.vehicleType;
    ticketSerial.textContent = paidOrder.serial;
    ticketTotal.textContent = money(paidOrder.total);
    ticketTime.textContent = paidOrder.paidAt.toLocaleString('es-MX');

    const qrPayload = `${paidOrder.id}|${paidOrder.serial}|${paidOrder.station}|${paidOrder.total}`;
    ticketQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`;
  };

  const startTripTimer = () => {
    tripStartedAt = Date.now();
    if (tripTimerId) {
      clearInterval(tripTimerId);
    }

    const tick = () => {
      const elapsedSec = Math.floor((Date.now() - tripStartedAt) / 1000);
      const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
      const ss = String(elapsedSec % 60).padStart(2, '0');
      tripTimer.textContent = `${mm}:${ss}`;
    };

    tick();
    tripTimerId = window.setInterval(tick, 1000);
  };

  const stopTrip = () => {
    if (tripTimerId) {
      clearInterval(tripTimerId);
      tripTimerId = null;
    }
    const total = tripTimer.textContent;
    showToast(`Viaje finalizado. Tiempo total: ${total}`);
    setStep('map');
  };

  goPayment.addEventListener('click', () => {
    if (!selectedStation || !selectedVehicle) {
      showToast('Selecciona estacion y vehiculo para continuar.');
      return;
    }

    setStep('payment');
  });

  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!selectedStation || !selectedVehicle) {
      showToast('Primero selecciona estacion y vehiculo.');
      setStep('map');
      return;
    }

    paidOrder = generateOrder();
    fillTicket();
    setStep('ticket');
    showToast('Pago realizado con exito.');
  });

  startTripBtn.addEventListener('click', () => {
    if (!paidOrder) {
      showToast('No hay ticket valido para iniciar.');
      return;
    }

    tripVehicle.textContent = paidOrder.vehicleType;
    tripSerial.textContent = paidOrder.serial;
    tripStation.textContent = paidOrder.station;
    setStep('trip');
    startTripTimer();
    showToast('Viaje iniciado. Maneja con precaucion.');
  });

  stopTripBtn.addEventListener('click', stopTrip);
  helpTripBtn.addEventListener('click', () => showToast('Ayuda enviada: operador en camino.'));
  supportTripBtn.addEventListener('click', () => showToast('Soporte: 55-1234-5678'));
  emergencyTripBtn.addEventListener('click', () => showToast('Emergencia activada: contactando asistencia.'));

  renderMap();
  fillSummary();
});
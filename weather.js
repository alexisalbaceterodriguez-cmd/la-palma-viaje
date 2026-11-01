/* El tiempo por zonas del itinerario. Sin GPS ni claves API. */
(() => {
  'use strict';

  const panel = document.getElementById('weatherPanel');
  if (!panel || typeof TRIP_DATA === 'undefined') return;

  const cards = document.getElementById('weatherCards');
  const scope = document.getElementById('weatherScope');
  const status = document.getElementById('weatherStatus');
  const button = document.getElementById('weatherRefresh');
  const TTL = 30 * 60 * 1000;
  const MAX_STALE = 72 * 60 * 60 * 1000;
  const STORAGE_PREFIX = 'la-palma-weather-v1-';
  const DAY_PLACES = {
    0: ['santacruz', 'tilos', 'roque', 'salinas', 'puertonaos'],
    1: ['santacruz', 'cancajos'],
    2: ['nogales', 'tilos', 'fajana'],
    3: ['piedras', 'sanantonio', 'salinas'],
    4: ['cumbrecita', 'roque'],
    5: ['santacruz', 'llanos', 'puertonaos'],
    6: ['puertonaos'],
    7: ['tazacorte', 'playatazacorte', 'time'],
    8: ['puertonaos', 'airport']
  };

  let selectedDay = getDayFromUrl();
  let generation = 0;

  function getDayFromUrl() {
    const value = Number(new URLSearchParams(location.search).get('dia') || '1');
    return Number.isInteger(value) && value >= 0 && value <= TRIP_DATA.days.length ? value : 1;
  }

  function zonesForDay(day) {
    const ids = DAY_PLACES[day] || DAY_PLACES[0];
    return ids.map(id => TRIP_DATA.places[id]).filter(p =>
      p && Array.isArray(p.coords) && p.coords.length === 2 &&
      p.coords.every(Number.isFinite));
  }

  function canaryDate() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Atlantic/Canary', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const value = key => parts.find(p => p.type === key)?.value || '';
    return value('year') + '-' + value('month') + '-' + value('day');
  }

  function routeDate(day) {
    return day > 0 ? '2026-10-' + String(9 + day).padStart(2, '0') : null;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c =>
      ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  }

  function numeric(value, digits = 0) {
    return typeof value === 'number' && Number.isFinite(value)
      ? value.toLocaleString('es-ES', {maximumFractionDigits: digits}) : '—';
  }

  function weatherLabel(code, isDay = true) {
    if (code === 0) return [isDay ? '☀' : '☾', 'Despejado'];
    if (code === 1 || code === 2) return ['⛅', 'Poco nuboso'];
    if (code === 3) return ['☁', 'Cubierto'];
    if (code === 45 || code === 48) return ['≋', 'Niebla'];
    if (code >= 51 && code <= 67) return ['☂', 'Lluvia o llovizna'];
    if (code >= 71 && code <= 77) return ['❄', 'Nieve'];
    if (code >= 80 && code <= 82) return ['☂', 'Chubascos'];
    if (code >= 95) return ['⚡', 'Tormenta'];
    return ['☁', 'Tiempo variable'];
  }

  function timestamp(ms) {
    return new Date(ms).toLocaleString('es-ES', {
      timeZone: 'Atlantic/Canary', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit'
    }) + ' (Canarias)';
  }

  function loadSaved(id) {
    try {
      const record = JSON.parse(localStorage.getItem(STORAGE_PREFIX + id) || 'null');
      return record && Number.isFinite(record.savedAt) && record.savedAt <= Date.now() &&
        Date.now() - record.savedAt <= MAX_STALE &&
        record.data?.current && Array.isArray(record.data?.daily?.time)
        ? record : null;
    } catch {
      return null;
    }
  }

  function save(id, record) {
    try {
      localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(record));
    } catch {
      // Local storage can be disabled or full. The current result still works.
    }
  }

  function apiUrl(zone) {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: String(zone.coords[0]),
      longitude: String(zone.coords[1]),
      current: 'temperature_2m,precipitation,weather_code,is_day,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
      forecast_days: '16',
      timezone: 'Atlantic/Canary'
    }).toString();
    return url;
  }

  async function getWeather(zone, force = false) {
    const saved = loadSaved(zone.id);
    if (!force && saved && Date.now() - saved.savedAt < TTL) return {...saved, cached: true};
    if (navigator.onLine === false) return saved ? {...saved, cached: true} : null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(apiUrl(zone), {
        signal: controller.signal, cache: 'no-store',
        headers: {Accept: 'application/json'}
      });
      if (!response.ok) throw new Error('Weather API ' + response.status);
      const data = await response.json();
      if (!data?.current || !Array.isArray(data?.daily?.time) ||
          !Number.isFinite(data.current.temperature_2m)) {
        throw new Error('Incomplete weather data');
      }
      const record = {savedAt: Date.now(), data};
      save(zone.id, record);
      return {...record, cached: false};
    } catch {
      return saved ? {...saved, cached: true} : null;
    } finally {
      clearTimeout(timer);
    }
  }

  function cardMarkup(zone, record, today, target) {
    if (!record) {
      return '<article class="weather-card weather-card-empty"><h4>' +
        escapeHtml(zone.name) + '</h4><p>Sin datos meteorológicos disponibles.</p></article>';
    }
    const data = record.data;
    const future = target && target > today;
    const dayIndex = future ? data.daily.time.indexOf(target) : -1;
    const forecast = dayIndex !== -1;
    const current = data.current;
    const code = forecast ? data.daily.weather_code?.[dayIndex] : current.weather_code;
    const [symbol, description] = weatherLabel(code, forecast || current.is_day !== 0);
    const amount = forecast
      ? numeric(data.daily.temperature_2m_min?.[dayIndex]) + '° / ' +
        numeric(data.daily.temperature_2m_max?.[dayIndex]) + '°'
      : numeric(current.temperature_2m, 1) + ' °C';
    const rainIndex = forecast ? dayIndex : data.daily.time.indexOf(today);
    const rainProbability = rainIndex >= 0
      ? numeric(data.daily.precipitation_probability_max?.[rainIndex]) + '%'
      : '—';
    const wind = forecast ? data.daily.wind_speed_10m_max?.[dayIndex] : current.wind_speed_10m;
    const info = forecast
      ? 'Previsión · ' + target.slice(8, 10) + '/' + target.slice(5, 7)
      : 'Ahora · ' + (typeof current.time === 'string' ? current.time.slice(11, 16) + ' h' : 'hora de Canarias');
    const label = forecast ? 'Viento máx.' : 'Viento ahora';
    const note = record.cached ? 'Datos guardados · ' + timestamp(record.savedAt) : 'Actualizado · ' + timestamp(record.savedAt);
    return '<article class="weather-card">' +
      '<div class="weather-card-top"><h4>' + escapeHtml(zone.name) + '</h4>' +
      '<span class="weather-symbol" aria-hidden="true">' + escapeHtml(symbol) + '</span></div>' +
      '<div class="weather-card-time">' + escapeHtml(info) + '</div>' +
      '<div class="weather-temperature">' + escapeHtml(amount) + '</div>' +
      '<p class="weather-description">' + escapeHtml(description) + '</p>' +
      '<div class="weather-facts"><span>Lluvia ' + (forecast ? 'ese día' : 'hoy') + ': <b>' +
      escapeHtml(rainProbability) + '</b></span><span>' + escapeHtml(label) +
      ': <b>' + escapeHtml(numeric(wind)) + ' km/h</b></span></div>' +
      '<small class="weather-card-updated">' + escapeHtml(note) + '</small></article>';
  }

  function setScope(day, today) {
    const target = routeDate(day);
    if (day === 0) {
      scope.textContent = 'Condiciones actuales estimadas en cinco zonas de la isla, no observaciones de estaciones.';
    } else if (target < today) {
      scope.textContent = 'La ruta es del ' + target.slice(8) + '/' + target.slice(5, 7) +
        '/2026. Se muestra el tiempo de HOY, no el de aquel día.';
    } else if (target === today) {
      scope.textContent = 'Condiciones actuales estimadas en las zonas de este día del itinerario.';
    } else {
      scope.textContent = 'Previsión para el ' + target.slice(8) + '/' + target.slice(5, 7) +
        '/2026, si está disponible. En caso contrario, se muestra el tiempo de hoy.';
    }
  }

  async function update(force = false) {
    const token = ++generation;
    const day = selectedDay;
    const today = canaryDate();
    const target = routeDate(day);
    const zones = zonesForDay(day);
    setScope(day, today);
    button.disabled = true;
    status.textContent = 'Consultando Open-Meteo…';
    cards.setAttribute('aria-busy', 'true');
    cards.innerHTML = '<p class="weather-loading">Cargando tiempo por zonas…</p>';
    const results = await Promise.all(zones.map(zone => getWeather(zone, force)));
    if (token !== generation) return;
    cards.innerHTML = zones.map((zone, index) =>
      cardMarkup(zone, results[index], today, target)).join('');
    cards.removeAttribute('aria-busy');
    button.disabled = false;
    const available = results.filter(Boolean);
    const cached = available.filter(r => r.cached).length;
    status.textContent = !available.length
      ? 'No se puede consultar el tiempo ahora. El itinerario sigue disponible.'
      : available.length < zones.length
        ? 'Datos parciales: ' + available.length + ' de ' + zones.length + ' zonas.'
        : cached
          ? 'Datos guardados: ' + cached + ' de ' + zones.length +
            ' zonas. Revisa la hora de actualización.'
          : 'Estimaciones meteorológicas actualizadas. No sustituyen a los avisos oficiales.';
  }

  button.addEventListener('click', () => { void update(true); });
  window.addEventListener('lapalma:day-changed', event => {
    selectedDay = event.detail?.dayId ?? getDayFromUrl();
    void update(false);
  });
  window.addEventListener('online', () => { void update(false); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void update(false);
  });
  window.setInterval(() => {
    if (!document.hidden) void update(false);
  }, TTL);

  window.LaPalmaWeather = {refresh: () => update(true)};
  void update(false);
})();

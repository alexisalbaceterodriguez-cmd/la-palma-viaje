/* Per-browser travel profiles. No remote accounts or backend. */
(() => {
  'use strict';
  const KEY = 'lapalma-profiles-v1';
  const LEGACY = 'lapalma-visited-v1';
  const MAX = 20;
  const el = id => document.getElementById(id);
  function cleanVisited(value) {
    const out = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
    Object.entries(value).forEach(([key, completed]) => {
      if (/^[a-zA-Z0-9_-]{1,80}$/.test(key) && completed === true) out[key] = true;
    });
    return out;
  }
  function read(key) {
    try { const raw = localStorage.getItem(key); return raw === null ? null : JSON.parse(raw); }
    catch { return null; }
  }
  function load() {
    const saved = read(KEY);
    if (saved && Array.isArray(saved.profiles) && saved.profiles.length) {
      const seen = new Set();
      const profiles = saved.profiles.slice(0, MAX).filter(p => {
        if (!p || typeof p.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(p.id) || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      }).map(p => ({
        id: p.id,
        name: typeof p.name === 'string' && p.name.trim() ? p.name.trim().slice(0, 32) : 'Viajero',
        visited: cleanVisited(p.visited)
      }));
      if (profiles.length) return { version: 1, activeId: profiles.some(p => p.id === saved.activeId) ? saved.activeId : profiles[0].id, profiles };
    }
    // One-time import of the marks made before traveler profiles existed.
    return { version: 1, activeId: 'default', profiles: [{ id: 'default', name: 'Mi viaje', visited: cleanVisited(read(LEGACY)) }] };
  }
  let state = load();
  let storageAvailable = true;
  function active() { return state.profiles.find(p => p.id === state.activeId) || state.profiles[0]; }
  function updateUI() {
    if (el('profileName')) el('profileName').textContent = active().name;
    if (el('profileInfo')) el('profileInfo').textContent = storageAvailable
      ? Object.keys(active().visited).length + ' paradas marcadas · Guardado en este navegador'
      : 'No se puede guardar: revisa los ajustes de privacidad';
    const select = el('profileSelect');
    if (select) {
      select.replaceChildren();
      for (const p of state.profiles) {
        const option = document.createElement('option');
        option.value = p.id; option.textContent = p.name;
        select.appendChild(option);
      }
      select.value = active().id;
    }
    if (el('profileCreate')) el('profileCreate').disabled = state.profiles.length >= MAX;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageAvailable = true; }
    catch { storageAvailable = false; }
    updateUI();
  }
  function announce() {
    updateUI();
    window.dispatchEvent(new Event('lapalma:profile-changed'));
  }
  function getVisited() { return { ...active().visited }; }
  function toggleVisited(id) {
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return;
    const marks = active().visited;
    if (marks[id]) delete marks[id]; else marks[id] = true;
    persist();
  }
  function closePanel() {
    if (el('profilePanel')) el('profilePanel').hidden = true;
    el('profileOpen')?.setAttribute('aria-expanded', 'false');
  }
  function selectProfile(id) {
    if (!state.profiles.some(p => p.id === id)) return;
    if (state.activeId !== id) {
      state.activeId = id;
      persist();
      announce();
    }
    closePanel();
  }
  function createProfile(value) {
    const name = String(value || '').trim().replace(/\s+/g, ' ').slice(0, 32);
    if (!name) { el('profileNewName')?.focus(); return; }
    if (state.profiles.length >= MAX) return;
    let id;
    do { id = 'p_' + Math.random().toString(36).slice(2, 12); }
    while (state.profiles.some(p => p.id === id));
    state.profiles.push({ id, name, visited: {} });
    state.activeId = id;
    persist();
    if (el('profileNewName')) el('profileNewName').value = '';
    announce();
    closePanel();
  }
  function bind() {
    const button = el('profileOpen'), panel = el('profilePanel');
    if (!button || !panel) return;
    button.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      button.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) { updateUI(); el('profileSelect')?.focus(); }
    });
    el('profileUse')?.addEventListener('click', () => selectProfile(el('profileSelect').value));
    el('profileCreate')?.addEventListener('click', () => createProfile(el('profileNewName').value));
    el('profileNewName')?.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); createProfile(event.currentTarget.value); }
    });
    updateUI();
  }
  window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return;
    state = load();
    storageAvailable = true;
    announce();
  });
  window.LaPalmaProfiles = { getVisited, toggleVisited, selectProfile, createProfile, getActive: () => ({ id: active().id, name: active().name }) };
  persist();
  bind();
})();

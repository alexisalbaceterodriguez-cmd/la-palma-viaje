(() => {
  'use strict';
  const dialog = document.getElementById('placeSearch');
  const open = document.getElementById('searchButton');
  const input = document.getElementById('placeSearchInput');
  const results = document.getElementById('placeSearchResults');
  const count = document.getElementById('placeSearchCount');
  const panel = document.getElementById('panel');
  if (!dialog || !open || !input || !results || !count || !panel || typeof TRIP_DATA === 'undefined') return;
  const { places, days, extras } = TRIP_DATA;
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').replace(/\s+/g, ' ').trim();
  const indexed = new Map();
  days.forEach(day => day.items.forEach(id => {
    if (!places[id]) return;
    if (!indexed.has(id)) indexed.set(id, { id, place: places[id], days: [], extra: false });
    indexed.get(id).days.push(day);
  }));
  extras.forEach(id => {
    if (!places[id]) return;
    if (!indexed.has(id)) indexed.set(id, { id, place: places[id], days: [], extra: true });
    else indexed.get(id).extra = true;
  });
  const entries = [...indexed.values()].map(e => ({
    ...e,
    nameKey: normalize(e.place.name),
    searchable: normalize([e.place.name, e.place.desc, e.place.cat, ...e.days.flatMap(d => [d.title, d.date, 'dia ' + d.id]), e.extra ? 'plan b opcional' : ''].join(' '))
  }));
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  let highlightTimer;
  function renderResults() {
    const query = normalize(input.value);
    const terms = query.split(/\s+/).filter(Boolean);
    const matches = entries.filter(e => terms.every(t => e.searchable.includes(t)));
    matches.sort((a,b) => {
      if (query) {
        const rank = e => e.nameKey === query ? 0 : e.nameKey.startsWith(query) ? 1 : e.nameKey.includes(query) ? 2 : 3;
        const diff = rank(a) - rank(b);
        if (diff) return diff;
      }
      return (a.days[0]?.id ?? 99) - (b.days[0]?.id ?? 99) || a.place.name.localeCompare(b.place.name, 'es');
    });
    count.textContent = query ? matches.length + (matches.length === 1 ? ' lugar encontrado' : ' lugares encontrados') : entries.length + ' lugares en el itinerario y Plan B';
    results.replaceChildren();
    if (!matches.length) {
      results.append(el('p', 'place-search-empty', 'No encontramos ese lugar. Prueba con «Roque», «playa» o «volcán».'));
      return;
    }
    for (const entry of matches) {
      const card = el('article', 'place-search-result');
      card.setAttribute('role', 'listitem');
      const header = el('div', 'place-result-top');
      header.append(el('strong', '', entry.place.name), el('span', 'place-result-category', entry.place.cat));
      card.append(header, el('p', '', entry.place.desc));
      const dayButtons = el('div', 'place-result-days');
      for (const day of entry.days) {
        const btn = el('button', 'place-result-day', 'Día ' + day.id + ' · ' + day.date);
        btn.type = 'button';
        btn.dataset.placeId = entry.id;
        btn.dataset.placeDay = day.id;
        btn.setAttribute('aria-label', 'Ir a ' + entry.place.name + ', día ' + day.id + ', ' + day.date);
        dayButtons.append(btn);
      }
      if (entry.extra) {
        const btn = el('button', 'place-result-day is-extra', 'Plan B · sin día fijo');
        btn.type = 'button';
        btn.dataset.placeId = entry.id;
        btn.dataset.placeExtra = 'true';
        dayButtons.append(btn);
      }
      card.append(dayButtons);
      results.append(card);
    }
  }
  function openSearch() {
    if (dialog.open) return;
    renderResults();
    dialog.showModal();
    input.focus();
    input.select();
  }
  function jump(id, day, isExtra) {
    const tab = [...document.querySelectorAll('#tabs button[data-day]')].find(b => Number(b.dataset.day) === day);
    if (!isExtra && !tab) return;
    dialog.close();
    if (tab) tab.click();
    setTimeout(() => {
      const nodes = panel.querySelectorAll(isExtra ? '.extra-item[data-extra]' : '.stop[data-spot]');
      const target = [...nodes].find(node => (isExtra ? node.dataset.extra : node.dataset.spot) === id);
      if (!target) return;
      panel.querySelectorAll('.search-hit').forEach(node => node.classList.remove('search-hit'));
      clearTimeout(highlightTimer);
      target.classList.add('search-hit');
      target.tabIndex = -1;
      target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      target.focus({ preventScroll: true });
      highlightTimer = setTimeout(() => target.classList.remove('search-hit'), 4800);
    }, 80);
  }
  open.addEventListener('click', openSearch);
  document.getElementById('placeSearchClose')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  input.addEventListener('input', renderResults);
  results.addEventListener('click', event => {
    const button = event.target.closest('button[data-place-id]');
    if (button) jump(button.dataset.placeId, Number(button.dataset.placeDay), button.dataset.placeExtra === 'true');
  });
  document.addEventListener('keydown', event => {
    const editing = event.target?.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target?.tagName || '');
    if ((event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !editing && !event.altKey && !event.ctrlKey && !event.metaKey)) {
      event.preventDefault();
      openSearch();
    }
  });
})();
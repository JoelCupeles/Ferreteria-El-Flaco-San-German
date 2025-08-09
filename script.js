// =======================================
// script.js — fix robusto carrusel + ofertas (v11)
// =======================================

document.addEventListener('DOMContentLoaded', () => {
  // ===== Header height (CSS var) =====
  const headerEl = document.getElementById('siteHeader');
  const setHeaderHeight = () => {
    const h = headerEl ? (headerEl.offsetHeight || 64) : 64;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  };
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight, { passive: true });
  window.addEventListener('orientationchange', setHeaderHeight, { passive: true });

  // ===== Menú móvil =====
  const menuBtn = document.getElementById('menuBtn');
  const menuList = document.getElementById('menuList');
  const toggleMenu = (force) => {
    if (!menuList || !menuBtn) return;
    const willOpen = typeof force === 'boolean' ? force : !menuList.classList.contains('open');
    menuList.classList.toggle('open', willOpen);
    menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  };
  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleMenu(); });
    Array.from(document.querySelectorAll('nav a'))
      .forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  }

  // ===== Año en footer =====
  const yEl = document.getElementById('y');
  if (yEl) yEl.textContent = new Date().getFullYear();

  // ========================
  // Datos (Catálogo / Ofertas)
  // ========================
  const productos = [
    { nombre:'Taladro DeWalt 20V MAX (driver)', precio:null, categoria:'Herramientas', marca:'DeWalt', foto:'assets/Dewalt-driver.webp?v=1' },
    { nombre:'Gardner 100% Silicón – Flat Roof Coat-N-Seal (4.75 gal)', precio:null, categoria:'Construcción', marca:'Gardner', foto:'assets/gardner-100-silicone.jpg' },
    { nombre:'Crossco 5500 – Sellador Acrílico 2 en 1', precio:null, categoria:'Construcción', marca:'Crossco', foto:'assets/crossco-5500.jpg' },
    { nombre:'Lanco Dry-Coat – Penetrating Surface Cleaner (1 gal)', precio:null, categoria:'Limpieza', marca:'LANCO', foto:'assets/lanco-penetrating-surface-cleaner-dry-coat.jpg' },
    { nombre:'Amsoil Saber 2-Stroke Oil (mezcla)', precio:null, categoria:'Lubricantes', marca:'Amsoil', foto:'assets/2-stroke-oil.jpg' },
    { nombre:'Discos de corte StrongJohn (varios)', precio:null, categoria:'Abrasivos', marca:'StrongJohn', foto:'assets/discos-strongjohn.jpg' },
    { nombre:'Fluidmaster Better Than Wax – Toilet Seal', precio:null, categoria:'Plomería', marca:'Fluidmaster', foto:'assets/fluidmaster-better-than-wax.jpg' }
  ];

  const ofertas = [
    { nombre:'WECO W1000 Thin Set – Oferta especial', categoria:'Ofertas', marca:'WECO', foto:'assets/oferta-weco.jpg' }
  ];

  // ========================
  // UI (filtros + render)
  // ========================
  const catSelect  = document.getElementById('categoria');
  const grid       = document.getElementById('productGrid');
  const offersGrid = document.getElementById('offersGrid');
  const search     = document.getElementById('search');

  // Opciones de categoría
  if (catSelect) {
    const categorias = [...new Set(productos.map(p => p.categoria))].sort();
    categorias.forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c;
      catSelect.appendChild(o);
    });
  }

  const cardHTML = (p) => `
    <article class="card">
      <img loading="lazy" src="${p.foto}" alt="${p.nombre}">
      <div class="body">
        <div class="tags">
          <span class="pill">${p.categoria}</span>
          <span class="pill">${p.marca}</span>
        </div>
        <h3>${p.nombre}</h3>
        ${p.precio != null ? `<div class="price">$${p.precio.toFixed(2)}</div>` : ``}
        <a class="btn btn-primary"
           href="https://api.whatsapp.com/send?phone=17878923930&text=${encodeURIComponent('Hola, quiero info del producto: ' + p.nombre)}"
           target="_blank" rel="noopener">Pedir cotización</a>
      </div>
    </article>`;

  function renderCatalog(list) {
    if (!grid) return;
    grid.innerHTML = list.map(cardHTML).join('');
    hydrateCarousel(grid);
  }
  function renderOffers() {
    if (!offersGrid) return;
    offersGrid.innerHTML = ofertas.map(cardHTML).join('');
    hydrateCarousel(offersGrid);
  }

  function filtrar() {
    const q = (search && search.value ? search.value : '').toLowerCase().trim();
    const c = catSelect ? catSelect.value : '';
    const list = productos.filter(p => {
      const okCat = !c || p.categoria === c;
      const okQ   = !q || (`${p.nombre} ${p.marca}`).toLowerCase().includes(q);
      return okCat && okQ;
    });
    renderCatalog(list);
  }

  if (search)   search.addEventListener('input', filtrar);
  if (catSelect) catSelect.addEventListener('change', filtrar);

  // Render inicial
  renderCatalog(productos);
  renderOffers();

  // ===== Hero ticker =====
  (function ticker(){
    const el = document.getElementById('heroTicker');
    if (!el) return;
    const frases = ['Desde <b>1989</b>','Llaves al instante','Asesoría experta','Servicio con cariño boricua'];
    let i = 0;
    setInterval(() => { i = (i + 1) % frases.length; el.innerHTML = frases[i]; }, 2500);
  })();

  // =======================================
  // Carrusel con dots (robusto en mobile)
  // =======================================
  const MAX_DOTS = 5;
  const state = new WeakMap(); // { onScroll, rafId, snaps:number[] }

  const isDesktop = () => window.matchMedia('(min-width: 900px)').matches;

  function ensureDotsEl(listEl){
    let dots = listEl.nextElementSibling &&
               listEl.nextElementSibling.classList &&
               listEl.nextElementSibling.classList.contains('dots')
               ? listEl.nextElementSibling : null;
    if (!dots) {
      dots = document.createElement('div');
      dots.className = 'dots';
      listEl.after(dots);
    }
    return dots;
  }

  function getSnaps(listEl){
    // snaps = offsetLeft de cada tarjeta .card
    const cards = Array.from(listEl.querySelectorAll('.card'));
    return cards.map(c => Math.max(0, c.offsetLeft));
  }

  function nearestIndex(snaps, x){
    if (snaps.length === 0) return 0;
    let idx = 0, best = Infinity;
    for (let i = 0; i < snaps.length; i++){
      const d = Math.abs(snaps[i] - x);
      if (d < best) { best = d; idx = i; }
    }
    return idx;
  }

  function scrollToSnap(listEl, snaps, i){
    const left = snaps[Math.max(0, Math.min(i, snaps.length - 1))] || 0;
    listEl.scrollTo({ left, behavior: 'smooth' });
  }

  function renderDots(listEl){
    const dots = ensureDotsEl(listEl);

    // Desktop: oculto; Mobile: solo si hay overflow y >1 card
    const cards = listEl.querySelectorAll('.card').length;
    const hasOverflow = (listEl.scrollWidth - listEl.clientWidth) > 2;

    if (isDesktop() || cards <= 1 || !hasOverflow){
      dots.style.display = 'none';
      detachCarousel(listEl);
      return;
    }

    // guardar snaps y construir
    const snaps = getSnaps(listEl);
    const total = snaps.length;
    const curr  = nearestIndex(snaps, listEl.scrollLeft);
    const visible = Math.min(MAX_DOTS, total);

    let start = curr - Math.floor(visible / 2);
    start = Math.max(0, Math.min(start, total - visible));

    const fr = document.createDocumentFragment();
    for (let i = 0; i < visible; i++){
      const pageIndex = start + i;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot' + (pageIndex === curr ? ' active' : '');
      b.setAttribute('aria-label', `Ir a elemento ${pageIndex + 1} de ${total}`);
      b.addEventListener('click', () => scrollToSnap(listEl, snaps, pageIndex));
      fr.appendChild(b);
    }
    dots.replaceChildren(fr);
    dots.style.display = 'flex';

    // guardar estado + listeners
    let s = state.get(listEl) || {};
    s.snaps = snaps;
    state.set(listEl, s);
    attachCarousel(listEl);
  }

  function onScrollFactory(listEl){
    return () => {
      let s = state.get(listEl) || {};
      if (s.rafId) return;
      s.rafId = requestAnimationFrame(() => {
        s.rafId = null;
        renderDots(listEl);
      });
      state.set(listEl, s);
    };
  }

  function attachCarousel(listEl){
    let s = state.get(listEl) || {};
    if (s.onScroll) return; // ya conectado
    s.onScroll = onScrollFactory(listEl);
    state.set(listEl, s);
    listEl.addEventListener('scroll', s.onScroll, { passive: true });
    window.addEventListener('resize', s.onScroll, { passive: true });
    window.addEventListener('orientationchange', s.onScroll, { passive: true });
  }

  function detachCarousel(listEl){
    const s = state.get(listEl);
    if (!s || !s.onScroll) return;
    listEl.removeEventListener('scroll', s.onScroll);
    window.removeEventListener('resize', s.onScroll);
    window.removeEventListener('orientationchange', s.onScroll);
    if (s.rafId){ cancelAnimationFrame(s.rafId); s.rafId = null; }
    s.onScroll = null;
    state.set(listEl, s);
  }

  function hydrateCarousel(listEl){
    if (!listEl) return;

    // construir una vez
    renderDots(listEl);

    // recalc cuando carguen imágenes dentro del carrusel
    const imgs = Array.from(listEl.querySelectorAll('img'));
    let pending = imgs.length;
    if (pending === 0) { renderDots(listEl); }
    imgs.forEach(img => {
      const done = () => { pending--; if (pending <= 0) renderDots(listEl); };
      if (img.complete) done();
      else {
        img.addEventListener('load', done,  { once: true });
        img.addEventListener('error', done, { once: true });
      }
    });

    // observar cambios reales de tamaño del contenedor (Roboto)
    const ro = new ResizeObserver(() => renderDots(listEl));
    ro.observe(listEl);
  }
});

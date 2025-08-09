// Altura real del header
const headerEl = document.getElementById('siteHeader');
function setHeaderHeight(){
  const h = headerEl ? (headerEl.offsetHeight || 64) : 64;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}
setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);
window.addEventListener('orientationchange', setHeaderHeight);

// Menú móvil simple
const menuBtn = document.getElementById('menuBtn');
const menuList = document.getElementById('menuList');
function toggleMenu(force){
  if(!menuList || !menuBtn) return;
  const willOpen = typeof force==='boolean' ? force : !menuList.classList.contains('open');
  menuList.classList.toggle('open', willOpen);
  menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}
if(menuBtn){
  menuBtn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); toggleMenu(); });
  Array.from(document.querySelectorAll('nav a')).forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
}

// Año en footer
const yEl=document.getElementById('y'); if(yEl) yEl.textContent=new Date().getFullYear();

// ========================
// Datos (productos/ofertas)
// ========================
const productos=[
  {nombre:'Taladro DeWalt 20V MAX (driver)', precio:null, categoria:'Herramientas', marca:'DeWalt', foto:'assets/Dewalt-driver.webp?v=1'},
  {nombre:'Gardner 100% Silicón – Flat Roof Coat-N-Seal (4.75 gal)', precio:null, categoria:'Construcción', marca:'Gardner', foto:'assets/gardner-100-silicone.jpg'},
  {nombre:'Crossco 5500 – Sellador Acrílico 2 en 1', precio:null, categoria:'Construcción', marca:'Crossco', foto:'assets/crossco-5500.jpg'},
  {nombre:'Lanco Dry-Coat – Penetrating Surface Cleaner (1 gal)', precio:null, categoria:'Limpieza', marca:'LANCO', foto:'assets/lanco-penetrating-surface-cleaner-dry-coat.jpg'},
  {nombre:'Amsoil Saber 2-Stroke Oil (mezcla)', precio:null, categoria:'Lubricantes', marca:'Amsoil', foto:'assets/2-stroke-oil.jpg'},
  {nombre:'Discos de corte StrongJohn (varios)', precio:null, categoria:'Abrasivos', marca:'StrongJohn', foto:'assets/discos-strongjohn.jpg'}
];

const ofertas=[
  {nombre:'WECO W1000 Thin Set – Oferta especial', categoria:'Ofertas', marca:'WECO', foto:'assets/oferta-weco.jpg'}
];

// ========================
// UI Catálogo/Filtros
// ========================
const catSelect=document.getElementById('categoria');
const grid=document.getElementById('productGrid');
const offersGrid=document.getElementById('offersGrid');
const search=document.getElementById('search');

if (catSelect) {
  const categorias=[...new Set(productos.map(p=>p.categoria))].sort();
  categorias.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;catSelect.appendChild(o);});
}

const cardHTML=p=>`
  <article class="card">
    <img loading="lazy" src="${p.foto}" alt="${p.nombre}">
    <div class="body">
      <div class="tags"><span class="pill">${p.categoria}</span><span class="pill">${p.marca}</span></div>
      <h3>${p.nombre}</h3>
      ${p.precio!=null?('<div class="price">$'+p.precio.toFixed(2)+'</div>'):''}
      <a class="btn btn-primary" href="https://api.whatsapp.com/send?phone=17878923930&text=${encodeURIComponent('Hola, quiero info del producto: '+p.nombre)}" target="_blank" rel="noopener">Pedir cotización</a>
    </div>
  </article>`;

// Render + “dots” seguros
function render(list){
  if(!grid) return;
  grid.innerHTML=list.map(cardHTML).join('');
  buildDots(grid);      // ← crea/actualiza los 5 puntitos máx
}
function renderOffers(){
  if(!offersGrid) return;
  offersGrid.innerHTML=ofertas.map(cardHTML).join('');
  buildDots(offersGrid); // ← también para Ofertas
}
function filtrar(){
  const q=(search && search.value ? search.value : '').toLowerCase().trim();
  const c=catSelect ? catSelect.value : '';
  const list=productos.filter(p=>{
    const okCat=!c||p.categoria===c;
    const okQ=!q||(`${p.nombre} ${p.marca}`).toLowerCase().includes(q);
    return okCat&&okQ;
  });
  render(list);
}
if(search) search.addEventListener('input',filtrar);
if(catSelect) catSelect.addEventListener('change',filtrar);

// Render inicial (si existen los contenedores)
render(productos);
renderOffers();

// ========================
// Hero ticker (no tocar productos)
// ========================
(function(){
  const el=document.getElementById('heroTicker');
  if(!el) return;
  const frases=['Desde <b>1989</b>','Llaves al instante','Asesoría experta','Servicio con cariño boricua'];
  let i=0; setInterval(()=>{ i=(i+1)%frases.length; el.innerHTML=frases[i]; }, 2500);
})();

// ========================
// Paginador de “puntitos” (máx 5)
// ========================

/*
  ¿Cómo funciona?
  - Se crea un contenedor .dots justo después de cada carrusel (.products).
  - En móviles (layout horizontal con scroll), muestra hasta 5 puntos.
    Si hay más ítems, la “ventana” de 5 se mueve alrededor del activo.
  - En desktop (>=900px, grilla sin scroll), se ocultan los puntos.
  - Al hacer click en un punto -> scroll al card correspondiente.
  - Se actualiza al hacer scroll, al renderizar y al cambiar tamaño.
*/

function buildDots(track){
  if(!track) return;
  // Asegurar un wrapper de dots único por carrusel
  let dotsWrap = track.nextElementSibling && track.nextElementSibling.classList && track.nextElementSibling.classList.contains('dots')
    ? track.nextElementSibling
    : null;
  if(!dotsWrap){
    dotsWrap = document.createElement('div');
    dotsWrap.className = 'dots';
    dotsWrap.setAttribute('aria-label','Indicadores del carrusel');
    dotsWrap.setAttribute('role','tablist');
    track.after(dotsWrap);
  }

  const isDesktop = window.matchMedia('(min-width: 900px)').matches;
  const items = Array.from(track.children);
  const total = items.length;

  // En desktop (grilla), ocultamos
  if(isDesktop || total <= 1){
    dotsWrap.style.display = 'none';
    // Quitar listeners previos si existen
    detachScrollHandler(track);
    return;
  } else {
    dotsWrap.style.display = 'flex';
  }

  // Estado por carrusel
  ensureCarouselState(track);

  // Inicializar/actualizar estructura
  updateDots(track, dotsWrap);

  // Listeners de scroll/resize
  attachScrollHandler(track, () => updateDots(track, dotsWrap));
}

// Estado por carrusel en un WeakMap
const carouselState = new WeakMap();
function ensureCarouselState(track){
  if(!carouselState.has(track)){
    carouselState.set(track, { activeIndex: 0, rafId: null, onScroll: null });
  }
  return carouselState.get(track);
}

// Calcular índice activo según scrollLeft
function getActiveIndex(track){
  const items = Array.from(track.children);
  const sl = track.scrollLeft;
  let best = 0;
  let bestDist = Infinity;
  for(let i=0;i<items.length;i++){
    const card = items[i];
    const dist = Math.abs(card.offsetLeft - sl);
    if(dist < bestDist){
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

function updateDots(track, dotsWrap){
  const state = ensureCarouselState(track);
  const items = Array.from(track.children);
  const total = items.length;
  if(total === 0){
    dotsWrap.innerHTML = '';
    return;
  }

  // Índice activo actual
  const active = getActiveIndex(track);
  state.activeIndex = active;

  // Ventana de hasta 5
  const MAX = 5;
  let start = Math.max(0, Math.min(active - 2, total - MAX));
  if(total <= MAX) start = 0;
  const end = Math.min(total - 1, start + MAX - 1);

  // Construir puntos visibles
  const fr = document.createDocumentFragment();
  for(let realIdx = start; realIdx <= end; realIdx++){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dot' + (realIdx === active ? ' active' : '');
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-selected', realIdx === active ? 'true' : 'false');
    btn.dataset.index = String(realIdx);
    btn.addEventListener('click', ()=>{
      const card = track.children[realIdx];
      if(card){
        card.scrollIntoView({behavior:'smooth', inline:'start', block:'nearest'});
      }
    });
    fr.appendChild(btn);
  }

  // Opcional: indicadores de que hay más (al inicio/fin)
  // Los dejamos simples para no recargar visualmente.

  // Reemplazar contenido sin parpadeo
  dotsWrap.replaceChildren(fr);
}

// Manejo de scroll con rAF (una sola callback por carrusel)
function attachScrollHandler(track, onChange){
  const state = ensureCarouselState(track);
  if(state.onScroll) return; // ya conectado
  state.onScroll = () => {
    if(state.rafId) return;
    state.rafId = requestAnimationFrame(()=>{
      state.rafId = null;
      onChange();
    });
  };
  track.addEventListener('scroll', state.onScroll, { passive: true });
  window.addEventListener('resize', state.onScroll, { passive: true });
  window.addEventListener('orientationchange', state.onScroll, { passive: true });
}

function detachScrollHandler(track){
  const state = carouselState.get(track);
  if(!state || !state.onScroll) return;
  track.removeEventListener('scroll', state.onScroll);
  window.removeEventListener('resize', state.onScroll);
  window.removeEventListener('orientationchange', state.onScroll);
  state.onScroll = null;
  if(state.rafId){ cancelAnimationFrame(state.rafId); state.rafId = null; }
}

// Recalcular dots al cambiar layout (ej. al filtrar)
window.addEventListener('resize', ()=>{
  if(grid) buildDots(grid);
  if(offersGrid) buildDots(offersGrid);
});
window.addEventListener('orientationchange', ()=>{
  if(grid) buildDots(grid);
  if(offersGrid) buildDots(offersGrid);
});



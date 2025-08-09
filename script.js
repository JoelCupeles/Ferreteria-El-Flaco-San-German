// ================================
// script.js — versión estable 2025 (FIX carrusel + ofertas)
// ================================

document.addEventListener('DOMContentLoaded', () => {
  // ===== Header height CSS var =====
  const headerEl = document.getElementById('siteHeader');
  function setHeaderHeight(){
    const h = headerEl ? (headerEl.offsetHeight || 64) : 64;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
  window.addEventListener('orientationchange', setHeaderHeight);

  // ===== Menú móvil =====
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

  // ===== Año en footer =====
  const yEl=document.getElementById('y'); if(yEl) yEl.textContent=new Date().getFullYear();

  // ========================
  // Datos (productos / ofertas)
  // ========================
  const productos=[
    {nombre:'Taladro DeWalt 20V MAX (driver)', precio:null, categoria:'Herramientas', marca:'DeWalt', foto:'assets/Dewalt-driver.webp?v=1'},
    {nombre:'Gardner 100% Silicón – Flat Roof Coat-N-Seal (4.75 gal)', precio:null, categoria:'Construcción', marca:'Gardner', foto:'assets/gardner-100-silicone.jpg'},
    {nombre:'Crossco 5500 – Sellador Acrílico 2 en 1', precio:null, categoria:'Construcción', marca:'Crossco', foto:'assets/crossco-5500.jpg'},
    {nombre:'Lanco Dry-Coat – Penetrating Surface Cleaner (1 gal)', precio:null, categoria:'Limpieza', marca:'LANCO', foto:'assets/lanco-penetrating-surface-cleaner-dry-coat.jpg'},
    {nombre:'Amsoil Saber 2-Stroke Oil (mezcla)', precio:null, categoria:'Lubricantes', marca:'Amsoil', foto:'assets/2-stroke-oil.jpg'},
    {nombre:'Discos de corte StrongJohn (varios)', precio:null, categoria:'Abrasivos', marca:'StrongJohn', foto:'assets/discos-strongjohn.jpg'},
    {nombre:'Fluidmaster Better Than Wax – Toilet Seal', precio:null, categoria:'Plomería', marca:'Fluidmaster', foto:'assets/fluidmaster-better-than-wax.jpg'}
  ];

  const ofertas=[
    {nombre:'WECO W1000 Thin Set – Oferta especial', categoria:'Ofertas', marca:'WECO', foto:'assets/oferta-weco.jpg'}
  ];

  // ========================
  // UI Catálogo / Filtros
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
      <img loading="lazy" src="${p.foto}" alt="${p.nombre}" onerror="this.onerror=null;this.src='assets/placeholder.jpg'">
      <div class="body">
        <div class="tags"><span class="pill">${p.categoria}</span><span class="pill">${p.marca}</span></div>
        <h3>${p.nombre}</h3>
        ${p.precio!=null?('<div class="price">$'+p.precio.toFixed(2)+'</div>'):''}
        <a class="btn btn-primary" href="https://api.whatsapp.com/send?phone=17878923930&text=${encodeURIComponent('Hola, quiero info del producto: '+p.nombre)}" target="_blank" rel="noopener">Pedir cotización</a>
      </div>
    </article>`;

  function render(list){
    if(!grid) return;
    grid.innerHTML=list.map(cardHTML).join('');
    buildDots(grid);
    // Recalcular cuando carguen fotos (fix principal)
    Array.from(grid.querySelectorAll('img')).forEach(img=>{
      img.addEventListener('load', ()=> buildDots(grid), { once:true });
    });
  }
  function renderOffers(){
    if(!offersGrid) return;
    offersGrid.innerHTML=ofertas.map(cardHTML).join('');
    buildDots(offersGrid);
    Array.from(offersGrid.querySelectorAll('img')).forEach(img=>{
      img.addEventListener('load', ()=> buildDots(offersGrid), { once:true });
    });
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

  // Render inicial
  render(productos);
  renderOffers();

  // ===== Hero ticker =====
  (function(){
    const el=document.getElementById('heroTicker');
    if(!el) return;
    const frases=['Desde <b>1989</b>','Llaves al instante','Asesoría experta','Servicio con cariño boricua'];
    let i=0; setInterval(()=>{ i=(i+1)%frases.length; el.innerHTML=frases[i]; }, 2500);
  })();

  // ======================================
  // Paginador de carrusel (máx 5 puntos)
  // ======================================
  const MAX_DOTS = 5;
  const state = new WeakMap(); // { rafId, onScroll }

  function pagesCount(el){
    const w = el.clientWidth || 1;
    return Math.max(1, Math.ceil((el.scrollWidth - w) / w) + 1);
  }
  function activePage(el){
    const w = el.clientWidth || 1;
    const total = pagesCount(el);
    const i = Math.round(el.scrollLeft / w);
    return Math.min(Math.max(0, i), total - 1);
  }
  function scrollToPage(el, i){
    const w = el.clientWidth || 1;
    el.scrollTo({ left: i * w, behavior:'smooth' });
  }
  function windowStart(curr, total, visible){
    let start = curr - Math.floor(visible/2);
    start = Math.max(0, start);
    start = Math.min(start, Math.max(0, total - visible));
    return start;
  }

  function ensureDots(el){
    let dots = el.nextElementSibling && el.nextElementSibling.classList && el.nextElementSibling.classList.contains('dots')
      ? el.nextElementSibling : null;
    if(!dots){
      dots = document.createElement('div');
      dots.className = 'dots';
      el.after(dots);
    }
    return dots;
  }

  function renderDotsFor(el){
    const dots = ensureDots(el);
    const isDesktop = window.matchMedia('(min-width: 900px)').matches;
    const total = pagesCount(el);

    if(isDesktop || total<=1){
      dots.style.display='none';
      detach(el);
      return;
    } else {
      dots.style.display='flex';
    }

    const curr = activePage(el);
    const visible = Math.min(MAX_DOTS, total);
    const start = total>visible ? windowStart(curr, total, visible) : 0;

    const fr = document.createDocumentFragment();
    for(let i=0; i<visible; i++){
      const pageIndex = start + i;
      const b = document.createElement('button');
      b.type='button';
      b.className = 'dot' + (pageIndex===curr ? ' active' : '');
      b.setAttribute('aria-label', `Ir a página ${pageIndex+1} de ${total}`);
      b.addEventListener('click', ()=> scrollToPage(el, pageIndex));
      fr.appendChild(b);
    }
    dots.replaceChildren(fr);
    attach(el);
  }

  function attach(el){
    let s = state.get(el);
    if(s && s.onScroll) return;
    s = s || {};
    s.onScroll = ()=>{
      if(s.rafId) return;
      s.rafId = requestAnimationFrame(()=>{ s.rafId=null; renderDotsFor(el); });
    };
    state.set(el, s);
    el.addEventListener('scroll', s.onScroll, { passive:true });
    window.addEventListener('resize', s.onScroll, { passive:true });
    window.addEventListener('orientationchange', s.onScroll, { passive:true });
  }
  function detach(el){
    const s = state.get(el);
    if(!s || !s.onScroll) return;
    el.removeEventListener('scroll', s.onScroll);
    window.removeEventListener('resize', s.onScroll);
    window.removeEventListener('orientationchange', s.onScroll);
    s.onScroll = null;
    if(s.rafId){ cancelAnimationFrame(s.rafId); s.rafId=null; }
  }
  function buildDots(el){ renderDotsFor(el); }

  // Recalcular dots cuando cambie el layout
  window.addEventListener('resize', ()=>{ if(grid) buildDots(grid); if(offersGrid) buildDots(offersGrid); });
  window.addEventListener('orientationchange', ()=>{ if(grid) buildDots(grid); if(offersGrid) buildDots(offersGrid); });

  // Recalcular dots si cambia el tamaño real de los carruseles
  const ro = new ResizeObserver(()=>{ if(grid) buildDots(grid); if(offersGrid) buildDots(offersGrid); });
  if(grid) ro.observe(grid);
  if(offersGrid) ro.observe(offersGrid);
});





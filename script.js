// Aseguramos que todo corre tras construir el DOM
document.addEventListener('DOMContentLoaded', () => {
  // ===== Util: altura del header =====
  const headerEl = document.getElementById('siteHeader');
  function setHeaderHeight(){
    const h = headerEl ? (headerEl.offsetHeight || 64) : 64;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
  window.addEventListener('orientationchange', setHeaderHeight);

  // ===== Menú móvil simple =====
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

  function render(list){
    if(!grid) return;
    grid.innerHTML=list.map(cardHTML).join('');
    buildDots(grid); // crea/actualiza los puntitos (máx 5)
  }
  function renderOffers(){
    if(!offersGrid) return;
    offersGrid.innerHTML=ofertas.map(cardHTML).join('');
    buildDots(offersGrid);
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

  // ========================
  // Paginador “máx 5 puntos”
  // ========================
  const carouselState = new WeakMap();

  function ensureState(track){
    if(!carouselState.has(track)){
      carouselState.set(track, { rafId:null, onScroll:null, lastActive:0 });
    }
    return carouselState.get(track);
  }

  function getActiveIndex(track){
    const items = Array.from(track.children);
    if(items.length===0) return 0;
    const sl = track.scrollLeft;
    let best = 0, bestDist = Infinity;
    for(let i=0;i<items.length;i++){
      const card = items[i];
      const dist = Math.abs(card.offsetLeft - sl);
      if(dist < bestDist){ bestDist = dist; best = i; }
    }
    return best;
  }

  function updateDots(track, dotsWrap){
    const items = Array.from(track.children);
    const total = items.length;
    if(total<=1){
      dotsWrap.style.display='none';
      return;
    }

    const isDesktop = window.matchMedia('(min-width: 900px)').matches;
    if(isDesktop){
      dotsWrap.style.display='none';
      return;
    } else {
      dotsWrap.style.display='flex';
    }

    const active = getActiveIndex(track);
    const MAX = 5;
    let start = Math.max(0, Math.min(active - 2, total - MAX));
    if(total <= MAX) start = 0;
    const end = Math.min(total - 1, start + MAX - 1);

    const fr = document.createDocumentFragment();
    for(let realIdx = start; realIdx <= end; realIdx++){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dot' + (realIdx === active ? ' active' : '');
      btn.setAttribute('aria-label', `Ir a elemento ${realIdx+1} de ${total}`);
      btn.dataset.index = String(realIdx);
      btn.addEventListener('click', ()=>{
        const card = track.children[realIdx];
        if(card) card.scrollIntoView({behavior:'smooth', inline:'start', block:'nearest'});
      });
      fr.appendChild(btn);
    }
    dotsWrap.replaceChildren(fr);
  }

  function attachScrollHandler(track, dotsWrap){
    const state = ensureState(track);
    if(state.onScroll) return; // ya conectado
    state.onScroll = ()=>{
      if(state.rafId) return;
      state.rafId = requestAnimationFrame(()=>{
        state.rafId = null;
        updateDots(track, dotsWrap);
      });
    };
    track.addEventListener('scroll', state.onScroll, { passive:true });
    window.addEventListener('resize', state.onScroll, { passive:true });
    window.addEventListener('orientationchange', state.onScroll, { passive:true });
  }

  function buildDots(track){
    if(!track) return;
    // crear/obtener el contenedor de dots adyacente
    let dotsWrap = track.nextElementSibling && track.nextElementSibling.classList && track.nextElementSibling.classList.contains('dots')
      ? track.nextElementSibling
      : null;
    if(!dotsWrap){
      dotsWrap = document.createElement('div');
      dotsWrap.className = 'dots';
      track.after(dotsWrap);
    }
    updateDots(track, dotsWrap);
    attachScrollHandler(track, dotsWrap);
  }

  // Recalcular cuando cambia layout
  window.addEventListener('resize', ()=>{ if(grid) buildDots(grid); if(offersGrid) buildDots(offersGrid); });
  window.addEventListener('orientationchange', ()=>{ if(grid) buildDots(grid); if(offersGrid) buildDots(offersGrid); });
});




// ===== Helpers =====
const $ = (id) => document.getElementById(id);

// ===== Altura real del header =====
(function(){
  const headerEl = $('siteHeader');
  function setHeaderHeight(){
    const h = headerEl ? (headerEl.offsetHeight || 64) : 64;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
  window.addEventListener('orientationchange', setHeaderHeight);
})();

// ===== Menú móvil simple =====
(function(){
  const menuBtn = $('menuBtn');
  const menuList = $('menuList');
  if(!menuBtn || !menuList) return;

  function toggleMenu(force){
    const willOpen = typeof force==='boolean' ? force : !menuList.classList.contains('open');
    menuList.classList.toggle('open', willOpen);
    menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  }
  menuBtn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); toggleMenu(); });
  Array.from(document.querySelectorAll('nav a')).forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
})();

// ===== Año en footer =====
(function(){
  const yEl=$('y'); if(yEl) yEl.textContent=new Date().getFullYear();
})();

// ===== DATA =====
// Catálogo (incluye nuevo: Abanicos con panel solar)
const productos=[
  {nombre:'Taladro DeWalt 20V MAX (driver)', precio:null, categoria:'Herramientas', marca:'DeWalt', foto:'assets/Dewalt-driver.webp?v=1'},
  {nombre:'Gardner 100% Silicón – Flat Roof Coat-N-Seal (4.75 gal)', precio:null, categoria:'Construcción', marca:'Gardner', foto:'assets/gardner-100-silicone.jpg'},
  {nombre:'Crossco 5500 – Sellador Acrílico 2 en 1', precio:null, categoria:'Construcción', marca:'Crossco', foto:'assets/crossco-5500.jpg'},
  {nombre:'Lanco Dry-Coat – Penetrating Surface Cleaner (1 gal)', precio:null, categoria:'Limpieza', marca:'LANCO', foto:'assets/lanco-penetrating-surface-cleaner-dry-coat.jpg'},
  {nombre:'Amsoil Saber 2-Stroke Oil (mezcla)', precio:null, categoria:'Lubricantes', marca:'Amsoil', foto:'assets/2-stroke-oil.jpg'},
  {nombre:'Discos de corte StrongJohn (varios)', precio:null, categoria:'Abrasivos', marca:'StrongJohn', foto:'assets/discos-strongjohn.jpg'},
  {nombre:'Fluidmaster Better Than Wax – Sello Universal para Inodoros', precio:null, categoria:'Plomería', marca:'Fluidmaster', foto:'assets/fluidmaster-better-than-wax.jpg'},
  {nombre:'Abanicos con panel solar', precio:null, categoria:'Energía', marca:'AM-2501', foto:'assets/abanicos-con-panel-solar.jpg'}
];

// Ofertas (ADICIONALES: WECO + Fortlev)
const ofertas=[
  {nombre:'WECO W1000 Thin Set – Oferta especial', precio:null, categoria:'Ofertas', marca:'WECO', foto:'assets/oferta-weco.jpg'},
  {nombre:'Cisterna Fortlev – 5 años de garantía', precio:159.00, categoria:'Ofertas', marca:'FORTLEV', foto:'assets/fortlev-5anos-de-garantia.jpg'}
];

// ===== UI: filtros y grids =====
(function(){
  const catSelect = $('categoria');
  const grid = $('productGrid');
  const offersGrid = $('offersGrid');
  const search = $('search');

  // Cargar categorías
  if (catSelect) {
    const categorias=[...new Set(productos.map(p=>p.categoria))].sort();
    categorias.forEach(c=>{
      const o=document.createElement('option'); o.value=c; o.textContent=c; catSelect.appendChild(o);
    });
  }

  const waIcon = `<svg class="wa" viewBox="0 0 32 32" aria-hidden="true"><path d="M19.3 17.3c-.3-.2-1.6-.8-1.8-.9s-.4-.2-.6.1-.7.9-.9 1.1-.3.2-.6.1c-.3-.2-1.1-.4-2.1-1.3-1-.9-1.3-1.8-1.4-2.1 0-.2 0-.3.1-.4.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2.1-.2-.6-.4-.5-.6-.5h-.5c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.3 3.1 1.4 3.3c.2.2 2.6 4 6.4 5.4.9.4 1.7.6 2.3.8 1 .3 2 .2 2.7.1.8-.1 1.6-.7 1.8-1.3.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z" fill="currentColor"/></svg>`;

  const productCardHTML=p=>`
    <article class="card">
      <img loading="lazy" src="${p.foto}" alt="${p.nombre}">
      <div class="body">
        <div class="tags"><span class="pill">${p.categoria}</span><span class="pill">${p.marca}</span></div>
        <h3>${p.nombre}</h3>
        ${p.precio!=null?('<div class="price">$'+p.precio.toFixed(2)+'</div>'):''}
        <a class="btn btn-wa-red btn-full" aria-label="Pedir cotización por WhatsApp para ${p.nombre}"
           href="https://api.whatsapp.com/send?phone=17878923930&text=${encodeURIComponent('Hola, quiero info del producto: '+p.nombre)}"
           target="_blank" rel="noopener">${waIcon}Pedir cotización</a>
      </div>
    </article>`;

  const offerCardHTML=o=>`
    <article class="card">
      <img loading="lazy" src="${o.foto}" alt="${o.nombre}">
      <div class="body">
        <div class="tags"><span class="pill">${o.categoria}</span><span class="pill">${o.marca}</span></div>
        <h3>${o.nombre}</h3>
        ${o.precio!=null?('<div class="price">$'+o.precio.toFixed(2)+'</div>'):''}
        <a class="btn btn-wa-red btn-full" aria-label="Pedir por WhatsApp ${o.nombre}"
           href="https://api.whatsapp.com/send?phone=17878923930&text=${encodeURIComponent('Hola, quiero pedir: '+o.nombre)}"
           target="_blank" rel="noopener">${waIcon}Pedir</a>
      </div>
    </article>`;

  function render(list){
    if (!grid) return;
    grid.innerHTML=list.map(productCardHTML).join('');
  }

  function filtrar(){
    if (!grid) return;
    const q=(search && search.value ? search.value : '').toLowerCase().trim();
    const c=catSelect ? catSelect.value : '';
    const list=productos.filter(p=>{
      const okCat=!c||p.categoria===c;
      const okQ=!q||(`${p.nombre} ${p.marca}`).toLowerCase().includes(q);
      return okCat&&okQ;
    });
    render(list);
  }

  if (search) search.addEventListener('input',filtrar);
  if (catSelect) catSelect.addEventListener('change',filtrar);

  render(productos); // catálogo
  if (offersGrid) offersGrid.innerHTML = ofertas.map(offerCardHTML).join(''); // ofertas (2)
})();

// ===== Hero ticker =====
(function(){
  const el=$('heroTicker'); if(!el) return;
  const frases=['Servicio con cariño boricua','Desde <b>1989</b>','Asesoría experta','Llaves al instante'];
  let i=0; setInterval(()=>{ i=(i+1)%frases.length; el.innerHTML=frases[i]; }, 2500);
})();

// ===== Carrusel: puntos con ventana deslizante (máximo N) =====
(function(){
  const MAX_DOTS = 5;

  function pagesCount(scrollEl){
    const pageW = scrollEl.clientWidth || 1;
    if (scrollEl.scrollWidth <= pageW + 2) return 1;
    return Math.max(1, Math.round(scrollEl.scrollWidth / pageW));
  }

  function currentPageIndex(scrollEl){
    const pageW = scrollEl.clientWidth || 1;
    return Math.round(scrollEl.scrollLeft / pageW);
  }

  function scrollToPage(scrollEl, i){
    const pageW = scrollEl.clientWidth || 1;
    scrollEl.scrollTo({ left: i * pageW, behavior:'smooth' });
  }

  function calcWindowStart(curr, total, maxDots){
    const half = Math.floor(maxDots/2);
    let start = curr - half;
    start = Math.max(0, start);
    start = Math.min(start, Math.max(0, total - maxDots));
    return start;
  }

  function setupDots(scrollEl, dotsEl){
    if(!scrollEl || !dotsEl) return;

    let total = pagesCount(scrollEl);

    function renderDots(){
      total = pagesCount(scrollEl);
      dotsEl.innerHTML = '';

      const visible = Math.min(MAX_DOTS, total);
      for(let i=0;i<visible;i++){
        const b=document.createElement('button');
        b.type='button';
        b.addEventListener('click', ()=>{
          const target = Number(b.dataset.pageIndex || 0);
          scrollToPage(scrollEl, target);
        });
        dotsEl.appendChild(b);
      }
      sync();
    }

    function sync(){
      const curr = currentPageIndex(scrollEl);
      const visible = Math.min(MAX_DOTS, total);
      const start = total > visible ? calcWindowStart(curr, total, visible) : 0;

      const btns = dotsEl.querySelectorAll('button');
      btns.forEach((b, i)=>{
        const pageIndex = start + i;
        b.dataset.pageIndex = String(pageIndex);
        b.setAttribute('aria-current', pageIndex===curr ? 'true' : 'false');
        b.setAttribute('aria-label', `Ir a página ${pageIndex+1} de ${total}`);
      });
    }

    let raf;
    function onScroll(){ cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }

    const RO = window.ResizeObserver || class{ constructor(cb){ this.cb=cb; window.addEventListener('resize', ()=>cb()); } observe(){} };
    const ro = new RO(renderDots);
    ro.observe(scrollEl);

    scrollEl.addEventListener('scroll', onScroll, { passive:true });
    renderDots();
  }

  document.querySelectorAll('.carousel-dots').forEach(dots=>{
    const id = dots.getAttribute('data-for');
    const scroller = document.getElementById(id);
    setupDots(scroller, dots);
  });
})();

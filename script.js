// Altura real del header
const headerEl = document.getElementById('siteHeader');
function setHeaderHeight(){
  const h = headerEl.offsetHeight || 64;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}
setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);
window.addEventListener('orientationchange', setHeaderHeight);

// Menú móvil simple
const menuBtn = document.getElementById('menuBtn');
const menuList = document.getElementById('menuList');
function toggleMenu(force){
  const willOpen = typeof force==='boolean' ? force : !menuList.classList.contains('open');
  menuList.classList.toggle('open', willOpen);
  menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}
menuBtn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); toggleMenu(); });
Array.from(document.querySelectorAll('nav a')).forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));

// Año en footer
const yEl=document.getElementById('y'); if(yEl) yEl.textContent=new Date().getFullYear();

// Productos sin precios (demo)
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

// Cargar categorías
const catSelect=document.getElementById('categoria');
const categorias=[...new Set(productos.map(p=>p.categoria))].sort();
categorias.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;catSelect.appendChild(o);});

const grid=document.getElementById('productGrid');
const offersGrid=document.getElementById('offersGrid');
const search=document.getElementById('search');

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

function render(list){ grid.innerHTML=list.map(cardHTML).join(''); }
function filtrar(){
  const q=(search.value||'').toLowerCase().trim();
  const c=catSelect.value;
  const list=productos.filter(p=>{
    const okCat=!c||p.categoria===c;
    const okQ=!q||(`${p.nombre} ${p.marca}`).toLowerCase().includes(q);
    return okCat&&okQ;
  });
  render(list);
}
search.addEventListener('input',filtrar);
catSelect.addEventListener('change',filtrar);
render(productos);

// Ofertas
offersGrid.innerHTML=ofertas.map(cardHTML).join('');

// Hero ticker
(function(){
  const el=document.getElementById('heroTicker');
  if(!el) return;
  const frases=['Desde <b>1989</b>','Llaves al instante','Asesoría experta','Servicio con cariño boricua'];
  let i=0; setInterval(()=>{ i=(i+1)%frases.length; el.innerHTML=frases[i]; }, 2500);
})();

// ===== Carrusel: puntos con ventana deslizante (máximo N) =====
(function(){
  const MAX_DOTS = 5; // <-- ajusta aquí cuántos puntos quieres como máximo

  function pagesCount(scrollEl){
    const pageW = scrollEl.clientWidth || 1;
    // 1 página si no hay overflow horizontal
    if (scrollEl.scrollWidth <= pageW + 2) return 1;
    // redondeo al entero más cercano de "pantallas" completas
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
    // Mantiene la ventana centrada en la medida de lo posible
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
      sync(); // set inicial de aria-current y mapeo de página
    }

    function sync(){
      const curr = currentPageIndex(scrollEl);
      const visible = Math.min(MAX_DOTS, total);
      const start = total > visible ? calcWindowStart(curr, total, visible) : 0;

      const btns = dotsEl.querySelectorAll('button');
      btns.forEach((b, i)=>{
        const pageIndex = start + i; // página real a la que representa este punto
        b.dataset.pageIndex = String(pageIndex);
        b.setAttribute('aria-current', pageIndex===curr ? 'true' : 'false');
        b.setAttribute('aria-label', `Ir a página ${pageIndex+1} de ${total}`);
      });
    }

    // Throttle con rAF
    let raf;
    function onScroll(){
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    }

    // ResizeObserver para recalcular puntos al cambiar el layout
    const RO = window.ResizeObserver || class{ constructor(cb){ this.cb=cb; window.addEventListener('resize', ()=>cb()); } observe(){} };
    const ro = new RO(renderDots);
    ro.observe(scrollEl);

    scrollEl.addEventListener('scroll', onScroll, { passive:true });
    renderDots();
  }

  // Inicializa para cada set de puntos
  document.querySelectorAll('.carousel-dots').forEach(dots=>{
    const id = dots.getAttribute('data-for');
    const scroller = document.getElementById(id);
    setupDots(scroller, dots);
  });
})();

})();


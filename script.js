// ========== Altura real del header ==========
const headerEl = document.getElementById('siteHeader');
function setHeaderHeight(){
  const h = headerEl?.offsetHeight || 64;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}
setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);
window.addEventListener('orientationchange', setHeaderHeight);

// ========== Menú móvil robusto ==========
const menuBtn = document.getElementById('menuBtn');
const menuList = document.getElementById('menuList');
const menuOverlay = document.getElementById('menuOverlay');

function openMenu(){
  if(!menuList) return;
  menuList.classList.add('open');
  menuBtn?.setAttribute('aria-expanded','true');
  document.body.classList.add('menu-open');
  if(menuOverlay){ menuOverlay.hidden = false; }
}
function closeMenu(){
  if(!menuList) return;
  menuList.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded','false');
  document.body.classList.remove('menu-open');
  if(menuOverlay){ menuOverlay.hidden = true; }
}
function toggleMenu(){
  if(menuList?.classList.contains('open')) closeMenu(); else openMenu();
}

menuBtn?.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); toggleMenu(); });
menuOverlay?.addEventListener('click', closeMenu);
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeMenu(); });
// Cerrar tras navegar
Array.from(document.querySelectorAll('nav a')).forEach(a=>a.addEventListener('click',()=>closeMenu()));

// ========== Año en footer ==========
const yEl=document.getElementById('y'); if(yEl) yEl.textContent=new Date().getFullYear();

// ========== Datos de productos ==========
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

// ========== Render de productos ==========
const catSelect=document.getElementById('categoria');
const grid=document.getElementById('productGrid');
const offersGrid=document.getElementById('offersGrid');
const search=document.getElementById('search');

// Cargar categorías
if(catSelect){
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

function render(list, container){
  if(!container) return;
  container.innerHTML=list.map(cardHTML).join('');
  setupScrollerUI(container); // Dots + sombras
}

function filtrar(){
  const q=(search?.value||'').toLowerCase().trim();
  const c=catSelect?.value || '';
  const list=productos.filter(p=>{
    const okCat=!c||p.categoria===c;
    const okQ=!q||(`${p.nombre} ${p.marca}`).toLowerCase().includes(q);
    return okCat&&okQ;
  });
  render(list, grid);
}

search?.addEventListener('input',filtrar);
catSelect?.addEventListener('change',filtrar);
render(productos, grid);

// Ofertas
render(ofertas, offersGrid);

// ========== Ticker del hero ==========
(function(){
  const el=document.getElementById('heroTicker');
  if(!el) return;
  const frases=['Desde <b>1989</b>','Llaves al instante','Asesoría experta','Servicio con cariño boricua'];
  let i=0; setInterval(()=>{ i=(i+1)%frases.length; el.innerHTML=frases[i]; }, 2500);
})();

// ========== Carrusel: Dots + sombras ==========
function setupScrollerUI(scroller){
  // Solo mostrar UI tipo carrusel en móvil (coincide con CSS)
  const isDesktop = window.matchMedia('(min-width: 900px)').matches;
  const dotsSelector = scroller.getAttribute('data-dots');
  const dotsWrap = dotsSelector ? document.querySelector(dotsSelector) : null;

  if(isDesktop){
    if(dotsWrap) dotsWrap.innerHTML='';
    scroller.removeAttribute('data-can-left');
    scroller.removeAttribute('data-can-right');
    return;
  }

  // Calcular slides como cantidad de hijos
  const items = Array.from(scroller.children);
  const slideCount = items.length;
  if(dotsWrap){
    dotsWrap.innerHTML='';
    for(let i=0;i<slideCount;i++){
      const b=document.createElement('button');
      b.type='button';
      b.className='dot';
      b.setAttribute('aria-label', `Ir a tarjeta ${i+1} de ${slideCount}`);
      b.addEventListener('click',()=> scrollToIndex(i, scroller, items));
      dotsWrap.appendChild(b);
    }
  }

  function updateDots(){
    const idx = getActiveIndex(scroller, items);
    if(dotsWrap){
      const kids = Array.from(dotsWrap.children);
      kids.forEach((k,i)=> k.setAttribute('aria-current', i===idx ? 'true' : 'false'));
    }
  }
  function updateShadows(){
    const canLeft = scroller.scrollLeft > 4 ? '1' : '0';
    const canRight = (scroller.scrollLeft + scroller.clientWidth) < (scroller.scrollWidth - 4) ? '1' : '0';
    scroller.setAttribute('data-can-left', canLeft);
    scroller.setAttribute('data-can-right', canRight);
  }

  updateDots(); updateShadows();

  scroller.addEventListener('scroll', ()=>{
    // Throttle ligero
    window.requestAnimationFrame(()=>{ updateDots(); updateShadows(); });
  }, {passive:true});

  window.addEventListener('resize', ()=>{
    // Recalcular cuando cambia layout
    setupScrollerUI(scroller);
  }, {once:true});
}

function getActiveIndex(scroller, items){
  const left = scroller.getBoundingClientRect().left;
  let best = 0, bestDelta = Infinity;
  items.forEach((el, i)=>{
    const r = el.getBoundingClientRect();
    const delta = Math.abs(r.left - left);
    if(delta < bestDelta){ bestDelta = delta; best = i; }
  });
  return best;
}

function scrollToIndex(index, scroller, items){
  const el = items[index];
  if(!el) return;
  scroller.scrollTo({ left: el.offsetLeft - scroller.offsetLeft, behavior:'smooth' });
}

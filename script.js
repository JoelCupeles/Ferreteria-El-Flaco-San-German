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
menuBtn.addEventListener('click',()=>toggleMenu());
menuList.addEventListener('click',(e)=>{
  if(e.target.tagName==='A'){ toggleMenu(false); }
});

// Catálogo — data mínima de ejemplo
const productos = [
  { titulo:'Taladro percutor 1/2” 750W', cat:'Herramientas', img:'assets/products/taladro.jpg', precio:89 },
  { titulo:'Pintura acrílica premium blanca 5 gal', cat:'Pinturas', img:'assets/products/pintura.jpg', precio:129 },
  { titulo:'Cinta teflón pro 1/2” x 260”', cat:'Plomería', img:'assets/products/teflon.jpg', precio:3 },
];

const ofertas = [
  { titulo:'Juego de brocas de titanio 21 piezas', cat:'Herramientas', img:'assets/products/brocas.jpg', precio:19 },
  { titulo:'Guantes de trabajo recubiertos', cat:'Seguridad', img:'assets/products/guantes.jpg', precio:4 },
];

const productsGrid = document.getElementById('productsGrid');
const offersGrid = document.getElementById('offersGrid');
const searchInput = document.getElementById('searchInput');
const catSelect = document.getElementById('catSelect');

function cardHTML(p){
  return `
  <article class="card" data-title="${p.titulo.toLowerCase()}" data-cat="${p.cat}">
    <img src="${p.img}" alt="${p.titulo}" loading="lazy">
    <div class="body">
      <span class="pill">${p.cat}</span>
      <h3>${p.titulo}</h3>
      ${p.precio != null ? `<div class="price">$${p.precio}</div>` : ``}
      <a class="btn btn-primary" href="https://wa.me/1787XXXXXXX" target="_blank" rel="noopener">Consultar por WhatsApp</a>
    </div>
  </article>`;
}

function render(list){
  if(!productsGrid) return;
  productsGrid.innerHTML = list.map(cardHTML).join('');
}

function filtrar(){
  const term = (searchInput?.value || '').toLowerCase();
  const cat = catSelect?.value || '';
  const cards = productsGrid?.querySelectorAll('.card') || [];
  cards.forEach(c=>{
    const title = c.getAttribute('data-title') || '';
    const ccat  = c.getAttribute('data-cat') || '';
    const okTerm = !term || title.includes(term);
    const okCat  = !cat || cat === ccat;
    c.style.display = okTerm && okCat ? '' : 'none';
  });
}
searchInput?.addEventListener('input',filtrar);
catSelect?.addEventListener('change',filtrar);
render(productos);

// Ofertas
if(offersGrid){ offersGrid.innerHTML=ofertas.map(cardHTML).join(''); }

// Hero ticker
(function(){
  const el=document.getElementById('heroTicker');
  if(!el) return;
  const frases=['Desde <b>1989</b>','Llaves al instante','Asesoría experta','Servicio con cariño boricua'];
  let i=0; setInterval(()=>{ i=(i+1)%frases.length; el.innerHTML=frases[i]; }, 2500);
})();

// === UX Minimalista: mejoras adicionales, sin romper nada existente ===
// Cierre con Escape y control de scroll cuando el menú está abierto
(function(){
  const menu = document.getElementById('menuList') || document.getElementById('siteMenu');
  const body = document.body;
  function isOpen(){
    return !!menu && menu.classList.contains('open');
  }
  function lockScroll(on){
    if(on){ body.classList.add('menu-open'); }
    else{ body.classList.remove('menu-open'); }
  }
  // Hook a los toggles existentes
  const origToggle = window.toggleMenu;
  if(typeof origToggle === 'function'){
    window.toggleMenu = function(force){
      const res = origToggle.apply(this, arguments);
      lockScroll(isOpen());
      return res;
    };
  }else{
    // Fallback: observar cambios en la clase open
    const obs = new MutationObserver(()=> lockScroll(isOpen()));
    if(menu) obs.observe(menu, { attributes:true, attributeFilter:['class'] });
  }
  // Escape para cerrar
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape' && isOpen()){
      if(typeof window.toggleMenu === 'function'){ window.toggleMenu(false); }
      menu.classList.remove('open');
      lockScroll(false);
    }
  });
})();

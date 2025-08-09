// Altura real del header
const headerEl = document.getElementById('siteHeader');
function setHeaderHeight(){
  const h = headerEl.offsetHeight || 64;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}
setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);
window.addEventListener('orientationchange', setHeaderHeight);

// Menú móvil con foco y bloqueo de scroll
const menuBtn = document.getElementById('menuBtn');
const menuList = document.getElementById('menuList');
const firstMenuLink = menuList ? menuList.querySelector('a') : null;

function lockScroll(on){
  document.body.classList.toggle('menu-open', !!on);
}

function toggleMenu(force){
  const willOpen = typeof force==='boolean' ? force : !menuList.classList.contains('open');
  menuList.classList.toggle('open', willOpen);
  menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  lockScroll(willOpen);
  if (willOpen && firstMenuLink) {
    // esperar al frame para que el menú sea focusable
    requestAnimationFrame(()=> firstMenuLink.focus());
  } else {
    menuBtn.focus();
  }
}

menuBtn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); toggleMenu(); });
Array.from(document.querySelectorAll('nav a')).forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));

// Cerrar con Escape
window.addEventListener('keydown', (e)=>{
  if(e.key==='Escape' && menuList.classList.contains('open')) toggleMenu(false);
});

// Año en footer
const yEl=document.getElementById('y'); if(yEl) yEl.textContent=new Date().getFullYear();

// Productos sin precios (precio oculto por CSS si viniera nulo)
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

// Hero ticker (se mantiene)
(function(){
  const el=document.getElementById('heroTicker');
  if(!el) return;
  const frases=['Desde <b>1989</b>','Llaves al instante','Asesoría experta','Servicio con cariño boricua'];
  let i=0; setInterval(()=>{ i=(i+1)%frases.length; el.innerHTML=frases[i]; }, 2500);
})();

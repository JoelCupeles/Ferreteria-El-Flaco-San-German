console.log("[El Flaco] main.js cargado ✓", location.pathname);

// Normaliza BASE del <html data-base="...">
const normalizeBase = (v) => {
  if (!v) return "/";
  return v.endsWith("/") ? v : v + "/";
};
const BASE = normalizeBase(document.documentElement?.dataset?.base);

// Helper
const $ = (id) => document.getElementById(id);

// ===== Ajuste altura header =====
(function () {
  const headerEl = $("siteHeader");
  function setHeaderHeight() {
    const h = headerEl ? headerEl.offsetHeight || 64 : 64;
    document.documentElement.style.setProperty("--header-h", h + "px");
  }
  setHeaderHeight();
  addEventListener("resize", setHeaderHeight);
  addEventListener("orientationchange", setHeaderHeight);
})();

// ===== Menú móvil =====
(function () {
  const menuBtn = $("menuBtn");
  const menuList = $("menuList");
  if (!menuBtn || !menuList) return;

  function toggleMenu(force) {
    const willOpen =
      typeof force === "boolean" ? force : !menuList.classList.contains("open");
    menuList.classList.toggle("open", willOpen);
    menuBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
  }
  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });
  Array.from(document.querySelectorAll("nav a")).forEach((a) =>
    a.addEventListener("click", () => toggleMenu(false))
  );
})();

// ===== Año en footer =====
(function () {
  const yEl = $("y");
  if (yEl) yEl.textContent = new Date().getFullYear();
})();

/* ===== Catálogo / Ofertas ===== */
const productos = [
  { nombre:"Taladro DeWalt 20V MAX (driver)", categoria:"Herramientas", marca:"DeWalt", precio:null, foto:"Dewalt-driver.webp" },
  { nombre:"Gardner 100% Silicón – Flat Roof Coat-N-Seal (4.75 gal)", categoria:"Construcción", marca:"Gardner", precio:null, foto:"gardner-100-silicone.jpg" },
  { nombre:"Crossco 5500 – Sellador Acrílico 2 en 1", categoria:"Construcción", marca:"Crossco", precio:null, foto:"crossco-5500.jpg" },
  { nombre:"Lanco Dry-Coat – Penetrating Surface Cleaner (1 gal)", categoria:"Limpieza", marca:"LANCO", precio:null, foto:"lanco-penetrating-surface-cleaner-dry-coat.jpg" },
  { nombre:"Amsoil Saber 2-Stroke Oil (mezcla)", categoria:"Lubricantes", marca:"Amsoil", precio:null, foto:"2-stroke-oil.jpg" },
  { nombre:"Discos de corte StrongJohn (varios)", categoria:"Abrasivos", marca:"StrongJohn", precio:null, foto:"discos-strongjohn.jpg" },
  { nombre:"Fluidmaster Better Than Wax – Sello Universal para Inodoros", categoria:"Plomería", marca:"Fluidmaster", precio:null, foto:"fluidmaster-better-than-wax.jpg" },
  { nombre:"Abanicos con panel solar", categoria:"Energía", marca:"AM-2501", precio:null, foto:"abanicos-con-panel-solar.jpg" }
].map(p => ({ ...p, foto: BASE + "assets/" + p.foto }));

const ofertas = [
  { nombre:"WECO W1000 Thin Set – Oferta especial", categoria:"Ofertas", marca:"WECO", precio:null, foto:"oferta-weco.jpg" },
  { nombre:"Cisterna Fortlev – 5 años de garantía", categoria:"Ofertas", marca:"FORTLEV", precio:159.00, foto:"fortlev-5anos-de-garantia.jpg" }
].map(o => ({ ...o, foto: BASE + "assets/" + o.foto }));

// ===== Render + filtros =====
(function () {
  const catSelect = $("categoria");
  const grid = $("productGrid");
  const offersGrid = $("offersGrid");
  const search = $("search");

  if (catSelect) {
    const categorias = [...new Set(productos.map((p) => p.categoria))].sort();
    categorias.forEach((c) => {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = c;
      catSelect.appendChild(o);
    });
  }

  const waIcon =
    '<svg class="wa" viewBox="0 0 32 32" aria-hidden="true"><path d="M19.3 17.3c-.3-.2-1.6-.8-1.8-.9s-.4-.2-.6.1-.7.9-.9 1.1-.3.2-.6.1c-.3-.2-1.1-.4-2.1-1.3-1-.9-1.3-1.8-1.4-2.1 0-.2 0-.3.1-.4.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2.1-.2-.6-.4-.5-.6-.5h-.5c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.3 3.1 1.4 3.3c.2.2 2.6 4 6.4 5.4.9.4 1.7.6 2.3.8 1 .3 2 .2 2.7.1.8-.1 1.6-.7 1.8-1.3.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3z" fill="currentColor"/></svg>';

  const productCardHTML = (p) => `
    <article class="card">
      <img loading="lazy" src="${p.foto}" alt="${p.nombre}">
      <div class="body">
        <div class="tags"><span class="pill">${p.categoria}</span><span class="pill">${p.marca}</span></div>
        <h3>${p.nombre}</h3>
        ${p.precio != null ? '<div class="price">$' + p.precio.toFixed(2) + '</div>' : ''}
        <a class="btn btn-wa-red btn-full"
           href="https://api.whatsapp.com/send?phone=17878923930&text=${encodeURIComponent('Hola, quiero info del producto: ' + p.nombre)}"
           target="_blank" rel="noopener" aria-label="Pedir cotización por WhatsApp para ${p.nombre}">
           ${waIcon}Pedir cotización
        </a>
      </div>
    </article>`;

  const offerCardHTML = (o) => `
    <article class="card">
      <img loading="lazy" src="${o.foto}" alt="${o.nombre}">
      <div class="body">
        <div class="tags"><span class="pill">${o.categoria}</span><span class="pill">${o.marca}</span></div>
        <h3>${o.nombre}</h3>
        ${o.precio != null ? '<div class="price">$' + o.precio.toFixed(2) + '</div>' : ''}
        <a class="btn btn-wa-red btn-full"
           href="https://api.whatsapp.com/send?phone=17878923930&text=${encodeURIComponent('Hola, quiero pedir: ' + o.nombre)}"
           target="_blank" rel="noopener" aria-label="Pedir por WhatsApp ${o.nombre}">
           ${waIcon}Pedir
        </a>
      </div>
    </article>`;

  function render(list) {
    if (!grid) return;
    grid.innerHTML = list.map(productCardHTML).join("");
  }

  function filtrar() {
    if (!grid) return;
    const q = (search?.value || "").toLowerCase().trim();
    const c = catSelect?.value || "";
    const list = productos.filter((p) => {
      const okCat = !c || p.categoria === c;
      const okQ = !q || (`${p.nombre} ${p.marca}`).toLowerCase().includes(q);
      return okCat && okQ;
    });
    render(list);
  }

  search?.addEventListener("input", filtrar);
  catSelect?.addEventListener("change", filtrar);

  render(productos);
  if (offersGrid) offersGrid.innerHTML = ofertas.map(offerCardHTML).join("");

  // Comprobador de imágenes en consola
  [...new Set([
    `${BASE}assets/Logo-flaco.jpg`,
    `${BASE}assets/colores-en-cintas-de-aislar-tips.jpg`,
    `${BASE}assets/ferreteria-de-noche.jpg`,
    ...productos.map(p => p.foto),
    ...ofertas.map(o => o.foto)
  ])].forEach(url => {
    const img = new Image();
    img.onload = () => console.log("IMG OK:", url);
    img.onerror = () => console.warn("IMG 404:", url);
    img.src = url;
  });
})();

// ===== Dots carrusel (mobile) =====
(function () {
  const MAX_DOTS = 5;
  function pagesCount(el){ const w = el.clientWidth || 1; return (el.scrollWidth <= w + 2) ? 1 : Math.max(1, Math.round(el.scrollWidth / w)); }
  function currentPageIndex(el){ const w = el.clientWidth || 1; return Math.round(el.scrollLeft / w); }
  function scrollToPage(el, i){ const w = el.clientWidth || 1; el.scrollTo({ left: i * w, behavior: "smooth" }); }
  function calcWindowStart(curr, total, maxDots){ const half = Math.floor(maxDots/2); let s = curr - half; s = Math.max(0, s); s = Math.min(s, Math.max(0, total - maxDots)); return s; }
  function setupDots(scrollEl, dotsEl){
    if(!scrollEl || !dotsEl) return;
    let total = pagesCount(scrollEl);
    function renderDots(){
      total = pagesCount(scrollEl);
      dotsEl.innerHTML = "";
      const visible = Math.min(MAX_DOTS, total);
      for(let i=0;i<visible;i++){
        const b=document.createElement("button");
        b.type="button";
        b.addEventListener("click", ()=>{ const target = Number(b.dataset.pageIndex || 0); scrollToPage(scrollEl, target); });
        dotsEl.appendChild(b);
      }
      sync();
    }
    function sync(){
      const curr = currentPageIndex(scrollEl);
      const visible = Math.min(MAX_DOTS, total);
      const start = total > visible ? calcWindowStart(curr, total, visible) : 0;
      const btns = dotsEl.querySelectorAll("button");
      btns.forEach((b, i)=>{
        const pageIndex = start + i;
        b.dataset.pageIndex = String(pageIndex);
        b.setAttribute("aria-current", pageIndex===curr ? "true" : "false");
        b.setAttribute("aria-label", `Ir a página ${pageIndex+1} de ${total}`);
      });
    }
    let raf; function onScroll(){ cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }
    const RO = window.ResizeObserver || class { constructor(cb){ this.cb=cb; addEventListener("resize", ()=>cb()); } observe(){} };
    const ro = new RO(renderDots); ro.observe(scrollEl);
    scrollEl.addEventListener("scroll", onScroll, { passive:true });
    renderDots();
  }
  document.querySelectorAll(".carousel-dots").forEach(dots=>{
    const id = dots.getAttribute("data-for");
    const scroller = document.getElementById(id);
    setupDots(scroller, dots);
  });
})();

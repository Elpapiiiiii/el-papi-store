// ===== Keys =====
const CART_KEY = "carrito_el_papi";
const CATALOG_KEY = "catalogo_el_papi";
const FILTERS_KEY = "filtros_el_papi";

// ===== Base =====
const base = [
  { id: 1,  nombre: "GPU El Papi — RTX 5060 Ti 8GB", precio: 459999, categoria: "hardware", imagen: "https://res.cloudinary.com/dtjy3wi14/image/upload/v1758930630/VCG5060T8DFXPB1-O_800_bhrsir.jpg" },
  { id: 2,  nombre: "Auriculares JBL Tune 720 (Ed. Papi)", precio: 89999, categoria: "hardware", imagen: "https://res.cloudinary.com/dtjy3wi14/image/upload/v1758930631/JBL_Tune_720BT_Lifestyle_Image_Black_904x560_nwxlw8.png" },
  { id: 3,  nombre: "Mate El Papi Inox", precio: 24999, categoria: "merch", imagen: "https://res.cloudinary.com/dtjy3wi14/image/upload/v1758930630/MayoPubli-10-768x1151_si7yxt.jpg" },
  { id: 4,  nombre: "Remera Oficial El Papi", precio: 19999, categoria: "merch", imagen: "https://res.cloudinary.com/dtjy3wi14/image/upload/v1758930631/img_8372-a3f354e6f30b08f23f17515597405730-1024-1024_ip9lrq.jpg" }
];

// ===== Estado =====
const carrito = JSON.parse(localStorage.getItem(CART_KEY)) || [];
let extra   = JSON.parse(localStorage.getItem(CATALOG_KEY)) || []; // agregados por el usuario
let filtros = JSON.parse(localStorage.getItem(FILTERS_KEY)) || { q: "", cat: "" };

let catalogo = [...base, ...extra];

// ===== Helpers =====
const $ = (s) => document.querySelector(s);
const ar$ = (n) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const guardarCarrito = () => localStorage.setItem(CART_KEY, JSON.stringify(carrito));
const guardarExtra = () => localStorage.setItem(CATALOG_KEY, JSON.stringify(extra));
const guardarFiltros = () => localStorage.setItem(FILTERS_KEY, JSON.stringify(filtros));
const nextId = () => (catalogo.reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1;
const normalizar = (x) => (x ?? "").toString().trim();

// ===== Badge =====
function actualizarBadge() {
  const cant = carrito.reduce((a, i) => a + i.cantidad, 0);
  $("#badge").textContent = `🛒 ${cant}`;
}

// ===== Categorías =====
function renderCategorias() {
  const cats = Array.from(new Set(catalogo.map(p => p.categoria))).sort();
  const sel = $("#categoria");
  sel.innerHTML = `<option value="">Todas las categorías</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join("");
  if (filtros.cat) sel.value = filtros.cat;
  if (filtros.q) $("#buscador").value = filtros.q;
}

// ===== Filtros =====
function aplicarFiltros(lista) {
  const q = normalizar(filtros.q).toLowerCase();
  const cat = normalizar(filtros.cat).toLowerCase();
  return lista.filter(p => {
    const okQ = !q || p.nombre.toLowerCase().includes(q);
    const okC = !cat || normalizar(p.categoria).toLowerCase() === cat;
    return okQ && okC;
  });
}

// ===== Render catálogo =====
function renderProductos() {
  const cont = $("#cards-container");
  cont.innerHTML = "";
  for (const p of aplicarFiltros(catalogo)) {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.imagen || "https://picsum.photos/seed/fallback/600/400"}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <div class="cat">${p.categoria}</div>
      <div class="price">${ar$(p.precio)}</div>
      <button data-add="${p.id}">Agregar</button>
    `;
    cont.appendChild(card);
  }
}

// ===== Carrito =====
function renderCarrito() {
  const ul = $("#carrito-lista");
  ul.innerHTML = "";
  for (const it of carrito) {
    const li = document.createElement("li");
    li.className = "carrito-item";
    li.innerHTML = `
      <span>${it.nombre}</span>
      <span>${ar$(it.precio * it.cantidad)}</span>
      <div class="qty">
        <button data-sub="${it.id}">-</button>
        <span>${it.cantidad}</span>
        <button data-addqty="${it.id}">+</button>
      </div>
      <button data-remove="${it.id}">Quitar</button>
    `;
    ul.appendChild(li);
  }
  const total = carrito.reduce((a, i) => a + i.precio * i.cantidad, 0);
  $("#carrito-total").textContent = `Total: ${ar$(total)}`;
  actualizarBadge();
}

function agregarAlCarrito(id) {
  const prod = catalogo.find(p => p.id === id);
  if (!prod) return;
  const item = carrito.find(i => i.id === id);
  item ? item.cantidad++ : carrito.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 });
  guardarCarrito(); renderCarrito();
}
function disminuirCantidad(id) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad--;
  if (item.cantidad <= 0) carrito.splice(carrito.findIndex(i => i.id === id), 1);
  guardarCarrito(); renderCarrito();
}
function aumentarCantidad(id) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad++; guardarCarrito(); renderCarrito();
}
function quitarItem(id) {
  const idx = carrito.findIndex(i => i.id === id);
  if (idx > -1) carrito.splice(idx, 1);
  guardarCarrito(); renderCarrito();
}
function vaciarCarrito() { carrito.length = 0; guardarCarrito(); renderCarrito(); }

// ===== Eventos generales =====
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) agregarAlCarrito(Number(add.dataset.add));

  const sub = e.target.closest("[data-sub]");
  if (sub) disminuirCantidad(Number(sub.dataset.sub));

  const addq = e.target.closest("[data-addqty]");
  if (addq) aumentarCantidad(Number(addq.dataset.addqty));

  const rem = e.target.closest("[data-remove]");
  if (rem) quitarItem(Number(rem.dataset.remove));
});

$("#btnVaciar").addEventListener("click", vaciarCarrito);
$("#btnComprar").addEventListener("click", vaciarCarrito);

// ===== Filtros =====
$("#formFiltros").addEventListener("submit", (ev) => {
  ev.preventDefault();
  filtros.q = $("#buscador").value;
  filtros.cat = $("#categoria").value;
  guardarFiltros();
  renderProductos();
});
$("#btnReset").addEventListener("click", () => {
  filtros = { q: "", cat: "" };
  guardarFiltros();
  $("#buscador").value = "";
  $("#categoria").value = "";
  renderProductos();
});

// ===== Agregar unitario =====
$("#formAgregar").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const nombre = normalizar($("#addNombre").value);
  const precio = Number($("#addPrecio").value);
  const categoria = normalizar($("#addCategoria").value).toLowerCase();
  const imagen = normalizar($("#addImagen").value);

  if (!nombre || !precio || !categoria) return;

  const nuevo = { id: Math.max(nextId(), 1001), nombre, precio, categoria, imagen };
  extra.push(nuevo);
  guardarExtra();

  catalogo = [...base, ...extra];
  renderCategorias();
  renderProductos();
  ev.target.reset();
});

// ===== Restaurar catálogo (elimina agregados) =====
$("#btnRestoreCatalog").addEventListener("click", () => {
  localStorage.removeItem(CATALOG_KEY);
  extra = [];
  catalogo = [...base];
  renderCategorias();
  renderProductos();
});

// ===== Init =====
(function init(){
  catalogo = [...base, ...extra];
  renderCategorias();
  renderProductos();
  renderCarrito();
})();

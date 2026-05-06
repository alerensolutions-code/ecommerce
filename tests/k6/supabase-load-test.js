import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ─── Métricas personalizadas ───────────────────────────────────────────────
const supabaseLatency = new Trend('supabase_latency', true);
const supabaseErrors  = new Rate('supabase_error_rate');
const supabaseReqs    = new Counter('supabase_total_requests');

// ─── Configuración ────────────────────────────────────────────────────────
const SUPABASE_URL     = 'https://glxkuyeobtbfuaptimpe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qils09BmnUAVfg3Ypi5g6w_Qe1WZsFy';

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// ─── Escenarios de carga ───────────────────────────────────────────────────
// El plan free de Supabase tiene ~500 conexiones simultáneas al pool (pgBouncer)
// Empezamos suave y vamos subiendo hasta encontrar el límite.
export const options = {
  ext: { loadimpact: { projectID: 7462573 }, name: "Supabase Free Plan Limit Test" },

  scenarios: {
    // Fase 1: usuarios navegando la tienda (lectura)
    shop_browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m',  target: 20  },  // calentamiento
        { duration: '2m',  target: 50  },  // carga normal
        { duration: '2m',  target: 100 },  // carga alta
        // { duration: '2m',  target: 200 },  // estrés
        { duration: '1m',  target: 0   },  // bajada
      ],
    },
  },

  thresholds: {
    // Si Supabase free plan colapsa, estos fallarán
    'supabase_error_rate':              ['rate<0.05'],       // menos del 5% de errores
    'supabase_latency{type:products}':  ['p(95)<1000'],      // productos < 1s
    'supabase_latency{type:categories}':['p(95)<1000'],      // categorías < 1s
    'supabase_latency{type:product_detail}': ['p(95)<1500'], // detalle < 1.5s
    http_req_failed:                    ['rate<0.05'],
  },
};

// ─── IDs de productos reales (se obtienen del primer request) ─────────────
// Se cargan una sola vez por VU al inicio
let productIds = [];

export function setup() {
  // Obtener algunos IDs de productos reales para usar en los tests de detalle
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/products?select=id&limit=20`,
    { headers: HEADERS }
  );
  if (res.status === 200) {
    const data = JSON.parse(res.body);
    return { productIds: data.map(p => p.id) };
  }
  return { productIds: [] };
}

// ─── Flujo de usuario ─────────────────────────────────────────────────────
export default function (data) {
  const ids = data.productIds;

  // 1. Cargar categorías (como hace el Navbar y CategorySidebar)
  // La app usa: supabase.from('categories').select('*').order('name')
  group('1. Cargar categorías', function () {
    const res = http.get(
      `${SUPABASE_URL}/rest/v1/categories?select=*&order=name.asc`,
      { headers: HEADERS, tags: { type: 'categories' } }
    );

    const ok = check(res, {
      'categorías: status 200': (r) => r.status === 200,
      'categorías: tiene datos': (r) => r.body && r.body.length > 2,
    });

    supabaseLatency.add(res.timings.duration, { type: 'categories' });
    supabaseErrors.add(!ok);
    supabaseReqs.add(1);
  });

  sleep(0.5);

  // 2. Cargar listado de productos (página /shop)
  // La app usa: supabase.from('products').select('*, category:categories(name)')
  group('2. Listar productos en la tienda', function () {
    const res = http.get(
      `${SUPABASE_URL}/rest/v1/products?select=*,category:categories(name)&order=created_at.desc&limit=20`,
      { headers: HEADERS, tags: { type: 'products' } }
    );

    const ok = check(res, {
      'productos: status 200':  (r) => r.status === 200,
      'productos: tiene lista': (r) => {
        try { return JSON.parse(r.body).length >= 0; } catch(e) { return false; }
      },
    });

    supabaseLatency.add(res.timings.duration, { type: 'products' });
    supabaseErrors.add(!ok);
    supabaseReqs.add(1);
  });

  sleep(1);

  // 3. Ver detalle de un producto (página /product/[id])
  if (ids && ids.length > 0) {
    group('3. Ver detalle de producto', function () {
      // Elegir un producto al azar de los que existen
      const randomId = ids[Math.floor(Math.random() * ids.length)];

      const res = http.get(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${randomId}&select=*`,
        { headers: HEADERS, tags: { type: 'product_detail' } }
      );

      const ok = check(res, {
        'detalle: status 200':     (r) => r.status === 200,
        'detalle: tiene producto': (r) => {
          try { return JSON.parse(r.body).length === 1; } catch(e) { return false; }
        },
      });

      supabaseLatency.add(res.timings.duration, { type: 'product_detail' });
      supabaseErrors.add(!ok);
      supabaseReqs.add(1);
    });
  }

  sleep(1);

  // 4. Filtrar por precio ascendente (simula filtro de tienda)
  // La app usa: supabase.from('products').select('*')
  group('4. Filtrar productos por precio', function () {
    const res = http.get(
      `${SUPABASE_URL}/rest/v1/products?select=*&order=price.asc&limit=20`,
      { headers: HEADERS, tags: { type: 'products' } }
    );

    const ok = check(res, {
      'filtro: status 200': (r) => r.status === 200,
    });

    supabaseLatency.add(res.timings.duration, { type: 'products' });
    supabaseErrors.add(!ok);
    supabaseReqs.add(1);
  });

  sleep(2);
}

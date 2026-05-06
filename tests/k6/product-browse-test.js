import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ─── Métricas personalizadas ──────────────────────────────────────────────
const productLatency  = new Trend('product_page_latency', true);
const productErrors   = new Rate('product_error_rate');
const totalProductHits = new Counter('total_product_hits');

// ─── Config ───────────────────────────────────────────────────────────────
const SUPABASE_URL      = 'https://glxkuyeobtbfuaptimpe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qils09BmnUAVfg3Ypi5g6w_Qe1WZsFy';

const HEADERS = {
  'apikey':        SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type':  'application/json',
  'Accept':        'application/json',
};

// ─── Escenario ─────────────────────────────────────────────────────────────
// 100 VUs, cada uno visita TODOS los productos 10 veces.
// ⚠️  Para correr con -o cloud necesitás plan Grafana pro (límite free = 50 VUs).
//     Para correr local sin límite: k6 run tests/k6/product-browse-test.js
export const options = {
  ext: { loadimpact: { projectID: 7462573 }, name: 'Product Browse — All Products x10' },

  scenarios: {
    browse_all_products: {
      executor:     'per-vu-iterations',
      vus:          100,   // usuarios simultáneos
      iterations:   10,    // cada VU recorre todos los productos 10 veces
      maxDuration:  '15m', // buffer generoso: 100 VUs × 10 iter × ~9s c/u ≈ 900s max
      gracefulStop: '3m',  // si el escenario termina, dar 3min para cerrar iteraciones activas
    },
  },

  thresholds: {
    'product_error_rate':                   ['rate<0.05'],   // < 5% errores
    'product_page_latency{type:detail}':    ['p(95)<1500'],  // detalle < 1.5s
    'product_page_latency{type:listing}':   ['p(95)<1000'],  // listado < 1s
    http_req_failed:                        ['rate<0.05'],
  },
};

// ─── Setup: obtener TODOS los productos ───────────────────────────────────
// Se ejecuta UNA SOLA VEZ antes de que arranquen los VUs
export function setup() {
  console.log('📦 Obteniendo lista completa de productos...');

  const res = http.get(
    `${SUPABASE_URL}/rest/v1/products?select=id,name&order=created_at.asc`,
    { headers: HEADERS }
  );

  if (res.status !== 200) {
    console.error(`❌ No se pudo obtener productos: ${res.status} — ${res.body}`);
    return { products: [] };
  }

  const products = JSON.parse(res.body);
  console.log(`✅ ${products.length} productos encontrados. Total requests esperados: ${products.length * 100 * 10}`);
  return { products };
}

// ─── Función principal ────────────────────────────────────────────────────
export default function (data) {
  const { products } = data;

  if (!products || products.length === 0) {
    console.error('No hay productos para testear');
    return;
  }

  // Cada VU recorre todos los productos en orden (o aleatorio, ver abajo)
  for (const product of products) {

    group(`Producto: ${product.name || product.id}`, function () {

      // Llamada al detalle del producto (equivalente a /product/[id])
      const res = http.get(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}&select=*`,
        { headers: HEADERS, tags: { type: 'detail' } }
      );

      const ok = check(res, {
        [`${product.name} — status 200`]:     (r) => r.status === 200,
        [`${product.name} — tiene datos`]:    (r) => {
          try { return JSON.parse(r.body).length === 1; } catch(e) { return false; }
        },
      });

      productLatency.add(res.timings.duration, { type: 'detail' });
      productErrors.add(!ok);
      totalProductHits.add(1);

      // Pausa realista entre productos (simula usuario navegando)
      sleep(0.3);
    });
  }

  // Al terminar de ver todos los productos, pequeña pausa antes de repetir
  sleep(1);
}

// ─── Teardown: resumen final ──────────────────────────────────────────────
export function teardown(data) {
  const { products } = data;
  console.log(`\n📊 Test finalizado.`);
  console.log(`   Productos testeados: ${products.length}`);
  console.log(`   VUs: 100 | Iteraciones por VU: 10`);
  console.log(`   Total hits esperados: ${products.length * 100 * 10}`);
}

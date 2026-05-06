/**
 * full-stack-test.js
 *
 * Simula el flujo REAL de un usuario en la tienda:
 *   1. Carga home y shop en Next.js
 *   2. Fetchea todos los productos desde Supabase REST (como hace el browser)
 *   3. Entra a CADA producto (Next.js /product/[id])
 *   4. Descarga las imágenes de cada producto desde Supabase Storage
 *
 * Mide los 3 gastos reales del plan free: DB API, Storage bandwidth, Next.js.
 */
import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ─── Métricas ─────────────────────────────────────────────────────────────
const nextLatency     = new Trend('nextjs_latency',   true);
const supabaseLatency = new Trend('supabase_latency', true);
const storageLatency  = new Trend('storage_latency',  true);
const errorRate       = new Rate('error_rate');
const imageBytes      = new Counter('image_bytes_received');

// ─── Endpoints ────────────────────────────────────────────────────────────
const NEXT_URL          = 'http://localhost:3000';
const SUPABASE_URL      = 'https://glxkuyeobtbfuaptimpe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qils09BmnUAVfg3Ypi5g6w_Qe1WZsFy';

const SUPABASE_HEADERS = {
  'apikey':        SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Accept':        'application/json',
};

// ─── Escenario ─────────────────────────────────────────────────────────────
export const options = {
  ext: { loadimpact: { projectID: 7462573 }, name: 'Full Stack — Next + Supabase + Storage' },

  scenarios: {
    full_user_journey: {
      executor:     'per-vu-iterations',
      vus:          100,    // usuarios simultáneos (límite Grafana free)
      iterations:   10,    // cada VU hace el recorrido completo 10 veces
      maxDuration:  '30m',
      gracefulStop: '5m',  // tiempo para terminar la vuelta actual
    },
  },

  thresholds: {
    error_rate:                            ['rate<0.05'],
    'nextjs_latency{page:home}':           ['p(95)<3000'],
    'nextjs_latency{page:shop}':           ['p(95)<3000'],
    'nextjs_latency{page:product}':        ['p(95)<3000'],
    'supabase_latency{type:products}':     ['p(95)<1000'],
    'storage_latency{type:image}':         ['p(95)<2000'],
    http_req_failed:                       ['rate<0.05'],
  },
};

// ─── Setup: obtener todos los productos con sus imágenes ──────────────────
export function setup() {
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/products?select=id,name,images&order=created_at.asc`,
    { headers: SUPABASE_HEADERS }
  );

  if (res.status !== 200) {
    console.error(`Setup falló: ${res.status}`);
    return { products: [] };
  }

  const products = JSON.parse(res.body);
  const totalImages = products.reduce((acc, p) => acc + (p.images?.length || 0), 0);
  console.log(`✅ ${products.length} productos | ${totalImages} imágenes en Supabase Storage`);
  console.log(`   Requests por iteración: ~${2 + 1 + products.length + totalImages} (next + supabase + productos + imágenes)`);
  return { products };
}

// ─── Flujo del usuario ────────────────────────────────────────────────────
// Cada VU:
//   1. Carga home y shop (una vez por iteración)
//   2. Fetchea todos los productos via Supabase REST
//   3. Recorre TODOS los productos: Next.js /product/[id] + sus imágenes de Storage
export default function (data) {
  const { products } = data;
  if (!products || products.length === 0) return;

  // ── 1. HOME (Next.js) ────────────────────────────────────────────────────
  group('1. Página Home (Next.js)', function () {
    const res = http.get(`${NEXT_URL}/`, { tags: { page: 'home' } });
    const ok = check(res, {
      'home: status 200': (r) => r.status === 200,
    });
    nextLatency.add(res.timings.duration, { page: 'home' });
    errorRate.add(!ok);
  });

  sleep(1);

  // ── 2. SHOP (Next.js) ───────────────────────────────────────────────────
  group('2. Página Tienda (Next.js)', function () {
    const res = http.get(`${NEXT_URL}/shop`, { tags: { page: 'shop' } });
    const ok = check(res, {
      'shop: status 200': (r) => r.status === 200,
    });
    nextLatency.add(res.timings.duration, { page: 'shop' });
    errorRate.add(!ok);
  });

  sleep(0.5);

  // ── 3. SUPABASE REST ────────────────────────────────────────────────────
  // Lo que hace el browser al cargar /shop (fetcha todos los productos)
  group('3. Fetch productos (Supabase REST)', function () {
    const res = http.get(
      `${SUPABASE_URL}/rest/v1/products?select=*,category:categories(name)&order=created_at.desc`,
      { headers: SUPABASE_HEADERS, tags: { type: 'products' } }
    );
    const ok = check(res, {
      'products API: status 200': (r) => r.status === 200,
    });
    supabaseLatency.add(res.timings.duration, { type: 'products' });
    errorRate.add(!ok);
  });

  sleep(1);

  // ── 4. RECORRER TODOS LOS PRODUCTOS ────────────────────────────────────
  for (const product of products) {

    // 4a. Página de detalle en Next.js (/product/[id])
    group('4. Detalle Producto (Next.js)', function () {
      const res = http.get(
        `${NEXT_URL}/product/${product.id}`,
        { tags: { page: 'product' } }
      );
      const ok = check(res, {
        [`${product.name}: status 200`]: (r) => r.status === 200,
      });
      nextLatency.add(res.timings.duration, { page: 'product' });
      errorRate.add(!ok);
    });

    sleep(0.3);

    // 4b. Imágenes del producto desde Supabase Storage
    const images = product.images || [];
    if (images.length > 0) {
      group('5. Imágenes Storage', function () {
        for (const imageUrl of images) {
          const res = http.get(imageUrl, { tags: { type: 'image' } });
          const ok = check(res, {
            'imagen: status 200 o 304': (r) => r.status === 200 || r.status === 304,
          });
          storageLatency.add(res.timings.duration, { type: 'image' });
          imageBytes.add(res.body ? res.body.length : 0);
          errorRate.add(!ok);
        }
      });
    }

    // Pausa entre productos (simula usuario leyendo la ficha)
    sleep(0.5);
  }

  sleep(1);
}

// ─── Resumen ──────────────────────────────────────────────────────────────
export function teardown(data) {
  const { products } = data;
  const totalImages = products.reduce((acc, p) => acc + (p.images?.length || 0), 0);
  console.log('\n📊 Test finalizado.');
  console.log(`   Productos recorridos por iteración: ${products.length}`);
  console.log(`   Imágenes descargadas por iteración: ${totalImages}`);
  console.log('   Este test midió los 3 gastos reales del plan free:');
  console.log('   → Supabase DB API (queries REST)');
  console.log('   → Supabase Storage (imágenes)');
  console.log('   → Next.js server (páginas HTML)');
}

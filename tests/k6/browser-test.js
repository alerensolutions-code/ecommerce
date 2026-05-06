/**
 * browser-test.js
 *
 * Test de browser real con Chromium (k6 browser module).
 * A diferencia de los tests HTTP, este carga la página IGUAL que un usuario real:
 *   - Ejecuta JavaScript
 *   - Descarga CSS, fuentes, imágenes
 *   - Mide Web Vitals (LCP, FCP, CLS)
 *
 * Esto sí cuenta el egress real de imágenes en Supabase Storage.
 *
 * Cómo correr:
 *   k6 run tests/k6/browser-test.js
 *
 * ⚠️  NO compatible con -o cloud (los browser tests solo corren local).
 * ⚠️  Requiere que `npm start` esté corriendo en otra terminal.
 */
import { browser } from 'k6/browser';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ─── Métricas ─────────────────────────────────────────────────────────────
const pageLoadTime   = new Trend('browser_page_load',   true);
const lcpMetric      = new Trend('browser_lcp',         true);
const errorRate      = new Rate('browser_error_rate');

// ─── Config ───────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000';

export const options = {
  scenarios: {
    browser_shopping: {
      executor:        'per-vu-iterations',
      vus:             3,     // Volvemos a 3 para que la PC no se sature
      iterations:      1,     // 1 vuelta completa es suficiente para medir egress
      maxDuration:     '15m',
      gracefulStop:    '2m',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },

  thresholds: {
    browser_error_rate:              ['rate<0.05'],
    'browser_page_load{page:home}':  ['p(95)<5000'],
    'browser_page_load{page:shop}':  ['p(95)<5000'],
    'browser_page_load{page:product}': ['p(95)<8000'],
    'browser_lcp{page:product}':     ['p(95)<4000'],
  },
};

// ─── Flujo principal ──────────────────────────────────────────────────────
export default async function () {
  const page = await browser.newPage();

  // Interceptar para medir el tamaño de las imágenes descargadas
  let imageBytesSeen = 0;
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('supabase.co/storage') && response.status() === 200) {
      response.body().then(body => {
        imageBytesSeen += body.byteLength;
      }).catch(() => {});
    }
  });

  try {
    // ── 1. HOME ──────────────────────────────────────────────────────────
    console.log('→ Cargando Home...');
    const homeStart = Date.now();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const homeLoad = Date.now() - homeStart;

    pageLoadTime.add(homeLoad, { page: 'home' });

    const homeOk = check(page, {
      'home: cargó correctamente': (p) => p.url().includes('localhost:3000'),
    });
    errorRate.add(!homeOk);

    // Screenshot de la home
    await page.screenshot({ path: 'tests/k6/screenshots/home.png' });

    sleep(1);

    // ── 2. SHOP ──────────────────────────────────────────────────────────
    console.log('→ Navegando a /shop...');
    const shopStart = Date.now();
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle' });
    const shopLoad = Date.now() - shopStart;

    pageLoadTime.add(shopLoad, { page: 'shop' });

    const shopOk = check(page, {
      'shop: cargó correctamente': (p) => p.url().includes('/shop'),
    });
    errorRate.add(!shopOk);

    await page.screenshot({ path: 'tests/k6/screenshots/shop.png' });

    // Scroll hacia abajo para disparar lazy loading de imágenes
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    sleep(1);
    await page.evaluate(() => window.scrollTo(0, 0));
    sleep(0.5);

    // ── 3. CADA PRODUCTO ────────────────────────────────────────────────
    // Esperar a que los productos aparezcan en pantalla
    await page.waitForSelector('a[href*="/product/"]', { timeout: 10000 });

    // Obtener todos los links de producto
    const productLinks = await page.locator('a[href*="/product/"]').all();
    const urls = [];
    for (const link of productLinks) {
        const href = await link.getAttribute('href');
        if (href && !urls.includes(href)) {
            urls.push(href.startsWith('http') ? href : `${BASE_URL}${href}`);
        }
    }

    console.log(`→ Encontrados ${urls.length} productos en /shop`);

    for (let i = 0; i < urls.length; i++) {
      const productUrl = urls[i];
      console.log(`→ Producto ${i + 1}/${productLinks.length}: ${productUrl}`);

      const productStart = Date.now();
      await page.goto(productUrl, { waitUntil: 'networkidle' });
      const productLoad = Date.now() - productStart;

      pageLoadTime.add(productLoad, { page: 'product' });

      // Medir LCP (Largest Contentful Paint) — indica cuándo cargó la imagen principal
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              resolve(entries[entries.length - 1].startTime);
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          // Fallback si no hay LCP
          setTimeout(() => resolve(0), 2000);
        });
      });

      if (lcp > 0) {
        lcpMetric.add(lcp, { page: 'product' });
      }

      const productOk = check(page, {
        [`producto ${i + 1}: status OK`]: (p) => !p.url().includes('404'),
      });
      errorRate.add(!productOk);

      // Screenshot del primer producto para verificar visualmente
      if (i === 0) {
        await page.screenshot({ path: `tests/k6/screenshots/product-${i}.png` });
      }

      // Scroll para ver todas las imágenes del producto
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      sleep(0.5);

      sleep(0.5);
    }

    console.log(`→ Imágenes de Storage descargadas: ${(imageBytesSeen / 1024 / 1024).toFixed(2)} MB`);

  } catch (err) {
    console.error(`Error: ${err.message}`);
    errorRate.add(1);
    await page.screenshot({ path: 'tests/k6/screenshots/error.png' });
  } finally {
    await page.close();
  }
}

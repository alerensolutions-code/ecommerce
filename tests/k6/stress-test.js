import http from 'k6/http';
import { sleep, check } from 'k6';

// Configuración del test de estrés
export const options = {
  ext: { loadimpact: { projectID:7462573 }, name: "Devilgame" },
  stages: [
    { duration: '30s', target: 20 },  // Rampa de subida: 20 usuarios en 30 segundos
    { duration: '1m', target: 20 },   // Mantener 20 usuarios por 1 minuto
    { duration: '30s', target: 50 },  // Estrés: subir a 50 usuarios
    { duration: '1m', target: 50 },   // Mantener estrés
    { duration: '30s', target: 0 },   // Rampa de bajada
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // El 95% de las peticiones deben durar menos de 500ms
    http_req_failed: ['rate<0.01'],   // Menos del 1% de las peticiones deben fallar
  },
};

export default function () {
  // 1. Probar la página principal
  let res = http.get('http://localhost:3000/');
  check(res, {
    'home status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 2. Probar la tienda (si existe la ruta /shop)
  res = http.get('http://localhost:3000/shop');
  check(res, {
    'shop status is 200': (r) => r.status === 200,
  });

  sleep(2);
}

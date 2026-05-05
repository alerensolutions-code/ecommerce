# Tests de Rendimiento — k6

Scripts de prueba de carga y estrés para Devilgame.

## Requisitos

- [k6](https://k6.io/docs/get-started/installation/) instalado
- La app corriendo localmente (`npm start`) o en producción

---

## Scripts disponibles

| Script | Descripción | VUs máx | Duración |
|---|---|---|---|
| `stress-test.js` | Test de estrés gradual en home y shop | 50 | ~3.5 min |

---

## Cómo correr los tests

### ▶ Correr localmente (solo consola)
```bash
k6 run tests/k6/stress-test.js
```

### ☁️ Correr localmente pero ver métricas en Grafana Cloud
```bash
k6 run -o cloud tests/k6/stress-test.js
```
> Requiere haber hecho `k6 login cloud --token <TU_TOKEN>` previamente.

### 🔥 Test rápido (1 sola iteración para verificar que funciona)
```bash
k6 run --iterations 1 tests/k6/stress-test.js
```

---

## Convención de nombres

- `smoke-test.js` → prueba mínima (1-2 VUs) para verificar que la app responde
- `load-test.js` → carga normal esperada
- `stress-test.js` → carga por encima de lo normal para encontrar el límite
- `soak-test.js` → test prolongado para detectar memory leaks

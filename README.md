# EcoLens — prototipo

Web app (mobile-first) que identifica qué residuo es a partir de una foto y dice en qué caneca va (código de colores de Bogotá) y cuál es el punto de reciclaje más cercano.
Proyecto académico — Universidad Libre, Metodología de la Investigación.

> **Estado:** el reconocimiento es real: la foto se envía a un modelo de visión (Claude, vía API) que identifica el residuo y la caneca según el código de Bogotá. **Sin la variable `ANTHROPIC_API_KEY` la app no inventa resultados: muestra un error de "reconocimiento no configurado".**
>
> Limitaciones: la "confianza" la auto-reporta el modelo (no es una probabilidad calibrada) y todavía no hay medición de *accuracy*. El modelo propio entrenado con TrashNet sigue pendiente.

## Activar el reconocimiento

En Vercel: *Project → Settings → Environment Variables* → agrega `ANTHROPIC_API_KEY` (llave de console.anthropic.com) y haz *Redeploy*.
Opcional: `ANTHROPIC_MODEL` para cambiar de modelo (por defecto `claude-sonnet-5-5`).
Local: crea `.env.local` con `ANTHROPIC_API_KEY=...` (ya está en `.gitignore`).

## Correr local

```bash
npm install
npm run dev      # http://localhost:3000
```

La cámara en vivo solo funciona en `https://` o `localhost` (Vercel ya da https).

## Desplegar en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En [vercel.com/new](https://vercel.com/new) → **Import** el repo → **Deploy** (Vercel detecta Next.js solo, no hay que configurar nada).

O con la CLI: `npx vercel` (te pide login la primera vez) y luego `npx vercel --prod`.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `components/EcoLensApp.tsx` | Las pantallas y el flujo (cámara, galería, resultado) |
| `app/api/classify/route.ts` | Endpoint `POST /api/classify` (recibe campo `image`) |
| `lib/classify.ts` | Llamada al modelo de visión y reglas de clasificación (prompt). **Aquí se cambia por un modelo propio** |
| `lib/waste.ts` | Canecas (blanco/negro/verde/especial) y enlace a Google Maps |
| `lib/image.ts` | Reduce la foto a 1024 px antes de subirla |

## Siguientes pasos

1. **Modelo propio**: entrenar con TrashNet + fotos locales y reemplazar la llamada en `classifyImage()` (mismo tipo de retorno `ClassifyResult`).
2. **Puntos de reciclaje reales**: hoy el botón abre una búsqueda en Google Maps. Cambiar por datos reales (UAESP / Datos Abiertos Bogotá) ordenados por distancia con `navigator.geolocation`.
3. **Medición para la investigación**: guardar (con consentimiento) aciertos/errores para calcular la *accuracy* y aplicar la encuesta Likert.

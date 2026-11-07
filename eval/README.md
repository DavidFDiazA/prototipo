# Evaluación del modelo (TrashNet)

- `evaluate.mjs`: ejecuta el mismo modelo y descripciones de `lib/labels.json` sobre imágenes de TrashNet (`dataset-resized`) y guarda el resultado por imagen. Uso: `node evaluate.mjs ../lib/labels.json <carpeta dataset-resized> 1,2 salida.json` (requiere `npm i @huggingface/transformers@3.7.6`).
- Selección de imágenes: 20 por clase por cada desplazamiento (`i % paso == desplazamiento`). Desplazamiento 0 = muestra de ajuste (120 imágenes); 1 y 2 = muestra de evaluación (240 imágenes).
- `results_heldout.json` / `results_tuning.json`: resultados por imagen.
- `metrics.py`: exactitud, IC 95 % (Wilson), matriz de confusión y cobertura. Uso: `python3 metrics.py <carpeta con res/heldout.json y res/tuning.json>`.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downscale } from "@/lib/image";
import { BIN_HEX, BIN_LABEL, MAPS_SEARCH_URL } from "@/lib/waste";
import { classify, onModelProgress, warmup, type ClassifyResult } from "@/lib/classifier";
import { CameraIcon, CartonIcon, ChevronLeft, ImageIcon, PinIcon, RecycleLogo, TrashIcon } from "./Icons";

type Screen = "inicio" | "captura" | "analizando" | "resultado";

function confidenceLabel(c: number) {
  return c >= 0.6 ? "Seguridad alta" : c >= 0.4 ? "Seguridad media" : "Seguridad baja";
}

export default function EcoLensApp() {
  const [screen, setScreen] = useState<Screen>("inicio");
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [liveCam, setLiveCam] = useState(false);
  const [modelPct, setModelPct] = useState<number | null>(null); // null = no descargando
  const [modelReady, setModelReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLiveCam(false);
  }, []);

  // Cámara en vivo solo en la pantalla de captura; si falla, queda el selector de archivo.
  useEffect(() => {
    if (screen !== "captura") return;
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setLiveCam(true);
      } catch {
        /* sin permiso o sin cámara: se usa el selector de archivo */
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [screen, stopCamera]);

  // Descarga el modelo al abrir la cámara (la primera vez pesa ~150 MB; luego queda en caché).
  useEffect(() => {
    if (screen !== "captura" || modelReady) return;
    const off = onModelProgress((p) => setModelPct(p));
    warmup().then(() => { setModelReady(true); setModelPct(null); }).catch(() => {
      setError("No se pudo cargar el modelo de reconocimiento. Revisa tu conexión e intenta de nuevo.");
      setModelPct(null);
    });
    return () => { off(); };
  }, [screen, modelReady]);

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  async function analyze(blob: Blob) {
    setError("");
    setScreen("analizando");
    let url: string | null = null;
    try {
      const small = await downscale(blob);
      url = URL.createObjectURL(small);
      setPhotoUrl(url);
      const r = await classify(url);
      setResult(r);
      setModelReady(true);
      setScreen("resultado");
    } catch (e) {
      console.error(e);
      setError("No se pudo identificar el residuo. Revisa tu conexión e intenta de nuevo.");
      setScreen("captura");
    }
  }

  function shoot() {
    const v = videoRef.current;
    if (liveCam && v && v.videoWidth) {
      const c = document.createElement("canvas");
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext("2d")!.drawImage(v, 0, 0);
      c.toBlob((b) => b && analyze(b), "image/jpeg", 0.9);
    } else {
      fileRef.current?.click();
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) analyze(f);
  }

  function goHome() {
    setResult(null);
    setPhotoUrl(null);
    setError("");
    setScreen("inicio");
  }

  return (
    <main className="stage">
      <div className="phone">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />

        {screen === "inicio" && (
          <section className="screen home">
            <div className="top">
              <div className="logo"><RecycleLogo /></div>
              <span className="eyebrow">ECOLENS</span>
            </div>
            <h1 className="h1">Identifica papel en segundos</h1>
            <p className="lead">Modo demostración: toma una foto de un papel y te decimos en qué caneca va.</p>
            <div className="drop"><CameraIcon size={72} /></div>
            <div className="actions">
              <button className="btn-primary" onClick={() => setScreen("captura")}>
                <CameraIcon size={22} /> Tomar foto
              </button>
              <p className="footer-note">Proyecto académico — Universidad Libre</p>
            </div>
          </section>
        )}

        {(screen === "captura" || screen === "analizando") && (
          <section className="screen capture">
            <div className="bar">
              <button className="icon-btn" onClick={goHome} aria-label="Volver">
                <ChevronLeft />
              </button>
              <h2>Enfoca el residuo</h2>
            </div>

            {screen === "analizando" ? (
              <div className="loading" role="status" aria-live="polite">
                <div className="spin" />
                <span>{modelPct !== null && !modelReady ? `Descargando el modelo (solo la primera vez)… ${modelPct}%` : "Identificando residuo…"}</span>
              </div>
            ) : (
              <>
                <div className="finder-wrap">
                  <div className="finder">
                    <video ref={videoRef} playsInline muted style={{ display: liveCam ? "block" : "none" }} />
                    {!liveCam && <CartonIcon size={96} />}
                    <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
                  </div>
                  <p className="hint">Mantén el residuo centrado y con buena luz.</p>
                  <p className="hint" role="status">
                    {modelPct !== null && !modelReady ? `Preparando el reconocimiento… ${modelPct}%` : ""}
                  </p>
                  <p className="err" role="alert">{error}</p>
                </div>
                <div className="shutter-row">
                  <span className="spacer64" />
                  <button className="shutter" onClick={shoot} aria-label="Identificar residuo" />
                  <button className="side-btn" onClick={() => fileRef.current?.click()}>
                    <ImageIcon /> Galería
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {screen === "resultado" && result && (
          <section className="screen result">
            <div className="bar">
              <button className="icon-btn" onClick={() => setScreen("captura")} aria-label="Volver a la cámara">
                <ChevronLeft />
              </button>
              <span className="eyebrow">RESULTADO</span>
            </div>
            <div className="body">
              <div className="tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {photoUrl ? <img src={photoUrl} alt="Tu foto del residuo" /> : <CartonIcon size={64} />}
              </div>
              <h1 className="h1">{result.material}</h1>
              <p className="desc">{result.description}</p>
              {result.recognized ? (
                <span className="pill">{confidenceLabel(result.score)}</span>
              ) : (
                <span className="pill warn">No se pudo identificar</span>
              )}

              <div className="info">
                {result.recognized ? (
                  <div className="row">
                    <TrashIcon />
                    <span>
                      <i className="dot" style={{ background: BIN_HEX[result.bin] }} />
                      <strong>{BIN_LABEL[result.bin]}.</strong> {result.tip}
                    </span>
                  </div>
                ) : (
                  <div className="row">
                    <CameraIcon size={22} />
                    <span>{result.tip || "Toma otra foto, más cerca y con buena luz."}</span>
                  </div>
                )}
                {result.recognized && result.alternative && (
                  <div className="row">
                    <ImageIcon />
                    <span>También podría ser: <strong>{result.alternative.material}</strong>. Si no coincide con lo que tienes, toma otra foto.</span>
                  </div>
                )}
                <div className="row">
                  <PinIcon />
                  <span>
                    <a href={MAPS_SEARCH_URL} target="_blank" rel="noopener noreferrer">
                      Buscar un punto de reciclaje cercano
                    </a>
                  </span>
                </div>
              </div>
            </div>
            <div className="actions">
              <button className="btn-primary" onClick={() => { setResult(null); setScreen("captura"); }}>
                <CameraIcon size={22} /> Tomar otra foto
              </button>
              <button className="btn-link" onClick={goHome}>Volver al inicio</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

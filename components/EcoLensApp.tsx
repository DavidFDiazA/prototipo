"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downscale } from "@/lib/image";
import { BIN_HEX, BIN_LABEL, formatDistance } from "@/lib/waste";
import type { ClassifyResult } from "@/lib/classify";
import { CameraIcon, CartonIcon, ChevronLeft, ImageIcon, PinIcon, RecycleLogo, TrashIcon } from "./Icons";

type Screen = "inicio" | "captura" | "analizando" | "resultado";

export default function EcoLensApp() {
  const [screen, setScreen] = useState<Screen>("inicio");
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [liveCam, setLiveCam] = useState(false);

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

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  async function analyze(blob: Blob) {
    setError("");
    setScreen("analizando");
    try {
      const small = await downscale(blob);
      setPhotoUrl(URL.createObjectURL(small));
      const body = new FormData();
      body.append("image", small, "foto.jpg");
      const res = await fetch("/api/classify", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo identificar el residuo.");
      setResult(data as ClassifyResult);
      setScreen("resultado");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo salió mal. Intenta de nuevo.");
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
            <h1 className="h1">Clasifica tus residuos en segundos</h1>
            <p className="lead">Toma una foto y te decimos en qué caneca va, con el punto de reciclaje más cercano.</p>
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
                <span>Identificando residuo…</span>
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
              <span className="pill">{Math.round(result.confidence * 100)}% de confianza</span>

              <div className="info">
                <div className="row">
                  <TrashIcon />
                  <span>
                    <i className="dot" style={{ background: BIN_HEX[result.bin] }} />
                    <strong>{BIN_LABEL[result.bin]}.</strong> {result.tip}
                  </span>
                </div>
                <div className="row">
                  <PinIcon />
                  <span>
                    Punto limpio más cercano: <strong>{result.nearestPoint.name}</strong> · {formatDistance(result.nearestPoint.distanceM)}
                  </span>
                </div>
              </div>
              {result.demo && <p className="demo-tag">Resultado de demostración — modelo de visión aún no conectado.</p>}
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

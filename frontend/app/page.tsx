"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import DetectionOverlay from "@/components/DetectionOverlay";
import ResultsPanel from "@/components/ResultsPanel";
import { predict } from "@/lib/api";
import { PredictResponse } from "@/lib/types";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(file: File) {
    setError(null);
    setResult(null);
    setLoading(true);

    // Browsers can't display HEIC, and the backend may not support it either.
    // Convert HEIC → JPEG client-side for both preview and API call.
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    let fileToSend: File | Blob = file;
    let previewUrl: string;

    if (isHeic) {
      try {
        const heic2any = (await import("heic2any")).default;
        const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 }) as Blob;
        fileToSend = new File([blob], file.name.replace(/\.hei[cf]$/i, ".jpg"), { type: "image/jpeg" });
        previewUrl = URL.createObjectURL(blob);
      } catch {
        previewUrl = URL.createObjectURL(file);
      }
    } else {
      previewUrl = URL.createObjectURL(file);
    }
    setImageUrl(previewUrl);

    try {
      const res = await predict(fileToSend as File);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "64px 24px 96px",
      }}
    >
      <header style={{ marginBottom: 48 }}>
        <div
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--rust-400)",
            marginBottom: 10,
          }}
        >
          Solanum melongena · leaf pathology
        </div>
        <h1
          className="display"
          style={{
            fontSize: 40,
            fontWeight: 500,
            margin: 0,
            lineHeight: 1.15,
            maxWidth: 640,
          }}
        >
          Brinjal leaf disease detector
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 12, maxWidth: 560 }}>
          YOLO12n-LFR, trained on a 7-class brinjal leaf dataset — Cercospora
          leaf spot, Flea-Beetles, Phomopsis Blight, Phytophthora Blight,
          Powdery Mildew, Tobacco Mosaic Virus, and healthy leaf.
        </p>
      </header>

      {!imageUrl && <ImageUpload onSelect={handleSelect} />}

      {imageUrl && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div>
            {result ? (
              <DetectionOverlay
                imageUrl={imageUrl}
                detections={result.detections}
                imageWidth={result.image_width}
                imageHeight={result.image_height}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Uploaded leaf"
                style={{
                  width: "100%",
                  borderRadius: 4,
                  border: "1px solid var(--border)",
                  opacity: loading ? 0.5 : 1,
                  transition: "opacity 200ms",
                }}
              />
            )}

            <button
              onClick={() => {
                setImageUrl(null);
                setResult(null);
                setError(null);
              }}
              className="mono"
              style={{
                marginTop: 12,
                fontSize: 12,
                background: "none",
                border: "1px solid var(--border)",
                color: "var(--cream-300)",
                padding: "8px 14px",
                borderRadius: 3,
              }}
            >
              ↺ scan another leaf
            </button>
          </div>

          <div>
            {loading && (
              <div
                className="mono"
                style={{ fontSize: 13, color: "var(--muted)" }}
              >
                running inference…
              </div>
            )}
            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--rust-400)",
                  border: "1px solid var(--rust-500)",
                  borderRadius: 4,
                  padding: 12,
                }}
              >
                {error}
              </div>
            )}
            {result && (
              <ResultsPanel
                detections={result.detections}
                inferenceMs={result.inference_ms}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}

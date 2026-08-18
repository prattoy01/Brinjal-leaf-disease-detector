"use client";

import { Detection, accentFor } from "@/lib/types";

interface Props {
  detections: Detection[];
  inferenceMs: number;
}

export default function ResultsPanel({ detections, inferenceMs }: Props) {
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const healthy =
    sorted.length === 1 && sorted[0].class_name === "Healthy leaf";

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: 20,
        background: "rgba(37,24,41,0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--leaf-400)",
          }}
        >
          Findings
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
          {inferenceMs.toFixed(0)}ms
        </div>
      </div>

      {sorted.length === 0 && (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          Nothing detected above the confidence threshold. Try a clearer,
          closer shot of a single leaf.
        </p>
      )}

      {healthy && (
        <p style={{ fontSize: 14, color: "var(--leaf-400)" }}>
          No disease symptoms detected — this leaf reads as healthy.
        </p>
      )}

      {sorted.length > 0 && !healthy && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: 3,
                background: "var(--aubergine-800)",
                borderLeft: `3px solid ${accentFor(d.class_name)}`,
              }}
            >
              <span style={{ fontSize: 14 }}>{d.class_name}</span>
              <span
                className="mono"
                style={{ fontSize: 13, color: "var(--cream-300)" }}
              >
                {(d.confidence * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

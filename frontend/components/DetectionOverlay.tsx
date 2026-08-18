"use client";

import { useEffect, useRef, useState } from "react";
import { Detection, accentFor } from "@/lib/types";

interface Props {
  imageUrl: string;
  detections: Detection[];
  imageWidth: number;
  imageHeight: number;
}

const BRACKET = 14; // corner bracket arm length, in display px

export default function DetectionOverlay({
  imageUrl,
  detections,
  imageWidth,
  imageHeight,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = w * (imageHeight / imageWidth);
      setDisplaySize({ w, h });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [imageWidth, imageHeight]);

  const scale = displaySize.w ? displaySize.w / imageWidth : 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: displaySize.h || "auto",
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid var(--border)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Uploaded leaf specimen"
        style={{ width: "100%", display: "block" }}
      />

      {scale > 0 &&
        detections.map((d, i) => {
          const [x1, y1, x2, y2] = d.box;
          const left = x1 * scale;
          const top = y1 * scale;
          const w = (x2 - x1) * scale;
          const h = (y2 - y1) * scale;
          const color = accentFor(d.class_name);

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left,
                top,
                width: w,
                height: h,
                pointerEvents: "none",
              }}
            >
              {/* four corner brackets instead of a plain rectangle */}
              {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                <span
                  key={corner}
                  style={{
                    position: "absolute",
                    width: BRACKET,
                    height: BRACKET,
                    borderColor: color,
                    borderStyle: "solid",
                    borderWidth: 0,
                    ...(corner === "tl" && {
                      top: -1,
                      left: -1,
                      borderTopWidth: 2,
                      borderLeftWidth: 2,
                    }),
                    ...(corner === "tr" && {
                      top: -1,
                      right: -1,
                      borderTopWidth: 2,
                      borderRightWidth: 2,
                    }),
                    ...(corner === "bl" && {
                      bottom: -1,
                      left: -1,
                      borderBottomWidth: 2,
                      borderLeftWidth: 2,
                    }),
                    ...(corner === "br" && {
                      bottom: -1,
                      right: -1,
                      borderBottomWidth: 2,
                      borderRightWidth: 2,
                    }),
                  }}
                />
              ))}

              <div
                className="mono"
                style={{
                  position: "absolute",
                  top: -22,
                  left: -1,
                  fontSize: 10,
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                  background: color,
                  color: "var(--aubergine-950)",
                  padding: "2px 6px",
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                {d.class_name} · {(d.confidence * 100).toFixed(0)}%
              </div>
            </div>
          );
        })}
    </div>
  );
}

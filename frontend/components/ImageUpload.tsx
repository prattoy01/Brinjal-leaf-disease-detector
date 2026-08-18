"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export default function ImageUpload({ onSelect, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file && (file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif"))) {
        onSelect(file);
      }
    },
    [onSelect]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{
        border: `1.5px dashed ${dragging ? "var(--leaf-400)" : "var(--border)"}`,
        borderRadius: 4,
        padding: "56px 24px",
        textAlign: "center",
        cursor: disabled ? "default" : "pointer",
        background: dragging ? "rgba(124,154,94,0.06)" : "transparent",
        transition: "border-color 150ms, background 150ms",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        hidden
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--leaf-400)",
          marginBottom: 12,
        }}
      >
        Specimen intake
      </div>
      <div className="display" style={{ fontSize: 22, marginBottom: 8 }}>
        Drop a leaf photo, or click to browse
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>
        JPG, PNG, or HEIC · one leaf per scan works best
      </div>
    </div>
  );
}

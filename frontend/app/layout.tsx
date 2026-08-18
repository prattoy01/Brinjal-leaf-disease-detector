import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brinjal Leaf Disease Detector",
  description: "YOLO12n-based detection of brinjal (eggplant) leaf diseases",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

export interface Detection {
  class_name: string;
  class_id: number;
  confidence: number;
  box: [number, number, number, number]; // x1, y1, x2, y2 in original image px
}

export interface PredictResponse {
  detections: Detection[];
  image_width: number;
  image_height: number;
  inference_ms: number;
}

// Stable accent per class, keeps the same disease the same color across a session
export const CLASS_ACCENTS: Record<string, string> = {
  "Cercospora leaf spot": "#c96f45",
  "Flea-Beetles": "#d4a24c",
  "Healthy leaf": "#7c9a5e",
  "Phomopsis Blight": "#b5542a",
  "Phytophthora Blight": "#9a5a8f",
  "Powdery Mildew": "#c3b28a",
  "Tobacco Mosaic Virus": "#8f6fae",
};

export function accentFor(className: string): string {
  return CLASS_ACCENTS[className] ?? "#9bb87f";
}

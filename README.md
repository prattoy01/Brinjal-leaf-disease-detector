# Brinjal Leaf Disease Detector

A demo interface for your thesis: upload a leaf photo, get disease
detections drawn on it, powered by your YOLO12n-LFR model.

```
brinjal-detector/
├── backend/     FastAPI + ONNX Runtime, serves best.onnx via /predict
└── frontend/    Next.js 15 app, upload UI + annotated results
```

## Quick start

**1. Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**2. Frontend** (separate terminal)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`, drop in a leaf photo.

## What's already verified

- `best.onnx` was exported from your uploaded `best.pt` (Experiment 3,
  YOLO12n + LFR, 7 classes, NMS baked into the export) and confirmed to run
  a full forward pass.
- The FastAPI backend was started and hit with a real HTTP request — the
  `/predict` endpoint returns correctly shaped JSON.
- The Next.js frontend builds cleanly (`next build`) with no type errors.

## Design notes

The interface leans into a "specimen sheet" feel rather than a generic
dashboard: aubergine/leaf-green palette, monospace data readouts, and
bounding boxes drawn as corner brackets with pinned tag labels (like a
herbarium annotation) instead of plain rectangles. Feel free to swap this
for something plainer if you'd rather the thesis screenshots look more
conventional — it's all in `frontend/app/globals.css` and
`frontend/components/DetectionOverlay.tsx`.

## Before you present this

- Swap in your actual baseline YOLO12n checkpoint if you want the demo to
  reflect the 0.6878 mAP50 number rather than the LFR variant (see
  `backend/README.md`).
- Deploy: frontend to Vercel, backend to Render/Railway (set
  `NEXT_PUBLIC_API_URL` in the frontend to point at the deployed backend URL).
- For the paper itself, screenshot the empty upload state and a couple of
  clean annotated detections — one per disease class if you want a
  qualitative-results figure.
# Brinjal-leaf-disease-detector

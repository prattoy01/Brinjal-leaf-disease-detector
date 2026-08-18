# Backend — Brinjal Leaf Disease Detector API

Serves `best.onnx` (your YOLO12n-LFR checkpoint, NMS baked in) behind a
FastAPI `/predict` endpoint.

## Setup

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

Test it:

```bash
curl -F "file=@/path/to/leaf.jpg" http://localhost:8000/predict
```

Or open `http://localhost:8000/docs` for the interactive Swagger UI.

## Notes

- `best.onnx` was exported from `best.pt` with `nms=True`, so the model
  output is already NMS-filtered — the backend just applies a confidence
  threshold (`CONF_THRES = 0.25` in `main.py`).
- `best.pt` is your **Experiment 3 (YOLO12n + LFR)** checkpoint (val mAP50
  ≈ 0.659), not the plain YOLO12n baseline (mAP50 ≈ 0.6878). If you want the
  interface to demo the baseline instead, export that checkpoint the same
  way: `YOLO("baseline_best.pt").export(format="onnx", imgsz=640, simplify=True, nms=True)`
  and drop the resulting `.onnx` in this folder in place of `best.onnx`.
- `preprocess()` uses a plain resize rather than letterboxing. This is fine
  for a demo but stretches non-square images slightly before inference —
  swap in letterbox padding if you need pixel-exact boxes for the paper's
  figures.
- CORS is wide open (`allow_origins=["*"]`) for local development — restrict
  this to your deployed frontend's URL before sharing the demo publicly.

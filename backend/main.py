"""
Brinjal Leaf Disease Detector — FastAPI backend
Serves the YOLO12n-LFR model (ONNX, NMS baked in) behind a /predict endpoint.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

MODEL_PATH = Path(__file__).parent / "best.onnx"
IMG_SIZE = 640
CONF_THRES = 0.25

CLASS_NAMES = [
    "Cercospora leaf spot",
    "Flea-Beetles",
    "Healthy leaf",
    "Phomopsis Blight",
    "Phytophthora Blight",
    "Powdery Mildew",
    "Tobacco Mosaic Virus",
]

app = FastAPI(title="Brinjal Leaf Disease Detector")

# Lock this down to your actual frontend origin in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_session: ort.InferenceSession | None = None


def get_session() -> ort.InferenceSession:
    global _session
    if _session is None:
        if not MODEL_PATH.exists():
            raise RuntimeError(f"Model not found at {MODEL_PATH}")
        _session = ort.InferenceSession(
            str(MODEL_PATH), providers=["CPUExecutionProvider"]
        )
    return _session


class Detection(BaseModel):
    class_name: str
    class_id: int
    confidence: float
    box: list[float]  # [x1, y1, x2, y2] in original image pixels


class PredictResponse(BaseModel):
    detections: list[Detection]
    image_width: int
    image_height: int
    inference_ms: float


def preprocess(img: Image.Image) -> tuple[np.ndarray, float, float, int, int]:
    """Letterbox-free simple resize (matches Ultralytics export default well enough
    for a demo; swap in proper letterboxing if you need pixel-perfect boxes)."""
    orig_w, orig_h = img.size
    resized = img.resize((IMG_SIZE, IMG_SIZE))
    arr = np.asarray(resized).astype(np.float32) / 255.0
    arr = arr.transpose(2, 0, 1)[None, ...]  # HWC -> NCHW
    scale_x = orig_w / IMG_SIZE
    scale_y = orig_h / IMG_SIZE
    return arr, scale_x, scale_y, orig_w, orig_h


def postprocess(
    raw_output: np.ndarray, scale_x: float, scale_y: float
) -> list[Detection]:
    """Ultralytics ONNX export with nms=True returns shape (1, 300, 6):
    each row = [x1, y1, x2, y2, confidence, class_id] in the 640x640 input space,
    padded with zero-confidence rows. Filter by confidence and rescale to the
    original image size."""
    preds = raw_output[0]  # (300, 6)
    detections: list[Detection] = []

    for row in preds:
        x1, y1, x2, y2, conf, cls_id = row
        if conf < CONF_THRES:
            continue
        cls_id = int(cls_id)
        if cls_id < 0 or cls_id >= len(CLASS_NAMES):
            continue

        detections.append(
            Detection(
                class_name=CLASS_NAMES[cls_id],
                class_id=cls_id,
                confidence=float(conf),
                box=[
                    float(x1 * scale_x),
                    float(y1 * scale_y),
                    float(x2 * scale_x),
                    float(y2 * scale_y),
                ],
            )
        )

    return detections


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": MODEL_PATH.exists()}


@app.post("/predict", response_model=PredictResponse)
async def predict(file: UploadFile = File(...)):
    if file.content_type is None or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    import time

    try:
        img = Image.open(file.file).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read image: {e}")

    tensor, scale_x, scale_y, orig_w, orig_h = preprocess(img)

    session = get_session()
    input_name = session.get_inputs()[0].name

    start = time.perf_counter()
    outputs = session.run(None, {input_name: tensor})
    elapsed_ms = (time.perf_counter() - start) * 1000

    detections = postprocess(outputs[0], scale_x, scale_y)

    return PredictResponse(
        detections=detections,
        image_width=orig_w,
        image_height=orig_h,
        inference_ms=round(elapsed_ms, 2),
    )

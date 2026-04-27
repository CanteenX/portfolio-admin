import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Upload, Crop } from "lucide-react";

const HANDLE_SIZE = 10;
const MIN_CROP_SIZE = 30;

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute an initial centered crop region.
 * @param {number} imgWidth
 * @param {number} imgHeight
 * @param {number} [aspectRatio]
 * @returns {{x: number, y: number, width: number, height: number}}
 */
function computeInitialCrop(imgWidth, imgHeight, aspectRatio) {
  const ratio = aspectRatio ?? imgWidth / imgHeight;
  let cropW = imgWidth * 0.8;
  let cropH = cropW / ratio;

  if (cropH > imgHeight * 0.8) {
    cropH = imgHeight * 0.8;
    cropW = cropH * ratio;
  }

  return {
    x: (imgWidth - cropW) / 2,
    y: (imgHeight - cropH) / 2,
    width: cropW,
    height: cropH,
  };
}

/**
 * @param {{
 *   onSave: (blob: Blob, previewUrl: string) => void,
 *   initialImageUrl?: string,
 *   aspectRatio?: number,
 *   minWidth?: number,
 *   minHeight?: number
 * }} props
 */
export function ImageCropUploader({
  onSave,
  initialImageUrl,
  aspectRatio,
  minWidth = 50,
  minHeight = 50,
}) {
  const [imageSrc, setImageSrc] = useState(initialImageUrl ?? null);
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCropOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const displayW = img.clientWidth;
    const displayH = img.clientHeight;
    setImageSize({ width: displayW, height: displayH });
    setCrop(computeInitialCrop(displayW, displayH, aspectRatio));
  }, [aspectRatio]);

  /**
   * Detects which drag handle (or move) is at a given point.
   * @param {number} px
   * @param {number} py
   * @returns {"move"|"nw"|"ne"|"sw"|"se"|null}
   */
  const getHandleAtPoint = useCallback(
    (px, py) => {
      const { x, y, width, height } = crop;
      const hs = HANDLE_SIZE;

      if (Math.abs(px - x) < hs && Math.abs(py - y) < hs) return "nw";
      if (Math.abs(px - (x + width)) < hs && Math.abs(py - y) < hs) return "ne";
      if (Math.abs(px - x) < hs && Math.abs(py - (y + height)) < hs) return "sw";
      if (Math.abs(px - (x + width)) < hs && Math.abs(py - (y + height)) < hs) return "se";

      if (px >= x && px <= x + width && py >= y && py <= y + height) return "move";
      return null;
    },
    [crop]
  );

  const handleMouseDown = useCallback(
    (e) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const handle = getHandleAtPoint(px, py);

      if (handle) {
        dragRef.current = {
          handle,
          startX: e.clientX,
          startY: e.clientY,
          startCrop: { ...crop },
        };
        e.preventDefault();
      }
    },
    [crop, getHandleAtPoint]
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const sc = drag.startCrop;
      const { width: imgW, height: imgH } = imageSize;

      /** @type {{x: number, y: number, width: number, height: number}} */
      let next;

      if (drag.handle === "move") {
        next = {
          ...sc,
          x: clamp(sc.x + dx, 0, imgW - sc.width),
          y: clamp(sc.y + dy, 0, imgH - sc.height),
        };
      } else {
        let newX = sc.x;
        let newY = sc.y;
        let newW = sc.width;
        let newH = sc.height;

        if (drag.handle === "nw" || drag.handle === "sw") {
          newX = clamp(sc.x + dx, 0, sc.x + sc.width - MIN_CROP_SIZE);
          newW = sc.width - (newX - sc.x);
        }
        if (drag.handle === "ne" || drag.handle === "se") {
          newW = clamp(sc.width + dx, MIN_CROP_SIZE, imgW - sc.x);
        }
        if (drag.handle === "nw" || drag.handle === "ne") {
          newY = clamp(sc.y + dy, 0, sc.y + sc.height - MIN_CROP_SIZE);
          newH = sc.height - (newY - sc.y);
        }
        if (drag.handle === "sw" || drag.handle === "se") {
          newH = clamp(sc.height + dy, MIN_CROP_SIZE, imgH - sc.y);
        }

        if (aspectRatio) {
          newH = newW / aspectRatio;
          if (newH + newY > imgH) {
            newH = imgH - newY;
            newW = newH * aspectRatio;
          }
        }

        next = {
          x: newX,
          y: newY,
          width: Math.max(newW, MIN_CROP_SIZE),
          height: Math.max(newH, MIN_CROP_SIZE),
        };
      }

      setCrop(next);
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [imageSize, aspectRatio]);

  const handleCropConfirm = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;

    const outputW = Math.max(crop.width * scaleX, minWidth);
    const outputH = Math.max(crop.height * scaleY, minHeight);

    canvas.width = outputW;
    canvas.height = outputH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      outputW,
      outputH
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const previewUrl = canvas.toDataURL("image/png");
      onSave(blob, previewUrl);
      setCropOpen(false);
    }, "image/png");
  }, [crop, minWidth, minHeight, onSave]);

  const handleCancel = useCallback(() => {
    setCropOpen(false);
  }, []);

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="image-crop-file-input"
      />

      <label htmlFor="image-crop-file-input">
        <Button variant="outline" asChild>
          <span>
            <Upload className="mr-1.5 h-4 w-4" />
            Choose Image
          </span>
        </Button>
      </label>

      {initialImageUrl && !cropOpen && (
        <img
          src={initialImageUrl}
          alt="Current"
          className="mt-3 max-w-[200px] max-h-[200px] rounded border border-border"
        />
      )}

      <canvas ref={canvasRef} className="hidden" />

      <Dialog open={cropOpen} onOpenChange={(value) => { if (!value) handleCancel(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5">
              <Crop className="h-4 w-4" />
              Crop Image
            </DialogTitle>
          </DialogHeader>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            className="relative inline-block select-none max-w-full mx-auto"
          >
            {imageSrc && (
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop source"
                onLoad={handleImageLoad}
                className="block max-w-full"
                style={{ maxHeight: 450 }}
                draggable={false}
              />
            )}

            {/* Dark overlay outside crop — sides */}
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                background: `
                  linear-gradient(to right,
                    rgba(0,0,0,0.5) ${crop.x}px,
                    transparent ${crop.x}px,
                    transparent ${crop.x + crop.width}px,
                    rgba(0,0,0,0.5) ${crop.x + crop.width}px
                  )
                `,
              }}
            />

            {/* Top overlay */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: 0,
                left: crop.x,
                width: crop.width,
                height: crop.y,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            />

            {/* Bottom overlay */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: crop.y + crop.height,
                left: crop.x,
                width: crop.width,
                height: imageSize.height - crop.y - crop.height,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            />

            {/* Crop border */}
            <div
              className="absolute border-2 border-dashed border-white pointer-events-none box-border"
              style={{
                top: crop.y,
                left: crop.x,
                width: crop.width,
                height: crop.height,
              }}
            />

            {/* Corner handles */}
            {["nw", "ne", "sw", "se"].map((corner) => {
              const isLeft = corner.includes("w");
              const isTop = corner.includes("n");
              return (
                <div
                  key={corner}
                  className="absolute bg-white border border-primary pointer-events-none z-10"
                  style={{
                    width: HANDLE_SIZE,
                    height: HANDLE_SIZE,
                    top: isTop
                      ? crop.y - HANDLE_SIZE / 2
                      : crop.y + crop.height - HANDLE_SIZE / 2,
                    left: isLeft
                      ? crop.x - HANDLE_SIZE / 2
                      : crop.x + crop.width - HANDLE_SIZE / 2,
                    cursor: `${corner}-resize`,
                  }}
                />
              );
            })}

            {/* Dimension label */}
            <span
              className="absolute text-white text-[0.65rem] bg-black/60 px-1 rounded pointer-events-none"
              style={{
                bottom:
                  crop.y + crop.height > imageSize.height - 24
                    ? undefined
                    : undefined,
                top:
                  crop.y + crop.height > imageSize.height - 24
                    ? crop.y + 4
                    : crop.y + crop.height + 4,
                left: crop.x,
              }}
            >
              {Math.round(crop.width)} x {Math.round(crop.height)}
            </span>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm}>Apply Crop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

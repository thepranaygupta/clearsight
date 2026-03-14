"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, ImageOff } from "lucide-react";
import type { Issue, Severity } from "@/lib/types";

const severityColors: Record<Severity, { stroke: string; fill: string; glow: string }> = {
  critical: {
    stroke: "rgba(239, 68, 68, 0.9)",
    fill: "rgba(239, 68, 68, 0.12)",
    glow: "rgba(239, 68, 68, 0.4)",
  },
  serious: {
    stroke: "rgba(249, 115, 22, 0.9)",
    fill: "rgba(249, 115, 22, 0.12)",
    glow: "rgba(249, 115, 22, 0.4)",
  },
  moderate: {
    stroke: "rgba(234, 179, 8, 0.9)",
    fill: "rgba(234, 179, 8, 0.12)",
    glow: "rgba(234, 179, 8, 0.4)",
  },
  minor: {
    stroke: "rgba(96, 165, 250, 0.9)",
    fill: "rgba(96, 165, 250, 0.12)",
    glow: "rgba(96, 165, 250, 0.4)",
  },
};

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

interface ScreenshotViewerProps {
  screenshot: string;
  issue: Issue;
}

export function ScreenshotViewer({ screenshot, issue }: ScreenshotViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoomIndex, setZoomIndex] = useState(3); // default 1x
  const zoom = ZOOM_LEVELS[zoomIndex];

  const box = issue.elementBoundingBox;
  const colors = severityColors[issue.severity] ?? severityColors.minor;

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, []);

  // Auto-scroll to the highlighted element when issue changes
  useEffect(() => {
    if (!box || !containerRef.current || naturalSize.width === 0) return;

    const displayWidth = naturalSize.width * zoom;
    const displayHeight = naturalSize.height * zoom;
    const container = containerRef.current;

    const scale = displayWidth / naturalSize.width;
    const highlightY = box.y * scale;
    const highlightX = box.x * scale;
    const highlightH = box.height * scale;
    const highlightW = box.width * scale;

    // Scroll to center the highlight in the viewport
    const targetScrollTop = highlightY + highlightH / 2 - container.clientHeight / 2;
    const targetScrollLeft = highlightX + highlightW / 2 - container.clientWidth / 2;

    container.scrollTo({
      top: Math.max(0, Math.min(targetScrollTop, displayHeight - container.clientHeight)),
      left: Math.max(0, Math.min(targetScrollLeft, displayWidth - container.clientWidth)),
      behavior: "smooth",
    });
  }, [box, naturalSize, zoom, issue.id]);

  const zoomIn = () => setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  const zoomOut = () => setZoomIndex((i) => Math.max(i - 1, 0));
  const zoomFit = () => setZoomIndex(3);

  const displayWidth = naturalSize.width * zoom;
  const displayHeight = naturalSize.height * zoom;

  return (
    <div className="flex h-full flex-col">
      {/* Zoom controls */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-zinc-900/50 px-3 py-1.5">
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={zoomIndex === 0}
            className="inline-flex size-7 items-center justify-center rounded text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/80 disabled:opacity-30"
          >
            <ZoomOut className="size-3.5" />
          </button>
          <span className="min-w-10 text-center font-mono text-[11px] tabular-nums text-white/50">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            className="inline-flex size-7 items-center justify-center rounded text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/80 disabled:opacity-30"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <div className="mx-1 h-4 w-px bg-white/[0.08]" />
          <button
            onClick={zoomFit}
            className="inline-flex size-7 items-center justify-center rounded text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white/80"
            title="Reset zoom"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>
        {box && (
          <span className="font-mono text-[10px] text-white/30">
            {box.x}, {box.y} &mdash; {box.width}&times;{box.height}px
          </span>
        )}
      </div>

      {/* Screenshot canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        <div
          className="relative"
          style={{ width: displayWidth || "100%", height: displayHeight || "auto" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={`data:image/png;base64,${screenshot}`}
            alt="Page screenshot"
            onLoad={handleImageLoad}
            className="block"
            style={{
              width: displayWidth || "100%",
              height: displayHeight || "auto",
            }}
          />

          {/* SVG highlight overlay */}
          {box && naturalSize.width > 0 && (
            <svg
              className="pointer-events-none absolute left-0 top-0"
              width={displayWidth}
              height={displayHeight}
              viewBox={`0 0 ${naturalSize.width} ${naturalSize.height}`}
            >
              {/* Dimmed overlay with cutout */}
              <defs>
                <mask id={`highlight-mask-${issue.id}`}>
                  <rect
                    x="0"
                    y="0"
                    width={naturalSize.width}
                    height={naturalSize.height}
                    fill="white"
                  />
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    fill="black"
                    rx="2"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width={naturalSize.width}
                height={naturalSize.height}
                fill="rgba(0,0,0,0.35)"
                mask={`url(#highlight-mask-${issue.id})`}
              />

              {/* Highlight rectangle */}
              <rect
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="2"
                rx="2"
                className="animate-inspector-pulse"
              />

              {/* Label above highlight */}
              <g transform={`translate(${box.x}, ${box.y - 22})`}>
                <rect
                  width={Math.max(box.width, 80)}
                  height="18"
                  rx="3"
                  fill={colors.stroke}
                />
                <text
                  x="6"
                  y="13"
                  fill="white"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {issue.severity.toUpperCase()} &middot; {issue.wcagCriterion}
                </text>
              </g>
            </svg>
          )}

          {/* No bounding box fallback */}
          {!box && naturalSize.width > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex flex-col items-center gap-2 rounded-lg bg-zinc-900/90 px-5 py-4 backdrop-blur">
                <ImageOff className="size-5 text-white/40" />
                <p className="text-xs text-white/50">
                  Element position not available
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

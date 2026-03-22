"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

function getScoreColor(score: number): string {
  if (score < 50) return "var(--score-bad)";
  if (score < 80) return "var(--score-okay)";
  return "var(--score-good)";
}

function getScoreLabel(score: number): string {
  if (score < 50) return "Poor";
  if (score < 80) return "Needs work";
  return "Good";
}

export function ScoreGauge({
  score,
  size = 140,
  strokeWidth = 10,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    startTimeRef.current = performance.now();
    const duration = 1400;

    function animate(now: number) {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted/40"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.1s ease-out",
              filter: `drop-shadow(0 0 8px ${color}50)`,
            }}
          />
        </svg>
        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono font-bold tabular-nums tracking-tighter leading-none ${size >= 60 ? "text-3xl" : ""}`}
            style={{
              color,
              ...(size < 60 ? { fontSize: `${size * 0.3}px` } : {}),
            }}
          >
            {animatedScore}
          </span>
          {size >= 60 && (
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {getScoreLabel(score)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

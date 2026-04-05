import { motion } from "motion/react";
import React from "react";

interface ChessClockProps {
  timeMs: number;
  isActive: boolean;
  color: "white" | "black";
  label: string;
}

function formatTime(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatTimeTenths(ms: number): string {
  if (ms <= 0) return "0:00.0";
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((ms % 1000) / 100);
  if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  return `${seconds}.${tenths}`;
}

export function ChessClock({
  timeMs,
  isActive,
  color,
  label,
}: ChessClockProps) {
  const isLow = timeMs < 30000 && timeMs > 0; // under 30 seconds
  const isCritical = timeMs < 10000 && timeMs > 0; // under 10 seconds
  const displayTime = isLow ? formatTimeTenths(timeMs) : formatTime(timeMs);

  return (
    <motion.div
      className={`
        flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
        ${
          isActive
            ? "bg-navy-dark text-white shadow-md"
            : "bg-white border border-border text-foreground"
        }
      `}
      animate={isActive ? { scale: [1, 1.01, 1] } : { scale: 1 }}
      transition={{
        duration: 1.5,
        repeat: isActive ? Number.POSITIVE_INFINITY : 0,
        ease: "easeInOut",
      }}
    >
      <div className="flex items-center gap-2">
        {/* Color indicator dot */}
        <div
          className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
            color === "white"
              ? isActive
                ? "bg-white border-white/50"
                : "bg-white border-border"
              : isActive
                ? "bg-gray-800 border-gray-600"
                : "bg-gray-800 border-gray-600"
          }`}
        />
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isActive ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
      </div>
      <span
        className={`text-3xl font-bold tabular-nums tracking-tight ${
          isCritical
            ? "text-red-400"
            : isLow
              ? "text-amber-400"
              : isActive
                ? "text-white"
                : "text-foreground"
        }`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {displayTime}
      </span>
    </motion.div>
  );
}

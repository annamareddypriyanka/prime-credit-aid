import { motion } from "motion/react";

export function ScoreRing({
  value,
  size = 200,
  label = "AI Risk Score",
  caption,
}: {
  value: number;
  size?: number | undefined;
  label?: string | undefined;
  caption?: string | undefined;
}) {
  const stroke = Math.max(10, size * 0.075);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, value)) / 100;
  const color =
    value < 35 ? "var(--success)" : value < 62 ? "var(--warning)" : "var(--destructive)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct) }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-4xl font-bold tabular-nums" style={{ color }}>
              {value}
            </p>
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">out of 100</p>
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="font-display text-sm font-semibold">{label}</p>
        {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
      </div>
    </div>
  );
}
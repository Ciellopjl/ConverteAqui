'use client';

// Arrays fixos para evitar erro de hydration no Next.js (sem Math.random no render)
const BAR_HEIGHTS = [40, 65, 85, 55, 70, 90, 45, 75, 60, 80, 50, 88, 42, 72, 95, 58, 78, 48, 68, 85, 52, 76, 62, 82, 47];
const BAR_DELAYS  = [0, 0.18, 0.35, 0.12, 0.5, 0.22, 0.4, 0.08, 0.3, 0.15, 0.45, 0.28, 0.6, 0.05, 0.38, 0.2, 0.55, 0.1, 0.42, 0.25, 0.52, 0.16, 0.48, 0.32, 0.62];

export default function AudioWaveform() {
  return (
    <div className="flex items-end justify-center gap-[3px] h-14 mt-6 mb-2 opacity-60" aria-hidden="true">
      {BAR_HEIGHTS.map((height, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            height: `${height}%`,
            background: `linear-gradient(to top, #7c3aed, #facc15)`,
            animation: `waveform-pulse 1.6s ease-in-out infinite alternate`,
            animationDelay: `${BAR_DELAYS[i]}s`,
          }}
        />
      ))}
    </div>
  );
}

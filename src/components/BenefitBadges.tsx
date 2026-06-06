'use client';

import { Zap, Package, Gauge, Sparkles } from 'lucide-react';

const BADGES = [
  { icon: Zap,      label: 'Alta qualidade',    color: 'text-yellow-400', glow: 'rgba(250, 204, 21, 0.15)' },
  { icon: Package,  label: 'Sem instalação',     color: 'text-violet-400', glow: 'rgba(139, 92, 246, 0.15)' },
  { icon: Gauge,    label: 'Rápido e gratuito',  color: 'text-pink-400',   glow: 'rgba(236, 72, 153, 0.15)' },
  { icon: Sparkles, label: 'Interface premium',  color: 'text-yellow-300', glow: 'rgba(250, 204, 21, 0.12)' },
];

export default function BenefitBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
      {BADGES.map(({ icon: Icon, label, color, glow }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-sm font-medium text-zinc-300 transition-all duration-300 hover:border-white/25 hover:text-white"
          style={{
            background: `rgba(255,255,255,0.04)`,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 0 16px ${glow}`,
          }}
        >
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          {label}
        </div>
      ))}
    </div>
  );
}

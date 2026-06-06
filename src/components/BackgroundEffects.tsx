'use client';

import { motion } from 'framer-motion';

export default function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Subtle grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Purple blob — esquerda */}
      <motion.div
        animate={{ x: [-40, 40, -40], y: [-30, 30, -30], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Yellow/gold blob — direita */}
      <motion.div
        animate={{ x: [40, -40, 40], y: [30, -30, 30], scale: [0.9, 1.15, 1, 0.9] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -right-32 w-[700px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px]"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(139, 92, 246, 0.07) 0%, transparent 70%)',
        }}
      />

      {/* Vinheta borda */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(3, 3, 6, 0.75) 100%)',
        }}
      />
    </div>
  );
}

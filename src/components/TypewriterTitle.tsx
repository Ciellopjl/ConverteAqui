'use client';

import Typewriter from 'typewriter-effect';

export default function TypewriterTitle() {
  return (
    <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 drop-shadow-lg" style={{ color: 'var(--color-ciello-yellow)' }}>
      <Typewriter
        options={{
          strings: ['Ciello Uploads', 'MP3 Premium', 'Download Rápido'],
          autoStart: true,
          loop: true,
          delay: 75,
          deleteSpeed: 50,
        }}
      />
    </h1>
  );
}

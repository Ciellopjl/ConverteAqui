'use client';

import { useState, useEffect } from 'react';

const WORDS = ['Converte Aqui', 'MP3 Premium', 'Download Rápido'];

export default function TypewriterTitle() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const targetWord = WORDS[currentWordIndex];

    const tick = () => {
      if (!isDeleting) {
        // Digitando
        setCurrentText(targetWord.substring(0, currentText.length + 1));
        if (currentText === targetWord) {
          // Pausa antes de começar a apagar
          timer = setTimeout(() => setIsDeleting(true), 1500);
          return;
        }
      } else {
        // Apagando
        setCurrentText(targetWord.substring(0, currentText.length - 1));
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % WORDS.length);
          return;
        }
      }

      const speed = isDeleting ? 35 : 80;
      timer = setTimeout(tick, speed);
    };

    timer = setTimeout(tick, 100);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex]);

  return (
    <h1 
      className="text-4xl md:text-6xl font-bold text-center mb-8 drop-shadow-lg min-h-[48px] md:min-h-[72px] bg-clip-text text-transparent bg-gradient-to-r from-brand-yellow via-brand-purple to-indigo-400 select-none"
    >
      <span>{currentText}</span>
      <span className="animate-pulse text-brand-yellow ml-0.5">|</span>
    </h1>
  );
}

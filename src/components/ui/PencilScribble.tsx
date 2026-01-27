'use client';

import React from 'react';

interface PencilScribbleProps {
  className?: string;
  color?: string;
  width?: number;
  height?: number;
  path?: string;
  style?: React.CSSProperties;
}

export function PencilScribble({ 
  className = '', 
  color = '#3b82f6',
  width = 200,
  height = 50,
  path,
  style
}: PencilScribbleProps) {
  // Paths pré-definidos para diferentes tipos de rabiscos
  const defaultPaths = {
    underline: 'M 10 30 Q 30 20, 50 30 T 90 30 T 130 30 T 170 30',
    wavy: 'M 10 25 Q 30 15, 50 25 T 90 25 T 130 25 T 170 25 Q 190 15, 200 25',
    circle: 'M 100 25 A 25 25 0 1 1 100 75 A 25 25 0 1 1 100 25',
    arrow: 'M 10 25 L 150 25 M 130 10 L 150 25 L 130 40',
    zigzag: 'M 10 25 L 50 10 L 90 40 L 130 20 L 170 35',
    scribble: 'M 10 30 Q 20 10, 40 30 T 80 30 T 120 30 Q 140 10, 160 30 T 200 30',
  };

  const scribblePath = path || defaultPaths.scribble;

  // Generate unique ID for each instance to avoid conflicts
  const filterId = `pencil-texture-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        ...style,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <path
        d={scribblePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: `url(#${filterId})`,
        }}
      />
    </svg>
  );
}

// Componente para múltiplos rabiscos sobrepostos (efeito de escrita à mão)
export function HandDrawnText({ 
  children, 
  className = '',
  scribbleColor = '#3b82f6',
  offset = 2
}: { 
  children: React.ReactNode;
  className?: string;
  scribbleColor?: string;
  offset?: number;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent ${offset}px,
            ${scribbleColor} ${offset}px,
            ${scribbleColor} ${offset + 1}px
          )`,
          mixBlendMode: 'multiply',
          opacity: 0.3,
        }}
      />
    </span>
  );
}

"use client";

import { Grid } from 'ldrs/react';
import 'ldrs/react/Grid.css';

interface LoadingGridProps {
  size?: string;
  speed?: string;
  color?: string;
  className?: string;
}

export function LoadingGrid({ 
  size = "60", 
  speed = "1.5", 
  color = "#B3E240",
  className = ""
}: LoadingGridProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Grid
        size={size}
        speed={speed}
        color={color}
      />
    </div>
  );
}

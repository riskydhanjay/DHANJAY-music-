import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  className?: string;
  variant?: 'compact' | 'full';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 28,
  height = 42,
  className = '',
  variant = 'compact',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    // Generate simulated frequency peaks or smooth responsive waves
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const count = barCount;
      const barWidth = Math.max(2, (canvas.width - count * 2) / count);
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#7B2CFF'); // Electric purple
      gradient.addColorStop(0.6, '#FF4FA3'); // Neon pink
      gradient.addColorStop(1, '#FFF'); // Bright peak

      time += isPlaying ? 0.08 : 0.01;

      for (let i = 0; i < count; i++) {
        // Multi-frequency wave formula
        let amplitude = 0.15;
        if (isPlaying) {
          const wave1 = Math.sin(time * 2 + i * 0.45);
          const wave2 = Math.cos(time * 3 - i * 0.25);
          const wave3 = Math.sin(time * 1.5 + i * 0.8);
          amplitude = Math.abs((wave1 * 0.4 + wave2 * 0.35 + wave3 * 0.25));
          amplitude = Math.max(0.12, Math.min(0.98, amplitude));
        }

        const barHeight = amplitude * canvas.height;
        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        ctx.fillStyle = gradient;
        // Rounded top bars
        const radius = Math.min(barWidth / 2, 3);
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Glowing peak dot on full variant
        if (variant === 'full' && isPlaying && amplitude > 0.4) {
          ctx.fillStyle = '#FF4FA3';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, Math.max(2, y - 3), 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, barCount, variant]);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={barCount * 6}
        height={height}
        className="w-full h-full object-contain"
        aria-hidden="true"
      />
    </div>
  );
};

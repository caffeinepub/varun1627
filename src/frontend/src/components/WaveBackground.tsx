import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current = {
        x: e.clientX / width,
        y: e.clientY / height,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseRef.current = {
          x: e.touches[0].clientX / width,
          y: e.touches[0].clientY / height,
        };
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const draw = (timestamp: number) => {
      timeRef.current = timestamp * 0.0005;
      const t = timeRef.current;

      // Smooth mouse follow
      mouseRef.current.x +=
        (targetMouseRef.current.x - mouseRef.current.x) * 0.04;
      mouseRef.current.y +=
        (targetMouseRef.current.y - mouseRef.current.y) * 0.04;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, width, height);

      // Deep background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "oklch(0.08 0.01 240)");
      bgGrad.addColorStop(1, "oklch(0.06 0.008 240)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw gradient wave layers
      const layers = [
        {
          speed: 0.15,
          amplitude: 0.06,
          yOffset: 0.35,
          alpha: 0.12,
          hue: 195,
          chroma: 0.18,
          lightness: 0.45,
        },
        {
          speed: 0.2,
          amplitude: 0.05,
          yOffset: 0.5,
          alpha: 0.08,
          hue: 220,
          chroma: 0.14,
          lightness: 0.35,
        },
        {
          speed: 0.1,
          amplitude: 0.07,
          yOffset: 0.65,
          alpha: 0.1,
          hue: 195,
          chroma: 0.16,
          lightness: 0.4,
        },
        {
          speed: 0.25,
          amplitude: 0.04,
          yOffset: 0.2,
          alpha: 0.06,
          hue: 260,
          chroma: 0.12,
          lightness: 0.3,
        },
      ];

      for (const layer of layers) {
        const points: Point[] = [];
        const segments = 60;

        for (let i = 0; i <= segments; i++) {
          const px = (i / segments) * width;
          const normalizedX = i / segments;

          // Mouse influence
          const distFromMouse = Math.abs(normalizedX - mx) * 2;
          const mouseInfluence =
            Math.max(0, 1 - distFromMouse) * (my - 0.5) * 0.15;

          const wave1 =
            Math.sin(normalizedX * Math.PI * 3 + t * layer.speed * 2) *
            layer.amplitude;
          const wave2 =
            Math.sin(normalizedX * Math.PI * 5 + t * layer.speed * 3.1) *
            (layer.amplitude * 0.5);
          const wave3 =
            Math.cos(normalizedX * Math.PI * 2 + t * layer.speed * 1.7) *
            (layer.amplitude * 0.3);

          const py =
            (layer.yOffset + wave1 + wave2 + wave3 + mouseInfluence) * height;

          points.push({ x: px, y: py, ox: px, oy: py, vx: 0, vy: 0 });
        }

        // Draw wave as filled area
        const grad = ctx.createLinearGradient(
          0,
          points[0].y - 80,
          0,
          points[0].y + 80,
        );
        grad.addColorStop(
          0,
          `oklch(${layer.lightness} ${layer.chroma} ${layer.hue} / ${layer.alpha * 2})`,
        );
        grad.addColorStop(
          0.5,
          `oklch(${layer.lightness} ${layer.chroma} ${layer.hue} / ${layer.alpha})`,
        );
        grad.addColorStop(
          1,
          `oklch(${layer.lightness} ${layer.chroma} ${layer.hue} / 0)`,
        );

        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const cpx = (prev.x + curr.x) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
        }

        const last = points[points.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Subtle vignette
      const vignette = ctx.createRadialGradient(
        width * mx,
        height * my,
        0,
        width / 2,
        height / 2,
        Math.sqrt(width * width + height * height) * 0.7,
      );
      vignette.addColorStop(0, "oklch(0.78 0.18 195 / 0.03)");
      vignette.addColorStop(0.5, "oklch(0.0 0.0 0 / 0)");
      vignette.addColorStop(1, "oklch(0.0 0.0 0 / 0.4)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="wave-canvas"
      style={{ position: "fixed", top: 0, left: 0, zIndex: 0 }}
    />
  );
}

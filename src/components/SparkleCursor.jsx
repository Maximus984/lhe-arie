import React, { useEffect, useRef } from 'react';

export default function SparkleCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let lastMousePos = { x: 0, y: 0 };
    let hasMoved = false;

    // Handle viewport resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star particle blueprint
    class Sparkle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        
        // Random velocity drifting outward slightly
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed + 0.3; // drift slightly downwards

        // Size & rotation characteristics
        this.size = Math.random() * 8 + 4; // outer radius
        this.innerRadius = this.size * 0.25;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.08;

        // Fading behavior
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;

        // Color selection: Gold, Moss Green, Cyber Blue, Electric Purple, Hot Pink
        const colors = [
          '#FBBF24', // Gold
          '#10B981', // Moss Green
          '#00E5FF', // Cyber Blue
          '#A855F7', // Electric Purple
          '#EC4899', // Hot Pink
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.spin;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.alpha;

        // Draw a 4-pointed sparkle
        ctx.beginPath();
        const spikes = 4;
        let rot = (Math.PI / 2) * 3;
        let step = Math.PI / spikes;

        ctx.moveTo(0, -this.size);
        for (let i = 0; i < spikes; i++) {
          let xVal = Math.cos(rot) * this.size;
          let yVal = Math.sin(rot) * this.size;
          ctx.lineTo(xVal, yVal);
          rot += step;

          xVal = Math.cos(rot) * this.innerRadius;
          yVal = Math.sin(rot) * this.innerRadius;
          ctx.lineTo(xVal, yVal);
          rot += step;
        }
        ctx.lineTo(0, -this.size);
        ctx.closePath();

        // Add soft glow shadow
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
      }
    }

    // Spawns sparkles on mouse movement
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // Calculate distance moved to control density
      const dx = x - lastMousePos.x;
      const dy = y - lastMousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (!hasMoved) {
        lastMousePos = { x, y };
        hasMoved = true;
        return;
      }

      // Only spawn if mouse has moved a threshold to look premium and not overloaded
      if (dist > 4) {
        const numToSpawn = Math.min(Math.floor(dist / 6) + 1, 4);
        for (let i = 0; i < numToSpawn; i++) {
          // Lerp coordinates to interpolate sparse points
          const t = i / numToSpawn;
          const px = lastMousePos.x + dx * t;
          const py = lastMousePos.y + dy * t;
          particles.push(new Sparkle(px, py));
        }
        lastMousePos = { x, y };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.update();
        p.draw();
      });

      // Filter out decayed particles
      particles = particles.filter(p => p.alpha > 0);

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        pointerEvents: 'none',
      }}
    />
  );
}

import React, { useEffect, useRef } from 'react';

export default function SparkleCursor() {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    // Hide default cursor across the entire page
    const styleEl = document.createElement('style');
    styleEl.id = 'custom-cursor-hide-default';
    styleEl.innerHTML = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    const cursor = cursorRef.current;
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

        // Color selection matching the metallic fire theme: Orange, Red, Cyber Blue, Gold
        const colors = [
          '#EF4444', // Red
          '#F59E0B', // Amber/Orange
          '#FBBF24', // Gold
          '#00E5FF', // Cyber Blue
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

    // Spawns sparkles on mouse movement and updates custom cursor position
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // Update cursor div position instantly (hardware accelerated transform)
      if (cursor) {
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        cursor.style.opacity = 1;
      }

      // Calculate distance moved to control density
      const dx = x - lastMousePos.x;
      const dy = y - lastMousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (!hasMoved) {
        lastMousePos = { x, y };
        hasMoved = true;
        if (cursor) {
          cursor.style.opacity = 1;
        }
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

    // Hide custom cursor when mouse leaves the document window
    const handleMouseLeave = () => {
      if (cursor) {
        cursor.style.opacity = 0;
      }
    };

    const handleMouseEnter = () => {
      if (cursor) {
        cursor.style.opacity = 1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
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
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
      if (styleEl) styleEl.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: -2,  // Slight offset to align the hot spot precisely with the tip of the arrow
          left: -2,
          width: '28px', // A bit smaller size as requested
          height: '28px',
          backgroundImage: 'url(/custom-cursor.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none',
          zIndex: 100000,
          opacity: 0,
          transform: 'translate3d(-100px, -100px, 0)',
          transformOrigin: 'top left',
          transition: 'opacity 0.15s ease',
        }}
      />
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
    </>
  );
}

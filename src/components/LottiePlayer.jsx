import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

export default function LottiePlayer({
  src,
  className = '',
  loop = true,
  autoplay = true,
  renderer = 'svg',
  ariaLabel = 'Animated graphic',
  assetsPath = undefined, // Add assetsPath prop
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !src) return undefined;

    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer,
      loop,
      autoplay,
      path: src,
      assetsPath, // Pass assetsPath to lottie-web
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        progressiveLoad: true,
      },
    });

    return () => animation.destroy();
  }, [autoplay, loop, renderer, src, assetsPath]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  );
}

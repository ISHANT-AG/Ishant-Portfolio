import { useEffect, useRef } from 'react';
import { mindFrames, mindViewBox } from './mindFrames';

const FRAME_DURATION = 100;
const STILL_FRAME = 7;

/** The reference is an 11-frame hand-drawn flipbook, not an interpolated curve. */
export default function Mind({ motion }: { motion: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    const svg = svgRef.current!;
    const path = pathRef.current!;
    let previousIndex = -1;
    let animationFrame = 0;
    let visible = true;
    let lastTime = performance.now();

    function showFrame(index: number) {
      if (index === previousIndex) return;
      const frame = mindFrames[index];
      path.setAttribute('d', frame.path);
      path.setAttribute('fill', frame.color);
      svg.setAttribute('data-frame', frame.name);
      previousIndex = index;
    }

    if (!motion) {
      showFrame(STILL_FRAME);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      lastTime = performance.now();
    });
    observer.observe(svg);

    function tick(now: number) {
      const delta = Math.max(0, Math.min(now - lastTime, FRAME_DURATION));
      lastTime = now;
      if (visible && !document.hidden) {
        elapsedRef.current += delta;
        showFrame(Math.floor(elapsedRef.current / FRAME_DURATION) % mindFrames.length);
      }
      animationFrame = requestAnimationFrame(tick);
    }

    showFrame(Math.floor(elapsedRef.current / FRAME_DURATION) % mindFrames.length);
    animationFrame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [motion]);

  return (
    <svg
      ref={svgRef}
      className="mind-scribble"
      viewBox={mindViewBox}
      aria-hidden="true"
      focusable="false"
      data-frame={mindFrames[STILL_FRAME].name}
    >
      <path
        ref={pathRef}
        d={mindFrames[STILL_FRAME].path}
        fill={mindFrames[STILL_FRAME].color}
        fillRule="evenodd"
      />
    </svg>
  );
}

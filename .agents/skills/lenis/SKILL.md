---
name: lenis
description: "Darkroom Engineering Lenis smooth scroll guide, integration patterns, and best practices for React, Three.js, WebGL, and custom DOM containers."
---

# Lenis Smooth Scroll by Darkroom Engineering

Reference: [https://github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis)

Lenis is a lightweight, robust, high-performance smooth scrolling library designed for modern web apps, creative portfolios, and WebGL experiences.

## 1. Installation

```bash
npm install lenis
```

## 2. Core Setup & Stylesheet

Lenis requires its official stylesheet to normalize `html` / `body` heights, handle discrete overflow transitions, and support scroll-chaining constraints:

```javascript
import 'lenis/dist/lenis.css';
```

## 3. Recommended Implementation in React

### Root Viewport Smooth Scroll

```tsx
import Lenis from 'lenis';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.10,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
      prevent: (node) =>
        !!node.closest('[aria-modal="true"], dialog[open], [data-lenis-prevent]'),
    });

    // Handle smooth anchor navigation (#section)
    const handleAnchorClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest('a');
      const href = a?.getAttribute('href');
      if (href?.startsWith('#') && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target as HTMLElement, { offset: -32, duration: 1.2 });
          history.pushState(null, '', href);
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  return <main>{/* App content */}</main>;
}
```

### Nested / Container Smooth Scroll

For nested scrolling panes (such as galleries, drawers, or modal content):

```tsx
const view = containerRef.current;
const content = view?.firstElementChild;

const scroll = new Lenis({
  wrapper: view,
  content: content as HTMLElement,
  autoRaf: true,
  lerp: 0.10,
  duration: 1.2,
  smoothWheel: true,
  overscroll: false,
});
```

## 4. WebGL & Three.js Synchronization

When coordinating with WebGL or Three.js meshes, hook into `lenis.on('scroll')`:

```ts
lenis.on('scroll', ({ scroll, velocity, progress }) => {
  // Pass velocity and position directly to custom shader uniforms
  material.uniforms.uVelocity.value = velocity;
  material.uniforms.uScroll.value = scroll;
});
```

## 5. Attributes for Scroll Isolation

- `data-lenis-prevent="true"`: Completely stops parent Lenis from scrolling when the user interacts with this element (useful for 3D canvases, interactive maps, modals).
- `data-lenis-prevent-wheel="true"`: Isolates mouse wheel events.
- `data-lenis-prevent-touch="true"`: Isolates touch gesture drag events.

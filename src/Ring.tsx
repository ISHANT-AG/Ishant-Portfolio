import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Columns3,
  ExternalLink,
  LayoutGrid,
  Search,
  X,
} from 'lucide-react';
import {
  galleryCategories,
  type GalleryCategory,
  type GalleryItem,
} from './ring/galleryData';
import { RingScene, type SceneMode } from './ring/RingScene';
import { getEditorialPlateUrl } from './ring/textures';
import './ring/ring.css';

type LayoutMode = 'stream' | 'strips';

const TITLE_LETTERS = 'PORTFOLIO'.split('');
// Repeated category sequence for continuous 1:1 horizontal marquee tracking in the dock
const MARQUEE_ITEMS = [
  galleryCategories[2], // idx -1 -> AUTOMATE
  galleryCategories[0], // idx  0 -> BUILD
  galleryCategories[1], // idx  1 -> DESIGN
  galleryCategories[2], // idx  2 -> AUTOMATE
  galleryCategories[0], // idx  3 -> BUILD
];

function resolveItemSrc(item: GalleryItem): string {
  if (item.visual.kind === 'image') return item.visual.src;
  return getEditorialPlateUrl(item.visual.plateId);
}

export default function Ring({
  motion,
  onOpen,
}: {
  motion: boolean;
  onOpen: (id: string) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const streamScrollRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const dockMarqueeRef = useRef<HTMLSpanElement>(null);
  const zoomTouchXRef = useRef<number | null>(null);
  const sceneRef = useRef<RingScene | null>(null);
  const resumeFocusRef = useRef<HTMLElement | null>(null);
  const zoomFocusRef = useRef<HTMLElement | null>(null);

  const [galleryState, setGalleryState] = useState<SceneMode>(
    motion ? 'entering' : 'ringIdle',
  );
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('stream');
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [zoomedItemIdx, setZoomedItemIdx] = useState<number | null>(null);
  const [webglFallback, setWebglFallback] = useState(false);
  const [categoryThumbs, setCategoryThumbs] = useState<Record<number, string>>({});
  const [cursorMode, setCursorMode] = useState<'none' | 'view' | 'zoom' | 'close'>('none');
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(!motion);
  const [dockProgress, setDockProgress] = useState(motion ? 0 : 1);

  useEffect(() => {
    const preloadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });

    const promises = galleryCategories.flatMap(({ cover }) =>
      cover.type === 'image' ? [preloadImage(cover.src)] : [],
    );
    if (typeof document !== 'undefined' && document.fonts) {
      promises.push(document.fonts.ready.then(() => {}));
    }

    Promise.all(promises).then(() => {
      setIsAssetsReady(true);
    });
  }, []);

  useEffect(() => {
    if (isAssetsReady && sceneRef.current) {
      sceneRef.current.onAssetsReady();
    }
  }, [isAssetsReady]);

  const motionRef = useRef(motion);
  const stateRef = useRef(galleryState);
  stateRef.current = galleryState;
  const openCategoryRef = useRef<(index?: number) => void>(() => {});

  const activeCategory: GalleryCategory = galleryCategories[activeCategoryIdx];
  const activeItems = activeCategory.items;
  const focusedItem = activeItems[Math.min(activeItemIdx, activeItems.length - 1)] ?? activeItems[0];
  const zoomedItem =
    zoomedItemIdx !== null
      ? activeItems[Math.min(zoomedItemIdx, activeItems.length - 1)] ?? null
      : null;

  const isExpanded =
    galleryState === 'categoryTransition' ||
    galleryState === 'categoryGallery' ||
    galleryState === 'itemZoom' ||
    galleryState === 'returning';

  // Pre-generate authored editorial plate URLs lazily on client
  const itemMediaMap = useMemo(() => {
    const map = new Map<string, string>();
    if (isExpanded) {
      for (const item of activeItems) map.set(item.id, resolveItemSrc(item));
    }
    return map;
  }, [activeItems, isExpanded]);

  const updateCursorPosition = useCallback((clientX: number, clientY: number) => {
    const el = cursorRef.current;
    if (!el) return;
    el.style.setProperty('--cursor-x', `${clientX}px`);
    el.style.setProperty('--cursor-y', `${clientY}px`);
    el.style.transform = `translate3d(calc(${clientX}px - 50%), calc(${clientY}px - 100% - 14px), 0)`;
  }, []);

  const applyTitleProgress = useCallback((progress: number) => {
    const el = titleRef.current;
    if (!el) return;
    el.style.setProperty('--title-p', String(progress));
    el.dataset.hidden = progress < 0.03 ? 'true' : 'false';
  }, []);

  const applyPointerParallax = useCallback((nx: number, ny: number) => {
    const el = titleRef.current;
    if (!el) return;
    el.style.setProperty('--px', nx.toFixed(3));
    el.style.setProperty('--py', ny.toFixed(3));
  }, []);

  const applyContinuousStep = useCallback((step: number) => {
    const el = dockMarqueeRef.current;
    if (!el) return;
    // Wrap smoothly into [-0.5, 2.5) and offset by +1 slot in MARQUEE_ITEMS
    const n = galleryCategories.length;
    let wrapped = ((step % n) + n) % n;
    if (wrapped >= n - 0.5) wrapped -= n;
    const slotOffset = wrapped + 1;
    el.style.transform = `translate3d(${(-slotOffset * 100).toFixed(2)}%, 0, 0)`;
  }, []);

  const handleOpenCategory = useCallback(
    (index?: number) => {
      const targetIdx = typeof index === 'number' ? index : activeCategoryIdx;
      const curState = stateRef.current;
      if (curState !== 'ringIdle' && curState !== 'entering') return;
      resumeFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setActiveCategoryIdx(targetIdx);
      setActiveItemIdx(0);
      setZoomedItemIdx(null);
      setLayoutMode('stream');
      setCursorMode('none');

      // Align gallery cleanly into viewport before expanding into full stage
      sectionRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });

      if (webglFallback || !sceneRef.current) {
        setGalleryState('categoryGallery');
        applyTitleProgress(0);
        return;
      }

      setGalleryState(motionRef.current ? 'categoryTransition' : 'categoryGallery');
      sceneRef.current.openCategory(targetIdx);
    },
    [activeCategoryIdx, applyTitleProgress, webglFallback],
  );

  openCategoryRef.current = handleOpenCategory;

  const handleReturnToRing = useCallback(() => {
    const curState = stateRef.current;
    if (curState === 'ringIdle' || curState === 'entering' || curState === 'returning') return;

    setZoomedItemIdx(null);
    setCursorMode('none');

    if (streamScrollRef.current) {
      streamScrollRef.current.scrollTop = 0;
    }

    if (webglFallback || !sceneRef.current) {
      setGalleryState('ringIdle');
      applyTitleProgress(1);
      return;
    }

    setGalleryState(motionRef.current ? 'returning' : 'ringIdle');
    sceneRef.current.returnToRing();
  }, [applyTitleProgress, webglFallback]);

  const handleOpenZoom = useCallback((index: number) => {
    zoomFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveItemIdx(index);
    setZoomedItemIdx(index);
    setCursorMode('none');
    setGalleryState('itemZoom');
    sceneRef.current?.setModeExternal('itemZoom');
  }, []);

  const handleCloseZoom = useCallback(() => {
    setZoomedItemIdx(null);
    setCursorMode('none');
    setGalleryState('categoryGallery');
    sceneRef.current?.setModeExternal('categoryGallery');
  }, []);

  const handleStepCategory = useCallback(
    (delta: number) => {
      if (stateRef.current !== 'ringIdle' && stateRef.current !== 'entering') return;
      if (webglFallback || !sceneRef.current) {
        setActiveCategoryIdx(
          (prev) => (prev + delta + galleryCategories.length) % galleryCategories.length,
        );
        return;
      }
      sceneRef.current.stepCategory(delta);
    },
    [webglFallback],
  );

  const handleStepZoom = useCallback(
    (delta: number) => {
      setZoomedItemIdx((prev) => {
        if (prev === null) return null;
        const next = (prev + delta + activeItems.length) % activeItems.length;
        setActiveItemIdx(next);
        return next;
      });
    },
    [activeItems.length],
  );

  const handleToggleLayout = useCallback(() => {
    setLayoutMode((prev) => {
      const next = prev === 'stream' ? 'strips' : 'stream';
      if (next === 'strips') {
        sceneRef.current?.setGalleryScrollRatio(1);
      } else if (streamScrollRef.current) {
        sceneRef.current?.setGalleryScrollRatio(streamScrollRef.current.scrollTop / 460);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#gallery') {
      sectionRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    if (galleryState === 'itemZoom') {
      root.querySelector<HTMLButtonElement>('.dock-close')?.focus({ preventScroll: true });
    } else if (galleryState === 'categoryGallery') {
      const button = zoomFocusRef.current?.isConnected
        ? zoomFocusRef.current
        : root.querySelector<HTMLButtonElement>('.dock-back');
      button?.focus({ preventScroll: true });
      zoomFocusRef.current = null;
    } else if (galleryState === 'ringIdle' && resumeFocusRef.current) {
      const original = resumeFocusRef.current;
      const button = original.isConnected && original !== document.body
        ? original
        : root.querySelector<HTMLButtonElement>('.dock-label-btn');
      button?.focus({ preventScroll: true });
      resumeFocusRef.current = null;
    }
  }, [galleryState]);

  // Keep RingScene synced with motion prop
  useEffect(() => {
    motionRef.current = motion;
    sceneRef.current?.setMotion(motion);
    if (!motion && stateRef.current === 'entering') {
      setGalleryState('ringIdle');
      applyTitleProgress(1);
    }
  }, [motion, applyTitleProgress]);

  // Mount Three.js scene once (StrictMode-safe with full GPU disposal)
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    let scene: RingScene;
    try {
      scene = new RingScene(host, motionRef.current, {
        onActiveCategoryChange: (idx) => {
          setActiveCategoryIdx(idx);
        },
        onCategoryOpenRequest: (idx) => {
          openCategoryRef.current(idx);
        },
        onHoverFrontPanel: (hovering, x, y) => {
          if (stateRef.current !== 'ringIdle') {
            setCursorMode('none');
            return;
          }
          if (hovering) {
            updateCursorPosition(x, y);
            setCursorMode('view');
          } else {
            setCursorMode((prev) => (prev === 'view' ? 'none' : prev));
          }
        },
        onThumbReady: (idx, thumbUrl) => {
          setCategoryThumbs((prev) => (prev[idx] === thumbUrl ? prev : { ...prev, [idx]: thumbUrl }));
        },
        onTitleProgress: (p) => {
          applyTitleProgress(p);
        },
        onPointerParallax: (nx, ny) => {
          applyPointerParallax(nx, ny);
        },
        onContinuousStep: (step) => {
          applyContinuousStep(step);
        },
        onLoadingProgress: (p) => {
          setLoadingProgress(p);
          if (p >= 1.0) {
            setIsLoaded(true);
          }
        },
        onDockProgress: (p) => {
          setDockProgress(p);
        },
        onTransitionComplete: (to) => {
          setGalleryState(to);
          setIsLoaded(true);
          setDockProgress(1);
        },
      });
    } catch {
      setWebglFallback(true);
      setGalleryState('ringIdle');
      applyTitleProgress(1);
      return;
    }

    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [applyContinuousStep, applyPointerParallax, applyTitleProgress, updateCursorPosition]);

  // Lock body scroll ONLY while an active category or zoom overlay is open
  useEffect(() => {
    if (!isExpanded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isExpanded]);

  // Keyboard navigation when gallery is expanded or focused
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Do not hijack keys if native case-study <dialog> is open on top
      if (document.querySelector('dialog[open]')) return;

      const cur = stateRef.current;
      if (e.key === 'Tab' && cur !== 'ringIdle' && cur !== 'entering') {
        const buttons = Array.from(sectionRef.current?.querySelectorAll<HTMLElement>(
          '.gallery-stage-frame button:not([disabled]), .gallery-stage-frame a[href]'
        ) ?? []).filter(el => !el.closest('[inert], [aria-hidden="true"]') && el.getClientRects().length);
        const next = e.shiftKey ? buttons[buttons.length - 1] : buttons[0];
        if (next && (!buttons.includes(document.activeElement as HTMLElement) ||
          (e.shiftKey ? buttons[0] : buttons[buttons.length - 1]) === document.activeElement)) {
          e.preventDefault();
          next.focus();
        }
      }
      if (cur === 'itemZoom') {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleCloseZoom();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          handleStepZoom(1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          handleStepZoom(-1);
        }
        return;
      }

      if (cur === 'categoryGallery' || cur === 'categoryTransition') {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleReturnToRing();
        } else if (e.key === 'g' || e.key === 'G') {
          handleToggleLayout();
        }
        return;
      }

      // In ringIdle, only handle ArrowLeft/ArrowRight when focus is inside #gallery
      if (
        cur === 'ringIdle' &&
        sectionRef.current?.contains(document.activeElement) &&
        !(document.activeElement as HTMLElement)?.closest('a')
      ) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleStepCategory(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleStepCategory(1);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleCloseZoom, handleReturnToRing, handleStepCategory, handleStepZoom, handleToggleLayout]);

  // Track active item + reference-inspired subtle top-edge peel in vertical stream mode
  const handleStreamScroll = useCallback(() => {
    const container = streamScrollRef.current;
    if (!container) return;

    sceneRef.current?.setGalleryScrollRatio(container.scrollTop / 460);

    const cards = container.querySelectorAll<HTMLElement>('[data-stream-card]');
    const viewH = container.clientHeight;
    const midY = viewH * 0.48;
    let closestIdx = 0;
    let closestDist = Infinity;

    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const dist = Math.abs(center - midY);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }

      // Subtle top-edge peel warp as cards scroll toward the upper edge (disabled when motion is off)
      if (motionRef.current) {
        const topZone = viewH * 0.24;
        const peel = rect.top < topZone ? Math.min(1, Math.max(0, (topZone - rect.top) / (rect.height * 0.85))) : 0;
        card.style.setProperty('--peel', peel.toFixed(3));
      } else {
        card.style.setProperty('--peel', '0');
      }
    });

    setActiveItemIdx((prev) => (prev === closestIdx ? prev : closestIdx));
  }, []);

  // Compute dock thumbnail URL for current state
  const dockThumbSrc =
    galleryState === 'categoryGallery' || galleryState === 'itemZoom'
      ? (zoomedItem ? itemMediaMap.get(zoomedItem.id) : itemMediaMap.get(focusedItem.id)) ||
        categoryThumbs[activeCategoryIdx]
      : categoryThumbs[activeCategoryIdx];

  return (
    <section
      ref={sectionRef}
      className="gallery-section"
      id="gallery"
      aria-label="Interactive curved portfolio gallery"
      data-state={galleryState}
    >
      <div
        className={`gallery-stage-frame ${isExpanded ? 'is-expanded' : ''}`}
        data-state={galleryState}
        role={isExpanded ? 'dialog' : undefined}
        aria-modal={isExpanded || undefined}
        aria-label={isExpanded ? activeCategory.displayTitle + ' projects' : undefined}
      >

        <div className={`gallery-top-caption ${galleryState === 'itemZoom' ? 'is-dark' : ''}`}>
          {isExpanded ? (
            <>
              <span className="gallery-cat-breadcrumb">{activeCategory.label} / Project gallery</span>
              <span className="gallery-stage-hint">
                {galleryState === 'categoryGallery'
                  ? `${activeCategory.label} · ${activeItems.length} works`
                  : galleryState === 'itemZoom' && zoomedItem
                    ? `${zoomedItem.year} · ${zoomedItem.title}`
                    : ''}
              </span>
            </>
          ) : (
            <p className="gallery-photographer-line">
              <a href="#about" className="gallery-bio-link">Ishant Agarwal</a> is a designer &amp; creative technologist.
            </p>
          )}
        </div>

        {/* Exact Kenichi Aikawa Loading Overlay */}
        <div
          className={`g-loading ${isLoaded ? 'is-loaded' : ''}`}
          aria-hidden={isLoaded}
          aria-live="polite"
        >
          <div className="g-loading__view">
            <div className="g-loading__inner">
              <div className="g-loading__body">
                <div className="g-loading__content">
                  <div className="g-loading__name-wrap">
                    <div className="g-loading__name">Ishant Agarwal</div>
                  </div>
                  <div className="g-loading__progress-wrap">
                    <div className="g-loading__progress">
                      {Math.round(loadingProgress * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monumental real-DOM black serif typography behind the 3D cylinder (accessible to screen readers; visual rendering on WebGL plane) */}
        <h2
          ref={titleRef}
          className={`gallery-monument ${webglFallback ? 'is-fallback' : 'is-webgl'}`}
          aria-label="PORTFOLIO"
        >
          {TITLE_LETTERS.map((ch, i) => (
            <span key={`${ch}-${i}`} className="gallery-monument-slot">
              <span
                className="gallery-monument-char"
                style={{ ['--char-i' as string]: i }}
              >
                {ch}
              </span>
            </span>
          ))}
        </h2>

        {/* WebGL Three.js Canvas Host */}
        <div
          ref={canvasHostRef}
          className={`ring-canvas-host ${galleryState === 'ringIdle' ? 'is-interactive' : ''}`}
          aria-hidden="true"
        />

        {/* Non-WebGL Accessible Fallback */}
        {webglFallback && galleryState === 'ringIdle' && (
          <div className="ring-fallback-stage">
            <button
              type="button"
              className="ring-fallback-card"
              onClick={() => handleOpenCategory(activeCategoryIdx)}
              style={{ background: activeCategory.cover.tint }}
            >
              {activeCategory.cover.type === 'image' && (
                <img src={activeCategory.cover.src} alt="" />
              )}
              <span className="ring-fallback-title">{activeCategory.displayTitle}</span>
              <span className="ring-fallback-cta">View {activeCategory.label} →</span>
            </button>
          </div>
        )}

        {/* Category Gallery Layer (Vertical Stream + Horizontal Slit-Strip Modes) */}
        {(galleryState === 'categoryGallery' ||
          galleryState === 'categoryTransition' ||
          galleryState === 'itemZoom') && (
          <div
            className={`cat-gallery-layer is-${layoutMode} ${
              galleryState === 'categoryGallery' ? 'is-ready' : ''
            } ${
              galleryState === 'categoryTransition' ? 'is-transitioning' : ''
            } ${galleryState === 'itemZoom' ? 'is-under-zoom' : ''}`}
            inert={galleryState !== 'categoryGallery'}
            aria-hidden={galleryState !== 'categoryGallery'}
          >
            {layoutMode === 'stream' ? (
              <div
                ref={streamScrollRef}
                className="cat-stream-scroll"
                onScroll={handleStreamScroll}
              >
                <header className="cat-stream-hero">
                  <span className="eyebrow">
                    0{activeCategoryIdx + 1} / {activeCategory.label}
                  </span>
                  <h3>{activeCategory.displayTitle}</h3>
                  <p>{activeCategory.tagline}</p>
                </header>

                <div className="cat-stream-list">
                  {activeItems.map((item, idx) => {
                    const src = itemMediaMap.get(item.id) || '';
                    return (
                      <article
                        key={item.id}
                        className="cat-stream-card"
                        data-stream-card
                        style={{ ['--card-i' as string]: idx }}
                      >
                        <button
                          type="button"
                          className="cat-stream-media"
                          onClick={() => handleOpenZoom(idx)}
                          onMouseEnter={(e) => {
                            updateCursorPosition(e.clientX, e.clientY);
                            setCursorMode('zoom');
                          }}
                          onMouseMove={(e) => updateCursorPosition(e.clientX, e.clientY)}
                          onMouseLeave={() => setCursorMode('none')}
                          aria-label={`Inspect ${item.title}`}
                        >
                          <div
                            className="cat-stream-frame"
                            style={{
                              background:
                                item.visual.kind === 'image'
                                  ? item.visual.frameBg || '#f3f3f0'
                                  : '#f3f3f0',
                            }}
                          >
                            <img src={src} alt={item.visual.alt} loading={idx === 0 ? 'eager' : 'lazy'} />
                          </div>
                        </button>
                        <div className="cat-stream-meta">
                          <div className="cat-stream-meta-left">
                            <span className="mono">
                              {String(idx + 1).padStart(2, '0')} /{' '}
                              {String(activeItems.length).padStart(2, '0')}
                            </span>
                            <div>
                              <h4>{item.title}</h4>
                              <p>{item.subtitle}</p>
                            </div>
                          </div>
                          <div className="cat-stream-actions">
                            <button
                              type="button"
                              className="cat-inline-btn"
                              onClick={() => handleOpenZoom(idx)}
                            >
                              Zoom
                            </button>
                            {item.projectId && (
                              <button
                                type="button"
                                className="cat-inline-btn is-primary"
                                onClick={() => onOpen(item.projectId!)}
                              >
                                Case study <ArrowUpRight size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="cat-strips-stage" role="group" aria-label={`${activeCategory.label} strip view`}>
                <div className="cat-strips-track">
                  {activeItems.map((item, idx) => {
                    const src = itemMediaMap.get(item.id) || '';
                    const isFocused = idx === activeItemIdx;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`cat-strip-slice ${isFocused ? 'is-active' : ''}`}
                        onMouseEnter={(e) => {
                          setActiveItemIdx(idx);
                          updateCursorPosition(e.clientX, e.clientY);
                          setCursorMode('zoom');
                        }}
                        onMouseMove={(e) => updateCursorPosition(e.clientX, e.clientY)}
                        onMouseLeave={() => setCursorMode('none')}
                        onFocus={() => setActiveItemIdx(idx)}
                        onClick={() => handleOpenZoom(idx)}
                        aria-label={`Inspect ${item.title}`}
                      >
                        <img src={src} alt={item.visual.alt} />
                        <span className="cat-strip-index mono">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="cat-strips-footer" aria-live="polite">
                  <span className="mono">
                    {String(activeItemIdx + 1).padStart(2, '0')} /{' '}
                    {String(activeItems.length).padStart(2, '0')}
                  </span>
                  <strong>{focusedItem.title}</strong>
                  <span>{focusedItem.subtitle}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Item Zoom / Inspection Layer with rising curved dark backdrop */}
        <div
          className={`cat-zoom-layer ${galleryState === 'itemZoom' && zoomedItem ? 'is-open' : ''}`}
          aria-label={zoomedItem ? `${zoomedItem.title} preview` : 'Project preview'}
          aria-hidden={galleryState !== 'itemZoom'}
          onTouchStart={(e) => {
            zoomTouchXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (zoomTouchXRef.current === null) return;
            const endX = e.changedTouches[0]?.clientX ?? zoomTouchXRef.current;
            const dx = endX - zoomTouchXRef.current;
            zoomTouchXRef.current = null;
            if (Math.abs(dx) > 48) {
              handleStepZoom(dx < 0 ? 1 : -1);
            }
          }}
        >
          <div className="cat-zoom-curtain" onClick={handleCloseZoom} />
          {zoomedItem && zoomedItemIdx !== null && (
            <>
              <div className="cat-zoom-progress" aria-hidden="true">
                <span
                  style={{
                    transform: `scaleX(${(zoomedItemIdx + 1) / activeItems.length})`,
                  }}
                />
              </div>
              <div key={zoomedItem.id} className="cat-zoom-content">
                <div
                  className="cat-zoom-media-wrap"
                  onClick={handleCloseZoom}
                  onMouseEnter={(e) => {
                    updateCursorPosition(e.clientX, e.clientY);
                    setCursorMode('close');
                  }}
                  onMouseMove={(e) => updateCursorPosition(e.clientX, e.clientY)}
                  onMouseLeave={() => setCursorMode('none')}
                >
                  <img
                    src={itemMediaMap.get(zoomedItem.id) || ''}
                    alt={zoomedItem.visual.alt}
                    className="cat-zoom-image"
                  />
                </div>

                <div className="cat-zoom-info">
                  <div className="cat-zoom-copy">
                    <span className="cat-zoom-eyebrow mono">
                      {activeCategory.label} · {zoomedItem.year} · {zoomedItem.role}
                    </span>
                    <h4>{zoomedItem.title}</h4>
                    <p>{zoomedItem.summary}</p>
                    {zoomedItem.note && <small className="cat-zoom-note">{zoomedItem.note}</small>}
                  </div>

                  <div className="cat-zoom-links">
                    {zoomedItem.projectId && (
                      <button
                        type="button"
                        className="cat-zoom-cta is-primary"
                        onClick={() => onOpen(zoomedItem.projectId!)}
                      >
                        Open case study <ArrowUpRight size={15} />
                      </button>
                    )}
                    {zoomedItem.links.slice(0, 2).map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="cat-zoom-cta"
                      >
                        {link.label} <ExternalLink size={13} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Floating Reference-Matched Bottom Dock */}
        <div
          className={`ring-dock ${galleryState === 'itemZoom' ? 'is-dark' : ''} ${
            galleryState === 'entering' ? 'is-entering' : ''
          }`}
          role="region"
          aria-label="Gallery navigation controls"
          style={
            galleryState === 'entering'
              ? {
                  opacity: dockProgress,
                  transform: `translate3d(-50%, ${(1 - dockProgress) * 28}px, 0)`,
                  pointerEvents: dockProgress > 0.85 ? 'auto' : 'none',
                }
              : undefined
          }
        >
          {/* Left flanking button: Back to Ring (visible in categoryGallery) */}
          {(galleryState === 'categoryGallery' || galleryState === 'categoryTransition') && (
            <button
              type="button"
              className="dock-circle dock-back"
              onClick={handleReturnToRing}
              aria-label="Back to 3D ring"
            >
              <ArrowLeft size={16} />
              <span className="dock-expand-label">BACK</span>
            </button>
          )}

          {/* Center frosted module */}
          <div className="dock-capsule">
            <span className="dock-thumb" style={{ background: activeCategory.cover.tint }}>
              {dockThumbSrc && <img src={dockThumbSrc} alt="" />}
            </span>

            {galleryState === 'itemZoom' && zoomedItemIdx !== null ? (
              <>
                <div className="dock-label-group">
                  <span className="dock-micro">{activeCategory.label}</span>
                  <strong className="dock-title">
                    {zoomedItemIdx + 1} — {activeItems.length}
                  </strong>
                </div>
                <div className="dock-step-group">
                  <button
                    type="button"
                    className="dock-step-btn"
                    onClick={() => handleStepZoom(-1)}
                    aria-label="Previous item"
                  >
                    <ArrowLeft size={13} />
                  </button>
                  <button
                    type="button"
                    className="dock-step-btn"
                    onClick={() => handleStepZoom(1)}
                    aria-label="Next item"
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
              </>
            ) : galleryState === 'categoryGallery' || galleryState === 'categoryTransition' ? (
              <div className="dock-label-group">
                <span className="dock-micro">
                  {layoutMode === 'stream' ? activeCategory.label : 'List view'}
                </span>
                <strong className="dock-title">
                  {layoutMode === 'stream' ? 'GALLERY' : 'STRIPS'}
                </strong>
              </div>
            ) : (
              <button
                type="button"
                className="dock-label-btn"
                onClick={() => handleOpenCategory(activeCategoryIdx)}
                aria-label={`Open ${activeCategory.label} category`}
              >
                <span className="dock-micro">Category</span>
                <span className="dock-label-display" key={activeCategory.id}>
                  <strong className="dock-title">{activeCategory.label}</strong>
                </span>
              </button>
            )}
          </div>

          {/* Right flanking button: Open (ringIdle) / Layout Toggle (categoryGallery) / Close (itemZoom) */}
          {galleryState === 'itemZoom' ? (
            <button
              type="button"
              className="dock-circle dock-close"
              onClick={handleCloseZoom}
              aria-label="Close zoomed preview"
            >
              <X size={16} />
            </button>
          ) : galleryState === 'categoryGallery' || galleryState === 'categoryTransition' ? (
            <button
              type="button"
              className="dock-circle dock-layout"
              onClick={handleToggleLayout}
              aria-label={
                layoutMode === 'stream' ? 'Switch to horizontal strip mode' : 'Switch to vertical gallery mode'
              }
              aria-pressed={layoutMode === 'strips'}
            >
              {layoutMode === 'stream' ? <Columns3 size={16} /> : <LayoutGrid size={16} />}
            </button>
          ) : (
            <button
              type="button"
              className="dock-circle dock-open"
              onClick={() => handleOpenCategory(activeCategoryIdx)}
              aria-label={`View ${activeCategory.label} works`}
            >
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Floating fine-pointer cursor pill (VIEW / ZOOM / CLOSE) */}
        <div
          ref={cursorRef}
          className={`ring-cursor-pill ${cursorMode !== 'none' ? 'is-visible' : ''}`}
          aria-hidden="true"
        >
          {cursorMode === 'view' && <span>VIEW</span>}
          {cursorMode === 'zoom' && (
            <>
              <span>ZOOM</span>
              <Search size={11} />
            </>
          )}
          {cursorMode === 'close' && <span>CLOSE</span>}
        </div>
      </div>

      {/* Subtle footer editorial caption below the stage, preserving existing portfolio rhythm */}

    </section>
  );
}

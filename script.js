(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  // ============================================
  // CONFIGURATION
  // ============================================
  const GALLERY_IMAGES = [
    '/images/gallery/photo-01.svg',
    '/images/gallery/photo-02.svg',
    '/images/gallery/photo-03.svg',
    '/images/gallery/photo-04.svg',
    '/images/gallery/photo-05.svg',
    '/images/gallery/photo-06.svg',
    '/images/gallery/photo-07.svg',
    '/images/gallery/photo-08.svg',
  ];

  // Tile layout configuration: [colSpan, rowSpan, count]
  // Total grid: 20x20 = 400 cells
  const TILE_LAYOUT = [
    { size: 'xl', cols: 6, rows: 6, count: 2 },
    { size: 'l', cols: 5, rows: 4, count: 4 },
    { size: 'm', cols: 4, rows: 3, count: 6 },
    { size: 's', cols: 3, rows: 2, count: 10 },
    { size: 'xs', cols: 2, rows: 2, count: 12 },
    { size: 'xxs', cols: 1, rows: 1, count: 20 },
  ];

  const GRAPHIC_TILES = [
    { text: 'VIPLOV', size: 'm', class: '' },
    { text: 'HELLOGAIIS', size: 'l', class: '' },
    { text: '◼', size: 's', class: 'small' },
    { text: '⬛', size: 'xs', class: 'small' },
    { text: '▲', size: 'xs', class: 'small' },
    { text: '◆', size: 'xxs', class: 'small' },
  ];

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const headingEl = document.querySelector('.heading');
  const headingTextEl = document.querySelector('.heading-text');
  const subtitleEl = document.querySelector('.subtitle');
  const creditEl = document.querySelector('.credit');
  const cursorEl = document.querySelector('.cursor');
  const mosaicGrid = document.getElementById('mosaicGrid');
  const mosaicSection = document.querySelector('.mosaic');

  const headingText = 'HELLOGAIIS';

  // ============================================
  // HERO ENTRANCE ANIMATION
  // ============================================
  function splitHeading() {
    headingTextEl.innerHTML = '';
    headingText.split('').forEach((char) => {
      const charWrapper = document.createElement('span');
      charWrapper.className = 'heading-char';
      charWrapper.setAttribute('aria-hidden', 'true');
      charWrapper.innerHTML = `<span class="heading-char__inner">${char}</span>`;
      headingTextEl.appendChild(charWrapper);
    });
  }

  function initHeroAnimation() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.heading-char__inner').forEach((el) => {
        el.style.transform = 'translateY(0)';
      });
      subtitleEl.style.opacity = '1';
      subtitleEl.style.transform = 'translateY(0)';
      creditEl.style.opacity = '1';
      if (cursorEl) cursorEl.style.opacity = '1';
      return;
    }

    const chars = document.querySelectorAll('.heading-char__inner');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(chars, {
      y: '0%',
      duration: 0.85,
      stagger: 0.085,
      ease: 'power3.out'
    });

    tl.to(subtitleEl, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out'
    }, '-=0.4');

    tl.to(creditEl, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.2');

    tl.call(() => {
      if (cursorEl) cursorEl.style.opacity = '1';
    }, '-=0.1');
  }

  // ============================================
  // CURSOR
  // ============================================
  function initCursor() {
    if (isTouchDevice || !cursorEl) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let rafId = null;

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animate = () => {
      cursorX = lerp(cursorX, mouseX, 0.25);
      cursorY = lerp(cursorY, mouseY, 0.25);

      cursorEl.style.left = `${cursorX}px`;
      cursorEl.style.top = `${cursorY}px`;

      rafId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseEnter = () => {
      cursorEl.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      cursorEl.style.opacity = '0';
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    cursorX = window.innerWidth / 2;
    cursorY = window.innerHeight / 2;
    cursorEl.style.left = `${cursorX}px`;
    cursorEl.style.top = `${cursorY}px`;

    animate();

    window.addEventListener('beforeunload', () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    });
  }

  // ============================================
  // MOSAIC GRID GENERATION
  // ============================================
  let tiles = [];
  let scrollTriggerInstance = null;

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getRandomImage() {
    return GALLERY_IMAGES[Math.floor(Math.random() * GALLERY_IMAGES.length)];
  }

  function createTileElement(config, index, isGraphic = false) {
    const tile = document.createElement('div');
    tile.className = `mosaic-tile mosaic-tile--${config.size}`;
    tile.dataset.index = index;
    tile.style.opacity = '0';
    tile.style.transform = 'scale(0.8) translateX(-50px)';

    if (isGraphic) {
      tile.classList.add('mosaic-tile--graphic');
      if (config.class) tile.classList.add(config.class);
      tile.textContent = config.text;
      tile.style.opacity = '0';
      tile.style.transform = 'scale(0.6) translateY(30px)';
    } else {
      const img = document.createElement('img');
      img.src = getRandomImage();
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => {
        tile.classList.add('loaded');
      }, { once: true });
      img.addEventListener('error', () => {
        tile.classList.add('loaded');
        tile.style.background = '#f0f0f0';
      }, { once: true });
      tile.appendChild(img);
    }

    return tile;
  }

  function generateMosaicLayout() {
    const layout = [];

    // Add photo tiles
    TILE_LAYOUT.forEach(({ size, cols, rows, count }) => {
      for (let i = 0; i < count; i++) {
        layout.push({ size, cols, rows, isGraphic: false });
      }
    });

    // Add graphic tiles
    GRAPHIC_TILES.forEach((graphic) => {
      layout.push({ size: graphic.size, isGraphic: true, graphicConfig: graphic });
    });

    // Shuffle for organic distribution
    return shuffleArray(layout);
  }

  function placeTilesInGrid(layout) {
    const gridCols = 20;
    const gridRows = 20;
    const occupied = Array(gridRows).fill(null).map(() => Array(gridCols).fill(false));
    const placedTiles = [];

    layout.forEach((tileConfig, index) => {
      const cols = tileConfig.cols || getColsForSize(tileConfig.size);
      const rows = tileConfig.rows || getRowsForSize(tileConfig.size);

      // Find first available position
      let placed = false;
      for (let r = 0; r <= gridRows - rows && !placed; r++) {
        for (let c = 0; c <= gridCols - cols && !placed; c++) {
          let canPlace = true;
          for (let dr = 0; dr < rows; dr++) {
            for (let dc = 0; dc < cols; dc++) {
              if (occupied[r + dr][c + dc]) {
                canPlace = false;
                break;
              }
            }
            if (!canPlace) break;
          }

          if (canPlace) {
            // Mark occupied
            for (let dr = 0; dr < rows; dr++) {
              for (let dc = 0; dc < cols; dc++) {
                occupied[r + dr][c + dc] = true;
              }
            }

            const tileEl = createTileElement(tileConfig, index, tileConfig.isGraphic);
            tileEl.style.gridColumnStart = c + 1;
            tileEl.style.gridColumnEnd = `span ${cols}`;
            tileEl.style.gridRowStart = r + 1;
            tileEl.style.gridRowEnd = `span ${rows}`;

            if (tileConfig.isGraphic) {
              tileEl.dataset.graphicConfig = JSON.stringify(tileConfig.graphicConfig);
            }

            mosaicGrid.appendChild(tileEl);
            placedTiles.push({
              element: tileEl,
              config: tileConfig,
              gridPos: { col: c, row: r, cols, rows },
              index
            });
            placed = true;
          }
        }
      }

      // If couldn't place, try smaller size or skip
      if (!placed && !tileConfig.isGraphic) {
        const smallerSizes = ['xl', 'l', 'm', 's', 'xs', 'xxs'];
        const currentIdx = smallerSizes.indexOf(tileConfig.size);
        for (let si = currentIdx + 1; si < smallerSizes.length; si++) {
          const newSize = smallerSizes[si];
          const newCols = getColsForSize(newSize);
          const newRows = getRowsForSize(newSize);

          for (let r = 0; r <= gridRows - newRows && !placed; r++) {
            for (let c = 0; c <= gridCols - newCols && !placed; c++) {
              let canPlace = true;
              for (let dr = 0; dr < newRows; dr++) {
                for (let dc = 0; dc < newCols; dc++) {
                  if (occupied[r + dr][c + dc]) {
                    canPlace = false;
                    break;
                  }
                }
                if (!canPlace) break;
              }

              if (canPlace) {
                for (let dr = 0; dr < newRows; dr++) {
                  for (let dc = 0; dc < newCols; dc++) {
                    occupied[r + dr][c + dc] = true;
                  }
                }

                const newConfig = { ...tileConfig, size: newSize, cols: newCols, rows: newRows };
                const tileEl = createTileElement(newConfig, index, false);
                tileEl.style.gridColumnStart = c + 1;
                tileEl.style.gridColumnEnd = `span ${newCols}`;
                tileEl.style.gridRowStart = r + 1;
                tileEl.style.gridRowEnd = `span ${newRows}`;

                mosaicGrid.appendChild(tileEl);
                placedTiles.push({
                  element: tileEl,
                  config: newConfig,
                  gridPos: { col: c, row: r, cols: newCols, rows: newRows },
                  index
                });
                placed = true;
              }
            }
          }
        }
      }
    });

    tiles = placedTiles;
    return placedTiles;
  }

  function getColsForSize(size) {
    const map = { xl: 6, l: 5, m: 4, s: 3, xs: 2, xxs: 1 };
    return map[size] || 2;
  }

  function getRowsForSize(size) {
    const map = { xl: 6, l: 4, m: 3, s: 2, xs: 2, xxs: 1 };
    return map[size] || 1;
  }

  // ============================================
  // MOSAIC SCROLL ANIMATION
  // ============================================
  function initMosaicAnimation() {
    if (prefersReducedMotion) {
      tiles.forEach(({ element }) => {
        element.style.opacity = '1';
        element.style.transform = 'none';
        const img = element.querySelector('img');
        if (img) {
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
        }
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Sort tiles by distance from left edge for left-to-right reveal
    const sortedTiles = [...tiles].sort((a, b) => {
      return a.gridPos.col - b.gridPos.col;
    });

    // Create staggered animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.mosaic',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          // Optional: could add progress-based logic here
        }
      }
    });

    // Phase 1: Initial scattered tiles from left
    const initialTiles = sortedTiles.slice(0, 15);
    tl.to(initialTiles.map(t => t.element), {
      opacity: 1,
      transform: 'scale(1) translateX(0)',
      duration: 0.3,
      stagger: {
        each: 0.02,
        from: 'start',
        ease: 'power2.out'
      },
      ease: 'power2.out'
    }, 0);

    // Phase 2: More tiles expanding horizontally
    const phase2Tiles = sortedTiles.slice(15, 35);
    tl.to(phase2Tiles.map(t => t.element), {
      opacity: 1,
      transform: 'scale(1) translateX(0)',
      duration: 0.4,
      stagger: {
        each: 0.015,
        from: 'start',
        ease: 'power2.out'
      },
      ease: 'power2.out'
    }, 0.1);

    // Phase 3: Bulk of tiles filling in
    const phase3Tiles = sortedTiles.slice(35, -GRAPHIC_TILES.length);
    tl.to(phase3Tiles.map(t => t.element), {
      opacity: 1,
      transform: 'scale(1) translateX(0)',
      duration: 0.5,
      stagger: {
        each: 0.008,
        from: 'start',
        ease: 'power1.out'
      },
      ease: 'power1.out'
    }, 0.25);

    // Phase 4: Graphic tiles appear last
    const graphicTiles = sortedTiles.slice(-GRAPHIC_TILES.length);
    tl.to(graphicTiles.map(t => t.element), {
      opacity: 1,
      transform: 'scale(1) translateY(0)',
      duration: 0.6,
      stagger: {
        each: 0.05,
        from: 'start',
        ease: 'back.out(1.2)'
      },
      ease: 'back.out(1.2)'
    }, 0.5);

    // Subtle image scale animation for depth
    tiles.forEach(({ element, config }) => {
      if (!config.isGraphic) {
        const img = element.querySelector('img');
        if (img) {
          gsap.fromTo(img,
            { scale: 1.2, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 1.2,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'center center',
                scrub: 0.5
              }
            }
          );
        }
      }
    });

    scrollTriggerInstance = tl.scrollTrigger;
  }

  // ============================================
  // IMAGE PRELOADING
  // ============================================
  function preloadCriticalImages() {
    // Preload first few images for smooth initial transition
    const criticalImages = GALLERY_IMAGES.slice(0, 4);
    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    // Hero
    splitHeading();
    initHeroAnimation();

    // Mosaic
    preloadCriticalImages();
    const layout = generateMosaicLayout();
    placeTilesInGrid(layout);
    initMosaicAnimation();

    // Cursor
    initCursor();

    // Handle resize - refresh ScrollTrigger
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
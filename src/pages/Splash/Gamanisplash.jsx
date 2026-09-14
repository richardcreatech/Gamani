import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/**
 * GamaniSplash
 * -----------------------------------------------------------------------
 * A brand splash screen: a chunky, retro pixel-art tree grows itself
 * onto the screen — a ground shadow lands first, then the trunk pops up
 * block by block, then the round pixel canopy fills in from the trunk
 * outward, and finally a few pixels inside the canopy glow like soft
 * purple embers. One GSAP timeline drives the whole sequence.
 *
 * HOW THE PIXEL ART WORKS:
 *   The tree isn't a drawn/traced path — it's a grid of 1x1 SVG <rect>
 *   "pixels". `TRUNK_CELLS` and `CANOPY_CELLS` below are just arrays of
 *   {row, col} positions describing which grid squares are filled in,
 *   built once from compact per-row ranges (see buildRowCells). That
 *   keeps the shape readable/editable as plain data instead of a long
 *   hand-written SVG path.
 *
 * HOW THE "GROWING" TRICK WORKS:
 *   Every pixel starts at scale 0 (invisible). GSAP scales each one up
 *   to 1 in a staggered sequence, so blocks appear to pop into place one
 *   at a time — trunk from the ground up, canopy from the trunk outward
 *   (bottom row first, and left-right from the center within each row).
 *   The *order* pixels appear in is controlled separately from the
 *   order they're rendered in: each pixel is stored in a lookup Map
 *   keyed by "row-col", then re-sorted into the desired reveal order
 *   right before the timeline is built.
 *
 * Usage:
 *   <GamaniSplash onComplete={() => setShowSplash(false)} />
 *
 * The component fades itself out at the end of the animation and then
 * calls `onComplete`. It does NOT unmount itself — the parent decides
 * when to stop rendering it, so you stay in control of when the splash
 * leaves the DOM.
 */

// -------------------------------------------------------------------
// Pixel grid data (module scope — this is static artwork, not state)
// -------------------------------------------------------------------

// Helper: expand a single row + column range into individual cells.
function buildRowCells(row, colStart, colEnd) {
  const cells = [];
  for (let col = colStart; col <= colEnd; col++) {
    cells.push({ row, col });
  }
  return cells;
}

// The canopy is described one row at a time as [row, startCol, endCol].
// Widths step out and back in (4, 6, 8, 10, 12, 12, 10, 8, 6, 4) which,
// on a pixel grid, reads as a soft round blob — the classic "cute"
// pixel-tree silhouette.
const CANOPY_ROW_RANGES = [
  [2, 4, 7],
  [3, 3, 8],
  [4, 2, 9],
  [5, 1, 10],
  [6, 0, 11],
  [7, 0, 11],
  [8, 1, 10],
  [9, 2, 9],
  [10, 3, 8],
  [11, 4, 7],
];

// A handful of canopy cells are picked out as "glow" pixels — soft
// purple accents scattered through the silhouette, like fireflies
// caught in the leaves.
const GLOW_POSITIONS = new Set(["4-3", "5-8", "7-2", "8-9", "9-5"]);

const CANOPY_CELLS = CANOPY_ROW_RANGES.flatMap(([row, start, end]) =>
  buildRowCells(row, start, end).map((cell) => ({
    ...cell,
    isGlow: GLOW_POSITIONS.has(`${cell.row}-${cell.col}`),
  }))
);

// The trunk: a narrow column that mostly tucks up under the canopy,
// with just enough peeking out at the bottom to read as a trunk.
const TRUNK_CELLS = [
  ...buildRowCells(12, 5, 6),
  ...buildRowCells(13, 5, 6),
  ...buildRowCells(14, 5, 6),
];

// Reveal order: within the canopy, lower rows (closer to the trunk)
// appear first, and within a row, pixels appear from the horizontal
// center (col 5.5) outward — so growth reads as "outward from the
// trunk" rather than a flat left-to-right scan.
function canopyRevealOrder(a, b) {
  if (b.row !== a.row) return b.row - a.row; // higher row number = lower on screen = first
  return Math.abs(a.col - 5.5) - Math.abs(b.col - 5.5);
}

// Trunk reveal order: ground-level pixels first, working upward.
function trunkRevealOrder(a, b) {
  return b.row - a.row;
}

export default function GamaniSplash({ onComplete }) {
  // Root wrapper — gsap.context() is scoped to this element so every
  // animation GSAP creates is automatically cleaned up on unmount.
  const rootRef = useRef(null);
  // const shadowRef = useRef(null);

  // Pixels are collected into a Map keyed by "row-col" as they mount,
  // so we can look them up again in any order we like (see
  // canopyRevealOrder / trunkRevealOrder above) once every pixel exists.
  const pixelElsByKey = useRef(new Map());
  const glowHaloRefs = useRef([]);
  glowHaloRefs.current = [];

  const registerPixel = (row, col) => (el) => {
    if (el) pixelElsByKey.current.set(`${row}-${col}`, el);
  };
  const collect = (list) => (el) => {
    if (el && !list.current.includes(el)) list.current.push(el);
  };

  // -------------------------------------------------------------------
  // Animation
  // -------------------------------------------------------------------
  useLayoutEffect(() => {
    // gsap.context() scopes every tween created inside the callback to
    // rootRef; ctx.revert() on unmount kills all of them — the
    // React-safe way to use GSAP (safe across StrictMode double-mounts,
    // route changes, etc).
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Look each pixel back up from the Map, in the order we actually
      // want it to appear (not the order it was rendered/mounted in).
      const trunkEls = [...TRUNK_CELLS]
        .sort(trunkRevealOrder)
        .map((c) => pixelElsByKey.current.get(`${c.row}-${c.col}`))
        .filter(Boolean);

      const canopyEls = [...CANOPY_CELLS]
        .sort(canopyRevealOrder)
        .map((c) => pixelElsByKey.current.get(`${c.row}-${c.col}`))
        .filter(Boolean);

      const allPixels = [...trunkEls, ...canopyEls];

      gsap.set(allPixels, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(glowHaloRefs.current, {
        opacity: 0,
        scale: 0.6,
        transformOrigin: "50% 50%",
      });
      // gsap.set(shadowRef.current, { scaleX: 0, transformOrigin: "50% 50%" });

      if (prefersReducedMotion) {
        gsap.set(allPixels, { scale: 1 });
        gsap.set(glowHaloRefs.current, { opacity: 0.75, scale: 1 });
        // gsap.set(shadowRef.current, { scaleX: 1 });
        onComplete && onComplete();
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          onComplete && onComplete();
        },
      });

      // --- Phase 1: the ground shadow lands -------------------------
      // tl.to(shadowRef.current, {
      //   scaleX: 1,
      //   duration: 0.5,
      //   ease: "back.out(1.7)",
      // });

      // --- Phase 2: the trunk pops up, block by block -----------------
      // A bouncy ease ("back.out") on each little block is what gives
      // the growth its "cute" pop, rather than a mechanical grow.
      tl.to(
        trunkEls,
        {
          scale: 1,
          duration: 0.25,
          stagger: 0.08,
          ease: "back.out(2.5)",
        },
        "-=0.15"
      );

      // --- Phase 3: the canopy fills in from the trunk outward --------
      // Reveal order was pre-sorted above (bottom rows first, center
      // columns first within each row), so this single staggered tween
      // is enough to make the whole canopy feel like it's blooming
      // outward from where it meets the trunk.
      tl.to(
        canopyEls,
        {
          scale: 1,
          duration: 0.22,
          stagger: 0.018,
          ease: "back.out(2)",
        },
        "-=0.1"
      );

      // --- Phase 4: a few pixels glow like soft purple embers ---------
      // These are separate blurred halo circles layered under the glow
      // pixels (see the SVG markup) — animating their opacity/scale
      // creates a soft bloom without touching the crisp pixel silhouette.
      tl.to(
        glowHaloRefs.current,
        {
          opacity: 0.85,
          scale: 1.3,
          duration: 0.6,
          stagger: 0.12,
          ease: "sine.out",
        },
        "-=0.25"
      );

      // A single gentle pulse — the tree "breathing" once before it settles.
      tl.to(glowHaloRefs.current, {
        opacity: 0.55,
        scale: 1,
        duration: 0.7,
        yoyo: true,
        repeat: 1,
        stagger: 0.06,
        ease: "sine.inOut",
      });

      // --- Phase 5: wordmark, then hand off to the app -----------------
      tl.to(
        ".gamani-splash__wordmark",
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.3"
      );

      tl.to(
        rootRef.current,
        { opacity: 0, duration: 0.8, ease: "power1.inOut" },
        "+=0.5"
      );
    }, rootRef);

    return () => ctx.revert();
    // Built once on mount — pass a stable onComplete (e.g. via
    // useCallback) if you need this to react to prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="gamani-splash" ref={rootRef}>
      <div className="gamani-splash__stage">
        <svg
          className="gamani-splash__pixel-tree"
          viewBox="0 0 12 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft blur used only by the glow halo circles behind the
                accent pixels — keeps the silhouette itself perfectly crisp. */}
            <filter
              id="gamani-glow-blur"
              x="-200%"
              y="-200%"
              width="500%"
              height="500%"
            >
              <feGaussianBlur stdDeviation="1" />
            </filter>
            <filter
              id="gamani-shadow-blur"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="0.35" />
            </filter>
          </defs>

          {/* Contact shadow on the ground beneath the trunk */}
          {/* <ellipse
            ref={shadowRef}
            className="gamani-splash__ground-shadow"
            cx="6"
            cy="15.3"
            rx="2.6"
            ry="0.5"
            filter="url(#gamani-shadow-blur)"
          /> */}

          {/* Glow halos, drawn *underneath* the pixels so the crisp
              silhouette still reads on top of the soft purple bloom */}
          {CANOPY_CELLS.filter((c) => c.isGlow).map((cell) => (
            <circle
              key={`halo-${cell.row}-${cell.col}`}
              ref={collect(glowHaloRefs)}
              className="gamani-splash__glow-halo"
              cx={cell.col + 0.5}
              cy={cell.row + 0.5}
              r="1.1"
              filter="url(#gamani-glow-blur)"
            />
          ))}

          {/* Trunk pixels */}
          {TRUNK_CELLS.map((cell) => (
            <rect
              key={`trunk-${cell.row}-${cell.col}`}
              ref={registerPixel(cell.row, cell.col)}
              className="gamani-splash__pixel gamani-splash__pixel--trunk"
              x={cell.col}
              y={cell.row}
              width="1"
              height="1"
            />
          ))}

          {/* Canopy pixels (glow ones get an extra class for their fill color) */}
          {CANOPY_CELLS.map((cell) => (
            <rect
              key={`canopy-${cell.row}-${cell.col}`}
              ref={registerPixel(cell.row, cell.col)}
              className={
                "gamani-splash__pixel gamani-splash__pixel--canopy" +
                (cell.isGlow ? " gamani-splash__pixel--glow" : "")
              }
              x={cell.col}
              y={cell.row}
              width="1"
              height="1"
            />
          ))}
        </svg>

        <div className="gamani-splash__wordmark">GAMANI</div>
      </div>
    </div>
  );
}
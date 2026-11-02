// A manual reload is flagged on <html data-reload> by an inline script that runs
// before the first paint, so the curtain can cover the page from the very first
// frame. First visits and in-app navigations never get the flag.
export const RELOAD_ATTR = "data-reload";

// Seconds into the curtain at which the cloth starts to lift.
export const RELOAD_REVEAL_AT = 1.2;

// Fired on window once the curtain's middle panel is fully up: the hero's cue.
const HERO_CUE = "kr:hero-cue";
let cued = false;

export const reloadDetectScript = `(function(){try{var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.setAttribute("${RELOAD_ATTR}","")}}catch(e){}})();`;

export function isReload() {
  return typeof document !== "undefined" && document.documentElement.hasAttribute(RELOAD_ATTR);
}

/** Called by the curtain when its middle panel has fully lifted. */
export function cueHero() {
  cued = true;
  window.dispatchEvent(new Event(HERO_CUE));
}

/** Called by the curtain once it's completely gone. */
export function finishCurtain() {
  if (!cued) cueHero();
  document.documentElement.removeAttribute(RELOAD_ATTR);
}

/** Run `cb` on the hero's cue: now if there's no curtain (or it already gave it). Returns a cleanup. */
export function afterCurtain(cb: () => void) {
  if (!isReload() || cued) {
    cb();
    return () => {};
  }
  window.addEventListener(HERO_CUE, cb, { once: true });
  return () => window.removeEventListener(HERO_CUE, cb);
}

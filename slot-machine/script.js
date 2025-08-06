// ---------- CONFIG ----------
const ICONS = [
  "img/cake.png",
  "img/camera.png",
  "img/champagnes.png",
  "img/flower.png",
  "img/gift.png",
];

const STRIP_SIZE = 15;            // how many "cells" per reel
const REEL_DURATION_MS = 1200;    // spin time per reel
const REEL_DELAY_MS = 600;        // stagger between reels

// Optional: force a specific final combo on a certain spin (e.g., 4th spin)
const FORCE_FINAL_ON_SPIN = null; // set to a number like 4 to force
const FORCED_ICON = "img/ringflower.png"; // if forcing, use this (or change)

// ---------- HELPERS ----------
function preloadImages(paths) {
  paths.forEach((src) => { const img = new Image(); img.src = src; });
}
function pickRandomIcon() {
  return ICONS[Math.floor(Math.random() * ICONS.length)];
}

// Build the strip once, reuse thereafter
function ensureStrip(reelEl) {
  let strip = reelEl.querySelector(".reel-strip");
  if (!strip) {
    strip = document.createElement("div");
    strip.className = "reel-strip";
    for (let i = 0; i < STRIP_SIZE; i++) {
      const item = document.createElement("div");
      item.className = "reel-item";
      const img = document.createElement("img");
      img.src = pickRandomIcon();
      img.alt = "Slot Icon";
      item.appendChild(img);
      strip.appendChild(item);
    }
    reelEl.innerHTML = "";
    reelEl.appendChild(strip);
  }
  return strip;
}

/**
 * Prepare the strip so the animation looks like a continuous downward spin and
 * ends on `finalIcon`.
 *
 * Steps:
 * 1) Capture the currently visible image (imgs[0]) as prevTopSrc.
 * 2) Put prevTopSrc into the last cell, fill middle with randoms.
 * 3) Jump (no transition) to show the last cell at the top (negative translateY).
 * 4) Put the desired final icon in imgs[0].
 * 5) Trigger a transition back to translateY(0) to reveal the final icon.
 */
function prepareStripForSpin(strip, finalIcon) {
  const imgs = strip.querySelectorAll("img");
  const prevTopSrc = imgs[0].src;

  strip.style.transition = "none";

  // last cell becomes the one that was visible (for seamless wrap)
  imgs[imgs.length - 1].src = prevTopSrc;

  // fill middle with randoms
  for (let i = 1; i < imgs.length - 1; i++) {
    imgs[i].src = pickRandomIcon();
  }

  // position strip so last cell is visible at top
  strip.style.transform = `translateY(-${(imgs.length - 1) * 100}%)`;

  // set the new "end" icon
  imgs[0].src = finalIcon || pickRandomIcon();

  // force reflow so browser applies the 'no transition' state before we animate
  void strip.offsetHeight;

  // now enable the transition we'll animate with
  strip.style.transition = `transform ${REEL_DURATION_MS}ms ease-out`;
}

function spinOneReel(reelEl, delayMs, finalIcon, onDone) {
  const strip = ensureStrip(reelEl);
  prepareStripForSpin(strip, finalIcon);

  setTimeout(() => {
    function handleEnd() {
      strip.removeEventListener("transitionend", handleEnd);
      // lock the final position & drop transition to avoid jitter later
      strip.style.transition = "none";
      strip.style.transform = "translateY(0)";
      if (onDone) onDone();
    }
    strip.addEventListener("transitionend", handleEnd);
    strip.style.transform = "translateY(0)";
  }, delayMs);
}

// avoid accidental 3-of-a-kind unless we intend it
function randomOutcomeAvoidTriple() {
  let a = pickRandomIcon();
  let b = pickRandomIcon();
  let c = pickRandomIcon();
  if (a === b && b === c) {
    c = ICONS.find((x) => x !== a) || c;
  }
  return [a, b, c];
}

// ---------- MAIN ----------
document.addEventListener("DOMContentLoaded", () => {
  preloadImages(ICONS.concat(["img/background.png", "img/taptospin.png"]));

  const reels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3"),
  ];
  // Ensure strips exist once at load (prevents first-spin layout jump)
  reels.forEach(ensureStrip);

  const spinButton = document.getElementById("spinButton");
  let spinCount = 0;
  let isSpinning = false;

  spinButton.addEventListener("click", () => {
    if (isSpinning) return;
    isSpinning = true;
    spinCount++;

    // Decide final symbols
    let outcome;
    if (FORCE_FINAL_ON_SPIN && spinCount === FORCE_FINAL_ON_SPIN) {
      outcome = [FORCED_ICON, FORCED_ICON, FORCED_ICON];
    } else {
      outcome = randomOutcomeAvoidTriple();
    }

    let finished = 0;
    reels.forEach((reelEl, i) => {
      spinOneReel(
        reelEl,
        i * REEL_DELAY_MS,
        outcome[i],
        () => {
          finished++;
          if (finished === reels.length) {
            // all reels done
            isSpinning = false;
          }
        }
      );
    });
  });
});
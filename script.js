// ====== CONFIGURE ME ======
// Get a topic at https://ntfy.sh (just make up a hard-to-guess topic name,
// no signup needed) and install the ntfy app on your phone, subscribed to
// that same topic. See README.md for step-by-step setup.
const NTFY_TOPIC = "KristiDatePicker123xqz-2";
// ===========================

const SAD_MESSAGES = [
  "Wait, what? 🥺",
  "Are you sure...?",
  "Nooo pick again 😭",
  "You're breaking my heart a little ngl",
  "C'mon, click the other one 👉",
  "The button doesn't want to be pressed anymore either...",
  "Okay it's officially running away now 🏃‍♀️💨",
  "You can't catch it. It's basically the flash now.",
];

const DODGE_AFTER_CLICKS = 4;
const DODGE_RADIUS = 130;

// Sad hamster images, escalating in intensity to match SAD_MESSAGES above.
const HAMSTER_SAD = [
  "assets/hamsters/sad-1.png",
  "assets/hamsters/sad-2.png",
  "assets/hamsters/sad-3.png",
  "assets/hamsters/sad-4.png",
  "assets/hamsters/sad-5.png",
  "assets/hamsters/sad-6.png",
  "assets/hamsters/sad-7.png",
  "assets/hamsters/sad-8.png",
];

// Happy hamster images shown as she moves through the flow after saying yes.
const HAMSTER_HAPPY = {
  idle: "assets/hamsters/happy-idle.png",
  yes: "assets/hamsters/happy-yes.png",
  date: "assets/hamsters/happy-date.png",
  confirm: "assets/hamsters/happy-confirm.png",
};

const hamsterImg = document.getElementById("hamsterImg");
const hamsterPlaceholder = document.getElementById("hamsterPlaceholder");

function setHamster(src) {
  hamsterImg.src = src;
  hamsterImg.classList.remove("hidden");
  hamsterPlaceholder.style.display = "none";
}

// Fetch every hamster image into the browser cache up front. Without this,
// each click was triggering a fresh network request for a ~100-600KB image,
// so fast clicking outran the loads and the picture appeared stuck/laggy.
const preloadedImages = [];
[...HAMSTER_SAD, ...Object.values(HAMSTER_HAPPY), "assets/hamsters/perv.jpg"].forEach((src) => {
  const img = new Image();
  img.src = src;
  preloadedImages.push(img);
});

setHamster(HAMSTER_HAPPY.idle);

const screens = {
  proposal: document.getElementById("screen-proposal"),
  type: document.getElementById("screen-type"),
  date: document.getElementById("screen-date"),
  confirm: document.getElementById("screen-confirm"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}

/* ---------------- Proposal screen: No button chaos ---------------- */

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const sadMessagesEl = document.getElementById("sadMessages");

let noClicks = 0;
let dodgeActive = false;

function bumpButtonSizes() {
  const yesScale = Math.min(1 + noClicks * 0.12, 2.2);
  const noScale = Math.max(1 - noClicks * 0.08, 0.5);
  yesBtn.style.transform = `scale(${yesScale})`;
  noBtn.style.transform = `scale(${noScale})`;
}

function spawnSadBubble(text) {
  const bubble = document.createElement("div");
  bubble.className = "sad-bubble";
  bubble.textContent = text;
  // Scatter around the card itself, slightly beyond its edges too.
  const left = -10 + Math.random() * 120;
  const top = -10 + Math.random() * 120;
  bubble.style.left = `${left}%`;
  bubble.style.top = `${top}%`;
  sadMessagesEl.appendChild(bubble);
  setTimeout(() => bubble.remove(), 2000);
}

function handleNoInteraction() {
  noClicks += 1;
  const index = Math.min(noClicks - 1, SAD_MESSAGES.length - 1);
  spawnSadBubble(SAD_MESSAGES[index]);
  setHamster(HAMSTER_SAD[index]);
  bumpButtonSizes();
  if (noClicks >= DODGE_AFTER_CLICKS) {
    activateDodge();
  }
}

// The point inside [minCx,maxCx] x [minCy,maxCy] that is farthest from
// (cursorX, cursorY). For an axis-aligned box the farthest point is always
// one of its corners, found by independently picking whichever bound is
// farther on each axis.
function farthestSafePoint(cursorX, cursorY, bounds) {
  const x = Math.abs(bounds.minCx - cursorX) > Math.abs(bounds.maxCx - cursorX) ? bounds.minCx : bounds.maxCx;
  const y = Math.abs(bounds.minCy - cursorY) > Math.abs(bounds.maxCy - cursorY) ? bounds.minCy : bounds.maxCy;
  return { x, y };
}

// Nudges the button a limited distance away from (cursorX, cursorY),
// clamped so it always stays fully inside the viewport. If that clamped
// step still leaves it within striking distance (e.g. it was pinned in a
// corner with nowhere further to go), it jumps to whichever corner of the
// screen is guaranteed farthest from the cursor instead — still fully
// on-screen, just decisive instead of trapped.
function dodgeAwayFrom(cursorX, cursorY) {
  const rect = noBtn.getBoundingClientRect();
  const margin = 16;
  const bounds = {
    minCx: margin + rect.width / 2,
    maxCx: window.innerWidth - margin - rect.width / 2,
    minCy: margin + rect.height / 2,
    maxCy: window.innerHeight - margin - rect.height / 2,
  };

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = cx - cursorX;
  let dy = cy - cursorY;
  const dist = Math.hypot(dx, dy) || 1;
  dx /= dist;
  dy /= dist;

  const step = 130;
  let newCx = Math.min(Math.max(cx + dx * step + (Math.random() - 0.5) * 40, bounds.minCx), bounds.maxCx);
  let newCy = Math.min(Math.max(cy + dy * step + (Math.random() - 0.5) * 40, bounds.minCy), bounds.maxCy);

  const resultingDist = Math.hypot(newCx - cursorX, newCy - cursorY);
  if (resultingDist < DODGE_RADIUS + 20) {
    const safe = farthestSafePoint(cursorX, cursorY, bounds);
    newCx = safe.x;
    newCy = safe.y;
  }

  noBtn.style.left = `${newCx - rect.width / 2}px`;
  noBtn.style.top = `${newCy - rect.height / 2}px`;
}

function handlePointerMove(e) {
  if (!dodgeActive) return;
  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
  if (dist < DODGE_RADIUS) {
    dodgeAwayFrom(e.clientX, e.clientY);
  }
}

function activateDodge() {
  if (dodgeActive) return;
  dodgeActive = true;
  const rect = noBtn.getBoundingClientRect();
  noBtn.classList.add("dodging");
  noBtn.style.left = `${rect.left}px`;
  noBtn.style.top = `${rect.top}px`;
  // Re-parent to <body> so its fixed position is always relative to the
  // real viewport — any ancestor with a transform/filter/backdrop-filter
  // would otherwise silently redefine the containing block and send it
  // to the wrong spot (this is what caused the old teleport-off-screen bug).
  document.body.appendChild(noBtn);
  document.addEventListener("pointermove", handlePointerMove);
  // A small startled nudge to the right, not a teleport, so the shift into
  // "dodge mode" reads as a reaction rather than a jump-scare.
  setTimeout(() => {
    const margin = 16;
    const maxLeft = window.innerWidth - rect.width - margin;
    noBtn.style.left = `${Math.min(rect.left + 60, maxLeft)}px`;
  }, 20);
}

function deactivateDodge() {
  dodgeActive = false;
  document.removeEventListener("pointermove", handlePointerMove);
}

// Catches the cursor actually entering the button's box, in case a very
// fast mouse movement jumped past the proximity check in handlePointerMove.
noBtn.addEventListener("pointerenter", (e) => {
  if (dodgeActive) {
    dodgeAwayFrom(e.clientX, e.clientY);
  }
});

noBtn.addEventListener("pointerdown", (e) => {
  if (dodgeActive) {
    e.preventDefault();
    dodgeAwayFrom(e.clientX, e.clientY);
    handleNoInteraction();
  }
});

// Some mobile browsers (older Safari especially) don't reliably suppress
// the synthetic click from preventDefault() on pointerdown alone — this is
// a defensive backstop specifically for touch. It only blocks the ghost
// click; the actual dodge + click-count already happened in pointerdown.
noBtn.addEventListener(
  "touchstart",
  (e) => {
    if (dodgeActive) {
      e.preventDefault();
    }
  },
  { passive: false }
);

noBtn.addEventListener("click", () => {
  if (dodgeActive) return; // pointerdown already handled it
  handleNoInteraction();
});

// Tab+Enter/Space activates a button by keyboard, bypassing the mouse
// entirely — without this, dodging wouldn't stop a keyboard-driven press.
noBtn.addEventListener("keydown", (e) => {
  if (dodgeActive && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    const rect = noBtn.getBoundingClientRect();
    dodgeAwayFrom(rect.left + rect.width / 2, rect.top + rect.height / 2);
    handleNoInteraction();
  }
});

yesBtn.addEventListener("click", () => {
  deactivateDodge();
  noBtn.style.display = "none"; // in case dodge mode moved it to <body>
  setHamster(HAMSTER_HAPPY.yes);
  showScreen("type");
});

/* ---------------- Type screen ---------------- */

let selectedType = null;
const typeOptions = document.getElementById("typeOptions");

typeOptions.addEventListener("click", (e) => {
  const card = e.target.closest(".option-card");
  if (!card) return;
  [...typeOptions.children].forEach((c) => c.classList.remove("selected"));
  card.classList.add("selected");
  selectedType = card.dataset.value;
  setTimeout(() => {
    renderCalendar();
    setHamster(HAMSTER_HAPPY.date);
    showScreen("date");
  }, 350);
});

/* ---------------- Date screen: real calendar picker ---------------- */

const confirmDateBtn = document.getElementById("confirmDateBtn");
const calendarGrid = document.getElementById("calendarGrid");
const monthLabel = document.getElementById("monthLabel");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let selectedDateISO = null;
let selectedDateLabel = null;
let calendarViewDate = new Date();
calendarViewDate.setDate(1);

function formatLabel(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  monthLabel.textContent = calendarViewDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  prevMonthBtn.disabled = isSameMonth(calendarViewDate, today);

  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement("span");
    empty.className = "cal-day empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const iso = toISODate(cellDate);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cal-day";
    btn.textContent = day;
    if (cellDate < today) {
      btn.disabled = true;
    }
    if (selectedDateISO === iso) {
      btn.classList.add("selected");
    }
    btn.addEventListener("click", () => {
      selectedDateISO = iso;
      selectedDateLabel = formatLabel(cellDate);
      confirmDateBtn.disabled = false;
      renderCalendar();
    });
    calendarGrid.appendChild(btn);
  }
}

prevMonthBtn.addEventListener("click", () => {
  calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
  renderCalendar();
});

confirmDateBtn.addEventListener("click", () => {
  setHamster(HAMSTER_HAPPY.confirm);
  showScreen("confirm");
  finalize();
});

/* ---------------- Confirm screen ---------------- */

const confirmSummary = document.getElementById("confirmSummary");
const sendStatus = document.getElementById("sendStatus");
const revealSection = document.getElementById("revealSection");

async function finalize() {
  confirmSummary.textContent = `${selectedType} — ${selectedDateLabel}`;
  launchConfetti();
  setTimeout(() => revealSection.classList.remove("hidden"), 1500);

  const message = `She said YES! 💕\nDate type: ${selectedType}\nDate: ${selectedDateLabel} (${selectedDateISO})`;

  if (NTFY_TOPIC === "REPLACE_WITH_YOUR_NTFY_TOPIC") {
    sendStatus.textContent = "(Notification not configured yet — see README.md)";
    return;
  }

  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      body: message,
      headers: {
        // HTTP header values must be Latin-1 — an emoji here throws
        // immediately and silently kills the whole request before it's sent.
        Title: "She said yes!",
        Tags: "heart,tada",
      },
    });
    sendStatus.textContent = "I've been notified 📲";
  } catch (err) {
    sendStatus.textContent = "Couldn't send the notification — text me just in case 😅";
  }
}

/* ---------------- Decorative: floating hearts + confetti ---------------- */

const floatingHearts = document.getElementById("floatingHearts");
const heartEmojis = ["💗", "💕", "💖", "💓", "💞"];

function spawnHeart() {
  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
  heart.style.left = `${Math.random() * 100}vw`;
  const duration = 6 + Math.random() * 6;
  heart.style.animationDuration = `${duration}s`;
  heart.style.fontSize = `${1 + Math.random() * 1.5}rem`;
  floatingHearts.appendChild(heart);
  setTimeout(() => heart.remove(), duration * 1000);
}

setInterval(spawnHeart, 900);

function launchConfetti() {
  const confettiEl = document.getElementById("confetti");
  const colors = ["#ff6fa5", "#c8a4ff", "#ffb6d5", "#9b6bff", "#ffe1ee"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.width = piece.style.height = `${6 + Math.random() * 6}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    const duration = 2.5 + Math.random() * 2;
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    confettiEl.appendChild(piece);
    setTimeout(() => piece.remove(), (duration + 0.5) * 1000);
  }
}

/* ---------------- PWA: service worker registration ---------------- */
// Required for Chrome to treat this as a real installable PWA — without
// it, "Add to Home Screen" falls back to a shortcut that ignores the
// manifest's icons.

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

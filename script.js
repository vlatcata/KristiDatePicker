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
const sadMessageEl = document.getElementById("sadMessage");

let noClicks = 0;
let dodgeActive = false;

function bumpButtonSizes() {
  const yesScale = Math.min(1 + noClicks * 0.12, 2.2);
  const noScale = Math.max(1 - noClicks * 0.08, 0.5);
  yesBtn.style.transform = `scale(${yesScale})`;
  noBtn.style.transform = `scale(${noScale})`;
}

function handleNoInteraction() {
  noClicks += 1;
  const msg = SAD_MESSAGES[Math.min(noClicks - 1, SAD_MESSAGES.length - 1)];
  sadMessageEl.textContent = msg;
  bumpButtonSizes();
  if (noClicks >= DODGE_AFTER_CLICKS) {
    activateDodge();
  }
}

function relocateNoButton() {
  const rect = noBtn.getBoundingClientRect();
  const margin = 16;
  const maxX = Math.max(window.innerWidth - rect.width - margin, margin);
  const maxY = Math.max(window.innerHeight - rect.height - margin, margin);
  const newX = margin + Math.random() * (maxX - margin);
  const newY = margin + Math.random() * (maxY - margin);
  noBtn.style.left = `${newX}px`;
  noBtn.style.top = `${newY}px`;
}

function handlePointerMove(e) {
  if (!dodgeActive) return;
  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
  if (dist < DODGE_RADIUS) {
    relocateNoButton();
  }
}

function activateDodge() {
  if (dodgeActive) return;
  dodgeActive = true;
  const rect = noBtn.getBoundingClientRect();
  noBtn.classList.add("dodging");
  noBtn.style.left = `${rect.left}px`;
  noBtn.style.top = `${rect.top}px`;
  document.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("scroll", relocateNoButton, { passive: true });
}

function deactivateDodge() {
  dodgeActive = false;
  document.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("scroll", relocateNoButton);
}

noBtn.addEventListener("pointerdown", (e) => {
  if (dodgeActive) {
    e.preventDefault();
    relocateNoButton();
    handleNoInteraction();
  }
});

noBtn.addEventListener("click", () => {
  if (dodgeActive) return; // pointerdown already handled it
  handleNoInteraction();
});

yesBtn.addEventListener("click", () => {
  deactivateDodge();
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
  showScreen("confirm");
  finalize();
});

/* ---------------- Confirm screen ---------------- */

const confirmSummary = document.getElementById("confirmSummary");
const sendStatus = document.getElementById("sendStatus");

async function finalize() {
  confirmSummary.textContent = `${selectedType} — ${selectedDateLabel}`;
  launchConfetti();

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
        Title: "She said yes! 💕",
        Tags: "heart,tada",
      },
    });
    sendStatus.textContent = "He's been told 📲";
  } catch (err) {
    sendStatus.textContent = "Couldn't send the notification — text him just in case 😅";
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

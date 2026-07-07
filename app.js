const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- scroll reveal ---------- */
const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);

revealItems.forEach((item) => {
  const siblings = Array.from(item.parentElement?.children || []).filter((el) =>
    el.classList.contains("reveal")
  );
  const index = siblings.indexOf(item);
  item.style.transitionDelay = `${Math.min(Math.max(index, 0), 5) * 80}ms`;
  revealObserver.observe(item);
});

/* ---------- header scroll state ---------- */
const header = document.querySelector("[data-header]");
const onScroll = () => {
  if (!header) return;
  header.toggleAttribute("data-scrolled", window.scrollY > 24);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- animated counters ---------- */
function animateCount(el) {
  const target = parseFloat(el.dataset.count || "0");
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  const format = (v) =>
    `${prefix}${v.toLocaleString("ru-RU", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  if (prefersReduced || target === 0) {
    el.textContent = format(target);
    return;
  }

  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(target * eased);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = format(target);
  }
  requestAnimationFrame(step);
}

const counters = document.querySelectorAll("[data-count]");
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
counters.forEach((c) => countObserver.observe(c));

/* ---------- cursor glow ---------- */
const glow = document.querySelector(".cursor-glow");
if (glow && window.matchMedia("(pointer: fine)").matches && !prefersReduced) {
  let gx = window.innerWidth / 2;
  let gy = window.innerHeight / 2;
  let cx = gx;
  let cy = gy;

  window.addEventListener("mousemove", (e) => {
    gx = e.clientX;
    gy = e.clientY;
    glow.style.opacity = "1";
  });

  const loop = () => {
    cx += (gx - cx) * 0.12;
    cy += (gy - cy) * 0.12;
    glow.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();
}

/* ---------- magnetic buttons ---------- */
if (window.matchMedia("(pointer: fine)").matches && !prefersReduced) {
  document.querySelectorAll(".magnetic").forEach((btn) => {
    const strength = 0.3;
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * strength}px, ${y * strength - 2}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  /* ---------- 3d tilt ---------- */
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const max = 7;
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- calculator ---------- */
const priceFormat = new Intl.NumberFormat("ru-RU");
const calcPrice = document.querySelector("#calcPrice");
const calcCaption = document.querySelector("#calcCaption");
const widthInput = document.querySelector("#gateWidth");
const heightInput = document.querySelector("#gateHeight");
const widthValue = document.querySelector("#widthValue");
const heightValue = document.querySelector("#heightValue");
const brandSelect = document.querySelector("#brandSelect");
const automationToggle = document.querySelector("#automationToggle");

function currentTypeButton() {
  return document.querySelector('[data-calc-group="type"] .chip.active');
}

function formatMeters(value) {
  return `${Number(value).toFixed(1).replace(".", ",")} м`;
}

function selectedBrandName() {
  const selected = brandSelect?.selectedOptions?.[0]?.textContent || "DoorHan";
  return selected.split(" — ")[0].split(" - ")[0];
}

function updateRangeFill(input) {
  if (!input) return;
  const min = Number(input.min);
  const max = Number(input.max);
  const pct = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty("--range-fill", `${pct}%`);
}

function updateCalculator() {
  if (!calcPrice || !widthInput || !heightInput || !brandSelect) return;

  const typeButton = currentTypeButton();
  const base = Number(typeButton?.dataset.price || 0);
  const brandDelta = Number(brandSelect.value || 0);
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);
  const automation = automationToggle?.checked ? 0 : -18000;
  const sizeDelta = Math.max(0, width * height - 7.2) * 9200;
  const total = Math.max(54000, Math.round((base + brandDelta + automation + sizeDelta) / 1000) * 1000);

  widthValue.textContent = formatMeters(width);
  heightValue.textContent = formatMeters(height);
  calcPrice.textContent = priceFormat.format(total);
  calcCaption.textContent = `${typeButton?.dataset.label || "ворота"} ${selectedBrandName()} под ключ`;

  updateRangeFill(widthInput);
  updateRangeFill(heightInput);
}

document.querySelectorAll('[data-calc-group="type"]').forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest(".chip");
    if (!button) return;
    group.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
    button.classList.add("active");
    updateCalculator();
  });
});

[widthInput, heightInput, brandSelect, automationToggle].forEach((control) => {
  control?.addEventListener("input", updateCalculator);
  control?.addEventListener("change", updateCalculator);
});

updateCalculator();

/* ---------- catalog filter chips ---------- */
document.querySelectorAll("[data-cat-group]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const chip = event.target.closest(".cat-chip");
    if (!chip) return;
    group.querySelectorAll(".cat-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
  });
});

/* ---------- photo slots: click to load your own image (preview helper) ---------- */
function wirePhotoUpload(el, apply) {
  el.classList.add("uploadable");
  const hint = document.createElement("span");
  hint.className = "upload-hint";
  hint.textContent = "📷 Загрузить фото";
  el.appendChild(hint);

  el.addEventListener("click", (event) => {
    event.preventDefault();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        apply(el, reader.result);
        hint.textContent = "📷 Заменить фото";
      };
      reader.readAsDataURL(file);
    });
    input.click();
  });
}

document.querySelectorAll(".photo-slot").forEach((slot) => {
  wirePhotoUpload(slot, (el, url) => {
    el.style.backgroundImage = `url("${url}")`;
    el.classList.add("has-photo");
  });
});

document.querySelectorAll(".cat-card").forEach((card) => {
  wirePhotoUpload(card, (el, url) => {
    el.style.setProperty("--photo", `url("${url}")`);
    el.classList.add("has-photo");
  });
});

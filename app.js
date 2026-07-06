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
  { threshold: 0.14 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(item);
});

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
  return selected.split(" - ")[0];
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

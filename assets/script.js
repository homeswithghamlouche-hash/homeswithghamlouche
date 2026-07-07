/* ============================================
   homeswithghamlouche — shared behavior
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  document.querySelectorAll(".plat-field").forEach(el => injectPlatMap(el));
  initListings();
  initValuation();
  initLeadForms();
});

/* ---------- nav ---------- */

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));
}

/* ---------- plat-map signature graphic ----------
   Generates an abstract survey-plat style line drawing:
   a grid of streets with irregular lot subdivisions and
   small pin markers, seeded per-instance for variety.
   Purely decorative, original geometry (not a real map). */

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function injectPlatMap(container) {
  const seed = parseInt(container.dataset.seed || "7", 10);
  const rand = seededRandom(seed * 13 + 1);
  const w = 1200, h = 800;
  let svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`;

  const vLines = 6, hLines = 4;
  const vPos = [];
  for (let i = 0; i <= vLines; i++) vPos.push(Math.round((w / vLines) * i + (rand() - 0.5) * 40));
  const hPos = [];
  for (let i = 0; i <= hLines; i++) hPos.push(Math.round((h / hLines) * i + (rand() - 0.5) * 30));

  vPos.forEach(x => { svg += `<line class="plat-line" x1="${x}" y1="0" x2="${x}" y2="${h}" />`; });
  hPos.forEach(y => { svg += `<line class="plat-line" x1="0" y1="${y}" x2="${w}" y2="${y}" />`; });

  // subdivided lot lines inside each block
  for (let i = 0; i < vPos.length - 1; i++) {
    for (let j = 0; j < hPos.length - 1; j++) {
      if (rand() > 0.45) continue;
      const x0 = vPos[i], x1 = vPos[i + 1], y0 = hPos[j], y1 = hPos[j + 1];
      const midX = Math.round(x0 + (x1 - x0) * (0.3 + rand() * 0.4));
      svg += `<line class="plat-line" x1="${midX}" y1="${y0}" x2="${midX}" y2="${y1}" opacity="0.5" />`;
      if (rand() > 0.5) {
        const midY = Math.round(y0 + (y1 - y0) * (0.3 + rand() * 0.4));
        svg += `<line class="plat-line" x1="${x0}" y1="${midY}" x2="${x1}" y2="${midY}" opacity="0.5" />`;
      }
    }
  }

  // pin markers at a few intersections
  const pinCount = 5;
  for (let p = 0; p < pinCount; p++) {
    const x = vPos[Math.floor(rand() * vPos.length)];
    const y = hPos[Math.floor(rand() * hPos.length)];
    svg += `<circle class="plat-pin" cx="${x}" cy="${y}" r="4" opacity="0.7" />`;
  }

  svg += `</svg>`;
  container.innerHTML = svg;
}

/* ---------- sample listings (stand-in for MLS/IDX feed) ---------- */

const SAMPLE_LISTINGS = [
  { addr: "4218 Maple Grove Ave", city: "Dearborn", status: "New", price: 289900, beds: 4, baths: 2.5, sqft: 2140, type: "Single Family" },
  { addr: "7731 Silvery Ln", city: "Dearborn Heights", status: "New", price: 214500, beds: 3, baths: 2, sqft: 1580, type: "Single Family" },
  { addr: "22960 Warren Ave", city: "Dearborn", status: "Pending", price: 349000, beds: 5, baths: 3, sqft: 2680, type: "Single Family" },
  { addr: "6014 Colson St", city: "Dearborn Heights", status: "Active", price: 198000, beds: 3, baths: 1.5, sqft: 1320, type: "Single Family" },
  { addr: "3345 Neckel St", city: "Dearborn", status: "Active", price: 259900, beds: 3, baths: 2, sqft: 1750, type: "Single Family" },
  { addr: "9820 Beech Daly Rd", city: "Dearborn Heights", status: "New", price: 232000, beds: 4, baths: 2, sqft: 1890, type: "Single Family" },
  { addr: "2210 Yinger Ave", city: "Dearborn", status: "Active", price: 315000, beds: 4, baths: 3, sqft: 2320, type: "Single Family" },
  { addr: "26150 Ann Arbor Trl", city: "Dearborn Heights", status: "Pending", price: 275000, beds: 4, baths: 2.5, sqft: 2050, type: "Condo" },
  { addr: "5590 Roosevelt St", city: "Dearborn", status: "New", price: 179900, beds: 2, baths: 1, sqft: 1050, type: "Condo" },
];

function initListings() {
  const grid = document.querySelector("#listing-grid");
  if (!grid) return;

  const cityFilter = document.querySelector("#filter-city");
  const priceFilter = document.querySelector("#filter-price");
  const bedFilter = document.querySelector("#filter-beds");
  const countLabel = document.querySelector("#result-count");

  function render() {
    const city = cityFilter.value;
    const maxPrice = priceFilter.value ? parseInt(priceFilter.value, 10) : Infinity;
    const minBeds = bedFilter.value ? parseInt(bedFilter.value, 10) : 0;

    const results = SAMPLE_LISTINGS.filter(l =>
      (city === "all" || l.city === city) &&
      l.price <= maxPrice &&
      l.beds >= minBeds
    );

    countLabel.textContent = `${results.length} listing${results.length === 1 ? "" : "s"}`;

    grid.innerHTML = results.map((l, i) => `
      <div class="listing-card">
        <div class="listing-photo">
          <span class="listing-status">${l.status}</span>
          <div class="plat-field" data-seed="${i + 3}" style="color: var(--line-on-dark);"></div>
        </div>
        <div class="listing-body">
          <div class="listing-price">$${l.price.toLocaleString()}</div>
          <div class="listing-addr">${l.addr}</div>
          <div class="listing-city">${l.city}, MI</div>
          <div class="listing-specs">
            <span>${l.beds} bd</span>
            <span>${l.baths} ba</span>
            <span>${l.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll(".plat-field").forEach(el => injectPlatMap(el));
  }

  [cityFilter, priceFilter, bedFilter].forEach(el => el.addEventListener("change", render));
  render();
}

/* ---------- home valuation estimator (illustrative only) ---------- */

function initValuation() {
  const form = document.querySelector("#valuation-form");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const city = form.querySelector("#val-city").value;
    const sqft = parseInt(form.querySelector("#val-sqft").value, 10) || 1500;
    const beds = parseInt(form.querySelector("#val-beds").value, 10) || 3;
    const condition = form.querySelector("#val-condition").value;

    const baseRate = city === "Dearborn" ? 148 : 122; // $/sqft baseline, illustrative
    const conditionMult = { updated: 1.12, average: 1.0, dated: 0.88 }[condition] || 1.0;
    const bedBump = Math.max(0, beds - 3) * 6000;

    const estimate = Math.round((sqft * baseRate * conditionMult + bedBump) / 500) * 500;
    const low = Math.round((estimate * 0.94) / 500) * 500;
    const high = Math.round((estimate * 1.06) / 500) * 500;

    document.querySelector("#val-estimate").textContent =
      `$${low.toLocaleString()} – $${high.toLocaleString()}`;

    document.querySelector("#valuation-result").classList.add("show");
    document.querySelector("#valuation-result").scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ---------- lead capture forms (contact + valuation lead-in) ----------
   Submits to /api/lead, a Vercel serverless function that emails
   the lead to homeswithghamlouche@gmail.com via Resend.
   See api/lead.js and README.md for setup. */

function initLeadForms() {
  document.querySelectorAll("form[data-lead-form]").forEach(form => {
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const panel = form.closest(".form-panel") || form.parentElement;
      const success = panel.querySelector(".form-success") || document.querySelector(`#${form.dataset.successTarget}`);
      const submitBtn = form.querySelector("button[type=submit]");
      const originalLabel = submitBtn ? submitBtn.textContent : "";

      const data = Object.fromEntries(new FormData(form));
      data.formType = form.dataset.formType || "contact";

      // include the estimate shown on-screen, if this is the valuation form
      const estimateEl = document.querySelector("#val-estimate");
      if (data.formType === "valuation" && estimateEl) {
        data.estimate = estimateEl.textContent;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        const resp = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await resp.json();

        if (result.ok) {
          form.style.display = "none";
          if (success) success.classList.add("show");
        } else {
          throw new Error(result.error || "Something went wrong.");
        }
      } catch (err) {
        console.error("Lead submission failed:", err);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
        alert("Something went wrong sending that — please call or text 313-578-1019, or try again in a moment.");
      }
    });
  });
}

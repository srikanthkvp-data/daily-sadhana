/* =========================
   LOCATION CONFIG
========================= */

const LOCATIONS = {
  hyderabad: {
    DIRECTION: "శ్రీశైలస్య ఉత్తర దిశాభాగే",
    RIVERS: "కృష్ణా గోదావరీ నద్యోః మధ్య ప్రదేశే"
  },
  tenali: {
    DIRECTION: "శ్రీశైలస్య పూర్వ దిశాభాగే",
    RIVERS: "కృష్ణా గోదావరీ నద్యోః మధ్య ప్రదేశే"
  }
};

function applyLocation(text, locationKey) {
  const loc = LOCATIONS[locationKey];
  return text
    .replace("{{DIRECTION}}", loc.DIRECTION)
    .replace("{{RIVERS}}", loc.RIVERS);
}

/* =========================
   GSHEET CONFIG
========================= */

const GSHEET_URL =
  "https://opensheet.elk.sh/1XpiN8e3z33L3zKmuUZ9sp9KNXfIB7cOyvny5LzzIwzQ/Sheet1";

function todayISO_IST() {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  return istDate.toISOString().split("T")[0];
}


async function getTodayPanchanga() {
  const res = await fetch(GSHEET_URL);
  const rows = await res.json();

  const today = todayISO_IST();
  console.log("Looking for date:", today);

  return rows.find(r => r.date === today) || null;

}

/* =========================
   SANKALPA PLACEHOLDERS
========================= */

function applyPanchanga(text, row) {
  if (!row) return text;

  return text
    .replace("{{SAMVATSARA}}", row.samvatsara)
    .replace("{{AYANA}}", row.ayana)
    .replace("{{RITU}}", row.ritu)
    .replace("{{MASA}}", row.masa)
    .replace("{{PAKSHA}}", row.paksha)
    .replace("{{TITHI}}", row.tithi)
    .replace("{{VARA}}", row.vara)
    .replace("{{NAKSHATRA}}", row.nakshatra)
    .replace("{{YOGA}}", row.yoga)
    .replace("{{KARANA}}", row.karana);
}

/* =========================
   CLOSING LOGIC
========================= */

function shouldShowClosing(order, note) {
  if (!note) return order === 25;

  if (note === "EKADASI") return order === 25;
  if (note === "AMAVASYA") return order === 26;
  if (note === "PURNIMA") return order === 27;
  if (note === "EVEN") return order === 25;
  if (note === "ODD") return order === 26;

  return false;
}

/* =========================
   RENDER MANTRAS
========================= */

fetch("mantras.json")
  .then(res => res.json())
  .then(async data => {
    const container = document.getElementById("mantras");
    const locationSelect = document.getElementById("location");

    const todayRow = await getTodayPanchanga();

    function render(selectedLocation) {
      container.innerHTML = "";

      Object.values(data)
        .sort((a, b) => a.order - b.order)
        .forEach(m => {
          if (m.visible === false) return;

          // closing logic
          if (m.type === "closing") {
            if (!shouldShowClosing(m.order, todayRow?.notes)) return;
          }

          let text = m.text;

          if (m.type === "section") {
            const div = document.createElement("div");
            div.className = "section-heading";
            div.innerHTML = `
              <h2>${m.title}</h2>
              <div class="section-subtitle">${m.subtitle}</div>
            `;
            container.appendChild(div);
            return;
          }

          // Sankalpa = order 6
          if (m.order === 6) {
            text = applyLocation(text, selectedLocation);
            text = applyPanchanga(text, todayRow);
          }

          const section = document.createElement("section");
          section.classList.add("mantra-section");

          if (m.type === "closing") {
            section.classList.add("closing");
          }

          section.innerHTML = `
            <h2>${m.title}</h2>
            ${m.note ? `<div class="mantra-note">${m.note}</div>` : ""}
            <pre>${text}</pre>
          `;

          container.appendChild(section);

        });

      /* =========================
         FOCUS MODE
      ========================= */

      const sections = document.querySelectorAll(".mantra-section");

      sections.forEach(s => s.classList.add("focus-dim"));

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              sections.forEach(s => {
                s.classList.add("focus-dim");
                s.classList.remove("focus-active");
              });
              entry.target.classList.remove("focus-dim");
              entry.target.classList.add("focus-active");
            }
          });
        },
        { threshold: 0.6 }
      );

      sections.forEach(s => observer.observe(s));
    }

    render(locationSelect.value);

    locationSelect.addEventListener("change", () => {
      render(locationSelect.value);
    });

    /* =========================
       FOCUS MODE TOGGLE
    ========================= */

    const focusToggle = document.getElementById("focusToggle");
    if (focusToggle) {
      document.body.classList.add("focus-on");

      focusToggle.addEventListener("change", () => {
        if (focusToggle.checked) {
          document.body.classList.add("focus-on");
        } else {
          document.body.classList.remove("focus-on");
          document
            .querySelectorAll(".mantra-section")
            .forEach(s =>
              s.classList.remove("focus-dim", "focus-active")
            );
        }
      });
    }
  })
  .catch(err => {
    console.error("Failed to load data", err);
  });

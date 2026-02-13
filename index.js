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

function applyLocationToSankalpa(text, locationKey) {
  const loc = LOCATIONS[locationKey];
  return text
    .replace("{{DIRECTION}}", loc.DIRECTION)
    .replace("{{RIVERS}}", loc.RIVERS);
}

/* =========================
   RENDER MANTRAS
========================= */

fetch("mantras.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("mantras");
    const locationSelect = document.getElementById("location");

    function render(selectedLocation) {
      container.innerHTML = "";

      Object.values(data)
        .sort((a, b) => a.order - b.order)
        .forEach(m => {
          if (m.visible === false) return;
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


          // Only Sankalpa (order 5) gets location substitution
          if (m.order === 5) {
            text = applyLocationToSankalpa(text, selectedLocation);
          }

          const section = document.createElement("section");

          // base class
          section.classList.add("mantra-section");

          // add special class if this is a closing
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
            FOCUS MODE (SCROLL)
          ========================= */

          const sections = document.querySelectorAll(".mantra-section");

          sections.forEach(s => {
            s.classList.add("focus-dim");
            s.classList.remove("focus-active");
          });

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

          sections.forEach(section => observer.observe(section));

    }

    // Initial render
    render(locationSelect.value);

        /* =========================
       FOCUS MODE TOGGLE
    ========================= */

    const focusToggle = document.getElementById("focusToggle");

    // default: focus ON
    document.body.classList.add("focus-on");

    focusToggle.addEventListener("change", () => {
      if (focusToggle.checked) {
        document.body.classList.add("focus-on");
      } else {
        document.body.classList.remove("focus-on");

        // reset any dimming
        document.querySelectorAll(".mantra-section").forEach(s => {
          s.classList.remove("focus-dim", "focus-active");
        });
      }
    });


    // Re-render on location change
    locationSelect.addEventListener("change", () => {
      render(locationSelect.value);
    });
  })
  .catch(err => {
    console.error("Failed to load mantras.json", err);
  });

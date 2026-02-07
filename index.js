fetch("mantras.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("mantras");

    Object.values(data)
      .sort((a, b) => a.order - b.order)
      .forEach(m => {
        const section = document.createElement("section");
        section.className = "mantra-section";

        section.innerHTML = `
          <h2>${m.title}</h2>
          <pre>${m.text}</pre>
        `;

        container.appendChild(section);
      });
  });

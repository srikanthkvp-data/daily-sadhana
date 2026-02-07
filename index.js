fetch("mantras.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("mantras");

    Object.values(data).forEach(m => {
      const div = document.createElement("div");
      div.innerHTML = `<h3>${m.title}</h3><p>${m.text}</p>`;
      container.appendChild(div);
    });
  });

document.getElementById("generate").onclick = () => {
  document.getElementById("sankalpa").textContent =
    "Saṅkalpa will appear here.";
};

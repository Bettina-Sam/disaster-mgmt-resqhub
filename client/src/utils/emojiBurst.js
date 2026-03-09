export default function emojiBurst({ x, y, emoji = "🌊", count = 14 }) {
  const make = (dx, dy, rot) => {
    const el = document.createElement("div");
    el.className = "emoji-pop";
    el.textContent = emoji;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty("--dx", `${dx}px`);
    el.style.setProperty("--dy", `${dy}px`);
    el.style.setProperty("--rot", `${rot}deg`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  };

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 40 + Math.random() * 80;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * (radius * 0.7) + 40; // slightly downward
    const rot = Math.random() * 120 - 60;
    setTimeout(() => make(dx, dy, rot), i * 12); // nice staggering
  }
}

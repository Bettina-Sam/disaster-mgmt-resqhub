// client/src/components/academy/MaterialCard.jsx
import { useNavigate } from "react-router-dom";
import emojiBurst from "../../utils/emojiBurst";

export default function MaterialCard({ m }) {
  const nav = useNavigate();

  const openMaterial = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    // center-top of the button, adjust for scrollY
    const x = r.left + r.width / 2;
    const y = r.top + window.scrollY + 10;
    //emojiBurst({ x, y, emoji: m.hero || "📘", count: 16 });
    setTimeout(() => nav(`/academy/lesson/${m.id}`), 100); // tiny delay feels nice
  };

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        {/* ... your existing header/summary/tags ... */}

        <div className="mt-auto d-flex justify-content-end gap-2">
          <button className="btn btn-sm btn-outline-primary" onClick={openMaterial}>
            Open material
          </button>
          {/* your Take quiz button if present */}
        </div>
      </div>
    </div>
  );
}

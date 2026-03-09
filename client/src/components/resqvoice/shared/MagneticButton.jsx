import { motion, useMotionValue, useTransform } from "framer-motion";

export default function MagneticButton({ children, onClick, className = "" }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useTransform(y, [-30, 30], [6, -6]);
  const ry = useTransform(x, [-30, 30], [-6, 6]);

  return (
    <motion.button
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - (r.left + r.width / 2));
        y.set(e.clientY - (r.top + r.height / 2));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x, y, rotateX: rx, rotateY: ry }}
      onClick={onClick}
      className={`rounded-full px-6 py-3 bg-sky-600 text-white shadow-[0_12px_30px_rgba(2,132,199,.35)] active:scale-95 transition ${className}`}
    >
      {children}
    </motion.button>
  );
}

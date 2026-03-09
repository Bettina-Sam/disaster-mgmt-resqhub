import { motion } from "framer-motion";

export default function FloatCard({ children, className = "", intensity = 4 }) {
  return (
    <motion.div
      className={`rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md shadow-[0_14px_36px_rgba(12,18,36,.35)] ${className}`}
      animate={{ y: [0, -intensity, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

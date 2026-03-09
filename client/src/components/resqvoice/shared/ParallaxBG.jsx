import { motion, useScroll, useTransform } from "framer-motion";

// Small helper so we don't repeat style objects
function Orb({ top, left, size, color, y }) {
  return (
    <motion.div
      style={{
        y,
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent 60%)`,
      }}
      className="absolute rounded-full blur-3xl opacity-25"
      // position & size via inline style so it's easy to tweak per orb
      // (could also be done with Tailwind arbitrary values)
      // eslint-disable-next-line react/style-prop-object
      // ^ not needed if you don't use eslint-plugin-react
      {...{
        style: {
          y,
          background: `radial-gradient(circle at 30% 30%, ${color}, transparent 60%)`,
          top,
          left,
          width: size,
          height: size,
          borderRadius: "9999px",
          filter: "blur(48px)",
          opacity: 0.25,
          position: "absolute",
          pointerEvents: "none",
        },
      }}
    />
  );
}

export default function ParallaxBG() {
  const { scrollY } = useScroll();
  const yFar = useTransform(scrollY, [0, 600], [0, -40]); // far layer
  const yNear = useTransform(scrollY, [0, 600], [0, -80]); // near layer

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Orbs (one uses far parallax, one uses near parallax) */}
      <Orb top="8%"  left="-3%" size="18rem" color="rgba(99,102,241,.45)"  y={yFar} />
      <Orb top="18%" left="78%" size="16rem" color="rgba(56,189,248,.45)" y={yNear} />
      <Orb top="72%" left="12%" size="14rem" color="rgba(167,139,250,.45)" y={yFar} />

      {/* Sparkles */}
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-[2px] w-[2px] rounded-full bg-white/80"
          style={{
            top: `${6 + Math.random() * 88}%`,
            left: `${6 + Math.random() * 88}%`,
          }}
          animate={{ opacity: [0, 0.9, 0], y: [0, -8, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

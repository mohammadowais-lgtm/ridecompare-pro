import { motion, useReducedMotion } from "framer-motion";

/** Quiet city-map backdrop: faint street grid with route lines that slowly draw and travel. */
const ROUTES = [
  "M-40 180 C 180 120, 260 320, 520 260 S 900 120, 1300 220",
  "M-40 620 C 220 560, 380 760, 640 680 S 1040 520, 1300 600",
  "M200 -40 C 260 200, 120 380, 300 560 S 420 900, 360 1100",
  "M1000 -40 C 940 220, 1100 420, 960 640 S 880 940, 1020 1100",
];

export function AnimatedBackdrop() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg className="h-full w-full" viewBox="0 0 1260 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="rc-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="var(--border)" strokeWidth="1" />
          </pattern>
          <radialGradient id="rc-fade" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="rc-mask">
            <rect width="100%" height="100%" fill="url(#rc-fade)" />
          </mask>
        </defs>
        <g mask="url(#rc-mask)" opacity="0.7">
          <rect width="100%" height="100%" fill="url(#rc-grid)" />
          {ROUTES.map((d, i) => (
            <g key={i}>
              <path d={d} fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" />
              <motion.path
                d={d}
                fill="none"
                stroke="var(--primary)"
                strokeOpacity="0.35"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, pathOffset: 0 }}
                animate={reduce ? { pathLength: 0.25 } : { pathLength: [0, 0.25, 0.25, 0], pathOffset: [0, 0, 0.75, 1] }}
                transition={{ duration: 9 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.6 }}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

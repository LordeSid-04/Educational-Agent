import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { CM } from '@/constants/testIds';

// macOS-style magnetic dock. Cursor-following magnification + tooltips + active dot.
export function MagneticDock({ items, iconSize = 52, maxScale = 1.7, magneticDistance = 140 }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      data-testid={CM.dock}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-end gap-3 px-4 py-3 rounded-3xl glass-strong shadow-2xl"
    >
      {items.map((item) => (
        <DockItem
          key={item.id}
          item={item}
          mouseX={mouseX}
          iconSize={iconSize}
          maxScale={maxScale}
          magneticDistance={magneticDistance}
        />
      ))}
    </motion.div>
  );
}

function DockItem({ item, mouseX, iconSize, maxScale, magneticDistance }) {
  const ref = React.useRef(null);
  const [hovered, setHovered] = React.useState(false);

  const distance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { left: 0, width: 0 };
    return val - rect.left - rect.width / 2;
  });
  const scaleT = useTransform(distance, [-magneticDistance, 0, magneticDistance], [1, maxScale, 1]);
  const scale = useSpring(scaleT, { damping: 20, stiffness: 300, mass: 0.5 });
  const size = useTransform(scale, (s) => s * iconSize);
  const yT = useTransform(scale, (s) => (s - 1) * -10);
  const y = useSpring(yT, { damping: 20, stiffness: 300, mass: 0.5 });
  const Icon = item.icon;

  return (
    <motion.button
      ref={ref}
      data-testid={CM.dockItem(item.id)}
      onClick={item.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: size, height: size, y }}
      whileTap={{ scale: 0.9 }}
      className="relative flex items-center justify-center"
    >
      <div
        className={`relative w-full h-full rounded-2xl flex items-center justify-center border transition-colors duration-200 ${
          item.active
            ? 'bg-cyan/15 border-cyan/50'
            : 'bg-white/[0.06] border-white/10 hover:bg-white/10'
        }`}
      >
        <div style={{ width: '52%', height: '52%' }} className="flex items-center justify-center">
          <Icon className={item.active ? 'text-cyan w-full h-full' : 'text-white/85 w-full h-full'} strokeWidth={2} />
        </div>
      </div>

      <AnimatePresence>
        {item.active && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan"
            style={{ boxShadow: '0 0 8px #00F0FF' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-11 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg glass-strong text-white text-xs font-medium whitespace-nowrap pointer-events-none"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default MagneticDock;

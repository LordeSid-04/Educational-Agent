import { motion } from 'framer-motion';

// A spinning vinyl record reflecting the track currently "playing".
export default function VinylRecord({ title = 'NIGHT RIDE', artist = 'The Midnight Hour', size = 150, className = '' }) {
  return (
    <div className={`relative ${className}`} style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* neon light streaks behind */}
        <div
          className="absolute -inset-6 rounded-full blur-2xl opacity-60"
          style={{ background: 'conic-gradient(from 0deg,#FF003C,#FF5C00,#00F0FF,#FF003C)' }}
        />
        <motion.div
          className="relative rounded-full vinyl-grooves shadow-2xl"
          style={{ width: size, height: size }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 4 }}
        >
          {/* light streak on the disc */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 200deg, transparent 0deg, rgba(255,0,60,0.55) 30deg, rgba(0,240,255,0.45) 70deg, transparent 120deg)',
              mixBlendMode: 'screen',
            }}
          />
          {/* center label */}
          <div className="absolute inset-0 m-auto rounded-full bg-magenta/90 flex items-center justify-center"
               style={{ width: size * 0.34, height: size * 0.34 }}>
            <div className="w-2 h-2 rounded-full bg-ink" />
          </div>
        </motion.div>
      </div>
      <div className="mt-3 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="flex gap-0.5 items-end h-3" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-0.5 bg-cyan"
                animate={{ height: ['30%', '100%', '50%', '90%', '30%'] }}
                transition={{ repeat: Infinity, duration: 0.9 + i * 0.2 }}
                style={{ height: '40%' }}
              />
            ))}
          </span>
          <span className="text-[10px] tracking-[0.25em] text-cyan uppercase">Now Playing</span>
        </div>
        <div className="text-white text-sm font-bold tracking-wide mt-1">{title}</div>
        <div className="text-ash text-[11px]">{artist}</div>
      </div>
    </div>
  );
}

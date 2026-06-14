import { useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { CM } from '@/constants/testIds';

// A scroll-driven 3D "coverflow" track. Items surf along a perspective rail.
export default function CollectionSurfer({ items = [], onSelect, accent = '#00F0FF' }) {
  const scrollerRef = useRef(null);
  const cardRefs = useRef([]);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    cardRefs.current.forEach((card) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = cardCenter - center;
      const rot = Math.max(-55, Math.min(55, -dist * 0.06));
      const z = -Math.abs(dist) * 0.45;
      const scale = Math.max(0.78, 1 - Math.abs(dist) * 0.0007);
      const op = Math.max(0.35, 1 - Math.abs(dist) * 0.0014);
      card.style.transform = `rotateY(${rot}deg) translateZ(${z}px) scale(${scale})`;
      card.style.opacity = op;
      card.style.zIndex = String(1000 - Math.round(Math.abs(dist)));
    });
  }, []);

  useEffect(() => {
    update();
    const el = scrollerRef.current;
    if (!el) return;
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
    };
  }, [update, items.length]);

  const nudge = (dir) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full" style={{ perspective: '1600px' }}>
      <button
        onClick={() => nudge(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 grid place-items-center rounded-full glass-strong hover:scale-110 transition-transform"
        aria-label="previous"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => nudge(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 grid place-items-center rounded-full glass-strong hover:scale-110 transition-transform"
        aria-label="next"
      >
        <ChevronRight size={20} />
      </button>

      <div
        ref={scrollerRef}
        className="flex items-center gap-8 overflow-x-auto no-scrollbar py-16 px-[40%]"
        style={{ transformStyle: 'preserve-3d', scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, i) => (
          <button
            key={item.id}
            ref={(n) => (cardRefs.current[i] = n)}
            data-testid={CM.surferCard(item.id)}
            onClick={() => onSelect?.(item)}
            className="group relative shrink-0 w-[260px] h-[340px] rounded-2xl overflow-hidden text-left will-change-transform"
            style={{ scrollSnapAlign: 'center', transition: 'transform 0.15s ease-out, opacity 0.15s' }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.55] group-hover:brightness-90 transition-all duration-500"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            <div
              className="absolute inset-0 rounded-2xl border-2 transition-colors duration-300"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            />
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: `inset 0 0 0 2px ${accent}, 0 0 40px ${accent}55` }}
            />
            <div className="absolute top-3 left-3 font-mono text-[10px] text-white/60">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-1.5 mb-2">
                <Layers size={13} style={{ color: accent }} />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: accent }}>
                  {item.tag || 'Collection'}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl leading-tight">{item.title}</h3>
              {item.meta && <p className="text-ash text-xs mt-1 font-mono">{item.meta}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

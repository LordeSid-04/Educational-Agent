import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RefreshCw } from 'lucide-react';
import { CM } from '@/constants/testIds';

// Brutalist black & white renderer for the agent's structured lesson segments.
export default function Whiteboard({ segments = [], onContinue }) {
  return (
    <div data-testid={CM.whiteboard} className="relative">
      {segments.map((seg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
          className="mb-7"
        >
          <Segment seg={seg} onContinue={onContinue} />
        </motion.div>
      ))}
    </div>
  );
}

function Segment({ seg, onContinue }) {
  switch (seg.type) {
    case 'heading':
      return (
        <h2 className="text-3xl sm:text-4xl tracking-tight text-ink border-b-4 border-ink pb-3 font-normal lowercase">
          {seg.content.text}
        </h2>
      );
    case 'text':
      return <p className="text-ink/90 leading-relaxed text-[17px] max-w-3xl">{seg.content.text}</p>;
    case 'step_marker':
      return (
        <div className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-1.5 rounded-sm font-mono text-xs tracking-[0.2em] uppercase">
          {seg.content.text}
        </div>
      );
    case 'math':
      return (
        <div className={`${seg.content.display ? 'text-center' : ''} my-2`}>
          <span className="inline-block bg-ink text-paper px-6 py-4 rounded font-mono text-xl tracking-wide whiteboard-shadow">
            {seg.content.latex}
          </span>
        </div>
      );
    case 'table':
      return <TableSeg content={seg.content} />;
    case 'diagram':
      return <DiagramSeg content={seg.content} />;
    case 'graph':
      return <GraphSeg content={seg.content} />;
    case 'network':
      return <NetworkSeg content={seg.content} />;
    case 'checkpoint':
      return <Checkpoint content={seg.content} onContinue={onContinue} />;
    default:
      return null;
  }
}

function TableSeg({ content }) {
  return (
    <div className="overflow-hidden rounded border-2 border-ink whiteboard-shadow inline-block">
      <table className="text-sm">
        <thead>
          <tr className="bg-ink text-paper">
            {content.headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left font-mono uppercase text-xs tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, r) => (
            <tr key={r} className={r % 2 ? 'bg-ink/5' : ''}>
              {row.map((cell, c) => (
                <td key={c} className="px-4 py-2.5 border-t border-ink/20 text-ink/90">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Frame({ children, label }) {
  return (
    <div className="inline-block max-w-full">
      <div className="rounded border-2 border-ink bg-paper whiteboard-shadow overflow-hidden">
        <div className="halftone-dark opacity-30 absolute" />
        {children}
      </div>
      {label && <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50 mt-2">{label}</p>}
    </div>
  );
}

function DiagramSeg({ content }) {
  const els = content.elements || [];
  return (
    <Frame label="Diagram">
      <svg viewBox="0 0 1000 480" className="w-full max-w-3xl h-auto" style={{ background: '#FAFAFA' }}>
        <defs>
          <marker id="wb-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#050505" />
          </marker>
        </defs>
        {els.map((e, i) => <Shape key={i} e={e} />)}
      </svg>
    </Frame>
  );
}

function Shape({ e }) {
  const stroke = '#050505';
  const fill = e.fill && e.fill !== '#FFFFFF' ? e.fill : 'transparent';
  const tx = { fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fill: '#050505', fontWeight: 600 };
  switch (e.shape) {
    case 'rect':
      return (
        <g>
          <rect x={e.x} y={e.y} width={e.w} height={e.h} fill={e.fill || '#FAFAFA'} stroke={stroke} strokeWidth="2.5" rx="4" />
          {e.label && <text x={e.x + e.w / 2} y={e.y + e.h / 2 + 5} textAnchor="middle" {...tx}>{e.label}</text>}
        </g>
      );
    case 'circle':
      return (
        <g>
          <circle cx={e.x} cy={e.y} r={e.r} fill={e.fill || 'transparent'} stroke={stroke} strokeWidth="2.5" />
          {e.label && <text x={e.x} y={e.y + 5} textAnchor="middle" {...tx}>{e.label}</text>}
        </g>
      );
    case 'ellipse':
      return <ellipse cx={e.x + (e.w || 0) / 2} cy={e.y + (e.h || 0) / 2} rx={(e.w || 60) / 2} ry={(e.h || 40) / 2} fill={fill} stroke={stroke} strokeWidth="2.5" />;
    case 'line':
      return e.from && e.to ? <line x1={e.from[0]} y1={e.from[1]} x2={e.to[0]} y2={e.to[1]} stroke={stroke} strokeWidth="2.5" /> : null;
    case 'arrow':
      if (!e.from || !e.to) return null;
      return (
        <g>
          <line x1={e.from[0]} y1={e.from[1]} x2={e.to[0]} y2={e.to[1]} stroke={stroke} strokeWidth="2.5" markerEnd="url(#wb-arrow)" />
          {e.label && (
            <text x={(e.from[0] + e.to[0]) / 2} y={(e.from[1] + e.to[1]) / 2 - 8} textAnchor="middle" style={{ ...tx, fontSize: 12 }}>
              {e.label}
            </text>
          )}
        </g>
      );
    case 'polygon':
      return e.points ? <polygon points={e.points.map((p) => p.join(',')).join(' ')} fill={fill} stroke={stroke} strokeWidth="2.5" /> : null;
    case 'arc': {
      const sa = e.startAngle ?? 0, ea = e.endAngle ?? Math.PI;
      const rx = (e.w || 80) / 2;
      const cx = e.x, cy = e.y;
      const x1 = cx + rx * Math.cos(sa), y1 = cy + rx * Math.sin(sa);
      const x2 = cx + rx * Math.cos(ea), y2 = cy + rx * Math.sin(ea);
      return <path d={`M ${x1} ${y1} A ${rx} ${rx} 0 0 1 ${x2} ${y2}`} fill="none" stroke={stroke} strokeWidth="2.5" />;
    }
    default:
      return null;
  }
}

function GraphSeg({ content }) {
  const W = 600, H = 320, pad = 44;
  const data = content.data && content.data.length ? content.data : [];
  const xs = data.map((d) => d.x), ys = data.map((d) => d.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(0, ...ys), maxY = Math.max(...ys, 1);
  const sx = (x) => pad + ((x - minX) / (maxX - minX || 1)) * (W - pad * 1.5);
  const sy = (y) => H - pad - ((y - minY) / (maxY - minY || 1)) * (H - pad * 1.5);
  const pts = data.map((d) => [sx(d.x), sy(d.y)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ');
  const barW = (W - pad * 1.5) / (data.length || 1) * 0.6;

  return (
    <Frame label={`Graph · ${content.chartType}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl h-auto" style={{ background: '#FAFAFA' }}>
        {/* axes */}
        <line x1={pad} y1={H - pad} x2={W - pad / 2} y2={H - pad} stroke="#050505" strokeWidth="2" />
        <line x1={pad} y1={pad / 2} x2={pad} y2={H - pad} stroke="#050505" strokeWidth="2" />
        {content.xLabel && <text x={W / 2} y={H - 8} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" fill="#050505">{content.xLabel}</text>}
        {content.yLabel && <text x="14" y={H / 2} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" fill="#050505" transform={`rotate(-90 14 ${H / 2})`}>{content.yLabel}</text>}

        {content.chartType === 'bar' &&
          pts.map((p, i) => (
            <rect key={i} x={p[0] - barW / 2} y={p[1]} width={barW} height={H - pad - p[1]} fill="#050505" />
          ))}
        {(content.chartType === 'line' || content.chartType === 'scatter' || content.chartType === 'area') && (
          <>
            {content.chartType === 'area' && (
              <path d={`${path} L ${pts[pts.length - 1]?.[0]} ${H - pad} L ${pts[0]?.[0]} ${H - pad} Z`} fill="#050505" opacity="0.1" />
            )}
            <path d={path} fill="none" stroke="#050505" strokeWidth="2.5" />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#050505" />)}
          </>
        )}
      </svg>
    </Frame>
  );
}

function NetworkSeg({ content }) {
  const W = 560, H = 380;
  const nodes = content.nodes || [];
  const cx = W / 2, cy = H / 2;
  const pos = {};
  const sats = nodes.filter((_, i) => i > 0);
  nodes.forEach((n, i) => {
    if (i === 0) pos[n.id] = [cx, cy];
    else {
      const a = ((i - 1) / sats.length) * Math.PI * 2 - Math.PI / 2;
      pos[n.id] = [cx + Math.cos(a) * 150, cy + Math.sin(a) * 130];
    }
  });
  return (
    <Frame label={content.title || 'Concept Map'}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl h-auto" style={{ background: '#FAFAFA' }}>
        {(content.edges || []).map((e, i) => {
          const a = pos[e.source], b = pos[e.target];
          if (!a || !b) return null;
          return (
            <g key={i}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#050505" strokeWidth="1.5" opacity="0.55" />
              {e.label && (
                <text x={(a[0] + b[0]) / 2} y={(a[1] + b[1]) / 2 - 4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#050505" opacity="0.6">
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map((n, i) => {
          const p = pos[n.id];
          const core = i === 0;
          return (
            <g key={n.id}>
              <circle cx={p[0]} cy={p[1]} r={core ? 40 : 30} fill={core ? '#050505' : '#FAFAFA'} stroke="#050505" strokeWidth="2.5" />
              <text x={p[0]} y={p[1] + 4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={core ? 12 : 10} fontWeight="700" fill={core ? '#FAFAFA' : '#050505'}>
                {(n.label || n.id).slice(0, 10)}
              </text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

function Checkpoint({ content, onContinue }) {
  const [picked, setPicked] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = picked === content.correctIndex;

  return (
    <div className="rounded border-2 border-ink bg-paper whiteboard-shadow p-6 max-w-2xl relative">
      <div className="absolute -top-3 left-5 bg-acid border-2 border-ink px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
        Checkpoint
      </div>
      <p className="text-xl text-ink mt-2 font-normal">{content.question}</p>
      <div className="mt-4 space-y-2.5">
        {content.options.map((opt, i) => {
          const isPicked = picked === i;
          const showRight = submitted && i === content.correctIndex;
          const showWrong = submitted && isPicked && i !== content.correctIndex;
          return (
            <button
              key={i}
              data-testid={CM.checkpointOption(i)}
              disabled={submitted}
              onClick={() => setPicked(i)}
              className={`w-full text-left px-4 py-3 rounded border-2 font-medium flex items-center justify-between transition-colors ${
                showRight
                  ? 'border-ink bg-ink text-paper'
                  : showWrong
                  ? 'border-magenta bg-magenta/10 text-ink'
                  : isPicked
                  ? 'border-ink bg-ink/10 text-ink'
                  : 'border-ink/30 hover:border-ink text-ink/90'
              }`}
            >
              {opt}
              {showRight && <Check size={18} />}
              {showWrong && <X size={18} />}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          data-testid={CM.checkpointSubmit}
          disabled={picked === null}
          onClick={() => setSubmitted(true)}
          className="mt-5 h-11 px-6 rounded bg-ink text-paper font-bold disabled:opacity-40 hover:bg-ink/80 transition-colors"
        >
          Check answer
        </button>
      ) : (
        <div className="mt-5">
          <p className={`font-bold ${correct ? 'text-ink' : 'text-magenta'}`}>
            {correct ? 'Correct — nice.' : 'Not quite.'}
          </p>
          <p className="text-ink/70 text-sm mt-1">{content.explanation}</p>
          <button
            onClick={() => onContinue?.(correct, content.question)}
            className="mt-4 inline-flex items-center gap-2 h-11 px-6 rounded bg-cyan text-ink font-bold hover:bg-ink hover:text-paper transition-colors"
          >
            <RefreshCw size={16} /> {correct ? 'Continue, harder' : 'Explain it differently'}
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PanelLeftClose, PanelLeftOpen, Plus, FolderClosed, FolderOpen,
  MessageSquare, Trash2, Check, X, Hash,
} from 'lucide-react';
import { CM } from '@/constants/testIds';

export default function Sidebar({
  collapsed, setCollapsed,
  projects, activeProjectId, onSelectProject, onNewProject, onDeleteProject,
  chats, activeChatId, onSelectChat, onNewChat, onDeleteChat,
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const submitNew = () => {
    if (name.trim()) onNewProject(name.trim());
    setName('');
    setAdding(false);
  };

  return (
    <motion.aside
      data-testid={CM.sidebar}
      animate={{ width: collapsed ? 68 : 280 }}
      transition={{ type: 'spring', damping: 24, stiffness: 240 }}
      className="relative h-full glass-strong border-r border-white/10 flex flex-col z-20 overflow-hidden"
    >
      {/* header */}
      <div className="flex items-center justify-between p-4 h-16 shrink-0">
        {!collapsed && (
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-cyan">Collections</span>
        )}
        <button
          data-testid={CM.sidebarToggle}
          onClick={() => setCollapsed(!collapsed)}
          className="grid place-items-center w-9 h-9 rounded-xl hover:bg-white/10 text-white/80 transition-colors"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* new collection */}
      <div className="px-3 shrink-0">
        {collapsed ? (
          <button
            onClick={() => { setCollapsed(false); setAdding(true); }}
            data-testid={CM.newCollection}
            className="w-full grid place-items-center h-10 rounded-xl bg-cyan/15 text-cyan hover:bg-cyan/25 transition-colors"
          >
            <Plus size={18} />
          </button>
        ) : adding ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitNew()}
              placeholder="Collection name"
              className="flex-1 h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:border-cyan/50"
            />
            <button onClick={submitNew} className="grid place-items-center w-9 h-9 rounded-lg bg-cyan text-ink"><Check size={16} /></button>
            <button onClick={() => { setAdding(false); setName(''); }} className="grid place-items-center w-9 h-9 rounded-lg bg-white/10"><X size={16} /></button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            data-testid={CM.newCollection}
            className="w-full flex items-center gap-2 h-10 px-3 rounded-xl bg-cyan/15 text-cyan hover:bg-cyan/25 transition-colors font-semibold text-sm"
          >
            <Plus size={16} /> New collection
          </button>
        )}
      </div>

      {/* tree */}
      <div className="flex-1 overflow-y-auto no-scrollbar mt-3 px-3 pb-4 space-y-1">
        {projects.length === 0 && !collapsed && (
          <p className="text-ash text-xs px-2 py-4 font-mono">No collections yet. Create one to start.</p>
        )}
        {projects.map((p) => {
          const active = p.id === activeProjectId;
          return (
            <div key={p.id}>
              <div
                data-testid={CM.collectionItem(p.id)}
                onClick={() => onSelectProject(p)}
                className={`group flex items-center gap-2 px-2.5 h-10 rounded-xl cursor-pointer transition-colors ${
                  active ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <span className="text-cyan shrink-0">
                  {active ? <FolderOpen size={17} /> : <FolderClosed size={17} />}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-sm font-medium text-white/90">{p.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}
                      className="opacity-0 group-hover:opacity-100 text-ash hover:text-magenta transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* chats under active project */}
              {!collapsed && active && (
                <AnimatePresence>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="ml-3 pl-3 border-l border-white/10 mt-1 space-y-0.5 overflow-hidden"
                  >
                    <button
                      data-testid={CM.newChat}
                      onClick={() => onNewChat(p.id)}
                      className="w-full flex items-center gap-2 h-8 px-2 rounded-lg text-ash hover:text-cyan hover:bg-white/5 transition-colors font-mono text-xs"
                    >
                      <Plus size={13} /> new topic
                    </button>
                    {chats.map((c) => (
                      <div
                        key={c.id}
                        data-testid={CM.chatItem(c.id)}
                        onClick={() => onSelectChat(c)}
                        className={`group flex items-center gap-2 h-8 px-2 rounded-lg cursor-pointer transition-colors ${
                          c.id === activeChatId ? 'bg-cyan/10 text-cyan' : 'text-white/70 hover:bg-white/5'
                        }`}
                      >
                        <Hash size={13} className="shrink-0 opacity-60" />
                        <span className="flex-1 truncate text-[13px]">{c.title}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteChat(c.id); }}
                          className="opacity-0 group-hover:opacity-100 text-ash hover:text-magenta transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </div>
    </motion.aside>
  );
}

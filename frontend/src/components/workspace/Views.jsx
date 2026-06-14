import { motion } from 'framer-motion';
import { Plus, Sparkles, FolderClosed, LogOut, User, Zap, Layers, BookOpen } from 'lucide-react';
import CollectionSurfer from '@/components/CollectionSurfer';
import { useAuth } from '@/context/AuthContext';
import { CM } from '@/constants/testIds';

const IMG_POOL = [
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80',
];

const imgFor = (id) => {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return IMG_POOL[h % IMG_POOL.length];
};

export function CollectionsView({ projects, onSelect, onNew }) {
  const items = projects.map((p) => ({
    id: p.id, title: p.name, tag: 'collection', meta: 'open the board', image: imgFor(p.id),
  }));

  return (
    <div data-testid={CM.collectionsView} className="h-full flex flex-col">
      <div className="px-8 sm:px-12 pt-8 flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-cyan font-light">collection surfer</p>
          <h1 className="text-3xl mt-2 text-cyan font-light">your collections</h1>
        </div>
        <button onClick={onNew} className="h-11 px-5 rounded-2xl bg-cyan text-ink font-medium flex items-center gap-2 hover:bg-white transition-colors">
          <Plus size={18} /> new
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 grid place-items-center">
          <div className="text-center">
            <FolderClosed size={44} className="mx-auto text-ash" />
            <p className="text-smoke font-light mt-4 max-w-xs text-sm">nothing here yet. make one and start surfing.</p>
            <button onClick={onNew} className="mt-5 h-11 px-6 rounded-2xl bg-cyan text-ink font-medium">create collection</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center -mt-6">
          <CollectionSurfer items={items} onSelect={onSelect} />
        </div>
      )}
    </div>
  );
}

export function HomeView({ user, projects, onQuickStart, onBrowse }) {
  const name = (user?.displayName || 'rider').split(' ')[0].toLowerCase();
  const stats = [
    { icon: Layers, label: 'collections', value: projects.length, color: '#00F0FF' },
    { icon: BookOpen, label: 'depths', value: 6, color: '#FF5C00' },
    { icon: Zap, label: 'status', value: 'live', color: '#FAFF00' },
  ];
  return (
    <div className="h-full overflow-y-auto px-8 sm:px-12 py-12 pb-28">
      <div className="mx-auto max-w-4xl">
        <p className="text-[11px] tracking-[0.3em] uppercase text-cyan font-light">welcome back</p>
        <h1 className="text-4xl mt-3 font-light">
          hey <span className="text-cyan">{name}</span>.
        </h1>
        <p className="text-smoke font-light mt-3 text-base max-w-md">board's clean. ask something, or surf your collections.</p>

        <div className="grid grid-cols-3 gap-4 mt-10">
          {stats.map((s) => (
            <motion.div key={s.label} whileHover={{ y: -4 }} className="rounded-2xl glass p-5">
              <s.icon size={20} style={{ color: s.color }} />
              <div className="text-3xl mt-3 font-light lowercase">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-ash mt-1 font-light">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <button onClick={onQuickStart} className="group text-left rounded-2xl bg-cyan text-ink p-6 hover:bg-white transition-colors">
            <Sparkles size={22} />
            <h3 className="text-xl mt-3">open the board</h3>
            <p className="text-ink/70 font-light text-sm mt-1">start a fresh lesson.</p>
          </button>
          <button onClick={onBrowse} className="group text-left rounded-2xl glass p-6 hover:bg-white/10 transition-colors">
            <Layers size={22} className="text-warm" />
            <h3 className="text-xl mt-3 text-cyan">surf collections</h3>
            <p className="text-smoke font-light text-sm mt-1">browse your topics in 3d.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsView() {
  const { user, logout } = useAuth();
  return (
    <div className="h-full overflow-y-auto px-8 sm:px-12 py-12">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] tracking-[0.3em] uppercase text-cyan font-light">settings</p>
        <h1 className="text-3xl mt-2 font-light">your pass</h1>

        <div className="mt-8 rounded-2xl glass p-6 flex items-center gap-4">
          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-cyan/15 text-cyan"><User size={24} /></span>
          <div className="flex-1">
            <div className="text-xl">{user?.displayName || 'guest rider'}</div>
            <div className="text-xs text-ash mt-0.5 font-light">
              {user ? `@${user.username}` : 'guest — saved on this device'}
            </div>
          </div>
        </div>

        {user && (
          <button
            data-testid={CM.logoutBtn}
            onClick={logout}
            className="mt-5 inline-flex items-center gap-2 h-11 px-6 rounded-2xl border border-magenta/40 text-magenta hover:bg-magenta/10 transition-colors font-light"
          >
            <LogOut size={16} /> log out
          </button>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Layers, GraduationCap, Settings as SettingsIcon, Train, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { projectApi, chatApi, apiErr } from '@/lib/api';
import MagneticDock from '@/components/workspace/MagneticDock';
import Sidebar from '@/components/workspace/Sidebar';
import TeachingPanel from '@/components/workspace/TeachingPanel';
import { CollectionsView, HomeView, SettingsView } from '@/components/workspace/Views';
import AuthModal from '@/components/AuthModal';
import { CM } from '@/constants/testIds';

export default function Workspace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState('home');
  const [collapsed, setCollapsed] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [segments, setSegments] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bloom, setBloom] = useState('understand');

  const activeChatRef = useRef(null);
  const activeProjectRef = useRef(null);
  activeChatRef.current = activeChat;
  activeProjectRef.current = activeProject;

  const loadProjects = useCallback(async () => {
    try {
      const ps = await projectApi.list();
      setProjects(ps);
      return ps;
    } catch (e) {
      toast.error(apiErr(e));
      return [];
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // reload collections/chats when auth identity changes
  useEffect(() => {
    setActiveProject(null);
    setChats([]);
    setActiveChat(null);
    setSegments([]);
    loadProjects();
  }, [user, loadProjects]);

  const loadChats = useCallback(async (projectId) => {
    try {
      const cs = await projectApi.listChats(projectId);
      setChats(cs);
      return cs;
    } catch (e) {
      toast.error(apiErr(e));
      return [];
    }
  }, []);

  const selectProject = useCallback(async (p) => {
    setActiveProject(p);
    await loadChats(p.id);
  }, [loadChats]);

  const newProject = useCallback(async (name) => {
    try {
      const created = await projectApi.create(name);
      const ps = await loadProjects();
      const full = ps.find((x) => x.id === created.id) || created;
      await selectProject(full);
      toast.success(`Collection “${name}” created`);
      return full;
    } catch (e) {
      toast.error(apiErr(e));
    }
  }, [loadProjects, selectProject]);

  const deleteProject = useCallback(async (id) => {
    try {
      await projectApi.remove(id);
      if (activeProject?.id === id) {
        setActiveProject(null);
        setChats([]);
        setActiveChat(null);
        setSegments([]);
      }
      loadProjects();
    } catch (e) {
      toast.error(apiErr(e));
    }
  }, [activeProject, loadProjects]);

  const openChat = useCallback(async (chat) => {
    try {
      const full = await chatApi.get(chat.id);
      setActiveChat(full);
      setSegments(full.segments || []);
      setView('agent');
    } catch (e) {
      toast.error(apiErr(e));
    }
  }, []);

  const newChat = useCallback(async (projectId) => {
    try {
      const created = await projectApi.createChat(projectId, 'New chat');
      await loadChats(projectId);
      setActiveChat({ ...created, segments: [], messages: [] });
      setSegments([]);
      setView('agent');
      return created;
    } catch (e) {
      toast.error(apiErr(e));
    }
  }, [loadChats]);

  const deleteChat = useCallback(async (id) => {
    try {
      await chatApi.remove(id);
      if (activeChat?.id === id) {
        setActiveChat(null);
        setSegments([]);
      }
      if (activeProject) loadChats(activeProject.id);
    } catch (e) {
      toast.error(apiErr(e));
    }
  }, [activeChat, activeProject, loadChats]);

  // ensure there is an active chat (auto-create a default collection + chat)
  const ensureChat = useCallback(async () => {
    if (activeChatRef.current) return activeChatRef.current;
    let project = activeProjectRef.current;
    if (!project) {
      const existing = await loadProjects();
      project = existing[0];
      if (!project) project = await newProject('My Notes');
      else await selectProject(project);
    }
    const created = await projectApi.createChat(project.id, 'New chat');
    await loadChats(project.id);
    const chatObj = { ...created, segments: [], messages: [] };
    setActiveChat(chatObj);
    return chatObj;
  }, [loadProjects, newProject, selectProject, loadChats]);

  const sendPrompt = useCallback(async (text) => {
    setView('agent');
    setBusy(true);
    setThinking(true);
    try {
      const chat = await ensureChat();
      const res = await chatApi.message(chat.id, text, bloom);
      setSegments(res.allSegments || []);
      setActiveChat((c) => (c ? { ...c, title: res.title } : c));
      if (activeProjectRef.current) loadChats(activeProjectRef.current.id);
    } catch (e) {
      toast.error(apiErr(e));
    } finally {
      setThinking(false);
      setBusy(false);
    }
  }, [bloom, ensureChat, loadChats]);

  const onContinue = useCallback((isCorrect, question) => {
    const prompt = isCorrect
      ? `I answered the checkpoint "${question}" correctly. Continue to the next idea, a little harder.`
      : `I got the checkpoint "${question}" wrong. Re-explain that concept a completely different way.`;
    sendPrompt(prompt);
  }, [sendPrompt]);

  const dockItems = [
    { id: 'home', label: 'Home', icon: Home, active: view === 'home', onClick: () => setView('home') },
    { id: 'collections', label: 'Collections', icon: Layers, active: view === 'collections', onClick: () => setView('collections') },
    { id: 'agent', label: 'Teaching Agent', icon: GraduationCap, active: view === 'agent', onClick: () => setView('agent') },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, active: view === 'settings', onClick: () => setView('settings') },
  ];

  return (
    <div data-testid={CM.workspace} className="h-screen w-screen overflow-hidden flex bg-ink relative">
      {/* ambient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full bg-cyan/5 blur-[120px]" />
        <div className="absolute -bottom-40 right-0 w-[36rem] h-[36rem] rounded-full bg-warm/5 blur-[120px]" />
        <div className="absolute inset-0 halftone opacity-[0.04]" />
      </div>

      {(view === 'agent' || view === 'collections') && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          projects={projects}
          activeProjectId={activeProject?.id}
          onSelectProject={selectProject}
          onNewProject={newProject}
          onDeleteProject={deleteProject}
          chats={chats}
          activeChatId={activeChat?.id}
          onSelectChat={openChat}
          onNewChat={newChat}
          onDeleteChat={deleteChat}
        />
      )}

      <main className="relative flex-1 min-w-0">
        {/* top bar */}
        <div className="absolute top-0 right-0 z-30 p-4 flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="h-10 px-3 rounded-xl glass hover:bg-white/10 transition-colors flex items-center gap-2 text-sm text-white/80"
          >
            <Train size={16} className="text-cyan" /> <span className="hidden sm:inline font-mono text-xs">Exit</span>
          </button>
          {user ? (
            <div data-testid={CM.userMenu} className="h-10 px-3 rounded-xl glass flex items-center gap-2 text-sm">
              <span className="grid place-items-center w-6 h-6 rounded-lg bg-cyan text-ink font-bold text-xs">
                {(user.displayName || user.username)[0].toUpperCase()}
              </span>
              <span className="hidden sm:inline text-white/90 font-medium">{user.displayName}</span>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="h-10 px-4 rounded-xl bg-cyan text-ink font-bold text-sm flex items-center gap-2 hover:bg-white transition-colors"
            >
              <LogIn size={15} /> Log in
            </button>
          )}
        </div>

        <div className="h-full">
          {view === 'home' && (
            <HomeView
              user={user}
              projects={projects}
              onQuickStart={() => setView('agent')}
              onBrowse={() => setView('collections')}
            />
          )}
          {view === 'collections' && (
            <CollectionsView
              projects={projects}
              onSelect={(item) => {
                const p = projects.find((x) => x.id === item.id);
                if (p) { selectProject(p); setView('agent'); }
              }}
              onNew={() => newProject(`Collection ${projects.length + 1}`)}
            />
          )}
          {view === 'agent' && (
            <TeachingPanel
              title={activeChat?.title}
              segments={segments}
              thinking={thinking}
              busy={busy}
              bloom={bloom}
              setBloom={setBloom}
              onSubmit={sendPrompt}
              onContinue={onContinue}
            />
          )}
          {view === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* magnetic dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40">
        <MagneticDock items={dockItems} />
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={() => setAuthOpen(false)} />
    </div>
  );
}

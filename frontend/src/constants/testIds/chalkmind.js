// Central data-testid registry for ChalkMind.
export const CM = {
  // nav / landing
  navLogo: 'nav-logo',
  navLogin: 'nav-login-btn',
  navSignup: 'nav-signup-btn',
  navEnter: 'nav-enter-app-btn',
  heroEnter: 'hero-enter-btn',
  heroTitle: 'hero-title',
  heroScrollHint: 'hero-scroll-hint',

  // auth modal
  authModal: 'auth-modal',
  authUsername: 'auth-username-input',
  authPassword: 'auth-password-input',
  authDisplayName: 'auth-displayname-input',
  authSubmit: 'auth-submit-btn',
  authToggle: 'auth-toggle-mode-btn',
  authGuest: 'auth-guest-btn',
  authError: 'auth-error',

  // workspace
  workspace: 'workspace-root',
  dock: 'magnetic-dock',
  dockItem: (id) => `dock-item-${id}`,
  sidebar: 'collections-sidebar',
  sidebarToggle: 'sidebar-toggle-btn',
  newCollection: 'new-collection-btn',
  collectionItem: (id) => `collection-${id}`,
  newChat: 'new-chat-btn',
  chatItem: (id) => `chat-${id}`,
  userMenu: 'user-menu',
  logoutBtn: 'logout-btn',

  // teaching panel
  teachingPanel: 'teaching-panel',
  whiteboard: 'whiteboard',
  thinkingState: 'thinking-state',
  promptInput: 'prompt-input',
  promptSubmit: 'prompt-submit-btn',
  micBtn: 'mic-btn',
  bloomSelect: 'bloom-select',
  checkpointOption: (i) => `checkpoint-option-${i}`,
  checkpointSubmit: 'checkpoint-submit-btn',

  // collections view
  collectionsView: 'collections-view',
  surferCard: (id) => `surfer-card-${id}`,
};

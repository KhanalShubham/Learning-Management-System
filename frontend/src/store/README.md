# Store Directory

This directory contains Zustand store instances for global, cross-feature state.
Examples:
- `useAuthStore.ts` - Currently active session and user info
- `useThemeStore.ts` - Dark mode preference
- `useUIStore.ts` - Sidebar toggles and modal layouts

## Guidelines
- Do not store localized form states or component states globally. Use React's `useState` or `useReducer` for component-local state.
- Keep Zustand state definitions small and modular.

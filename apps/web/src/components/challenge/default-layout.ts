import type { Layout } from 'react-resizable-panels';

export const LAYOUT_GROUP_ID = 'nthtime-challenge';
export const RESET_LAYOUT_EVENT = 'nthtime:reset-layout';

export const DEFAULT_LAYOUT: Layout = {
  prompt: 30,
  editor: 70,
};

export function clearPanelStorage() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('react-resizable-panels'))
    .forEach((k) => localStorage.removeItem(k));
}

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

import { Platform } from 'react-native';

const tintColorLight = '#7c3aed'; // violet-600
const tintColorDark = '#a78bfa'; // violet-400

export const Colors = {
  light: {
    text: '#0f172a', // slate-900
    background: '#f8fafc', // slate-50
    tint: tintColorLight,
    icon: '#64748b', // slate-500
    tabIconDefault: '#94a3b8', // slate-400
    tabIconSelected: tintColorLight,
    primary: '#7c3aed',
    secondary: '#64748b',
    card: '#ffffff',
    border: '#e2e8f0',
    error: '#ef4444',
  },
  dark: {
    text: '#f8fafc', // slate-50
    background: '#020617', // slate-950
    tint: tintColorDark,
    icon: '#94a3b8', // slate-400
    tabIconDefault: '#64748b', // slate-500
    tabIconSelected: tintColorDark,
    primary: '#7c3aed',
    secondary: '#94a3b8',
    card: '#1e293b', // slate-800
    border: '#334155', // slate-700
    error: '#ef4444',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

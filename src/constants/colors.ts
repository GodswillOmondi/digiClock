export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  glow: string;
  description: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'yellow',
    name: 'Digital Yellow',
    hex: '#E6E600',
    glow: 'rgba(230, 230, 0, 0.35)',
    description: 'Reference Monitor Classic',
  },
  {
    id: 'amber',
    name: 'Retro Amber',
    hex: '#FFBF00',
    glow: 'rgba(255, 191, 0, 0.35)',
    description: 'Warm Vintage LED',
  },
  {
    id: 'red',
    name: 'Crimson LED',
    hex: '#FF2A2A',
    glow: 'rgba(255, 42, 42, 0.35)',
    description: 'Night-Vision Friendly',
  },
  {
    id: 'green',
    name: 'Matrix Green',
    hex: '#00FF66',
    glow: 'rgba(0, 255, 102, 0.35)',
    description: 'High-Contrast Phosphor',
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    hex: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.35)',
    description: 'Crisp Modern VFD',
  },
  {
    id: 'white',
    name: 'Pure White',
    hex: '#FFFFFF',
    glow: 'rgba(255, 255, 255, 0.3)',
    description: 'Clean Minimalist',
  },
];

export const DEFAULT_COLOR_HEX = '#E6E600';

export function isValidHexColor(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

export const THEMES = [
  {
    id: 'cork',
    label: 'Cork Board',
    previewBg: 'linear-gradient(135deg, #c8973f 0%, #a07030 100%)',
    textColor: '#fff',
  },
  {
    id: 'chalkboard',
    label: 'Chalkboard',
    previewBg: 'linear-gradient(135deg, #2d5a3d 0%, #1a3a28 100%)',
    textColor: '#fff',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    previewBg: 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%)',
    textColor: '#fff',
  },
  {
    id: 'linen',
    label: 'Linen',
    previewBg: 'linear-gradient(135deg, #e0d4c0 0%, #c8bba6 100%)',
    textColor: '#5a4a38',
  },
  {
    id: 'forest',
    label: 'Forest',
    previewBg: 'linear-gradient(135deg, #2c4a2e 0%, #162618 100%)',
    textColor: '#fff',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    previewBg: 'linear-gradient(135deg, #c75b1a 0%, #8b1a3a 100%)',
    textColor: '#fff',
  },
]

export function getTheme(id) {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}

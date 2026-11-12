/** The browser bar's colour (meta theme-color), matched to the theme's background (--bg in theme/tokens.css). */
const BG = { dark: '#0D1016', light: '#E8ECF2' } as const;

export function setThemeColor(theme: 'light' | 'dark'): void {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BG[theme]);
}

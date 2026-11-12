import { useEffect } from 'react';
import { usePrefersDark } from '../../platform/media';
import { setThemeColor } from '../../platform/themeColor';
import { useSettings } from './context';

/** The theme to draw: the player's choice, or the device's on "Auto". */
export function useResolvedTheme(): 'light' | 'dark' {
  const { settings } = useSettings();
  const prefersDark = usePrefersDark();
  const theme = settings.theme === 'auto' ? (prefersDark ? 'dark' : 'light') : settings.theme;
  useEffect(() => setThemeColor(theme), [theme]);
  return theme;
}

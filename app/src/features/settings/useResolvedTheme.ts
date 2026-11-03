import { usePrefersDark } from '../../platform/media';
import { useSettings } from './context';

/** The theme to draw: the player's choice, or the device's on "Auto". */
export function useResolvedTheme(): 'light' | 'dark' {
  const { settings } = useSettings();
  const prefersDark = usePrefersDark();
  if (settings.theme === 'auto') return prefersDark ? 'dark' : 'light';
  return settings.theme;
}

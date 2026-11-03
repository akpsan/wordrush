/** Makes settings available to every screen and saves changes on the device. */

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { load, save } from '../../platform/storage';
import { SettingsContext } from './context';
import { sanitize, type Settings } from './settings';

const KEY = 'settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => sanitize(load<unknown>(KEY, null)));
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      const next = sanitize({ ...current, ...patch });
      save(KEY, next);
      return next;
    });
  }, []);
  const api = useMemo(() => ({ settings, update }), [settings, update]);
  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>;
}

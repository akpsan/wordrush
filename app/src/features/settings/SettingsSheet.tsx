/**
 * Settings as a sheet. Screens choose which rows to show: the menu shows the theme,
 * the in-game sheet shows "Show ways out". "Show all letters" is in both. A feature adds its own row here when it ships.
 */

import type { ReactNode } from 'react';
import { plain, t } from '../../copy';
import { Segmented, Toggle } from '../../ui/Controls';
import { Sheet } from '../../ui/Sheet';
import { useSettings } from './context';
import type { HintsPerGame, ThemeSetting } from './settings';

export type SettingsRow = 'theme' | 'hints' | 'highlight' | 'waysOut' | 'showAll';

export interface SettingsSheetProps {
  readonly title: string;
  readonly rows: readonly SettingsRow[];
  readonly onClose: () => void;
  /** Extra actions above Done (the game adds "Back to menu"). */
  readonly extra?: ReactNode;
}

function Row({ label, help, children }: { label: string; help: string; children: ReactNode }) {
  return (
    <div className="setrow">
      <div className="st">
        <b>{label}</b>
        <span>{help}</span>
      </div>
      {children}
    </div>
  );
}

export function SettingsSheet({ title, rows, onClose, extra }: SettingsSheetProps) {
  const { settings, update } = useSettings();
  return (
    <Sheet title={title} onClose={onClose}>
      {rows.includes('theme') && (
        <Row label={t('settings.theme.label')} help={t('settings.theme.help')}>
          <Segmented<ThemeSetting>
            label={t('settings.theme.label')}
            value={settings.theme}
            options={[
              { value: 'auto', label: t('settings.theme.auto') },
              { value: 'light', label: t('settings.theme.light') },
              { value: 'dark', label: t('settings.theme.dark') },
            ]}
            onChange={(theme) => update({ theme })}
          />
        </Row>
      )}
      {rows.includes('hints') && (
        <Row label={t('settings.hints.label')} help={t('settings.hints.help')}>
          <Segmented<HintsPerGame>
            label={t('settings.hints.label')}
            value={settings.hints}
            options={[
              { value: 0, label: t('settings.hints.off') },
              { value: 1, label: '1' },
              { value: 3, label: '3' },
            ]}
            onChange={(hints) => update({ hints })}
          />
        </Row>
      )}
      {rows.includes('highlight') && (
        <Row label={t('settings.highlight.label')} help={t('settings.highlight.help')}>
          <Toggle
            on={settings.highlightLetters}
            label={plain('settings.highlight.aria', { 'on/off': settings.highlightLetters ? 'on' : 'off' })}
            onChange={(highlightLetters) => update({ highlightLetters })}
          />
        </Row>
      )}
      {rows.includes('waysOut') && (
        <Row label={t('gsettings.waysout.label')} help={t('gsettings.waysout.help')}>
          <Toggle
            on={settings.showWaysOut}
            label={t('gsettings.waysout.label')}
            onChange={(showWaysOut) => update({ showWaysOut })}
          />
        </Row>
      )}
      {rows.includes('showAll') && (
        <Row label={t('settings.showall.label')} help={t('settings.showall.help')}>
          <Toggle
            on={settings.showAllLetters}
            label={plain('settings.showall.aria', { 'on/off': settings.showAllLetters ? 'on' : 'off' })}
            onChange={(showAllLetters) => update({ showAllLetters })}
          />
        </Row>
      )}
      {extra}
      <button type="button" className="btn sec" onClick={onClose}>
        {t('settings.done')}
      </button>
    </Sheet>
  );
}

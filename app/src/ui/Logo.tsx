import { t } from '../copy';

export function Logo() {
  return (
    <div className="logo">
      <span className="lg" aria-hidden="true">
        <i />
        <i />
      </span>
      <span>{t('menu.logo')}</span>
    </div>
  );
}

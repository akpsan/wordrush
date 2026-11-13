import { t } from '../../../copy';
import '../styles/entry.css';
import { RichText } from '../../../ui/RichText';

/** The desktop key help line under the keyboard. (Flip and Play moved into the stepper and the keyboard, 2026-11-13.) */
export function KeyHelp() {
  return (
    <p className="khelp">
      <RichText text={t('desk.keys')} renderBold={(part, key) => <span key={key} className="kbd">{part}</span>} />
    </p>
  );
}

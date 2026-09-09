import React, { useState } from 'react';

/**
 * Aufklappbarer Karten-Abschnitt fürs Admin Panel.
 * Der Inhalt ist standardmäßig eingeklappt und wird erst beim Klick auf
 * die Kopfzeile angezeigt.
 */
function CollapsibleCard({
  title,
  headerClass = 'bg-secondary text-white',
  borderClass = 'border-secondary',
  badge = null,
  defaultOpen = false,
  bodyClass = '',
  children
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`card mb-4 shadow-sm ${borderClass}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className={`card-header fw-bold w-100 border-0 text-start d-flex justify-content-between align-items-center ${headerClass}`}
        style={{ cursor: 'pointer' }}
      >
        <span>{title}</span>
        <span className="d-flex align-items-center gap-2">
          {badge}
          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </span>
      </button>
      {open && <div className={`card-body ${bodyClass}`}>{children}</div>}
    </div>
  );
}

export default CollapsibleCard;

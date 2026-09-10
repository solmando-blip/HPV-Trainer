import React, { useState } from 'react';

/**
 * Aufklappbarer Karten-Abschnitt fürs Admin Panel.
 * Der Inhalt ist standardmäßig eingeklappt und wird erst beim Klick auf
 * die Kopfzeile angezeigt. Styling: siehe `.tp-collapsible` in theme.css.
 */
function CollapsibleCard({
  title,
  badge = null,
  defaultOpen = false,
  bodyClass = '',
  children
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card mb-4 tp-collapsible">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="card-header w-100 border-0 text-start d-flex justify-content-between align-items-center"
      >
        <span>{title}</span>
        <span className="d-flex align-items-center gap-2">
          {badge}
          <span aria-hidden="true" className="tp-collapsible__chev">{open ? '▾' : '▸'}</span>
        </span>
      </button>
      {open && <div className={`card-body ${bodyClass}`}>{children}</div>}
    </div>
  );
}

export default CollapsibleCard;

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import helpContent, { fallbackHelp } from '../help/helpContent';
import '../styles/Help.css';

// Schwebender „?“-Button auf jeder Seite. Öffnet einen Dialog mit
// seitenbezogener Hilfe, ausgewählt anhand des aktuellen Pfads.
function HelpButton() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const help = helpContent[location.pathname] || fallbackHelp;

  // Dialog bei Seitenwechsel schließen
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Schließen mit Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="help-fab"
        aria-label="Hilfe zu dieser Seite"
        title="Hilfe zu dieser Seite"
        onClick={() => setOpen(true)}
      >
        ?
      </button>

      {open && (
        <div className="help-overlay" onClick={() => setOpen(false)}>
          <div
            className="help-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="help-dialog-header">
              <h5 id="help-dialog-title" className="mb-0">❓ Hilfe: {help.title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Schließen"
                onClick={() => setOpen(false)}
              ></button>
            </div>

            <div className="help-dialog-body">
              {help.intro && <p className="text-muted">{help.intro}</p>}

              {help.sections.map((section, i) => (
                <div key={i} className="mb-3">
                  <h6 className="fw-bold">{section.h}</h6>
                  <ul className="mb-0">
                    {section.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {help.tips && help.tips.length > 0 && (
                <div className="alert alert-info mb-0">
                  <strong>Tipp</strong>
                  <ul className="mb-0 mt-1">
                    {help.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="help-dialog-footer">
              <span className="text-muted small">
                Mehr Details im Benutzerhandbuch (BENUTZERHANDBUCH.md).
              </span>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                Verstanden
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HelpButton;

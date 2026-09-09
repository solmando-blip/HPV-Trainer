import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { renderPreview } from '../utils/emailTemplate';
import '../styles/EmailTemplateManager.css';

const parseEmails = (text) =>
  String(text || '')
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

function SendTemplateModal({ template, headers, onClose }) {
  const [mode, setMode] = useState('self'); // self | group | users | emails
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [emailsText, setEmailsText] = useState('');
  const [vars, setVars] = useState(() =>
    Object.fromEntries((template.variables || []).map((v) => [v, '']))
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [g, u] = await Promise.all([
          axios.get('/api/admin/groups', { headers }),
          axios.get('/api/admin/users', { headers, params: { limit: 500 } })
        ]);
        if (!active) return;
        setGroups(g.data || []);
        setUsers((u.data.users || []).slice().sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        if (active) setError('Gruppen/Benutzer konnten nicht geladen werden.');
      }
    })();
    return () => {
      active = false;
    };
  }, [headers]);

  const preview = useMemo(
    () => renderPreview(template.subject, template.content, vars),
    [template.subject, template.content, vars]
  );

  const recipientHint = useMemo(() => {
    if (mode === 'self') return 'an Ihre eigene Adresse';
    if (mode === 'group') {
      const g = groups.find((x) => String(x.id) === String(groupId));
      return g ? `an „${g.name}" (${g.member_count} Mitglieder, nur aktive)` : 'Gruppe wählen';
    }
    if (mode === 'users') return `an ${selectedUserIds.length} ausgewählte Benutzer`;
    if (mode === 'emails') return `an ${parseEmails(emailsText).length} Adresse(n)`;
    return '';
  }, [mode, groups, groupId, selectedUserIds, emailsText]);

  const canSend =
    !sending &&
    ((mode === 'self') ||
      (mode === 'group' && groupId) ||
      (mode === 'users' && selectedUserIds.length > 0) ||
      (mode === 'emails' && parseEmails(emailsText).length > 0));

  const send = async () => {
    setError('');
    if (!window.confirm(`Template „${template.name}" jetzt senden — ${recipientHint}?`)) return;
    setSending(true);
    try {
      const body = { vars };
      if (mode === 'self') body.testToSelf = true;
      if (mode === 'group') body.groupId = Number(groupId);
      if (mode === 'users') body.userIds = selectedUserIds;
      if (mode === 'emails') body.emails = parseEmails(emailsText);
      const res = await axios.post(`/api/admin/templates/${template.id}/send`, body, { headers });
      setResult(res.data.message || 'Gesendet.');
    } catch (err) {
      setError(err.response?.data?.message || 'Versand fehlgeschlagen.');
      setSending(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" style={{ position: 'fixed', inset: 0, overflowY: 'auto' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Template senden: <code>{template.name}</code></h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}

            {result ? (
              <div className="alert alert-success mb-0">{result}</div>
            ) : (
              <div className="row g-4">
                {/* Empfänger + Variablen */}
                <div className="col-lg-6">
                  <label className="form-label">Empfänger</label>
                  <select className="form-select mb-3" value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option value="self">Testmail an mich</option>
                    <option value="group">Gruppe</option>
                    <option value="users">Einzelne Benutzer</option>
                    <option value="emails">E-Mail-Adressen</option>
                  </select>

                  {mode === 'group' && (
                    <select className="form-select mb-3" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                      <option value="">Gruppe auswählen…</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name} ({g.member_count})</option>
                      ))}
                    </select>
                  )}

                  {mode === 'users' && (
                    <select
                      className="form-select mb-3"
                      multiple
                      size={8}
                      value={selectedUserIds.map(String)}
                      onChange={(e) =>
                        setSelectedUserIds([...e.target.selectedOptions].map((o) => Number(o.value)))
                      }
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  )}

                  {mode === 'emails' && (
                    <textarea
                      className="form-control mb-3"
                      rows={5}
                      placeholder="Eine Adresse pro Zeile (oder Komma-getrennt)"
                      value={emailsText}
                      onChange={(e) => setEmailsText(e.target.value)}
                    />
                  )}

                  <div className="text-muted small mb-3">Wird gesendet: {recipientHint}. Bei mehreren Empfängern per BCC.</div>

                  <label className="form-label mb-1">Variablen einsetzen</label>
                  {(template.variables || []).length === 0 && (
                    <p className="text-muted">Dieses Template hat keine Variablen.</p>
                  )}
                  {(template.variables || []).map((v) => (
                    <div className="input-group input-group-sm mb-1" key={v}>
                      <span className="input-group-text" style={{ fontFamily: 'monospace' }}>{`{{${v}}}`}</span>
                      <input
                        className="form-control"
                        value={vars[v] ?? ''}
                        onChange={(e) => setVars({ ...vars, [v]: e.target.value })}
                      />
                    </div>
                  ))}
                  {(template.variables || []).length > 0 && (
                    <div className="form-text">
                      Leer gelassene Variablen bleiben als <code>{'{{name}}'}</code> in der Mail stehen.
                      Immer verfügbar (nicht auflisten nötig): <code>{'{{current_year}}'}</code>,{' '}
                      <code>{'{{platform_name}}'}</code>, <code>{'{{platform_url}}'}</code>,{' '}
                      <code>{'{{support_email}}'}</code>.
                    </div>
                  )}
                </div>

                {/* Vorschau */}
                <div className="col-lg-6">
                  <label className="form-label">Vorschau</label>
                  <div className="border rounded p-2">
                    <div className="pb-2 mb-2 border-bottom">
                      <strong>Betreff:</strong> {preview.subject || <span className="text-muted">—</span>}
                    </div>
                    <div className="tpl-preview" dangerouslySetInnerHTML={{ __html: preview.html || '—' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {result ? (
              <button type="button" className="btn btn-primary" onClick={onClose}>Schließen</button>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={sending}>Abbrechen</button>
                <button type="button" className="btn btn-primary" onClick={send} disabled={!canSend}>
                  {sending ? 'Sendet…' : 'Senden'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendTemplateModal;

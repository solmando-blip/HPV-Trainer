import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { escapeHtml, simpleFormat, extractVars, substitute, highlightVars } from '../utils/emailTemplate';
import SendTemplateModal from './SendTemplateModal';
import '../styles/EmailTemplateManager.css';

const emptyForm = { id: null, name: '', subject: '', content: '' };

function EmailTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // form-Objekt oder null
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sampleVars, setSampleVars] = useState({});
  const [sendingTemplate, setSendingTemplate] = useState(null); // Template-Zeile oder null

  const token = localStorage.getItem('hpv_token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/admin/templates', { headers });
      setTemplates(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Templates konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    load();
  }, [load]);

  const detectedVars = useMemo(
    () => (editing ? extractVars(editing.subject, editing.content) : []),
    [editing]
  );

  // Sample-Werte für neu aufgetauchte Variablen vorbelegen.
  useEffect(() => {
    if (!editing) return;
    setSampleVars((prev) => {
      const next = { ...prev };
      let changed = false;
      detectedVars.forEach((v) => {
        if (next[v] === undefined) {
          next[v] = `Beispiel-${v}`;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [detectedVars, editing]);

  const openNew = () => {
    setEditing({ ...emptyForm });
    setIsNew(true);
    setSampleVars({});
  };

  const openEdit = (tpl) => {
    setEditing({ id: tpl.id, name: tpl.name, subject: tpl.subject, content: tpl.content });
    setIsNew(false);
    setSampleVars({});
  };

  const closeModal = () => {
    setEditing(null);
    setSaving(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isNew) {
        await axios.post(
          '/api/admin/templates',
          { name: editing.name.trim(), subject: editing.subject, content: editing.content },
          { headers }
        );
      } else {
        await axios.put(
          `/api/admin/templates/${editing.id}`,
          { subject: editing.subject, content: editing.content },
          { headers }
        );
      }
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Speichern fehlgeschlagen.');
      setSaving(false);
    }
  };

  const remove = async (tpl) => {
    if (!window.confirm(`Template "${tpl.name}" wirklich löschen?`)) return;
    setError('');
    try {
      await axios.delete(`/api/admin/templates/${tpl.id}`, { headers });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Löschen fehlgeschlagen.');
    }
  };

  const previewSubject = editing ? substitute(editing.subject, sampleVars) : '';
  const previewHtml = editing
    ? simpleFormat(escapeHtml(substitute(editing.content, sampleVars)))
    : '';
  const sourceHtml = editing ? highlightVars(escapeHtml(editing.content)) : '';

  return (
    <div>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">{templates.length} Templates</span>
        <button className="btn btn-sm btn-success" onClick={openNew}>+ Neues Template</button>
      </div>

      {loading ? (
        <p className="text-muted mb-0">Lädt…</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Betreff</th>
                <th>Variablen</th>
                <th>Geändert</th>
                <th className="text-end">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td><code>{t.name}</code></td>
                  <td>{t.subject}</td>
                  <td>{(t.variables || []).length}</td>
                  <td>
                    <small className="text-muted">
                      {t.updated_at ? new Date(t.updated_at).toLocaleString('de-DE') : '—'}
                    </small>
                  </td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => setSendingTemplate(t)}>Senden</button>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(t)}>Bearbeiten</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(t)}>Löschen</button>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr><td colSpan="5" className="text-muted">Keine Templates vorhanden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {sendingTemplate && (
        <SendTemplateModal
          template={sendingTemplate}
          headers={headers}
          onClose={() => setSendingTemplate(null)}
        />
      )}

      {editing && (
        <div className="modal d-block bg-dark bg-opacity-50" style={{ position: 'fixed', inset: 0, overflowY: 'auto' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isNew ? 'Neues Template' : <>Template bearbeiten: <code>{editing.name}</code></>}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={save}>
                <div className="modal-body">
                  <div className="row g-4">
                    {/* Editor */}
                    <div className="col-lg-6">
                      {isNew && (
                        <div className="mb-3">
                          <label className="form-label">Name (technischer Schlüssel) *</label>
                          <input
                            className="form-control"
                            value={editing.name}
                            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                            placeholder="z.B. event_cancellation"
                            pattern="[a-z0-9_]+"
                            title="Nur Kleinbuchstaben, Ziffern und Unterstrich"
                            required
                          />
                          <div className="form-text">Nur <code>a–z</code>, <code>0–9</code>, <code>_</code>. Nicht änderbar nach dem Anlegen.</div>
                        </div>
                      )}
                      <div className="mb-3">
                        <label className="form-label">Betreff *</label>
                        <input
                          className="form-control"
                          value={editing.subject}
                          onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Inhalt * <span className="text-muted">(<code>**fett**</code>, Zeilenumbrüche, <code>{'{{variable}}'}</code>)</span></label>
                        <textarea
                          className="form-control tpl-content-input"
                          value={editing.content}
                          onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label mb-1">Erkannte Variablen</label>
                        <div>
                          {detectedVars.length === 0 && <span className="text-muted">keine</span>}
                          {detectedVars.map((v) => <span key={v} className="tpl-chip">{`{{${v}}}`}</span>)}
                        </div>
                      </div>
                    </div>

                    {/* Vorschau */}
                    <div className="col-lg-6">
                      <label className="form-label">Vorlage (Variablen hervorgehoben)</label>
                      <div
                        className="border rounded p-2 bg-light mb-3 tpl-source"
                        dangerouslySetInnerHTML={{ __html: sourceHtml || '<span class="text-muted">—</span>' }}
                      />

                      {detectedVars.length > 0 && (
                        <div className="mb-3">
                          <label className="form-label mb-1">Sample-Werte für die Vorschau</label>
                          {detectedVars.map((v) => (
                            <div className="input-group input-group-sm mb-1" key={v}>
                              <span className="input-group-text" style={{ fontFamily: 'monospace' }}>{`{{${v}}}`}</span>
                              <input
                                className="form-control"
                                value={sampleVars[v] ?? ''}
                                onChange={(e) => setSampleVars({ ...sampleVars, [v]: e.target.value })}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <label className="form-label">Vorschau</label>
                      <div className="border rounded p-2">
                        <div className="pb-2 mb-2 border-bottom">
                          <strong>Betreff:</strong> {previewSubject || <span className="text-muted">—</span>}
                        </div>
                        <div
                          className="tpl-preview"
                          dangerouslySetInnerHTML={{ __html: previewHtml || '<span class="text-muted">—</span>' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>Abbrechen</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Speichert…' : 'Speichern'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailTemplateManager;

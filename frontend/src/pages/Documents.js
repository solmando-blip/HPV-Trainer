import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/Documents.css';

// Nur für die Badge-Farbe – welche Typen im Browser vorschaufähig sind,
// bestimmt allein das Backend (GET /api/documents/preview-types).
const WORD_TYPES = ['doc', 'docx'];
const TEXT_LIKE = ['txt', 'csv', 'md', 'json', 'xml', 'log'];
const IMAGE_LIKE = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

// Wartet, bis ein per <script defer> geladenes Global verfügbar ist.
const waitForGlobal = (name, timeoutMs = 8000) =>
  new Promise((resolve) => {
    if (window[name]) return resolve(true);
    const start = Date.now();
    const iv = setInterval(() => {
      if (window[name]) {
        clearInterval(iv);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(iv);
        resolve(false);
      }
    }, 100);
  });

const badgeColor = (fileType) => {
  const t = (fileType || '').toLowerCase();
  if (t === 'pdf') return 'danger';
  if (WORD_TYPES.includes(t)) return 'primary';
  if (['xls', 'xlsx'].includes(t)) return 'success';
  if (TEXT_LIKE.includes(t)) return 'info';
  if (IMAGE_LIKE.includes(t)) return 'warning';
  return 'secondary';
};

function Documents({ user }) {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // { doc, kind, status, data, message }
  const [previewTypes, setPreviewTypes] = useState(null); // { endung: 'pdf'|'image'|'text'|'word' } vom Backend
  const previewReqRef = useRef(0);              // gegen Races bei schnellem Umschalten

  const fetchDocs = async () => {
    try {
      const res = await axios.get('/api/documents');
      setDocs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  // Vorschau-Katalog vom Backend holen (einzige Quelle der Wahrheit).
  useEffect(() => {
    axios.get('/api/documents/preview-types')
      .then(res => setPreviewTypes(res.data || {}))
      .catch(() => setPreviewTypes({}));
  }, []);

  const previewKind = (fileType) =>
    (previewTypes && previewTypes[(fileType || '').toLowerCase()]) || null;
  const canPreview = (fileType) => previewKind(fileType) !== null;

  // Vorschau-Dialog mit Escape schließen
  useEffect(() => {
    if (!preview) return;
    const onKey = (e) => { if (e.key === 'Escape') { previewReqRef.current++; setPreview(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openPreview = async (doc) => {
    const kind = previewKind(doc.file_type);
    const viewUrl = `/api/documents/view/${doc.id}`;
    const reqId = ++previewReqRef.current;
    const isStale = () => previewReqRef.current !== reqId;

    if (kind === 'pdf') {
      setPreview({ doc, kind: 'pdf', status: 'ready' });
      return;
    }
    if (kind === 'image') {
      setPreview({ doc, kind: 'image', status: 'ready' });
      return;
    }
    if (kind === 'text') {
      setPreview({ doc, kind: 'text', status: 'loading' });
      try {
        const res = await fetch(viewUrl);
        if (!res.ok) throw new Error('view failed');
        const text = await res.text();
        if (isStale()) return;
        setPreview({ doc, kind: 'text', status: 'ready', data: text });
      } catch {
        if (isStale()) return;
        setPreview({ doc, kind: 'text', status: 'error' });
      }
      return;
    }
    if (kind === 'word') {
      setPreview({ doc, kind: 'word', status: 'loading' });
      const [hasMammoth, hasPurify] = await Promise.all([
        waitForGlobal('mammoth'),
        waitForGlobal('DOMPurify'),
      ]);
      if (isStale()) return;
      if (!hasMammoth || !hasPurify) {
        setPreview({
          doc,
          kind: 'word',
          status: 'error',
          message: 'Die Word-Vorschau ist gerade nicht verfügbar (Komponente noch nicht geladen). Bitte die Seite neu laden oder die Datei herunterladen.',
        });
        return;
      }
      try {
        const res = await fetch(viewUrl);
        if (!res.ok) throw new Error('view failed');
        const arrayBuffer = await res.arrayBuffer();
        const result = await window.mammoth.convertToHtml({ arrayBuffer });
        if (isStale()) return;
        const safeHtml = window.DOMPurify.sanitize(result.value, { USE_PROFILES: { html: true } });
        setPreview({ doc, kind: 'word', status: 'ready', data: safeHtml });
      } catch {
        if (isStale()) return;
        setPreview({ doc, kind: 'word', status: 'error' });
      }
      return;
    }
    // .doc (Altformat) und alles Übrige: keine Browser-Vorschau
    setPreview({ doc, kind: 'word', status: 'unsupported' });
  };

  const closePreview = () => {
    previewReqRef.current++; // laufende Vorschau-Ladevorgänge verwerfen
    setPreview(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('title', title || file.name);
    formData.append('file', file);

    try {
      const token = localStorage.getItem('hpv_token');
      await axios.post('/api/documents', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setFile(null);
      fetchDocs();
    } catch (err) {
      alert('Upload-Fehler');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Datei löschen?')) return;
    const token = localStorage.getItem('hpv_token');
    await axios.delete(`/api/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchDocs();
  };

  return (
    <div>
      <h2 className="mb-4">📁 Dokumente & Downloads</h2>

      {user && ['Admin', 'Moderator'].includes(user.role) && (
        <form className="mb-4 card card-body shadow-sm" onSubmit={handleUpload}>
          <h5>Neue Datei Hochladen</h5>
          <input className="form-control mb-2" placeholder="Anzeigename (optional)" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="form-control mb-2" type="file" onChange={e => setFile(e.target.files[0])} required />
          <button className="btn btn-primary" type="submit">Upload Starten</button>
        </form>
      )}

      <p className="text-muted small">
        Tipp: Auf den Typ einer Datei (PDF, Text- oder Word-Datei, Bild) klicken, um eine Vorschau zu öffnen.
      </p>

      <div className="table-responsive shadow-sm">
        <table className="table table-hover bg-white align-middle">
          <thead className="table-light">
            <tr>
              <th>Typ</th>
              <th>Dateiname / Titel</th>
              <th>Größe</th>
              <th>Datum</th>
              <th className="text-end">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(doc => {
              const label = doc.file_type ? doc.file_type.toUpperCase() : 'FILE';
              return (
                <tr key={doc.id}>
                  <td>
                    {canPreview(doc.file_type) ? (
                      <button
                        type="button"
                        className={`badge border-0 bg-${badgeColor(doc.file_type)}`}
                        style={{ cursor: 'pointer' }}
                        title="Vorschau anzeigen"
                        onClick={() => openPreview(doc)}
                      >
                        {label} <span aria-hidden="true">👁</span>
                      </button>
                    ) : (
                      <span className={`badge bg-${badgeColor(doc.file_type)}`}>{label}</span>
                    )}
                  </td>
                  <td><strong>{doc.title}</strong></td>
                  <td>{formatBytes(doc.file_size)}</td>
                  <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="text-end">
                    {canPreview(doc.file_type) && (
                      <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openPreview(doc)}>
                        👁 Vorschau
                      </button>
                    )}
                    <a href={`/api/documents/download/${doc.id}`} className="btn btn-sm btn-outline-primary me-2" download>
                      💾 Download
                    </a>
                    {user && ['Admin', 'Moderator'].includes(user.role) && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(doc.id)}>🗑️</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {preview && (
        <div
          className="modal d-block"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
          onClick={closePreview}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-truncate">
                  Vorschau: {preview.doc.title}
                  <span className="badge bg-light text-dark ms-2">
                    {preview.doc.file_type ? preview.doc.file_type.toUpperCase() : 'FILE'}
                  </span>
                </h5>
                <button type="button" className="btn-close" aria-label="Schließen" onClick={closePreview}></button>
              </div>

              <div className="modal-body" style={{ minHeight: '55vh' }}>
                {preview.status === 'loading' && (
                  <p className="text-muted mb-0">Vorschau wird geladen…</p>
                )}
                {preview.status === 'error' && (
                  <div className="alert alert-danger mb-0">
                    {preview.message || 'Die Vorschau konnte nicht geladen werden. Bitte laden Sie die Datei herunter.'}
                  </div>
                )}
                {preview.status === 'unsupported' && (
                  <div className="alert alert-warning mb-0">
                    Für dieses Dateiformat ist keine Vorschau im Browser möglich
                    {preview.doc.file_type ? ` (.${preview.doc.file_type})` : ''}.
                    Bitte laden Sie die Datei herunter.
                  </div>
                )}

                {preview.status === 'ready' && preview.kind === 'pdf' && (
                  <iframe
                    title={preview.doc.title}
                    src={`/api/documents/view/${preview.doc.id}`}
                    style={{ width: '100%', height: '70vh', border: 0 }}
                  />
                )}
                {preview.status === 'ready' && preview.kind === 'image' && (
                  <img
                    src={`/api/documents/view/${preview.doc.id}`}
                    alt={preview.doc.title}
                    className="img-fluid d-block mx-auto"
                  />
                )}
                {preview.status === 'ready' && preview.kind === 'text' && (
                  <div className="doc-preview-text">{preview.data}</div>
                )}
                {preview.status === 'ready' && preview.kind === 'word' && (
                  <div className="docx-preview" dangerouslySetInnerHTML={{ __html: preview.data }} />
                )}
              </div>

              <div className="modal-footer">
                <a href={`/api/documents/download/${preview.doc.id}`} className="btn btn-primary" download>
                  💾 Herunterladen
                </a>
                <button type="button" className="btn btn-secondary" onClick={closePreview}>Schließen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;

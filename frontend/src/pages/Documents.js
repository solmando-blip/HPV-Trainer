import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Documents({ user }) {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const fetchDocs = async () => {
    try {
      const res = await axios.get('/api/documents');
      setDocs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            {docs.map(doc => (
              <tr key={doc.id}>
                <td>
                  <span className={`badge bg-${doc.file_type === 'pdf' ? 'danger' : ['doc', 'docx'].includes(doc.file_type) ? 'primary' : ['xls', 'xlsx'].includes(doc.file_type) ? 'success' : 'secondary'}`}>
                    {doc.file_type ? doc.file_type.toUpperCase() : 'FILE'}
                  </span>
                </td>
                <td><strong>{doc.title}</strong></td>
                <td>{formatBytes(doc.file_size)}</td>
                <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                <td className="text-end">
                  <a href={`/api/documents/download/${doc.id}`} className="btn btn-sm btn-outline-primary me-2" download>
                    💾 Download
                  </a>
                  {user && ['Admin', 'Moderator'].includes(user.role) && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(doc.id)}>🗑️</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Documents;

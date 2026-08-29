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

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
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

  return (
    <div>
      <h2 className="mb-4">Dokumente</h2>
      {user && ['Admin', 'Moderator'].includes(user.role) && (
        <form className="mb-4 card card-body shadow-sm" onSubmit={handleUpload}>
          <h5>Dokument Hochladen</h5>
          <input className="form-control mb-2" placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} required />
          <input className="form-control mb-2" type="file" onChange={e => setFile(e.target.files[0])} required />
          <button className="btn btn-primary" type="submit">Hochladen</button>
        </form>
      )}
      <ul className="list-group shadow-sm">
        {docs.map(doc => (
          <li key={doc.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span><strong>{doc.title}</strong></span>
            <a href={`/${doc.file_path}`} download className="btn btn-sm btn-outline-primary">Download</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Documents;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function News({ user }) {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingArticle, setEditingArticle] = useState(null);

  const fetchNews = async () => {
    try {
      const res = await axios.get('/api/news');
      setArticles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('hpv_token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingArticle) {
        await axios.put(`/api/news/${editingArticle.id}`, { title, content }, { headers });
      } else {
        await axios.post('/api/news', { title, content }, { headers });
      }

      setTitle('');
      setContent('');
      setEditingArticle(null);
      fetchNews();
    } catch (err) {
      alert('Fehler beim Speichern.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Artikel wirklich löschen?')) return;
    const token = localStorage.getItem('hpv_token');
    await axios.delete(`/api/news/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchNews();
  };

  const startEdit = (art) => {
    setEditingArticle(art);
    setTitle(art.title);
    setContent(art.content);
  };

  return (
    <div>
      <h2 className="mb-4">📢 News & Mitteilungen</h2>

      {user && ['Admin', 'Moderator'].includes(user.role) && (
        <div className="card mb-4 shadow-sm border-primary">
          <div className="card-header bg-primary text-white">
            {editingArticle ? 'Artikel Bearbeiten' : 'Neuen Artikel Erstellen'}
          </div>
          <div className="card-body">
            <form onSubmit={handleSave}>
              <input className="form-control mb-2" placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} required />
              <textarea className="form-control mb-2" rows="4" placeholder="Inhalt (HTML erlaubt: <b>fett</b>, <i>kursiv</i>, <br>)" value={content} onChange={e => setContent(e.target.value)} required />

              <div className="d-flex gap-2">
                <button className="btn btn-success" type="submit">{editingArticle ? 'Speichern' : 'Veröffentlichen'}</button>
                {editingArticle && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditingArticle(null); setTitle(''); setContent(''); }}>
                    Abbrechen
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {articles.map(art => (
        <div className="card mb-3 shadow-sm" key={art.id}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h3>{art.title}</h3>
              {user && ['Admin', 'Moderator'].includes(user.role) && (
                <div>
                  <button className="btn btn-sm btn-outline-warning me-2" onClick={() => startEdit(art)}>✏️ Bearbeiten</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(art.id)}>🗑️ Löschen</button>
                </div>
              )}
            </div>
            <p className="text-muted small">Am: {new Date(art.created_at).toLocaleDateString()} von {art.author_name || 'Verband'}</p>
            <div dangerouslySetInnerHTML={{ __html: art.content.replace(/\n/g, '<br>') }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default News;

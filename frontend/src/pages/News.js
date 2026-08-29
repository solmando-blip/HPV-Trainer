import React, { useState, useEffect } from 'react';
import axios from 'axios';

function News({ user }) {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchNews = async () => {
    try {
      const res = await axios.get('/api/news');
      setArticles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('hpv_token');
      await axios.post('/api/news', { title, content }, { headers: { Authorization: `Bearer ${token}` } });
      setTitle('');
      setContent('');
      fetchNews();
    } catch (err) {
      alert('Fehler beim Erstellen.');
    }
  };

  return (
    <div>
      <h2 className="mb-4">Aktuelle News</h2>
      {user && ['Admin', 'Moderator'].includes(user.role) && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5>Neuen Artikel erstellen</h5>
            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <input className="form-control" placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="mb-3">
                <textarea className="form-control" placeholder="Inhalt" rows="3" value={content} onChange={e => setContent(e.target.value)} required />
              </div>
              <button className="btn btn-success" type="submit">Veröffentlichen</button>
            </form>
          </div>
        </div>
      )}
      {articles.map(art => (
        <div className="card mb-3 shadow-sm" key={art.id}>
          <div className="card-body">
            <h3>{art.title}</h3>
            <p className="text-muted small">Erstellt am: {new Date(art.created_at).toLocaleDateString()} | Von {art.author_name || 'Admin'}</p>
            <p>{art.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default News;

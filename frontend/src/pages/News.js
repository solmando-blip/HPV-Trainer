import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Artikel nach Erscheinungsmonat gruppieren. Die Liste kommt bereits
// absteigend sortiert vom Backend, dadurch bleiben Monate und Artikel
// innerhalb eines Monats chronologisch (neueste zuerst).
const groupArticlesByMonth = (list) => {
  const groups = [];
  const byKey = new Map();

  list.forEach((art) => {
    const d = new Date(art.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!byKey.has(key)) {
      const group = {
        key,
        label: d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
        items: [],
      };
      byKey.set(key, group);
      groups.push(group);
    }
    byKey.get(key).items.push(art);
  });

  return groups;
};

function News({ user }) {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showIndex, setShowIndex] = useState(true);

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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      if (editingArticle) {
        await axios.put(`/api/news/${editingArticle.id}`, formData, { headers });
      } else {
        await axios.post('/api/news', formData, { headers });
      }

      setTitle('');
      setContent('');
      setImage(null);
      setImagePreview(null);
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
    setImage(null);
    setImagePreview(art.image_path ? `/api/view-image/${encodeURIComponent(art.image_path)}` : null);
  };

  const scrollToArticle = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(`article-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToIndex = (e) => {
    e.preventDefault();
    const el = document.getElementById('artikel-uebersicht');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
              
              <div className="mb-2">
                <label className="form-label">Bild hochladen (optional)</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Vorschau" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                  </div>
                )}
              </div>

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

      {articles.length > 1 && (
        <div className="card mb-4 shadow-sm" id="artikel-uebersicht">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span className="fw-bold">📑 Artikel-Übersicht ({articles.length})</span>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowIndex(v => !v)}
              aria-expanded={showIndex}
            >
              {showIndex ? 'Einklappen' : 'Ausklappen'}
            </button>
          </div>
          {showIndex && (
            <div className="card-body">
              {groupArticlesByMonth(articles).map(group => (
                <div key={group.key} className="mb-3">
                  <h6 className="text-uppercase text-muted small border-bottom pb-1 mb-2">
                    {group.label} <span className="fw-normal">({group.items.length})</span>
                  </h6>
                  <ul className="list-unstyled mb-0 ms-2">
                    {group.items.map(art => (
                      <li key={art.id} className="mb-1">
                        <a href={`#article-${art.id}`} onClick={e => scrollToArticle(e, art.id)}>
                          {art.title}
                        </a>
                        <span className="text-muted small ms-2">
                          {new Date(art.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {articles.map(art => (
        <div className="card mb-3 shadow-sm" key={art.id} id={`article-${art.id}`} style={{ scrollMarginTop: '1rem' }}>
          {art.image_path && (
            <img src={`/api/view-image/${encodeURIComponent(art.image_path)}`} alt={art.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
          )}
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
            {articles.length > 1 && (
              <p className="mb-0 mt-3">
                <a href="#artikel-uebersicht" onClick={scrollToIndex} className="small text-muted">↑ Zur Artikel-Übersicht</a>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default News;

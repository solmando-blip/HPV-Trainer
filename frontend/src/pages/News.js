import React, { useState, useEffect } from 'react';
import axios from 'axios';

function News({ user }) {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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

      {articles.map(art => (
        <div className="card mb-3 shadow-sm" key={art.id}>
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
          </div>
        </div>
      ))}
    </div>
  );
}

export default News;

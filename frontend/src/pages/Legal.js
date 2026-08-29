import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Legal() {
  const [texts, setTexts] = useState([]);

  useEffect(() => {
    axios.get('/api/legal')
      .then(res => setTexts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container py-3">
      <h2 className="mb-4">Rechtliche Hinweise</h2>
      <div className="row">
        {texts.map(item => (
          <div className="col-12 mb-4" key={item.key}>
            <div className="card shadow-sm">
              <div className="card-header bg-light fw-bold">{item.title}</div>
              <div className="card-body" style={{ whiteSpace: 'pre-line' }}>
                {item.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Legal;

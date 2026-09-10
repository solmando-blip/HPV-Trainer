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
    <div>
      <h2 className="mb-4">Rechtliche Hinweise</h2>
      {texts.map(item => (
        <div className="card mb-4" key={item.key}>
          <div className="card-header fw-bold">{item.title}</div>
          <div className="card-body tp-prose" style={{ whiteSpace: 'pre-line' }}>
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Legal;

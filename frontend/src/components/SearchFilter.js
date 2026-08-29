import React from 'react';
import '../styles/SearchFilter.css';

function SearchFilter({ onSearch, onRoleFilter, onStatusFilter, onApply }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const handleApply = () => {
    onSearch(searchTerm);
    onRoleFilter(roleFilter);
    onStatusFilter(statusFilter);
    if (onApply) onApply();
  };

  const handleReset = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    onSearch('');
    onRoleFilter('');
    onStatusFilter('');
    if (onApply) onApply();
  };

  return (
    <div className="search-filter-container">
      <div className="search-filter-group">
        <input
          type="text"
          className="form-control"
          placeholder="Nach Name oder E-Mail suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleApply()}
        />
      </div>

      <div className="search-filter-group">
        <select
          className="form-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Alle Rollen</option>
          <option value="Admin">Admin</option>
          <option value="Moderator">Moderator</option>
          <option value="User">Benutzer</option>
          <option value="Gast">Gast</option>
        </select>
      </div>

      <div className="search-filter-group">
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Alle Status</option>
          <option value="active">Aktiv</option>
          <option value="pending">Ausstehend</option>
          <option value="blocked">Blockiert</option>
        </select>
      </div>

      <div className="search-filter-actions">
        <button className="btn btn-primary btn-sm" onClick={handleApply}>
          Filtern
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleReset}>
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}

export default SearchFilter;

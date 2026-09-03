function escapeCsvField(val) {
  const s = val === null || val === undefined ? '' : String(val);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows, columns) {
  const header = columns.map(c => escapeCsvField(c.label)).join(',');
  const lines = rows.map(row => columns.map(c => escapeCsvField(row[c.key])).join(','));
  return [header, ...lines].join('\r\n');
}

module.exports = { toCsv };

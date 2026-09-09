// Gemeinsame Render-Helfer für die E-Mail-Template-Vorschau im Frontend.
// Bildet das Verhalten von backend/services/templateService.js nach
// (escapen zuerst – Variablenwerte können Nutzereingaben sein –, dann
// die einfache **fett**/Zeilenumbruch-Formatierung).

export const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const simpleFormat = (escaped) =>
  escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

export const extractVars = (...fields) => {
  const found = new Set();
  const re = /\{\{(\w+)\}\}/g;
  let m;
  for (const field of fields) {
    while ((m = re.exec(field || '')) !== null) found.add(m[1]);
  }
  return [...found].sort();
};

// Unbelegte Platzhalter bleiben als {{name}} sichtbar.
export const substitute = (str, vars) =>
  String(str || '').replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined && vars[key] !== '' ? vars[key] : `{{${key}}}`
  );

// {{var}}-Tokens im (bereits escapten) Text farbig hervorheben.
export const highlightVars = (escaped) =>
  escaped.replace(/\{\{(\w+)\}\}/g, '<span class="tpl-var">{{$1}}</span>');

export const renderPreview = (subject, content, vars = {}) => ({
  subject: substitute(subject, vars),
  html: simpleFormat(escapeHtml(substitute(content, vars)))
});

// Pulls the values a test usually needs out of an email: a one-time code and the links.

const CODE_WORDS =
  /\b(code|otp|one[- ]time|passcode|pin|verification|verify|confirm|token|2fa|security)\b/i;
const YEAR = /^(19|20)\d{2}$/;

export function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<(style|script|head)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6]|table|section)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function candidates(line) {
  const found = [];
  // "4 8 2 9 1 3" or "482-913" style codes
  for (const m of line.matchAll(
    /(?<![\w.,$€£])(\d(?:[ -]?\d){3,7})(?![\w%]|[.,]\d)/g
  )) {
    const digits = m[1].replace(/[ -]/g, '');
    if (digits.length >= 4 && digits.length <= 8 && !YEAR.test(digits))
      found.push(digits);
  }
  // Mixed codes such as "K7Q-2XM" or "AB12CD"
  for (const m of line.matchAll(/\b([A-Z0-9]{3,4}-?[A-Z0-9]{3,4})\b/g)) {
    const raw = m[1];
    if (/[A-Z]/.test(raw) && /\d/.test(raw)) found.push(raw);
  }
  return found;
}

export function extractCode(subject, text) {
  const subjectHasWord = CODE_WORDS.test(subject || '');
  if (subjectHasWord) {
    const fromSubject = candidates(subject);
    if (fromSubject.length) return fromSubject[0];
  }
  const lines = (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const bodyHasWord = subjectHasWord || lines.some((l) => CODE_WORDS.test(l));
  if (!bodyHasWord) return null;
  // A line that is only the code wins, then a line that mentions a code word.
  for (const line of lines) {
    if (/^[A-Z0-9 -]{4,15}$/.test(line)) {
      const c = candidates(line);
      if (c.length === 1) return c[0];
    }
  }
  for (let i = 0; i < lines.length; i++) {
    if (!CODE_WORDS.test(lines[i])) continue;
    const near = [lines[i], lines[i + 1] || '', lines[i + 2] || ''];
    for (const l of near) {
      const c = candidates(l);
      if (c.length) return c[0];
    }
  }
  // The subject promised a code, so the first code-shaped value in the body is it.
  if (subjectHasWord) {
    for (const line of lines) {
      const c = candidates(line);
      if (c.length) return c[0];
    }
  }
  return null;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

export function extractLinks(html, text) {
  const links = [];
  const seen = new Set();
  const add = (url, label) => {
    const clean = decodeEntities(url.trim());
    if (!/^https?:\/\//i.test(clean) || seen.has(clean)) return;
    seen.add(clean);
    let host = '';
    try {
      host = new URL(clean).hostname;
    } catch {
      return;
    }
    const local =
      /^(localhost|127\.|0\.0\.0\.0|\[::1\]|10\.|192\.168\.)/.test(host) ||
      host.endsWith('.local');
    links.push({
      url: clean,
      label: (label || '').replace(/\s+/g, ' ').trim().slice(0, 120),
      local,
      insecure: clean.toLowerCase().startsWith('http://'),
    });
  };
  if (html) {
    for (const m of html.matchAll(
      /<a\b[^>]*?href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi
    )) {
      add(m[2], htmlToText(m[3]));
    }
  }
  for (const m of (text || '').matchAll(/https?:\/\/[^\s<>"')\]]+/gi)) {
    add(m[0].replace(/[.,;:!?]+$/, ''), '');
  }
  return links.slice(0, 50);
}

// "Kestrel <no-reply@kestrel.dev>" -> { name: "Kestrel", address: "no-reply@kestrel.dev" }
export function parseAddress(value) {
  const raw =
    (value || '').split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)[0]?.trim() || '';
  const m = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim(), address: m[2].trim().toLowerCase() };
  return { name: '', address: raw.toLowerCase() };
}

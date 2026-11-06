// Pulls the values a test usually needs out of an email: a one-time code and the links.

const CODE_WORDS =
  /\b(code|otp|one[- ]time|passcode|pin|verification|verify|confirm|token|2fa|security)\b/i;
const YEAR = /^(19|20)\d{2}$/;
// Wording that sits right before a code: "code: 482913", "your code is 482913", "OTP 482913".
const RIGHT_BEFORE = /\b(code|otp|passcode|pin)\W{0,3}(is\W{0,3})?$/i;

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

// Code-shaped values in a line, with where each starts.
function candidates(line) {
  const found = [];
  // "4 8 2 9 1 3" or "482-913" style codes
  for (const m of line.matchAll(
    /(?<![\w.,$€£])(\d(?:[ -]?\d){3,7})(?![\w%]|[.,]\d)/g
  )) {
    const digits = m[1].replace(/[ -]/g, '');
    if (digits.length >= 4 && digits.length <= 8 && !YEAR.test(digits))
      found.push({ code: digits, at: m.index });
  }
  // Mixed codes such as "K7Q-2XM" or "AB12CD"
  for (const m of line.matchAll(/\b([A-Z0-9]{3,4}-?[A-Z0-9]{3,4})\b/g)) {
    const raw = m[1];
    if (/[A-Z]/.test(raw) && /\d/.test(raw))
      found.push({ code: raw, at: m.index });
  }
  return found;
}

// Scores every code-shaped value and returns the best one. A value counts only near code wording,
// or anywhere when the subject promises a code. Wording right before it counts most, then a line
// that's only the code, the same line, and the two lines above. 6 digits win a tie, and so does
// the earlier value.
export function extractCode(subject, text) {
  const body = (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const subjectHasWord = CODE_WORDS.test(subject || '');
  if (!subjectHasWord && !body.some((l) => CODE_WORDS.test(l))) return null;

  let best = null;
  const consider = (line, wordAbove) => {
    const found = candidates(line);
    const alone = found.length === 1 && /^[A-Z0-9 -]{4,15}$/.test(line);
    const wordHere = CODE_WORDS.test(line);
    for (const { code, at } of found) {
      const rightAfter = RIGHT_BEFORE.test(line.slice(0, at));
      if (!rightAfter && !alone && !wordHere && !wordAbove && !subjectHasWord)
        continue;
      const score =
        (rightAfter ? 8 : 0) +
        (alone ? 4 : 0) +
        (wordHere ? 2 : 0) +
        (wordAbove ? 1 : 0) +
        (/^\d{6}$/.test(code) ? 0.5 : 0);
      if (!best || score > best.score) best = { code, score };
    }
  };
  consider((subject || '').trim(), false);
  body.forEach((line, i) =>
    consider(
      line,
      body.slice(Math.max(0, i - 2), i).some((l) => CODE_WORDS.test(l))
    )
  );
  return best?.code ?? null;
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

const COORD = String.raw`-?\d+\.?\d*`;

const COORD_PATTERNS = [
  new RegExp(String.raw`!3d(${COORD})!4d(${COORD})`, 'i'),
  new RegExp(String.raw`[?&]ll=(${COORD}),(${COORD})`, 'i'),
  new RegExp(String.raw`[?&]q=(${COORD}),\s*(${COORD})`, 'i'),
  new RegExp(String.raw`[?&]query=(${COORD}),\s*(${COORD})`, 'i'),
  new RegExp(String.raw`@(${COORD}),(${COORD})`),
  new RegExp(String.raw`[?&]center=(${COORD}),(${COORD})`, 'i'),
  new RegExp(String.raw`[?&]viewpoint=(${COORD}),(${COORD})`, 'i'),
  new RegExp(String.raw`[?&]sll=(${COORD}),(${COORD})`, 'i'),
  new RegExp(String.raw`/place/(${COORD}),(${COORD})`),
  new RegExp(String.raw`q=loc:(${COORD})[+\s,]+(${COORD})`, 'i'),
  new RegExp(String.raw`[?&]daddr=(${COORD}),(${COORD})`, 'i'),
  new RegExp(String.raw`[?&]destination=(${COORD}),(${COORD})`, 'i'),
  new RegExp(String.raw`[?&]coordinate=(${COORD}),(${COORD})`, 'i'),
];

function isValidCoord(lat, lng) {
  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && Math.abs(lat) <= 90
    && Math.abs(lng) <= 180;
}

function matchCoordinates(text) {
  for (const pattern of COORD_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (isValidCoord(lat, lng)) return { lat, lng };
  }
  return null;
}

function decodeUrlSafely(url) {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

function parseMapCoordinates(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  const decoded = decodeUrlSafely(trimmed);

  return matchCoordinates(trimmed) || matchCoordinates(decoded);
}

function isGoogleMapsUrl(url) {
  return /google\.(?:\w+\.)?\w+\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl|g\.co\/kgs/i.test(url);
}

async function expandMapUrl(url) {
  const trimmed = url.trim();
  if (!isGoogleMapsUrl(trimmed)) return null;

  try {
    const res = await fetch(trimmed, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TattooStudio/1.0)' },
    });
    return res.url && res.url !== trimmed ? res.url : null;
  } catch {
    return null;
  }
}

async function resolveMapCoordinates(url) {
  const direct = parseMapCoordinates(url);
  if (direct) return direct;

  const expanded = await expandMapUrl(url);
  if (expanded) return parseMapCoordinates(expanded);

  return null;
}

module.exports = {
  parseMapCoordinates,
  resolveMapCoordinates,
  expandMapUrl,
};

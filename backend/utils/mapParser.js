function parseMapCoordinates(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  let match = trimmed.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

  match = trimmed.match(/[?&]q=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/i);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

  match = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

  match = trimmed.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

  match = trimmed.match(/center=(-?\d+\.?\d*),(-?\d+\.?\d*)/i);
  if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

  return null;
}

module.exports = { parseMapCoordinates };

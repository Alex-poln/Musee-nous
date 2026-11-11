const BAY_SPACING = 5;
const FIRST_BAY_Z = -6;
const FRAME_RADIUS = 25;
export const GALLERY_WIDTH = 12;
export const GALLERY_BACK = 4;

export function layout(count) {
  const pairs = Math.floor(count / 2);
  const length = Math.max(22, pairs * BAY_SPACING + 8);
  const slots = Array.from({length: count}, (_, i) => {
    if (i === pairs * 2) return {x: 0, z: -length + .27, rotation: 0};
    const side = i % 2 === 0 ? -1 : 1;
    return {
      x: side * (GALLERY_WIDTH / 2 - .27),
      z: FIRST_BAY_Z - Math.floor(i / 2) * BAY_SPACING,
      rotation: -side * Math.PI / 2,
    };
  });
  return {length, pairs, slots};
}

export function nearbyFrames({pairs, slots}, z, radius = FRAME_RADIUS) {
  const firstBay = Math.max(0, Math.ceil((FIRST_BAY_Z - z - radius) / BAY_SPACING));
  const lastBay = Math.min(pairs - 1, Math.floor((FIRST_BAY_Z - z + radius) / BAY_SPACING));
  const indices = [];
  for (let bay = firstBay; bay <= lastBay; bay++) indices.push(bay * 2, bay * 2 + 1);
  if (slots.length > pairs * 2 && Math.abs(slots.at(-1).z - z) <= radius) {
    indices.push(pairs * 2);
  }
  return indices.sort((a, b) => Math.abs(slots[a].z - z) - Math.abs(slots[b].z - z));
}
export function constrain(x, z, length) {
  return { x: Math.max(-5.2, Math.min(5.2, x)), z: Math.max(-length + 1.2, Math.min(2.8, z)) };
}

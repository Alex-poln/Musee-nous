export function layout(count) {
  const rows = Math.ceil(Math.max(count - 1, 0) / 2);
  const length = Math.max(22, rows * 5 + 10);
  return { length, slots: Array.from({length: count}, (_, i) => i === count - 1
    ? { x: 0, z: -length + .2, rotation: 0 }
    : { x: i % 2 === 0 ? -5.77 : 5.77, z: -6 - Math.floor(i / 2) * 5, rotation: i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2 }) };
}
export function constrain(x, z, length) {
  return { x: Math.max(-5.2, Math.min(5.2, x)), z: Math.max(-length + 1.2, Math.min(2.8, z)) };
}

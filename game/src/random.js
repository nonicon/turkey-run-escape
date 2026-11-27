// A tiny seeded random number generator (mulberry32), so a screenshot seed
// always stages the same farm, the same obstacles and the same frame.
export function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random integer in [min, max] from the given generator. */
export function randomInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

/** A random float in [min, max) from the given generator. */
export function randomFloat(random, min, max) {
  return min + random() * (max - min);
}

/** Pick one element of an array at random. */
export function randomPick(random, items) {
  return items[Math.floor(random() * items.length)];
}

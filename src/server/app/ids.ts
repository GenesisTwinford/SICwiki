const CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encodeTime(time: number, length: number) {
  let value = time;
  let output = "";

  for (let index = 0; index < length; index += 1) {
    output = CROCKFORD_BASE32[value % 32] + output;
    value = Math.floor(value / 32);
  }

  return output;
}

function randomChar() {
  return CROCKFORD_BASE32[Math.floor(Math.random() * CROCKFORD_BASE32.length)];
}

export function createAppId() {
  const timePart = encodeTime(Date.now(), 10);
  const randomPart = Array.from({ length: 16 }, () => randomChar()).join("");

  return `${timePart}${randomPart}`;
}

export function slugify(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "learner";
}

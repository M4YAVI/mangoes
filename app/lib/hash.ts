// Stable deterministic hash from a string (e.g. UUID) to a non-negative 32-bit integer.
// Used so legacy components that need a numeric id can derive one from a DB UUID.
export function hashNumericId(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Indonesian number formatting helpers. */
export const decimal = (n: number) => String(n).replace(".", ",");
export const hours = (n: number) => `${decimal(n)} jam`;

/** "a", "a dan b", "a, b dan c" */
export function listJoin(items: string[]) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} dan ${items[items.length - 1]}`;
}

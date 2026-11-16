export const searchKeys = [
  "q",
  "title",
  "category",
  "district",
  "town",
  "condition",
  "size",
  "priceMin",
  "priceMax",
  "sort",
];
export function searchQuery(params) {
  return Object.fromEntries(
    searchKeys
      .filter((key) => params.has(key) && params.get(key) !== "")
      .map((key) => [key, params.get(key)]),
  );
}
export function searchUrl(query) {
  const params = new URLSearchParams();
  for (const key of searchKeys)
    if (typeof query[key] === "string" && query[key] !== "")
      params.set(key, query[key]);
  return "/?" + params.toString();
}

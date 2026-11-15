export const conditions = [
  "New with Tags",
  "Like New",
  "Fairly Used",
  "Used",
  "Worn",
];
export const sizes = ["", "XS", "S", "M", "L", "XL", "XXL"];
export const validateTitle = (title) =>
  title.trim().length >= 3 && title.trim().length <= 120;
export const validateDescription = (value) =>
  value.trim().length >= 10 && value.trim().length <= 4000;
export const validatePrice = (value) =>
  Number.isSafeInteger(Number(value)) &&
  Number(value) >= 1 &&
  Number(value) <= 1000000000;
export function listingError(value) {
  if (!validateTitle(value.title)) return "Title must be 3–120 characters";
  if (!validateDescription(value.description))
    return "Description must be 10–4000 characters";
  if (!validatePrice(value.price))
    return "Price must be a whole LKR amount from 1 to 1,000,000,000";
  if (
    !conditions.includes(value.condition) ||
    !sizes.includes(value.size || "")
  )
    return "Choose a valid condition and size";
  return "";
}

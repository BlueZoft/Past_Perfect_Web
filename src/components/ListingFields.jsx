import { conditions, sizes } from "../lib/listing";
import CatalogueFields from "./CatalogueFields";
export default function ListingFields({ value, onChange, disabled = false }) {
  const change = (event) =>
    onChange({ ...value, [event.target.name]: event.target.value });
  return (
    <fieldset disabled={disabled} className="listing-fields">
      <legend>Listing details</legend>
      <CatalogueFields value={value} onChange={onChange} />
      <label>
        Title
        <input
          name="title"
          required
          minLength={3}
          maxLength={120}
          value={value.title}
          onChange={change}
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={4000}
          value={value.description}
          onChange={change}
        />
      </label>
      <label>
        Price (LKR)
        <input
          name="price"
          type="number"
          required
          min={1}
          max={1000000000}
          step={1}
          value={value.price}
          onChange={change}
        />
      </label>
      <label>
        Condition
        <select
          name="condition"
          required
          value={value.condition}
          onChange={change}
        >
          <option value="">Select condition</option>
          {conditions.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      {value.category === "clothing" && (
        <label>
          Size (optional)
          <select name="size" value={value.size} onChange={change}>
            {sizes.map((item) => (
              <option key={item} value={item}>
                {item || "Not applicable"}
              </option>
            ))}
          </select>
        </label>
      )}
    </fieldset>
  );
}

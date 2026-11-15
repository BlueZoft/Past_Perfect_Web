import { t, errorText, useI18n } from "../i18n";
import { conditions, sizes } from "../lib/listing";
import CatalogueFields from "./CatalogueFields";
import CategoryAttributes from "./CategoryAttributes";
export default function ListingFields({ value, onChange, disabled = false }) {
  useI18n();
  const change = (event) =>
    onChange({
      ...value,
      [event.target.name]: event.target.value,
    });
  return (
    <fieldset disabled={disabled} className="listing-fields">
      <legend>{t("Listing details")}</legend>
      <CatalogueFields value={value} onChange={onChange} />
      <CategoryAttributes value={value} onChange={onChange} />
      <label>
        {" "}
        {t("Title")}{" "}
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
        {" "}
        {t("Description")}{" "}
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
        {" "}
        {t("Price (LKR)")}{" "}
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
        {" "}
        {t("Condition")}{" "}
        <select
          name="condition"
          required
          value={value.condition}
          onChange={change}
        >
          <option value="">{t("Select condition")}</option>
          {conditions.map((item) => (
            <option key={item} value={item}>
              {t(item)}
            </option>
          ))}
        </select>
      </label>
      {value.category === "clothing" && (
        <label>
          {" "}
          {t("Size (optional)")}{" "}
          <select name="size" value={value.size} onChange={change}>
            {sizes.map((item) => (
              <option key={item} value={item}>
                {item || t("Not applicable")}
              </option>
            ))}
          </select>
        </label>
      )}
    </fieldset>
  );
}

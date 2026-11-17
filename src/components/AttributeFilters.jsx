import { t, useI18n } from "../i18n";
import useCatalogue from "../hooks/useCatalogue";
export default function AttributeFilters({ category, raw, onChange }) {
  const { language } = useI18n(),
    { attributes = {} } = useCatalogue();
  let value = {};
  try {
    value = JSON.parse(raw || "{}");
    if (!value || Array.isArray(value) || typeof value !== "object") value = {};
  } catch {
    /* Server reports invalid URL filters. */
  }
  const fields = Object.hasOwn(attributes, category || "")
    ? attributes[category]
    : [];
  const change = (key, next) => {
    const copy = { ...value };
    if (next === "" || (typeof next === "object" && !Object.keys(next).length))
      delete copy[key];
    else copy[key] = next;
    onChange(Object.keys(copy).length ? JSON.stringify(copy) : "");
  };
  return fields.length ? (
    <fieldset>
      <legend>{t("Attribute filters")}</legend>
      {fields.map((field) => {
        const label = field.label[language] || field.label.en;
        if (field.type === "number") {
          const currentRange =
            typeof value[field.key] === "number"
              ? { min: value[field.key], max: value[field.key] }
              : value[field.key];
          return (
            <div key={field.key}>
              {["min", "max"].map((bound) => (
                <label key={bound}>
                  {t(bound === "min" ? "Minimum {0}" : "Maximum {0}", {
                    0: label,
                  })}
                  <input
                    type="number"
                    step="any"
                    min={field.min}
                    max={field.max}
                    value={
                      typeof currentRange === "object"
                        ? (currentRange?.[bound] ?? "")
                        : ""
                    }
                    onChange={(event) => {
                      const range = {
                        ...(typeof currentRange === "object"
                          ? currentRange
                          : {}),
                      };
                      if (event.target.value === "") delete range[bound];
                      else range[bound] = Number(event.target.value);
                      change(field.key, range);
                    }}
                  />
                </label>
              ))}
            </div>
          );
        }
        return (
          <label key={field.key}>
            {label}
            {field.type === "enum" ? (
              <select
                value={value[field.key] || ""}
                onChange={(event) => change(field.key, event.target.value)}
              >
                <option value="">{t("Any value")}</option>
                {field.values.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            ) : (
              <input
                maxLength={field.maxLength}
                value={
                  typeof value[field.key] === "string" ? value[field.key] : ""
                }
                onChange={(event) => change(field.key, event.target.value)}
              />
            )}
          </label>
        );
      })}
    </fieldset>
  ) : null;
}

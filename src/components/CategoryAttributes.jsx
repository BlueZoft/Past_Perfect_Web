import { useI18n, t } from "../i18n";
import useCatalogue from "../hooks/useCatalogue";
export default function CategoryAttributes({
  value,
  onChange,
  readOnly = false,
}) {
  const { language } = useI18n();
  const { attributes = {} } = useCatalogue();
  const fields = Object.hasOwn(attributes, value.category)
    ? attributes[value.category]
    : [];
  if (!fields.length) return null;
  const change = (field, input) =>
    onChange({
      ...value,
      attributes: { ...(value.attributes || {}), [field.key]: input },
    });
  if (readOnly)
    return (
      <dl>
        {fields
          .filter((field) => value.attributes?.[field.key] !== undefined)
          .map((field) => (
            <div key={field.key}>
              <dt>{field.label[language] || field.label.en}</dt>
              <dd>{String(value.attributes[field.key])}</dd>
            </div>
          ))}
      </dl>
    );
  return (
    <fieldset>
      <legend>{t("Category attributes")}</legend>
      {fields.map((field) => (
        <label key={field.key}>
          {field.label[language] || field.label.en}
          {field.type === "enum" ? (
            <select
              required={!!field.required}
              value={value.attributes?.[field.key] || ""}
              onChange={(event) => change(field, event.target.value)}
            >
              <option value="">{t("Not specified")}</option>
              {field.values.map((item) => (
                <option key={item} value={item}>
                  {t(item)}
                </option>
              ))}
            </select>
          ) : (
            <input
              required={!!field.required}
              type={field.type === "number" ? "number" : "text"}
              min={field.min}
              max={field.max}
              maxLength={field.maxLength}
              step={field.type === "number" ? "any" : undefined}
              value={value.attributes?.[field.key] ?? ""}
              onChange={(event) => change(field, event.target.value)}
            />
          )}
        </label>
      ))}
    </fieldset>
  );
}

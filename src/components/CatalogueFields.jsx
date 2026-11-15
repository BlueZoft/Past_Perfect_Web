import { t, errorText, useI18n } from "../i18n";
import useCatalogue from "../hooks/useCatalogue";
export default function CatalogueFields({ value, onChange, filters = false }) {
  useI18n();
  const { categories, locations, error } = useCatalogue();
  const district = value.district || "";
  const location = locations.find((item) => item.id === district);
  return (
    <>
      {error && <p role="alert">{errorText(error)}</p>}
      <label>
        {" "}
        {t("Category")}{" "}
        <select
          value={value.category || (filters ? "" : "other")}
          onChange={(e) =>
            onChange({
              ...value,
              category: e.target.value,
              size: "",
              attributes: {},
            })
          }
        >
          {filters && <option value="">{t("All categories")}</option>}
          {categories.map((item) => (
            <option key={item} value={item}>
              {t(item)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {" "}
        {t("District")}{" "}
        <select
          value={district}
          onChange={(e) =>
            onChange({
              ...value,
              district: e.target.value,
              town: "",
            })
          }
        >
          <option value="">
            {filters ? t("All districts") : t("Not specified")}
          </option>
          {locations.map((item) => (
            <option key={item.id} value={item.id}>
              {t(item.label)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {" "}
        {t("Town")}{" "}
        <select
          value={value.town || ""}
          disabled={!district}
          onChange={(e) =>
            onChange({
              ...value,
              town: e.target.value,
            })
          }
        >
          <option value="">
            {filters ? t("All towns") : t("Not specified")}
          </option>
          {location?.towns.map((item) => (
            <option key={item} value={item}>
              {t(item)}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

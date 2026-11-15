import useCatalogue from "../hooks/useCatalogue";
export default function CatalogueFields({ value, onChange, filters = false }) {
  const { categories, locations, error } = useCatalogue();
  const district = value.district || "";
  const location = locations.find((item) => item.id === district);
  return (
    <>
      {error && <p role="alert">{error}</p>}
      <label>
        Category
        <select
          value={value.category || (filters ? "" : "other")}
          onChange={(e) =>
            onChange({ ...value, category: e.target.value, size: "" })
          }
        >
          {filters && <option value="">All categories</option>}
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        District
        <select
          value={district}
          onChange={(e) =>
            onChange({ ...value, district: e.target.value, town: "" })
          }
        >
          <option value="">
            {filters ? "All districts" : "Not specified"}
          </option>
          {locations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Town
        <select
          value={value.town || ""}
          disabled={!district}
          onChange={(e) => onChange({ ...value, town: e.target.value })}
        >
          <option value="">{filters ? "All towns" : "Not specified"}</option>
          {location?.towns.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
    </>
  );
}

import { t, errorText, useI18n, localeTag } from "../i18n";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, errorMessage, imageUrl } from "../api";
import CatalogueFields from "../components/CatalogueFields";
import AttributeFilters from "../components/AttributeFilters";
import SaveSearch from "../components/SaveSearch";
import { searchQuery } from "../search";
export default function Home({ user }) {
  useI18n();
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const searchKey = params.has("title") ? "title" : "q";
  const keywords = !!params.get("q")?.trim();
  const savedQuery = searchQuery(params);
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(true),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setBusy(true);
    setError("");
    api
      .get("/offers", {
        params: new URLSearchParams(query),
        signal: controller.signal,
      })
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [query, retry]);
  const change = (key, value) => {
    const next = new URLSearchParams(params);
    value || key === "title" ? next.set(key, value) : next.delete(key);
    if (
      ["q", "title"].includes(key) &&
      !value.trim() &&
      next.get("sort") === "relevance"
    )
      next.delete("sort");
    next.set("page", "1");
    setParams(next);
  };
  return (
    <main className="container">
      <h1>{t("Find your next pre-loved item")}</h1>
      <section aria-label={t("Search filters")} className="filters">
        <CatalogueFields
          filters
          value={{
            category: params.get("category") || "",
            district: params.get("district") || "",
            town: params.get("town") || "",
          }}
          onChange={(value) => {
            const next = new URLSearchParams(params);
            for (const key of ["category", "district", "town"]) {
              value[key] ? next.set(key, value[key]) : next.delete(key);
            }
            if (value.category !== (params.get("category") || ""))
              next.delete("attributeFilters");
            if (value.category && value.category !== "clothing")
              next.delete("size");
            next.set("page", "1");
            setParams(next);
          }}
        />
        <label>
          {t("Search in")}
          <select
            value={searchKey}
            onChange={(event) => {
              const next = new URLSearchParams(params),
                value = params.get(searchKey) || "";
              next.delete("q");
              next.delete("title");
              next.set(event.target.value, value);
              if (
                event.target.value === "title" &&
                next.get("sort") === "relevance"
              )
                next.delete("sort");
              next.set("page", "1");
              setParams(next);
            }}
          >
            <option value="q">{t("Titles and descriptions")}</option>
            <option value="title">{t("Title contains")}</option>
          </select>
        </label>
        <label>
          {" "}
          {t("Search")}{" "}
          <input
            value={params.get(searchKey) || ""}
            maxLength={120}
            onChange={(e) => change(searchKey, e.target.value)}
          />
        </label>
        <label>
          {" "}
          {t("Minimum LKR")}{" "}
          <input
            type="number"
            min="0"
            value={params.get("priceMin") || ""}
            onChange={(e) => change("priceMin", e.target.value)}
          />
        </label>
        <label>
          {" "}
          {t("Maximum LKR")}{" "}
          <input
            type="number"
            min="0"
            value={params.get("priceMax") || ""}
            onChange={(e) => change("priceMax", e.target.value)}
          />
        </label>
        <label>
          {t("Condition")}
          <select
            value={params.get("condition") || ""}
            onChange={(event) => change("condition", event.target.value)}
          >
            <option value="">{t("All conditions")}</option>
            {["New with Tags", "Like New", "Fairly Used", "Used", "Worn"].map(
              (value) => (
                <option key={value} value={value}>
                  {t(value)}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          {t("Size")}
          <select
            disabled={
              !!params.get("category") && params.get("category") !== "clothing"
            }
            value={params.get("size") || ""}
            onChange={(event) => change("size", event.target.value)}
          >
            <option value="">{t("All sizes")}</option>
            {["XS", "S", "M", "L", "XL", "XXL"].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          {" "}
          {t("Sort")}{" "}
          <select
            value={params.get("sort") || (keywords ? "relevance" : "newest")}
            onChange={(e) => change("sort", e.target.value)}
          >
            {keywords && (
              <option value="relevance">{t("Most relevant")}</option>
            )}
            <option value="newest">{t("Newest")}</option>
            <option value="price-asc">{t("Price: low to high")}</option>
            <option value="price-desc">{t("Price: high to low")}</option>
          </select>
        </label>
      </section>
      <AttributeFilters
        category={params.get("category")}
        raw={params.get("attributeFilters")}
        onChange={(value) => change("attributeFilters", value)}
      />
      <p>
        {t(
          "Keyword search matches words. Use Title contains for partial text.",
        )}
      </p>
      {user && !user.suspended && (
        <SaveSearch
          key={JSON.stringify(savedQuery)}
          query={savedQuery}
          disabled={busy || !!error}
        />
      )}
      {busy ? (
        <p role="status">{t("Loading listings\u2026")}</p>
      ) : error ? (
        <div role="alert">
          {errorText(error)}
          <button onClick={() => setRetry(retry + 1)}>{t("Retry")}</button>
        </div>
      ) : (
        <>
          {!data?.offers.length && <p>{t("No listings match your search.")}</p>}
          <div className="offers">
            {data?.offers.map((item) => (
              <Link
                key={item._id}
                to={"/offer/" + item._id}
                className="card-container"
              >
                {item.images?.[0] && (
                  <img
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: 240,
                      objectFit: "cover",
                    }}
                    src={imageUrl(item.images[0].url)}
                    alt={item.title}
                  />
                )}
                <h2>{item.title}</h2>
                <p>
                  {t("LKR")} {item.price.toLocaleString(localeTag())}
                </p>
                <p>
                  {item.owner?.account?.username || t("Seller unavailable")}
                </p>
              </Link>
            ))}
          </div>
          <nav aria-label={t("Pagination")}>
            <button
              disabled={data.page <= 1}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("page", String(data.page - 1));
                setParams(next);
              }}
            >
              {" "}
              {t("Previous")}{" "}
            </button>
            <span>
              {" "}
              {t("Page")} {data.page} {t("of")}{" "}
              {Math.max(1, Math.ceil(data.count / data.limit))}{" "}
            </span>
            <button
              disabled={data.page * data.limit >= data.count}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("page", String(data.page + 1));
                setParams(next);
              }}
            >
              {" "}
              {t("Next")}{" "}
            </button>
          </nav>
        </>
      )}
    </main>
  );
}

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, errorMessage, imageUrl } from "../api";
export default function Home() {
  const [params, setParams] = useSearchParams();
  const query = params.toString();
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
    value ? next.set(key, value) : next.delete(key);
    next.set("page", "1");
    setParams(next);
  };
  return (
    <main className="container">
      <h1>Find your next pre-loved item</h1>
      <section aria-label="Search filters" className="filters">
        <label>
          Search
          <input
            value={params.get("title") || ""}
            maxLength={120}
            onChange={(e) => change("title", e.target.value)}
          />
        </label>
        <label>
          Minimum LKR
          <input
            type="number"
            min="0"
            value={params.get("priceMin") || ""}
            onChange={(e) => change("priceMin", e.target.value)}
          />
        </label>
        <label>
          Maximum LKR
          <input
            type="number"
            min="0"
            value={params.get("priceMax") || ""}
            onChange={(e) => change("priceMax", e.target.value)}
          />
        </label>
        <label>
          Sort
          <select
            value={params.get("sort") || "newest"}
            onChange={(e) => change("sort", e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </section>
      {busy ? (
        <p role="status">Loading listings…</p>
      ) : error ? (
        <div role="alert">
          {error}
          <button onClick={() => setRetry(retry + 1)}>Retry</button>
        </div>
      ) : (
        <>
          {!data?.offers.length && <p>No listings match your search.</p>}
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
                    style={{ width: "100%", height: 240, objectFit: "cover" }}
                    src={imageUrl(item.images[0].url)}
                    alt={item.title}
                  />
                )}
                <h2>{item.title}</h2>
                <p>LKR {item.price.toLocaleString("en-LK")}</p>
                <p>{item.owner?.account?.username || "Seller unavailable"}</p>
              </Link>
            ))}
          </div>
          <nav aria-label="Pagination">
            <button
              disabled={data.page <= 1}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("page", String(data.page - 1));
                setParams(next);
              }}
            >
              Previous
            </button>
            <span>
              {" "}
              Page {data.page} of{" "}
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
              Next
            </button>
          </nav>
        </>
      )}
    </main>
  );
}

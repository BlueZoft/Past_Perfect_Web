import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
export default function MyListings({ user }) {
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0),
    [remove, setRemove] = useState(null);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setError("");
    setRemove(null);
    api
      .get("/user/offers", { params: new URLSearchParams(query) })
      .then(({ data }) => {
        if (active) setData(data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, query, retry]);
  async function change(item, status) {
    setBusy(true);
    setError("");
    try {
      if (status === "removed")
        await api.delete("/offer/" + item._id, { data: { version: item.__v } });
      else
        await api.patch("/offer/" + item._id + "/status", {
          status,
          version: item.__v,
        });
      // A filtered page may become empty after an update; restart from the first page.
      const next = new URLSearchParams(params);
      next.set("page", "1");
      setParams(next);
      setRetry((value) => value + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      setRemove(null);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <h1>My listings</h1>
      <Link to="/publish">Create a listing</Link>
      <label>
        Status
        <select
          disabled={busy}
          value={params.get("status") || ""}
          onChange={(event) => {
            const next = new URLSearchParams();
            if (event.target.value) next.set("status", event.target.value);
            setParams(next);
          }}
        >
          <option value="">All current listings</option>
          <option value="active">Active</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </label>
      {error && (
        <div role="alert">
          {error}{" "}
          <button
            disabled={busy}
            onClick={() => setRetry((value) => value + 1)}
          >
            Reload listings
          </button>
        </div>
      )}
      {loading ? (
        <p role="status">Loading your listings…</p>
      ) : (
        data && (
          <>
            {!data.offers.length && <p>No listings in this view.</p>}
            {data.offers.map((item) => (
              <article className="seller-listing" key={item._id}>
                <h2>
                  <Link to={"/offer/" + item._id}>{item.title}</Link>
                </h2>
                <p>
                  LKR {item.price.toLocaleString("en-LK")} · {item.status}
                </p>
                {["active", "reserved"].includes(item.status) && (
                  <>
                    <Link to={"/my-listings/" + item._id + "/edit"}>
                      Edit listing
                    </Link>{" "}
                    <button
                      disabled={busy}
                      onClick={() =>
                        change(
                          item,
                          item.status === "active" ? "reserved" : "active",
                        )
                      }
                    >
                      {item.status === "active" ? "Reserve" : "Make available"}
                    </button>{" "}
                    <button
                      disabled={busy}
                      onClick={() => change(item, "sold")}
                    >
                      Mark sold
                    </button>{" "}
                  </>
                )}
                {remove === item._id ? (
                  <div>
                    <p>
                      Remove this listing? It will disappear from public
                      listings and cannot be restored here.
                    </p>
                    <button
                      disabled={busy}
                      onClick={() => change(item, "removed")}
                    >
                      Confirm removal
                    </button>
                    <button disabled={busy} onClick={() => setRemove(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button disabled={busy} onClick={() => setRemove(item._id)}>
                    Remove listing
                  </button>
                )}
              </article>
            ))}
            <nav aria-label="Seller pagination">
              <button
                disabled={busy || data.page <= 1}
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
                disabled={busy || data.page * data.limit >= data.count}
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
        )
      )}
    </main>
  );
}

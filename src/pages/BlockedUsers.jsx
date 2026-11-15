import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
export default function BlockedUsers({ user }) {
  const [params, setParams] = useSearchParams();
  const page = params.get("page") || "1";
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setData(null);
    setError("");
    api
      .get("/user/blocks", { params: { page } })
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [user, page, retry]);
  async function unblock(id) {
    setBusy(true);
    setError("");
    try {
      await api.delete("/user/blocks/" + id);
      setParams({ page: "1" });
      setRetry((value) => value + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <h1>Blocked users</h1>
      {error && (
        <div role="alert">
          {error}
          <button onClick={() => setRetry(retry + 1)}>Retry</button>
        </div>
      )}
      {!data && !error && <p role="status">Loading blocked users…</p>}
      {data && (
        <>
          {!data.blocks.length && <p>No blocked users.</p>}
          {data.blocks.map((item) => (
            <article key={item._id}>
              <p>{item.blocked?.account.username || "Deleted account"}</p>
              {item.blocked && (
                <button
                  disabled={busy}
                  onClick={() => unblock(item.blocked._id)}
                >
                  Unblock user
                </button>
              )}
            </article>
          ))}
          <Pagination
            {...data}
            disabled={busy}
            onChange={(value) => setParams({ page: String(value) })}
          />
        </>
      )}
    </main>
  );
}

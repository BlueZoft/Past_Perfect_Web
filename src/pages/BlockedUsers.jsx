import { t, errorText, useI18n } from "../i18n";
import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
export default function BlockedUsers({ user }) {
  useI18n();
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
      .get("/user/blocks", {
        params: {
          page,
        },
      })
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
      setParams({
        page: "1",
      });
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
      <h1>{t("Blocked users")}</h1>
      {error && (
        <div role="alert">
          {errorText(error)}
          <button onClick={() => setRetry(retry + 1)}>{t("Retry")}</button>
        </div>
      )}
      {!data && !error && (
        <p role="status">{t("Loading blocked users\u2026")}</p>
      )}
      {data && (
        <>
          {!data.blocks.length && <p>{t("No blocked users.")}</p>}
          {data.blocks.map((item) => (
            <article key={item._id}>
              <p>{item.blocked?.account.username || t("Deleted account")}</p>
              {item.blocked && (
                <button
                  disabled={busy}
                  onClick={() => unblock(item.blocked._id)}
                >
                  {" "}
                  {t("Unblock user")}{" "}
                </button>
              )}
            </article>
          ))}
          <Pagination
            {...data}
            disabled={busy}
            onChange={(value) =>
              setParams({
                page: String(value),
              })
            }
          />
        </>
      )}
    </main>
  );
}

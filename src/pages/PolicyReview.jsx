import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import { t, errorText, useI18n } from "../i18n";
import Pagination from "../components/Pagination";
export default function PolicyReview({ user }) {
  useI18n();
  const [page, setPage] = useState(1),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [note, setNote] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user?.isAdmin) return;
    let active = true;
    setData(null);
    setError("");
    api
      .get("/admin/policy-listings", { params: { page } })
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
  async function decide(item, hidden) {
    setBusy(true);
    setError("");
    try {
      await api.patch("/admin/offers/" + item._id + "/moderation", {
        hidden,
        reason: note,
        version: item.__v,
      });
      setPage(1);
      setRetry((value) => value + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <p>{t("Administrator access required")}</p>;
  return (
    <main className="container">
      <h1>{t("Policy review queue")}</h1>
      <label>
        {t("Moderation note")}
        <textarea
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      {error && (
        <div role="alert">
          {errorText(error)}
          <button
            disabled={busy}
            onClick={() => setRetry((value) => value + 1)}
          >
            {t("Retry")}
          </button>
        </div>
      )}
      {!data && !error && <p role="status">{t("Loading listings…")}</p>}
      {data && (
        <>
          {!data.offers.length && (
            <p>{t("No listings awaiting policy review.")}</p>
          )}
          {data.offers.map((item) => (
            <article key={item._id}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <p>
                {t("Policy version:")} {item.policyVersion}
              </p>
              <button
                disabled={busy || !note.trim()}
                onClick={() => decide(item, false)}
              >
                {t("Approve listing")}
              </button>
              <button
                disabled={busy || !note.trim()}
                onClick={() => decide(item, true)}
              >
                {t("Keep listing hidden")}
              </button>
            </article>
          ))}
          <Pagination {...data} onChange={setPage} />
        </>
      )}
    </main>
  );
}

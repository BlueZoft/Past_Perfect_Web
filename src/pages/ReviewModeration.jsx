import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import { t, errorText, useI18n } from "../i18n";
import Pagination from "../components/Pagination";
export default function ReviewModeration({ user }) {
  useI18n();
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [page, setPage] = useState(1),
    [retry, setRetry] = useState(0),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user?.isAdmin || user.suspended) return;
    let active = true;
    setData(null);
    setError("");
    api
      .get("/admin/reviews", { params: { page } })
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
  async function moderate(item) {
    setBusy(true);
    setError("");
    try {
      await api.patch("/admin/reviews/" + item._id, {
        version: item.revision,
        hidden: !item.review.hidden,
        reason,
      });
      setRetry((value) => value + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin || user.suspended)
    return <p>{t("Administrator access required")}</p>;
  return (
    <main className="container">
      <h1>{t("Review moderation")}</h1>
      <label>
        {t("Shared moderation reason")}
        <textarea
          maxLength={1000}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      <button disabled={busy} onClick={() => setRetry((value) => value + 1)}>
        {t("Refresh reviews")}
      </button>
      {error && <p role="alert">{errorText(error)}</p>}
      {!data && !error && <p role="status">{t("Loading reviews…")}</p>}
      {data && (
        <>
          {!data.reviews.length && <p>{t("No reviews yet.")}</p>}
          {data.reviews.map((item) => (
            <article key={item._id}>
              <h2>{item.title}</h2>
              <p>
                {item.review.rating}/5 · {t(item.status)}
              </p>
              <p>{item.review.text}</p>
              {item.paymentMode === "test" && (
                <p>
                  {t("Test order review. This is not a real customer rating.")}
                </p>
              )}
              <button
                disabled={
                  busy ||
                  !reason.trim() ||
                  [item.buyer, item.seller].includes(user._id)
                }
                onClick={() => moderate(item)}
              >
                {t(item.review.hidden ? "Restore review" : "Hide review")}
              </button>
            </article>
          ))}
          <Pagination {...data} disabled={busy} onChange={setPage} />
        </>
      )}
    </main>
  );
}

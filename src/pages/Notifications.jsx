import { t, errorText, useI18n } from "../i18n";
import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
const titles = {
  account: "Account status update",
  message: "New enquiry message",
  moderation: "Listing moderation update",
  report: "Your report has been reviewed",
  verification: "Your email has been verified",
};
export default function Notifications({ user }) {
  useI18n();
  const [params, setParams] = useSearchParams();
  const page = params.get("page") || "1";
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setData(null);
    setError("");
    api
      .get("/user/notifications", {
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
  async function read(id) {
    setBusy(true);
    setError("");
    try {
      if (id) await api.patch("/user/notifications/" + id + "/read");
      else await api.post("/user/notifications/read-all");
      window.dispatchEvent(new Event("notifications-changed"));
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
      <h1>{t("Notifications")}</h1>
      <button disabled={busy} onClick={() => setRetry(retry + 1)}>
        {t("Refresh notifications")}
      </button>
      {error && <p role="alert">{errorText(error)}</p>}
      {!data && !error && (
        <p role="status">{t("Loading notifications\u2026")}</p>
      )}
      {data && (
        <>
          <p>
            {t("Unread:")} {data.unreadCount}
          </p>
          <button disabled={busy || !data.unreadCount} onClick={() => read()}>
            {t("Mark all read")}
          </button>
          {!data.notifications.length && <p>{t("No notifications yet.")}</p>}
          {data.notifications.map((item) => (
            <article key={item._id}>
              <Link to={item.link}>
                {t(titles[item.type] || "Account update")}
              </Link>
              <p>{item.readAt ? t("Read") : t("Unread")}</p>
              {!item.readAt && (
                <button disabled={busy} onClick={() => read(item._id)}>
                  {t("Mark read")}
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

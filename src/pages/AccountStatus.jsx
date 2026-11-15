import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
import { t, errorText, useI18n } from "../i18n";
export default function AccountStatus({ user, setUser }) {
  useI18n();
  const [data, setData] = useState(null),
    [text, setText] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0),
    [page, setPage] = useState(1);
  useEffect(() => {
    if (!user) return;
    let active = true;
    api
      .get("/user/appeals", { params: { page } })
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [user, retry, page]);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/user/appeals", {
        text,
        version: user.moderationVersion,
      });
      setText("");
      setRetry((value) => value + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.get("/user/me");
      setUser(data);
      setRetry((value) => value + 1);
    } catch (err) {
      if (err.response?.status === 401) {
        setUser(null);
      } else setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  const existing = data?.appeals.some(
    (item) => item.moderationVersion === user.moderationVersion,
  );
  return (
    <main className="container">
      <h1>{t("Account status")}</h1>
      <p>{t(user.suspended ? "Account suspended" : "Account active")}</p>
      {user.suspended && (
        <p>
          {t("Reason:")} {user.suspensionReason}
        </p>
      )}
      <p>
        {t(
          "Account changes require a new sign-in. Refresh status or sign in again after an appeal decision.",
        )}
      </p>
      <button disabled={busy} onClick={refresh}>
        {t("Refresh account status")}
      </button>
      {error && <p role="alert">{errorText(error)}</p>}
      {user.suspended && data && !existing && (
        <form onSubmit={submit}>
          <label>
            {t("Appeal explanation")}
            <textarea
              required
              minLength={10}
              maxLength={2000}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <button disabled={busy}>{t("Submit appeal")}</button>
        </form>
      )}
      {data?.appeals.map((item) => (
        <article key={item._id}>
          <h2>
            {t("Appeal")}: {t(item.status)}
          </h2>
          <p>{item.text}</p>
          {item.resolution && (
            <p>
              {t("Decision:")} {item.resolution}
            </p>
          )}
        </article>
      ))}
      {data && <Pagination {...data} disabled={busy} onChange={setPage} />}
    </main>
  );
}

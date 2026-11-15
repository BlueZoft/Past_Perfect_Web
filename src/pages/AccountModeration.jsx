import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import { t, errorText, useI18n } from "../i18n";
import Pagination from "../components/Pagination";
function AppealReview({ item, onRefresh }) {
  useI18n();
  const [note, setNote] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function decide(decision) {
    setBusy(true);
    setError("");
    try {
      await api.patch("/admin/appeals/" + item.appeal._id, {
        decision,
        resolution: note,
        version: item.appeal.moderationVersion,
      });
      onRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <article>
      <h2>{item.user.username}</h2>
      <p>{item.appeal.text}</p>
      <p>{t(item.appeal.status)}</p>
      {item.appeal.status === "open" && (
        <>
          <label>
            {t("Public resolution")}
            <textarea
              required
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <button
            disabled={busy || !note.trim()}
            onClick={() => decide("accepted")}
          >
            {t("Accept and restore account")}
          </button>
          <button
            disabled={busy || !note.trim()}
            onClick={() => decide("rejected")}
          >
            {t("Reject appeal")}
          </button>
        </>
      )}
      {item.appeal.resolution && <p>{item.appeal.resolution}</p>}
      {error && <p role="alert">{errorText(error)}</p>}
    </article>
  );
}
export default function AccountModeration({ user }) {
  useI18n();
  const [id, setId] = useState(""),
    [account, setAccount] = useState(null),
    [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [data, setData] = useState(null),
    [retry, setRetry] = useState(0);
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "open",
    page = params.get("page") || "1";
  useEffect(() => {
    if (!user?.isAdmin) return;
    let active = true;
    setData(null);
    api
      .get("/admin/appeals", { params: { status, page } })
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [user, status, page, retry]);
  async function load(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setAccount(null);
    try {
      const { data } = await api.get("/admin/users/" + id.trim());
      setAccount(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function change() {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.patch(
        "/admin/users/" + account._id + "/moderation",
        {
          suspended: !account.suspended,
          reason,
          version: account.moderationVersion,
        },
      );
      setAccount(data);
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
      <h1>{t("Account moderation")}</h1>
      <form onSubmit={load}>
        <label>
          {t("User ID")}
          <input required value={id} onChange={(e) => setId(e.target.value)} />
        </label>
        <button disabled={busy}>{t("Load account")}</button>
      </form>
      {error && <p role="alert">{errorText(error)}</p>}
      {account && (
        <section>
          <h2>{account.account.username}</h2>
          <p>{t(account.suspended ? "Account suspended" : "Account active")}</p>
          <p>{account.suspensionReason}</p>
          <label>
            {t("Public reason")}
            <textarea
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button disabled={busy || !reason.trim()} onClick={change}>
            {t(account.suspended ? "Restore account" : "Suspend account")}
          </button>
        </section>
      )}
      <h2>{t("Appeals")}</h2>
      <label>
        {t("Appeal status")}
        <select
          value={status}
          onChange={(e) => setParams({ status: e.target.value })}
        >
          {["open", "accepted", "rejected"].map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </label>
      <button onClick={() => setRetry((value) => value + 1)}>
        {t("Refresh appeals")}
      </button>
      {data && (
        <>
          {!data.appeals.length && <p>{t("No appeals in this view.")}</p>}
          {data.appeals.map((item) => (
            <AppealReview
              key={item.appeal._id}
              item={item}
              onRefresh={() => setRetry((value) => value + 1)}
            />
          ))}
          <Pagination
            {...data}
            onChange={(value) => setParams({ status, page: String(value) })}
          />
        </>
      )}
    </main>
  );
}

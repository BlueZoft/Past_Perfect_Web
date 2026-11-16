import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import { t, errorText, useI18n } from "../i18n";
import { searchUrl } from "../search";
function Search({ item, busy, onRename, onRemove }) {
  const [name, setName] = useState(item.name);
  return (
    <article>
      <h2>{item.name}</h2>
      <Link to={searchUrl(item.query)}>{t("Run saved search")}</Link>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onRename(item, name);
        }}
      >
        <label>
          {t("Search name")}
          <input
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <button disabled={busy || !name.trim() || name.trim() === item.name}>
          {t("Rename search")}
        </button>
      </form>
      <button disabled={busy} onClick={() => onRemove(item)}>
        {t("Delete saved search")}
      </button>
    </article>
  );
}
export default function SavedSearches({ user }) {
  useI18n();
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user || user.suspended) return;
    let active = true;
    setData(null);
    setError("");
    api
      .get("/user/saved-searches")
      .then(({ data }) => {
        if (active) setData(data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [user, retry]);
  async function rename(item, name) {
    setBusy(true);
    setError("");
    try {
      const { data: updated } = await api.patch(
        "/user/saved-searches/" + item._id,
        { name, version: item.revision },
      );
      setData((current) => ({
        ...current,
        searches: current.searches.map((record) =>
          record._id === item._id ? updated : record,
        ),
      }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function remove(item) {
    setBusy(true);
    setError("");
    try {
      await api.delete("/user/saved-searches/" + item._id, {
        data: { version: item.revision },
      });
      setData((current) => ({
        ...current,
        count: current.count - 1,
        searches: current.searches.filter((record) => record._id !== item._id),
      }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.suspended) return <Navigate to="/account-status" replace />;
  return (
    <main className="container">
      <h1>{t("Saved searches")}</h1>
      <p>
        {t(
          "Save up to 25 searches. Running a search shows current available listings.",
        )}
      </p>
      <p>{t("Saved searches do not send alerts.")}</p>
      <Link to="/">{t("Browse items")}</Link>
      <button disabled={busy} onClick={() => setRetry((value) => value + 1)}>
        {t("Refresh saved searches")}
      </button>
      {error && <p role="alert">{errorText(error)}</p>}
      {!data && !error && <p role="status">{t("Loading saved searches…")}</p>}
      {data && (
        <>
          {!data.searches.length && <p>{t("No saved searches yet.")}</p>}
          {data.searches.map((item) => (
            <Search
              key={item._id + ":" + item.revision}
              item={item}
              busy={busy}
              onRename={rename}
              onRemove={remove}
            />
          ))}
        </>
      )}
    </main>
  );
}

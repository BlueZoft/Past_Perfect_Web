import { useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api";
import { t, errorText } from "../i18n";
export default function SaveSearch({ query, disabled }) {
  const [name, setName] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  async function save(event) {
    event.preventDefault();
    if (disabled || busy || saved || !name.trim()) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await api.post("/user/saved-searches", { name, query });
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label={t("Save this search")}>
      <form onSubmit={save}>
        <label>
          {t("Search name")}
          <input
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <button disabled={disabled || busy || saved || !name.trim()}>
          {t("Save this search")}
        </button>
      </form>
      {error && <p role="alert">{errorText(error)}</p>}
      {saved && <p role="status">{t("Search saved.")}</p>}
      <Link to="/saved-searches">{t("Saved searches")}</Link>
    </section>
  );
}

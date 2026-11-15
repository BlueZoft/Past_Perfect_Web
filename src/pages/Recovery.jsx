import { useState } from "react";
import { api, errorMessage } from "../api";
import { currentLanguage, t, errorText, useI18n } from "../i18n";
export default function Recovery() {
  useI18n();
  const [email, setEmail] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/user/recovery/request", {
        email,
        locale: currentLanguage(),
      });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container">
      <h1>{t("Recover account")}</h1>
      {done ? (
        <p role="status">
          {t("If this account exists, a recovery email has been sent")}
        </p>
      ) : (
        <form onSubmit={submit}>
          <label>
            {t("Email")}
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button disabled={busy}>{t("Send recovery link")}</button>
        </form>
      )}
      {error && <p role="alert">{errorText(error)}</p>}
    </main>
  );
}

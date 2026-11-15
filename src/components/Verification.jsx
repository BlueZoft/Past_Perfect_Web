import { useState } from "react";
import { api, errorMessage } from "../api";
import { currentLanguage, t, errorText, useI18n } from "../i18n";
export default function Verification({ user, setUser }) {
  useI18n();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false);
  async function send() {
    setBusy(true);
    setError("");
    try {
      await api.post("/user/verification/request", {
        locale: currentLanguage(),
      });
      setSent(true);
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
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>{t("Email verification")}</h2>
      <p>
        {user.emailVerified ? t("Email verified") : t("Email not verified")}
      </p>
      {!user.emailVerified && (
        <>
          <button disabled={busy} onClick={send}>
            {t("Send verification link")}
          </button>
          <button disabled={busy} onClick={refresh}>
            {t("Refresh verification status")}
          </button>
        </>
      )}
      {sent && (
        <p role="status">{t("Check your email for a verification link")}</p>
      )}
      {error && <p role="alert">{errorText(error)}</p>}
    </section>
  );
}

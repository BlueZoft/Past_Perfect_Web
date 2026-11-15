import { t, errorText, useI18n } from "../i18n";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
export default function AccountLink({ mode, setUser }) {
  useI18n();
  const location = useLocation(),
    navigate = useNavigate();
  const [token] = useState(
    () => new URLSearchParams(location.hash.slice(1)).get("token") || "",
  );
  const [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  useEffect(() => {
    if (location.hash)
      navigate(location.pathname, {
        replace: true,
      });
  }, []);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(
        mode === "verify"
          ? "/user/verification/confirm"
          : "/user/recovery/confirm",
        mode === "verify"
          ? {
              token,
            }
          : {
              token,
              password,
            },
      );
      if (mode !== "verify") setUser(null);
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="container">
      <h1>{mode === "verify" ? t("Verify email") : t("Reset password")}</h1>
      {done ? (
        <>
          <p role="status">
            {mode === "verify"
              ? t("Email verified. You can now sign in.")
              : t("Password reset. Sign in with your new password.")}
          </p>
          <Link to="/login">{t("Log in")}</Link>
        </>
      ) : token ? (
        <form onSubmit={submit}>
          {mode !== "verify" && (
            <label>
              {t("New password")}
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          <button disabled={busy}>
            {mode === "verify" ? t("Confirm email") : t("Set new password")}
          </button>
        </form>
      ) : (
        <p role="alert">
          {t("This link is missing or invalid. Request a new link.")}
        </p>
      )}
      {error && <p role="alert">{errorText(error)}</p>}
    </main>
  );
}

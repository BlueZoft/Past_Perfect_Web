import { t, errorText, useI18n } from "../i18n";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
export default function Login({ setUser }) {
  useI18n();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [username, setUsername] = useState("");
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/user/login", {
        email,
        password,
        username,
      });
      setUser(data);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main>
      <form className="signup-form container" onSubmit={submit}>
        <h1>{t("Log in")}</h1>

        <label>
          {" "}
          {t("Email")}{" "}
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          {" "}
          {t("Password")}{" "}
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button disabled={busy}>
          {busy ? t("Please wait\u2026") : t("Log in")}
        </button>
        {error && <p role="alert">{errorText(error)}</p>}
        <Link to="/recover">{t("Forgot password?")}</Link>
        <Link to="/signup">{t("Create an account")}</Link>
      </form>
    </main>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import { currentLanguage, t, errorText, useI18n } from "../i18n";
export default function SignUp({ setUser }) {
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
      const { data } = await api.post("/user/signup", {
        email,
        password,
        username,
        locale: currentLanguage(),
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
    <form className="signup-form container" onSubmit={submit}>
      <h1>{t("Sign up")}</h1>
      <label>
        {" "}
        {t("Username")}{" "}
        <input
          required
          maxLength={80}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button disabled={busy}>
        {busy ? t("Please wait\u2026") : t("Sign up")}
      </button>
      {error && <p role="alert">{errorText(error)}</p>}
      <Link to="/login">{t("Log in")}</Link>
    </form>
  );
}

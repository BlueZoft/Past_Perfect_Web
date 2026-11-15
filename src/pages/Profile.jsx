import { t, errorText, useI18n } from "../i18n";
import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { api, errorMessage } from "../api";
import AvatarEditor from "../components/AvatarEditor";
import Verification from "../components/Verification";
export default function Profile({ user, setUser }) {
  useI18n();
  const [username, setUsername] = useState(user?.account.username || ""),
    [bio, setBio] = useState(user?.account.bio || "");
  const [error, setError] = useState(""),
    [saved, setSaved] = useState(false),
    [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const { data } = await api.patch("/user/profile", {
        username,
        bio,
      });
      setUser(data);
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <h1>{t("My profile")}</h1>
      <p>
        {" "}
        {t(
          "Your username and bio are public. Do not include your address or other private information.",
        )}{" "}
      </p>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
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
            {t("Bio")}{" "}
            <textarea
              maxLength={1000}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
          <button>{t("Save profile")}</button>
        </fieldset>
      </form>
      {error && <p role="alert">{errorText(error)}</p>}
      {saved && <p role="status">{t("Profile saved.")}</p>}
      <Link to="/account-status">{t("Account status")}</Link>
      <Verification user={user} setUser={setUser} />
      <AvatarEditor user={user} setUser={setUser} />
      <Link to="/reports">{t("My reports")}</Link>
      <Link to="/blocked-users">{t("Manage blocked users")}</Link>
      <Link to={"/seller/" + user._id}>{t("View public profile")}</Link>
    </main>
  );
}

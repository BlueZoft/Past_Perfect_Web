import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { api, errorMessage } from "../api";
export default function Profile({ user, setUser }) {
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
      const { data } = await api.patch("/user/profile", { username, bio });
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
      <h1>My profile</h1>
      <p>
        Your username and bio are public. Do not include your address or other
        private information.
      </p>
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>
            Username
            <input
              required
              maxLength={80}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Bio
            <textarea
              maxLength={1000}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
          <button>Save profile</button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      {saved && <p role="status">Profile saved.</p>}
      <Link to={"/seller/" + user._id}>View public profile</Link>
    </main>
  );
}

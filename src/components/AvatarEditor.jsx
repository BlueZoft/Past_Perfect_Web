import { useState, useEffect, useRef } from "react";
import { api, errorMessage, imageUrl } from "../api";
export default function AvatarEditor({ user, setUser }) {
  const [file, setFile] = useState(null),
    [preview, setPreview] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const input = useRef();
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function change(remove = false) {
    setError("");
    if (
      !remove &&
      (!file ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024)
    ) {
      setError("Choose a JPEG, PNG or WebP avatar up to 5 MB");
      return;
    }
    setBusy(true);
    try {
      let response;
      if (remove)
        response = await api.delete("/user/avatar", {
          data: { version: user.avatarVersion || 0 },
        });
      else {
        const form = new FormData();
        form.set("version", String(user.avatarVersion || 0));
        form.set("avatar", file);
        response = await api.put("/user/avatar", form);
      }
      setUser(response.data);
      setFile(null);
      if (input.current) input.current.value = "";
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  const current = user.account.avatar?.url || user.account.avatar?.secure_url;
  return (
    <section>
      <h2>Profile photo</h2>
      {current && (
        <img
          src={imageUrl(current)}
          alt="Current avatar"
          style={{ maxWidth: 120, maxHeight: 120 }}
        />
      )}
      <label>
        New avatar
        <input
          ref={input}
          disabled={busy}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
      </label>
      {preview && (
        <img
          src={preview}
          alt="Avatar preview"
          style={{ maxWidth: 120, maxHeight: 120 }}
        />
      )}
      <button disabled={busy || !file} onClick={() => change(false)}>
        Save avatar
      </button>
      {current && (
        <button disabled={busy} onClick={() => change(true)}>
          Remove avatar
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

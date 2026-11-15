import { t, errorText, useI18n } from "../i18n";
import { useState, useEffect } from "react";
import { api, errorMessage, imageUrl } from "../api";
export default function ReplaceImages({ listing, onSaved, disabled = false }) {
  useI18n();
  const [files, setFiles] = useState([]),
    [previews, setPreviews] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);
    if (
      files.length < 1 ||
      files.length > 3 ||
      files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 5 * 1024 * 1024,
      )
    ) {
      setError("Select 1–3 JPEG, PNG or WebP photos, up to 5 MB each");
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.set("version", String(listing.__v));
      files.forEach((file) => form.append("images", file));
      const { data } = await api.put("/offer/" + listing._id + "/images", form);
      onSaved(data);
      setFiles([]);
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>{t("Listing photos")}</h2>
      <div>
        {listing.images?.map((image) => (
          <img
            key={image.publicId || image.url}
            src={imageUrl(image.url)}
            alt={t("Current listing photo")}
            style={{
              maxWidth: 150,
              maxHeight: 150,
            }}
          />
        ))}
      </div>
      <p>
        {" "}
        {t(
          "Choose all replacement photos in the order you want them displayed. This replaces the entire current set.",
        )}{" "}
      </p>
      <form onSubmit={submit}>
        <fieldset disabled={busy || disabled}>
          <label>
            {" "}
            {t("Replacement photos")}{" "}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                setFiles(Array.from(e.target.files));
                setSaved(false);
              }}
            />
          </label>
          <div>
            {previews.map((url) => (
              <img
                key={url}
                src={url}
                alt={t("Replacement preview")}
                style={{
                  maxWidth: 150,
                  maxHeight: 150,
                }}
              />
            ))}
          </div>
          <button disabled={!files.length}>
            {busy ? t("Replacing\u2026") : t("Replace all photos")}
          </button>
        </fieldset>
      </form>
      {error && <p role="alert">{errorText(error)}</p>}
      {saved && <p role="status">{t("Photos replaced.")}</p>}
    </section>
  );
}

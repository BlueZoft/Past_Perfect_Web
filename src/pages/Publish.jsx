import { t, errorText, useI18n } from "../i18n";
import { Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { api, errorMessage } from "../api";
import ListingFields from "../components/ListingFields";
import { listingError } from "../lib/listing";
export default function Publish({ token }) {
  useI18n();
  const navigate = useNavigate();
  const [value, setValue] = useState({
    category: "other",
    district: "",
    town: "",
    title: "",
    description: "",
    price: "",
    condition: "",
    size: "",
  });
  const [pictures, setPictures] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const pictureRef = useRef([]);
  pictureRef.current = pictures;
  useEffect(
    () => () =>
      pictureRef.current.forEach((item) => URL.revokeObjectURL(item.preview)),
    [],
  );
  const add = (event) => {
    const files = Array.from(event.target.files);
    event.target.value = "";
    if (files.length + pictures.length > 3) {
      setError("Maximum 3 images allowed");
      return;
    }
    if (
      files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 5 * 1024 * 1024,
      )
    ) {
      setError("Use JPEG, PNG or WebP images up to 5 MB each");
      return;
    }
    setError("");
    setPictures((previous) => [
      ...previous,
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };
  const remove = (index) => {
    URL.revokeObjectURL(pictures[index].preview);
    setPictures(pictures.filter((_, i) => i !== index));
  };
  async function submit(event) {
    event.preventDefault();
    const invalid = listingError(value);
    if (invalid || !pictures.length) {
      setError(invalid || "At least one image is required");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      Object.entries(value).forEach(([key, item]) => form.append(key, item));
      pictures.forEach((item, index) =>
        form.append("picture" + (index + 1), item.file),
      );
      const { data } = await api.post("/offer/publish", form);
      navigate("/offer/" + data._id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!token) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <h1>{t("Sell an item")}</h1>
      <form onSubmit={submit}>
        <ListingFields value={value} onChange={setValue} disabled={busy} />
        <fieldset disabled={busy}>
          <legend>{t("Photos")}</legend>
          <p>{t("Add 1\u20133 JPEG, PNG or WebP photos, up to 5 MB each.")}</p>
          {pictures.map((item, index) => (
            <div key={item.preview}>
              <img
                src={item.preview}
                alt={t("Photo preview {0}", {
                  0: index + 1,
                })}
                style={{
                  maxWidth: 200,
                  maxHeight: 200,
                }}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={t("Remove photo {0}", {
                  0: index + 1,
                })}
              >
                {" "}
                {t("Remove")}{" "}
              </button>
            </div>
          ))}
          <label>
            {" "}
            {t("Add photos")}{" "}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={add}
            />
          </label>
        </fieldset>
        {error && <p role="alert">{errorText(error)}</p>}
        <button disabled={busy}>
          {busy ? t("Publishing\u2026") : t("Publish")}
        </button>
      </form>
    </main>
  );
}

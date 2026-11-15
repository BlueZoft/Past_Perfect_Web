import { t, errorText, useI18n } from "../i18n";
import { useEffect, useState } from "react";
import { Navigate, Link, useParams, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import ListingFields from "../components/ListingFields";
import { listingError } from "../lib/listing";
import ReplaceImages from "../components/ReplaceImages";
export default function EditListing({ user }) {
  useI18n();
  const { id } = useParams(),
    navigate = useNavigate();
  const [listing, setListing] = useState(null),
    [value, setValue] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setListing(null);
    setValue(null);
    setError("");
    api
      .get("/user/offers/" + id)
      .then(({ data }) => {
        if (!active) return;
        if (data.owner?._id !== user._id) {
          setError("You cannot edit this listing");
          return;
        }
        if (
          data.moderationHidden ||
          !["active", "reserved"].includes(data.status)
        ) {
          setError("This listing is sold or hidden and cannot be edited");
          return;
        }
        setListing(data);
        setValue({
          attributes: data.attributes || {},
          category: data.category || "other",
          district: data.district || "",
          town: data.town || "",
          title: data.title,
          description: data.description,
          price: data.price,
          condition: data.condition,
          size: data.size || "",
        });
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [id, user, retry]);
  async function submit(event) {
    event.preventDefault();
    const invalid = listingError(value);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.patch("/offer/" + id, {
        ...value,
        price: Number(value.price),
        version: listing.__v,
      });
      navigate("/my-listings");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <h1>{t("Edit listing")}</h1>
      {error && (
        <div role="alert">
          {errorText(error)}{" "}
          <button disabled={busy} onClick={() => setRetry(retry + 1)}>
            {" "}
            {t("Reload listing")}{" "}
          </button>
        </div>
      )}
      {!value && !error && <p role="status">{t("Loading listing\u2026")}</p>}
      {value && (
        <form onSubmit={submit}>
          <ListingFields value={value} onChange={setValue} disabled={busy} />

          <button disabled={busy}>
            {busy ? t("Saving\u2026") : t("Save changes")}
          </button>
        </form>
      )}
      {listing && value && (
        <ReplaceImages listing={listing} onSaved={setListing} disabled={busy} />
      )}
      <Link to="/my-listings">{t("Back to my listings")}</Link>
    </main>
  );
}

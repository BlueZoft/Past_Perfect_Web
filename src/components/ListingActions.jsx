import { t, errorText, useI18n } from "../i18n";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import ReportControl from "./ReportControl";
export default function ListingActions({ listing, user }) {
  useI18n();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setSaved(null);
    setError("");
    api
      .get("/user/favourites/" + listing._id)
      .then((r) => {
        if (active) setSaved(r.data.saved);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [listing._id, user, retry]);
  async function favourite() {
    setBusy(true);
    setError("");
    try {
      if (saved) await api.delete("/user/favourites/" + listing._id);
      else await api.put("/user/favourites/" + listing._id);
      setSaved(!saved);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function enquire(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/offer/" + listing._id + "/enquiries", {
        message,
      });
      navigate("/enquiries/" + data._id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user)
    return (
      <p>
        <Link to="/login">
          {t("Log in to save this item or contact the seller")}
        </Link>
      </p>
    );
  return (
    <section aria-label={t("Listing actions")}>
      {listing.owner?._id !== user._id && (
        <ReportControl
          targetType="listing"
          target={listing._id}
          label="Report listing"
        />
      )}
      <button disabled={busy || saved === null} onClick={favourite}>
        {saved ? t("Remove favourite") : t("Save to favourites")}
      </button>
      {listing.status === "active" && listing.owner?._id !== user._id && (
        <form onSubmit={enquire}>
          <label>
            {" "}
            {t("Ask the seller")}{" "}
            <textarea
              required
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <button disabled={busy || !message.trim()}>
            {t("Send enquiry")}
          </button>
        </form>
      )}
      {error && (
        <div role="alert">
          {errorText(error)}
          {saved === null && (
            <button onClick={() => setRetry(retry + 1)}>{t("Retry")}</button>
          )}
        </div>
      )}
    </section>
  );
}

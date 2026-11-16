import { useEffect, useState, useRef } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import { t, errorText, useI18n, localeTag } from "../i18n";
const money = (value) =>
  (value / 100).toLocaleString(localeTag(), {
    style: "currency",
    currency: "LKR",
  });
export default function Checkout({ user }) {
  useI18n();
  const { id } = useParams(),
    navigate = useNavigate();
  const [quote, setQuote] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  const key = useRef({ scope: null, value: null });
  const scope = id + ":" + (user?._id || "");
  if (key.current.scope !== scope)
    key.current = {
      scope,
      value: Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join(""),
    };
  useEffect(() => {
    if (!user) return;
    let active = true;
    setQuote(null);
    setError("");
    api
      .get("/offer/" + id + "/quote")
      .then((r) => {
        if (active) setQuote(r.data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [id, user, retry]);
  async function reserve() {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/orders", {
        listingId: quote.listingId,
        listingVersion: quote.listingVersion,
        expectedTotalMinor: quote.totalMinor,
        idempotencyKey: key.current.value,
      });
      navigate("/orders/" + data._id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <h1>{t("Review order")}</h1>
      {error && (
        <div role="alert">
          {errorText(error)}
          <button
            disabled={busy}
            onClick={() => setRetry((value) => value + 1)}
          >
            {t("Reload quote")}
          </button>
        </div>
      )}
      {!quote && !error && <p role="status">{t("Loading order quote…")}</p>}
      {quote && (
        <>
          <h2>{quote.title}</h2>
          <dl>
            <dt>{t("Item price")}</dt>
            <dd>{money(quote.itemMinor)}</dd>
            <dt>{t("Platform fee")}</dt>
            <dd>{money(quote.platformFeeMinor)}</dd>
            <dt>{t("Delivery fee")}</dt>
            <dd>{money(quote.deliveryMinor)}</dd>
            <dt>{t("Total")}</dt>
            <dd>{money(quote.totalMinor)}</dd>
          </dl>
          <p>{t("Collection only. No delivery service is included.")}</p>
          <p>{t("Reservation lasts {0} minutes.", { 0: quote.holdMinutes })}</p>
          {quote.paymentMode === "test" ? (
            <p role="status">
              {t("Test payments only. No real money is moved.")}
            </p>
          ) : (
            <p>{t("Order payments are not configured. No charge was made.")}</p>
          )}
          {!user.emailVerified && (
            <p>
              <Link to="/profile">
                {t("Verify your email before ordering")}
              </Link>
            </p>
          )}
          <button
            disabled={
              busy || quote.paymentMode !== "test" || !user.emailVerified
            }
            onClick={reserve}
          >
            {t("Reserve item")}
          </button>
        </>
      )}
      <Link to="/orders">{t("My orders")}</Link>
    </main>
  );
}

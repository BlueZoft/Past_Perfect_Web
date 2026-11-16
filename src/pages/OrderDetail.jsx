import { useState, useEffect } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import { t, errorText, useI18n, localeTag } from "../i18n";
import OrderDispute from "../components/OrderDispute";
export default function OrderDetail({ user }) {
  useI18n();
  const { id } = useParams(),
    navigate = useNavigate();
  const [order, setOrder] = useState(null),
    [settings, setSettings] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (!user) return;
    let active = true;
    setOrder(null);
    setError("");
    Promise.all([api.get("/orders/" + id), api.get("/orders/config")])
      .then(([record, config]) => {
        if (active) {
          setOrder(record.data);
          setSettings(config.data);
        }
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [id, user, retry]);
  async function action(value, input = {}) {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/orders/" + id + "/" + value, {
        version: order.revision,
        ...input,
      });
      setOrder(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function contact(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/orders/" + id + "/enquiry", {
        message,
      });
      navigate("/enquiries/" + data._id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  const buyer = order?.buyer === user._id,
    seller = order?.seller === user._id;
  const money = (value) =>
    (value / 100).toLocaleString(localeTag(), {
      style: "currency",
      currency: "LKR",
    });
  return (
    <main className="container">
      <Link to="/orders">{t("My orders")}</Link>
      <h1>{t("Order details")}</h1>
      <button disabled={busy} onClick={() => setRetry((value) => value + 1)}>
        {t("Refresh order")}
      </button>
      {error && <p role="alert">{errorText(error)}</p>}
      {!order && !error && <p role="status">{t("Loading order…")}</p>}
      {order && (
        <>
          <h2>{order.title}</h2>
          <p>
            {t("Status:")} {t(order.status)}
          </p>
          <dl>
            <dt>{t("Item price")}</dt>
            <dd>{money(order.itemMinor)}</dd>
            <dt>{t("Platform fee")}</dt>
            <dd>{money(order.platformFeeMinor)}</dd>
            <dt>{t("Delivery fee")}</dt>
            <dd>{money(order.deliveryMinor)}</dd>
            <dt>{t("Total")}</dt>
            <dd>{money(order.totalMinor)}</dd>
          </dl>
          <p>{t("Collection only. No delivery service is included.")}</p>
          {order.status === "awaiting_payment" && (
            <p>
              {t("Reservation expires:")}{" "}
              <time dateTime={order.expiresAt}>
                {new Date(order.expiresAt).toLocaleString(localeTag())}
              </time>
            </p>
          )}
          {(order.paymentMode === "test" ||
            settings?.paymentMode === "test") && (
            <p role="status">
              {t("Test payments only. No real money is moved.")}
            </p>
          )}
          {order.status === "awaiting_payment" && (
            <>
              <button disabled={busy} onClick={() => action("cancel")}>
                {t("Cancel reservation")}
              </button>
              {buyer && !user.suspended && settings?.paymentMode === "test" && (
                <>
                  <button
                    disabled={busy}
                    onClick={() => action("test-success")}
                  >
                    {t("Simulate successful payment")}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => action("test-failure")}
                  >
                    {t("Simulate failed payment")}
                  </button>
                </>
              )}
            </>
          )}
          {seller && !user.suspended && order.status === "confirmed" && (
            <button disabled={busy} onClick={() => action("ready")}>
              {t("Mark ready for collection")}
            </button>
          )}
          {buyer && !user.suspended && order.status === "ready" && (
            <button disabled={busy} onClick={() => action("complete")}>
              {t("Confirm collection")}
            </button>
          )}
          <OrderDispute
            key={order._id}
            order={order}
            user={user}
            settings={settings}
            busy={busy}
            onAction={action}
          />
          {!user.suspended && (
            <form onSubmit={contact}>
              <label>
                {t("Message order participant")}
                <textarea
                  required
                  maxLength={2000}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </label>
              <button disabled={busy || !message.trim()}>
                {t("Send message")}
              </button>
            </form>
          )}
          {order.paymentReference && (
            <p>
              {t("Test reference:")} {order.paymentReference}
            </p>
          )}
        </>
      )}
    </main>
  );
}

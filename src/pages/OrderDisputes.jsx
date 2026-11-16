import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import { t, errorText, useI18n, localeTag } from "../i18n";
import Pagination from "../components/Pagination";
import OrderDispute from "../components/OrderDispute";
export default function OrderDisputes({ user }) {
  useI18n();
  const { id } = useParams();
  const [data, setData] = useState(null),
    [settings, setSettings] = useState(null),
    [status, setStatus] = useState("open"),
    [page, setPage] = useState(1),
    [retry, setRetry] = useState(0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user?.isAdmin || user.suspended) return;
    let active = true;
    setData(null);
    setError("");
    Promise.all([
      id
        ? api.get("/admin/order-disputes/" + id)
        : api.get("/admin/order-disputes", { params: { status, page } }),
      api.get("/orders/config"),
    ])
      .then(([records, config]) => {
        if (active) {
          setData(id ? { orders: [records.data] } : records.data);
          setSettings(config.data);
        }
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [user, id, status, page, retry]);
  async function decide(order, decision, input) {
    setBusy(true);
    setError("");
    try {
      await api.post("/admin/order-disputes/" + order._id + "/resolve", {
        version: order.revision,
        decision,
        ...input,
      });
      setRetry((value) => value + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin || user.suspended)
    return <p>{t("Administrator access required")}</p>;
  return (
    <main className="container">
      <h1>{t("Order disputes")}</h1>
      {id ? (
        <Link to="/admin/order-disputes">{t("Back to dispute queue")}</Link>
      ) : (
        <label>
          {t("Dispute status:")}
          <select
            value={status}
            disabled={busy}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            {["open", "refunded", "declined"].map((value) => (
              <option key={value} value={value}>
                {t(value)}
              </option>
            ))}
          </select>
        </label>
      )}
      <button disabled={busy} onClick={() => setRetry((value) => value + 1)}>
        {t("Refresh orders")}
      </button>
      {error && <p role="alert">{errorText(error)}</p>}
      {!data && !error && <p role="status">{t("Loading orders…")}</p>}
      {data && (
        <>
          {!data.orders.length && (
            <p>{t("No order disputes in this queue.")}</p>
          )}
          {data.orders.map((order) => (
            <article key={order._id}>
              <h2>
                <Link to={"/admin/order-disputes/" + order._id}>
                  {order.title}
                </Link>
              </h2>
              <p>
                {t("Status:")} {t(order.status)}
              </p>
              <p>
                {t("Total")}{" "}
                {(order.totalMinor / 100).toLocaleString(localeTag(), {
                  style: "currency",
                  currency: "LKR",
                })}
              </p>
              <p>
                {t("Buyer ID:")} {order.buyer}
              </p>
              <p>
                {t("Seller ID:")} {order.seller}
              </p>
              <OrderDispute
                order={order}
                user={user}
                admin
                settings={settings}
                busy={busy}
                onAction={(decision, input) => decide(order, decision, input)}
              />
            </article>
          ))}
          {!id && <Pagination {...data} onChange={setPage} />}
        </>
      )}
    </main>
  );
}

import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import { t, errorText, useI18n, localeTag } from "../i18n";
import Pagination from "../components/Pagination";
export default function Orders({ user }) {
  useI18n();
  const [params, setParams] = useSearchParams();
  const page = params.get("page") || "1";
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setData(null);
    setError("");
    api
      .get("/user/orders", { params: { page } })
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [user, page, retry]);
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <h1>{t("My orders")}</h1>
      <button onClick={() => setRetry((value) => value + 1)}>
        {t("Refresh orders")}
      </button>
      {error && <p role="alert">{errorText(error)}</p>}
      {!data && !error && <p role="status">{t("Loading orders…")}</p>}
      {data && (
        <>
          {!data.orders.length && <p>{t("No orders yet.")}</p>}
          {data.orders.map((order) => (
            <article key={order._id}>
              <Link to={"/orders/" + order._id}>
                <h2>{order.title}</h2>
              </Link>
              <p>
                {t(order.status)} ·{" "}
                {(order.totalMinor / 100).toLocaleString(localeTag(), {
                  style: "currency",
                  currency: "LKR",
                })}
              </p>
              <p>
                {t(
                  order.buyer === user._id
                    ? "You are the buyer"
                    : "You are the seller",
                )}
              </p>
            </article>
          ))}
          <Pagination
            {...data}
            onChange={(value) => setParams({ page: String(value) })}
          />
        </>
      )}
    </main>
  );
}

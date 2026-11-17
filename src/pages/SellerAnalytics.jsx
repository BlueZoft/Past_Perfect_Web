import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import { t, errorText, useI18n, localeTag } from "../i18n";
export default function SellerAnalytics({ user }) {
  useI18n();
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user || user.suspended) return;
    let active = true;
    setData(null);
    setError("");
    api
      .get("/user/analytics")
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [user, retry]);
  if (!user) return <Navigate to="/login" replace />;
  if (user.suspended) return <Navigate to="/account-status" replace />;
  const money = (value) =>
    (value / 100).toLocaleString(localeTag(), {
      style: "currency",
      currency: "LKR",
    });
  return (
    <main className="container">
      <h1>{t("Seller analytics")}</h1>
      <button onClick={() => setRetry((value) => value + 1)}>
        {t("Refresh analytics")}
      </button>
      {error && <p role="alert">{errorText(error)}</p>}
      {!data && !error && <p role="status">{t("Loading analytics…")}</p>}
      {data && (
        <>
          {[
            ["Listings by status", data.listings],
            ["Orders by status", data.orders],
          ].map(([title, values]) => (
            <table key={title}>
              <caption>{t(title)}</caption>
              <thead>
                <tr>
                  <th>{t("Status:")}</th>
                  <th>{t("Count")}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(values).map(([status, count]) => (
                  <tr key={status}>
                    <th scope="row">{t(status)}</th>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
          <p>
            {t("Hidden listings:")} {data.hiddenListings}
          </p>
          <h2>{t("Simulated checkout totals")}</h2>
          <p>
            {t("Simulated payments:")} {money(data.simulated.paidMinor)}
          </p>
          <p>
            {t("Simulated refunds:")} {money(data.simulated.refundedMinor)}
          </p>
          <p>
            {t(
              "These are test checkout amounts, not seller earnings or payouts.",
            )}
          </p>
        </>
      )}
    </main>
  );
}

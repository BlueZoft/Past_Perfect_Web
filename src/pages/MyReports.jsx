import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
import { t, errorText, useI18n } from "../i18n";
export default function MyReports({ user }) {
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
      .get("/user/reports", { params: { page } })
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
      <h1>{t("My reports")}</h1>
      {error && <p role="alert">{errorText(error)}</p>}
      {!data && !error && <p role="status">{t("Loading reports…")}</p>}
      <button onClick={() => setRetry(retry + 1)}>
        {t("Refresh reports")}
      </button>
      {data && (
        <>
          {!data.reports.length && <p>{t("No reports submitted.")}</p>}
          {data.reports.map((item) => (
            <article key={item._id}>
              <h2>
                {t(item.targetType)}: {t(item.reason)}
              </h2>
              <p>
                {t("Status:")} {t(item.status)}
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

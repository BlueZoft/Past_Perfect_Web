import { t, errorText, useI18n } from "../i18n";
import { useEffect, useState } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
export default function Enquiries({ user }) {
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
      .get("/user/enquiries", {
        params: {
          page,
        },
      })
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
      <h1>{t("Enquiries")}</h1>
      {error && (
        <div role="alert">
          {errorText(error)}
          <button onClick={() => setRetry(retry + 1)}>{t("Retry")}</button>
        </div>
      )}
      {!data && !error && <p role="status">{t("Loading enquiries\u2026")}</p>}
      {data && (
        <>
          {!data.enquiries.length && <p>{t("No enquiries yet.")}</p>}
          {data.enquiries.map((item) => (
            <article key={item._id}>
              <Link to={"/enquiries/" + item._id}>
                <h2>{item.title}</h2>
              </Link>
              <p>
                {" "}
                {t("With")}{" "}
                {item.buyer?._id === user._id
                  ? item.seller?.account.username || t("Unavailable seller")
                  : item.buyer?.account.username || t("Unavailable buyer")}
              </p>
            </article>
          ))}
          <Pagination
            {...data}
            onChange={(value) =>
              setParams({
                page: String(value),
              })
            }
          />
        </>
      )}
    </main>
  );
}

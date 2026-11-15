import { t, errorText, useI18n, localeTag } from "../i18n";
import { useEffect, useState } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
export default function Favourites({ user }) {
  useI18n();
  const [params, setParams] = useSearchParams();
  const page = params.get("page") || "1";
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setError("");
    setData(null);
    api
      .get("/user/favourites", {
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
  async function remove(id) {
    setBusy(true);
    setError("");
    try {
      await api.delete("/user/favourites/" + id);
      setParams({
        page: "1",
      });
      setRetry((value) => value + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <h1>{t("Favourites")}</h1>
      {error && (
        <div role="alert">
          {errorText(error)}
          <button onClick={() => setRetry(retry + 1)}>{t("Retry")}</button>
        </div>
      )}
      {!data && !error && <p role="status">{t("Loading favourites\u2026")}</p>}
      {data && (
        <>
          {!data.offers.length && <p>{t("No saved listings.")}</p>}
          {data.offers.map((item) => (
            <article key={item._id}>
              <h2>
                <Link to={"/offer/" + item._id}>{item.title}</Link>
              </h2>
              <p>
                {" "}
                {t("LKR")} {item.price.toLocaleString(localeTag())} ·{" "}
                {t(item.status)}
              </p>
              <button disabled={busy} onClick={() => remove(item._id)}>
                {" "}
                {t("Remove favourite")}{" "}
              </button>
            </article>
          ))}
          <Pagination
            {...data}
            disabled={busy}
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

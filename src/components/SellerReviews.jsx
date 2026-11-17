import { useEffect, useState } from "react";
import { api, errorMessage } from "../api";
import { t, errorText, localeTag } from "../i18n";
import Pagination from "./Pagination";
export default function SellerReviews({ id }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [page, setPage] = useState(1),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    api
      .get("/seller/" + id + "/reviews", { params: { page } })
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [id, page, retry]);
  return (
    <section aria-label={t("Seller reviews")}>
      <h2>{t("Seller reviews")}</h2>
      {error && (
        <p role="alert">
          {errorText(error)}
          <button onClick={() => setRetry((value) => value + 1)}>
            {t("Retry")}
          </button>
        </p>
      )}
      {!data && !error && <p role="status">{t("Loading reviews…")}</p>}
      {data && (
        <>
          {!!data.summary?.test?.count && (
            <p>
              {t("Test review average:")}{" "}
              {data.summary.test.average.toLocaleString(localeTag(), {
                maximumFractionDigits: 1,
              })}
              /5 · {data.summary.test.count}
            </p>
          )}
          {!(data.reviews || []).length && <p>{t("No visible reviews.")}</p>}
          {(data.reviews || []).map((review, index) => (
            <article key={index}>
              <p>
                {review.reviewer} · {review.rating}/5
              </p>
              <p>{review.text}</p>
              {review.test && (
                <p>
                  {t("Test order review. This is not a real customer rating.")}
                </p>
              )}
            </article>
          ))}
          {data.limit && <Pagination {...data} onChange={setPage} />}
        </>
      )}
    </section>
  );
}

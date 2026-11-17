import { t, errorText, useI18n } from "../i18n";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import SellerReviews from "../components/SellerReviews";
import OfferCards from "../components/OfferCards";
import Pagination from "../components/Pagination";
import BlockControl from "../components/BlockControl";
import ReportControl from "../components/ReportControl";
import { imageUrl } from "../api";
export default function Seller({ user }) {
  useI18n();
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const page = params.get("page") || "1";
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    api
      .get("/seller/" + id, {
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
  }, [id, page, retry]);
  if (error)
    return (
      <div role="alert">
        {errorText(error)}
        <button onClick={() => setRetry(retry + 1)}>{t("Retry")}</button>
      </div>
    );
  if (!data) return <p role="status">{t("Loading seller\u2026")}</p>;
  return (
    <main className="container">
      <h1>{data.seller.account.username}</h1>
      <p>{data.seller.account.bio || t("This seller has not added a bio.")}</p>
      {data.seller.account.avatar?.url && (
        <img
          src={imageUrl(data.seller.account.avatar.url)}
          alt={t("Seller avatar")}
          style={{
            maxWidth: 120,
            maxHeight: 120,
          }}
        />
      )}
      {user && user._id !== id && (
        <>
          <BlockControl target={id} />
          <ReportControl targetType="user" target={id} label="Report seller" />
        </>
      )}
      {data.seller.emailVerified && <p>{t("Email verified")}</p>}
      <SellerReviews key={id} id={id} />
      <h2>{t("Active listings")}</h2>
      {!data.offers.length && <p>{t("No active listings.")}</p>}
      <OfferCards offers={data.offers} />
      <Pagination
        {...data}
        onChange={(value) =>
          setParams({
            page: String(value),
          })
        }
      />
    </main>
  );
}

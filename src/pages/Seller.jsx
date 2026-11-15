import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import OfferCards from "../components/OfferCards";
import Pagination from "../components/Pagination";
import BlockControl from "../components/BlockControl";
import ReportControl from "../components/ReportControl";
import { imageUrl } from "../api";
export default function Seller({ user }) {
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
      .get("/seller/" + id, { params: { page } })
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
        {error}
        <button onClick={() => setRetry(retry + 1)}>Retry</button>
      </div>
    );
  if (!data) return <p role="status">Loading seller…</p>;
  return (
    <main className="container">
      <h1>{data.seller.account.username}</h1>
      <p>{data.seller.account.bio || "This seller has not added a bio."}</p>
      {data.seller.account.avatar?.url && (
        <img
          src={imageUrl(data.seller.account.avatar.url)}
          alt="Seller avatar"
          style={{ maxWidth: 120, maxHeight: 120 }}
        />
      )}
      {user && user._id !== id && (
        <>
          <BlockControl target={id} />
          <ReportControl targetType="user" target={id} label="Report seller" />
        </>
      )}
      <h2>Active listings</h2>
      {!data.offers.length && <p>No active listings.</p>}
      <OfferCards offers={data.offers} />
      <Pagination
        {...data}
        onChange={(value) => setParams({ page: String(value) })}
      />
    </main>
  );
}

import { useEffect, useState } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
export default function Enquiries({ user }) {
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
      .get("/user/enquiries", { params: { page } })
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
      <h1>Enquiries</h1>
      {error && (
        <div role="alert">
          {error}
          <button onClick={() => setRetry(retry + 1)}>Retry</button>
        </div>
      )}
      {!data && !error && <p role="status">Loading enquiries…</p>}
      {data && (
        <>
          {!data.enquiries.length && <p>No enquiries yet.</p>}
          {data.enquiries.map((item) => (
            <article key={item._id}>
              <Link to={"/enquiries/" + item._id}>
                <h2>{item.title}</h2>
              </Link>
              <p>
                With{" "}
                {item.buyer?._id === user._id
                  ? item.seller?.account.username || "Unavailable seller"
                  : item.buyer?.account.username || "Unavailable buyer"}
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

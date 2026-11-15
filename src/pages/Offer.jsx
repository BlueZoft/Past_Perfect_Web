import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, errorMessage, imageUrl } from "../api";
import ListingActions from "../components/ListingActions";
export default function Offer({ user }) {
  const { id } = useParams();
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    api
      .get("/offer/" + id)
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p role="status">Loading listing…</p>;
  return (
    <main className="container">
      <h1>{data.title}</h1>
      <div className="offer-container">
        <div>
          {data.images.map((image, i) => (
            <img
              key={image.publicId || i}
              style={{ maxWidth: "100%", maxHeight: 400 }}
              src={imageUrl(image.url)}
              alt={`${data.title} — photo ${i + 1}`}
            />
          ))}
        </div>
        <section>
          <h2>LKR {data.price.toLocaleString("en-LK")}</h2>
          <p>{data.description}</p>
          <p>Condition: {data.condition}</p>
          {data.size && <p>Size: {data.size}</p>}
          <p>
            Seller:{" "}
            {data.owner ? (
              <Link to={"/seller/" + data.owner._id}>
                {data.owner.account?.username || "Unavailable"}
              </Link>
            ) : (
              "Unavailable"
            )}
          </p>
          <p>Category: {data.category || "other"}</p>
          <p>Location: {data.town || data.district || "Not specified"}</p>
          <p>Status: {data.status}</p>
          <ListingActions listing={data} user={user} />
          <p>Online checkout is not available yet.</p>
        </section>
      </div>
    </main>
  );
}

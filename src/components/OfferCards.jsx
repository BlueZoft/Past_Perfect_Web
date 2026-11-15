import { Link } from "react-router-dom";
import { imageUrl } from "../api";
export default function OfferCards({ offers }) {
  return (
    <div className="offers">
      {offers.map((item) => (
        <article key={item._id} className="card-container">
          <Link to={"/offer/" + item._id}>
            {item.images?.[0] && (
              <img
                loading="lazy"
                src={imageUrl(item.images[0].url)}
                alt={item.title}
                style={{ width: "100%", height: 200, objectFit: "cover" }}
              />
            )}
            <h2>{item.title}</h2>
          </Link>
          <p>LKR {item.price.toLocaleString("en-LK")}</p>
          <p>{item.status}</p>
        </article>
      ))}
    </div>
  );
}

import { t, errorText, useI18n, localeTag } from "../i18n";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, errorMessage, imageUrl } from "../api";
import ListingActions from "../components/ListingActions";
export default function Offer({ user }) {
  useI18n();
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
  if (error) return <p role="alert">{errorText(error)}</p>;
  if (!data) return <p role="status">{t("Loading listing\u2026")}</p>;
  return (
    <main className="container">
      <h1>{data.title}</h1>
      <div className="offer-container">
        <div>
          {data.images.map((image, i) => (
            <img
              key={image.publicId || i}
              style={{
                maxWidth: "100%",
                maxHeight: 400,
              }}
              src={imageUrl(image.url)}
              alt={t("Photo {0} of {title}", {
                0: i + 1,
                title: data.title,
              })}
            />
          ))}
        </div>
        <section>
          <h2>
            {t("LKR")} {data.price.toLocaleString(localeTag())}
          </h2>
          <p>{data.description}</p>
          <p>
            {t("Condition:")} {t(data.condition)}
          </p>
          {data.size && (
            <p>
              {t("Size:")} {data.size}
            </p>
          )}
          <p>
            {" "}
            {t("Seller:")}{" "}
            {data.owner ? (
              <Link to={"/seller/" + data.owner._id}>
                {data.owner.account?.username || t("Unavailable")}
              </Link>
            ) : (
              t("Unavailable")
            )}
          </p>
          <p>
            {t("Category:")} {t(data.category || "other")}
          </p>
          <p>
            {t("Location:")} {data.town || data.district || t("Not specified")}
          </p>
          <p>
            {t("Status:")} {t(data.status)}
          </p>
          <ListingActions listing={data} user={user} />
          <p>{t("Online checkout is not available yet.")}</p>
        </section>
      </div>
    </main>
  );
}

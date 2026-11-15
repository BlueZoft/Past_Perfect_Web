import { t, errorText, useI18n, localeTag } from "../i18n";
import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
export default function MyListings({ user }) {
  useI18n();
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0),
    [remove, setRemove] = useState(null);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setError("");
    setRemove(null);
    api
      .get("/user/offers", {
        params: new URLSearchParams(query),
      })
      .then(({ data }) => {
        if (active) setData(data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, query, retry]);
  async function change(item, status) {
    setBusy(true);
    setError("");
    try {
      if (status === "removed")
        await api.delete("/offer/" + item._id, {
          data: {
            version: item.__v,
          },
        });
      else
        await api.patch("/offer/" + item._id + "/status", {
          status,
          version: item.__v,
        });
      // A filtered page may become empty after an update; restart from the first page.
      const next = new URLSearchParams(params);
      next.set("page", "1");
      setParams(next);
      setRetry((value) => value + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      setRemove(null);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <h1>{t("My listings")}</h1>
      <Link to="/publish">{t("Create a listing")}</Link>
      <label>
        {" "}
        {t("Status")}{" "}
        <select
          disabled={busy}
          value={params.get("status") || ""}
          onChange={(event) => {
            const next = new URLSearchParams();
            if (event.target.value) next.set("status", event.target.value);
            setParams(next);
          }}
        >
          <option value="">{t("All current listings")}</option>
          <option value="active">{t("Active")}</option>
          <option value="reserved">{t("Reserved")}</option>
          <option value="sold">{t("Sold")}</option>
        </select>
      </label>
      {error && (
        <div role="alert">
          {errorText(error)}{" "}
          <button
            disabled={busy}
            onClick={() => setRetry((value) => value + 1)}
          >
            {" "}
            {t("Reload listings")}{" "}
          </button>
        </div>
      )}
      {loading ? (
        <p role="status">{t("Loading your listings\u2026")}</p>
      ) : (
        data && (
          <>
            {!data.offers.length && <p>{t("No listings in this view.")}</p>}
            {data.offers.map((item) => (
              <article className="seller-listing" key={item._id}>
                <h2>
                  <Link to={"/offer/" + item._id}>{item.title}</Link>
                </h2>
                <p>
                  {" "}
                  {t("LKR")} {item.price.toLocaleString(localeTag())} ·{" "}
                  {t(item.status)}
                </p>
                {!item.moderationHidden &&
                  ["active", "reserved"].includes(item.status) && (
                    <>
                      <Link to={"/my-listings/" + item._id + "/edit"}>
                        {" "}
                        {t("Edit listing")}{" "}
                      </Link>{" "}
                      <button
                        disabled={busy}
                        onClick={() =>
                          change(
                            item,
                            item.status === "active" ? "reserved" : "active",
                          )
                        }
                      >
                        {item.status === "active"
                          ? t("Reserve")
                          : t("Make available")}
                      </button>{" "}
                      <button
                        disabled={busy}
                        onClick={() => change(item, "sold")}
                      >
                        {" "}
                        {t("Mark sold")}{" "}
                      </button>{" "}
                    </>
                  )}
                {item.moderationHidden && (
                  <p>
                    {" "}
                    {t(
                      "Hidden by moderation. You can remove this listing, but cannot edit or reactivate it.",
                    )}{" "}
                  </p>
                )}
                {remove === item._id ? (
                  <div>
                    <p>
                      {" "}
                      {t(
                        "Remove this listing? It will disappear from public listings and cannot be restored here.",
                      )}{" "}
                    </p>
                    <button
                      disabled={busy}
                      onClick={() => change(item, "removed")}
                    >
                      {" "}
                      {t("Confirm removal")}{" "}
                    </button>
                    <button disabled={busy} onClick={() => setRemove(null)}>
                      {" "}
                      {t("Cancel")}{" "}
                    </button>
                  </div>
                ) : (
                  <button disabled={busy} onClick={() => setRemove(item._id)}>
                    {" "}
                    {t("Remove listing")}{" "}
                  </button>
                )}
              </article>
            ))}
            <nav aria-label={t("Seller pagination")}>
              <button
                disabled={busy || data.page <= 1}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set("page", String(data.page - 1));
                  setParams(next);
                }}
              >
                {" "}
                {t("Previous")}{" "}
              </button>
              <span>
                {" "}
                {t("Page")} {data.page} {t("of")}{" "}
                {Math.max(1, Math.ceil(data.count / data.limit))}{" "}
              </span>
              <button
                disabled={busy || data.page * data.limit >= data.count}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set("page", String(data.page + 1));
                  setParams(next);
                }}
              >
                {" "}
                {t("Next")}{" "}
              </button>
            </nav>
          </>
        )
      )}
    </main>
  );
}

import { t, errorText, useI18n } from "../i18n";
import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
function ReportReview({ report, onRefresh }) {
  useI18n();
  const [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [listing, setListing] = useState(null);
  async function load() {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.get("/admin/offers/" + report.target);
      setListing(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function visibility() {
    if (!note.trim()) {
      setError("Add a moderation reason first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.patch(
        "/admin/offers/" + listing._id + "/moderation",
        {
          hidden: !listing.moderationHidden,
          reason: note,
          version: listing.__v,
        },
      );
      setListing(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  async function review(status) {
    if (!note.trim()) {
      setError("Add a resolution note first");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.patch("/admin/reports/" + report._id, {
        status,
        resolution: note,
        version: report.__v,
      });
      onRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="seller-listing">
      <h2>
        {t(report.targetType)}: {t(report.reason)}
      </h2>
      <p>
        {t("Target ID:")} {report.target}
      </p>
      <p>
        {t("Reporter:")} {report.reporter?.account.username || t("Unavailable")}
      </p>
      <p
        style={{
          whiteSpace: "pre-wrap",
        }}
      >
        {" "}
        {t("Reported content:")} {report.snapshot}
      </p>
      <p>
        {t("Details:")} {report.details || t("None supplied")}
      </p>
      <p>
        {t("Status:")} {t(report.status)}
      </p>
      {report.targetType === "listing" && (
        <>
          <button disabled={busy} onClick={load}>
            {" "}
            {t("Load current listing")}{" "}
          </button>
          {listing && (
            <>
              <p>
                {listing.title} · {t(listing.status)} ·{" "}
                {listing.moderationHidden ? t("Hidden") : t("Visible")}
              </p>
              <button
                disabled={busy || listing.status === "removed"}
                onClick={visibility}
              >
                {listing.moderationHidden
                  ? t("Restore visibility")
                  : t("Hide listing")}
              </button>
            </>
          )}
        </>
      )}
      <label>
        {" "}
        {t("Moderation note")}{" "}
        <textarea
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      {report.status === "open" ? (
        <>
          <button disabled={busy} onClick={() => review("resolved")}>
            {" "}
            {t("Resolve report")}{" "}
          </button>
          <button disabled={busy} onClick={() => review("dismissed")}>
            {" "}
            {t("Dismiss report")}{" "}
          </button>
        </>
      ) : (
        <p>
          {t("Resolution:")} {report.resolution}
        </p>
      )}
      {error && <p role="alert">{errorText(error)}</p>}
    </article>
  );
}
export default function Moderation({ user }) {
  useI18n();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "open",
    page = params.get("page") || "1";
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user?.isAdmin) return;
    let active = true;
    setData(null);
    setError("");
    api
      .get("/admin/reports", {
        params: {
          status,
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
  }, [user, status, page, retry]);
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin)
    return (
      <main className="container">
        <h1>{t("Administrator access required")}</h1>
      </main>
    );
  return (
    <main className="container">
      <h1>{t("Moderation queue")}</h1>
      <p>
        {" "}
        {t(
          "Listing visibility and report resolution are separate decisions. Resolve a report after applying any required listing action.",
        )}{" "}
      </p>
      <label>
        {" "}
        {t("Report status")}{" "}
        <select
          value={status}
          onChange={(e) =>
            setParams({
              status: e.target.value,
            })
          }
        >
          {["open", "resolved", "dismissed"].map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <div role="alert">
          {errorText(error)}
          <button onClick={() => setRetry(retry + 1)}>{t("Retry")}</button>
        </div>
      )}
      {!data && !error && <p role="status">{t("Loading reports\u2026")}</p>}
      {data && (
        <>
          {!data.reports.length && <p>{t("No reports in this queue.")}</p>}
          {data.reports.map((report) => (
            <ReportReview
              key={report._id}
              report={report}
              onRefresh={() => setRetry((value) => value + 1)}
            />
          ))}
          <Pagination
            {...data}
            onChange={(value) =>
              setParams({
                status,
                page: String(value),
              })
            }
          />
        </>
      )}
    </main>
  );
}

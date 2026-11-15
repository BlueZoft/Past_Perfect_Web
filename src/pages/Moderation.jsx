import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
function ReportReview({ report, onRefresh }) {
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
        {report.targetType}: {report.reason}
      </h2>
      <p>Target ID: {report.target}</p>
      <p>Reporter: {report.reporter?.account.username || "Unavailable"}</p>
      <p style={{ whiteSpace: "pre-wrap" }}>
        Reported content: {report.snapshot}
      </p>
      <p>Details: {report.details || "None supplied"}</p>
      <p>Status: {report.status}</p>
      {report.targetType === "listing" && (
        <>
          <button disabled={busy} onClick={load}>
            Load current listing
          </button>
          {listing && (
            <>
              <p>
                {listing.title} · {listing.status} ·{" "}
                {listing.moderationHidden ? "Hidden" : "Visible"}
              </p>
              <button
                disabled={busy || listing.status === "removed"}
                onClick={visibility}
              >
                {listing.moderationHidden
                  ? "Restore visibility"
                  : "Hide listing"}
              </button>
            </>
          )}
        </>
      )}
      <label>
        Moderation note
        <textarea
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      {report.status === "open" ? (
        <>
          <button disabled={busy} onClick={() => review("resolved")}>
            Resolve report
          </button>
          <button disabled={busy} onClick={() => review("dismissed")}>
            Dismiss report
          </button>
        </>
      ) : (
        <p>Resolution: {report.resolution}</p>
      )}
      {error && <p role="alert">{error}</p>}
    </article>
  );
}
export default function Moderation({ user }) {
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
      .get("/admin/reports", { params: { status, page } })
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
        <h1>Administrator access required</h1>
      </main>
    );
  return (
    <main className="container">
      <h1>Moderation queue</h1>
      <p>
        Listing visibility and report resolution are separate decisions. Resolve
        a report after applying any required listing action.
      </p>
      <label>
        Report status
        <select
          value={status}
          onChange={(e) => setParams({ status: e.target.value })}
        >
          {["open", "resolved", "dismissed"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      {error && (
        <div role="alert">
          {error}
          <button onClick={() => setRetry(retry + 1)}>Retry</button>
        </div>
      )}
      {!data && !error && <p role="status">Loading reports…</p>}
      {data && (
        <>
          {!data.reports.length && <p>No reports in this queue.</p>}
          {data.reports.map((report) => (
            <ReportReview
              key={report._id}
              report={report}
              onRefresh={() => setRetry((value) => value + 1)}
            />
          ))}
          <Pagination
            {...data}
            onChange={(value) => setParams({ status, page: String(value) })}
          />
        </>
      )}
    </main>
  );
}

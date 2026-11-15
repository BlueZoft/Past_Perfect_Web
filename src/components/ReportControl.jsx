import { useState } from "react";
import { api, errorMessage } from "../api";
export default function ReportControl({
  targetType,
  target,
  label = "Report",
}) {
  const [open, setOpen] = useState(false),
    [reason, setReason] = useState("other"),
    [details, setDetails] = useState(""),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/reports", { targetType, target, reason, details });
      setSent(true);
      setOpen(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (sent) return <p role="status">Report received for review.</p>;
  return (
    <section aria-label={label}>
      <button disabled={busy} onClick={() => setOpen(!open)}>
        {open ? "Cancel report" : label}
      </button>
      {open && (
        <form onSubmit={submit}>
          <label>
            Report reason
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {["scam", "prohibited-item", "harassment", "spam", "other"].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Report details
            <textarea
              maxLength={2000}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </label>
          <button disabled={busy}>Submit report</button>
        </form>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

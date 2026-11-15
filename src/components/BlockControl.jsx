import { useEffect, useState } from "react";
import { api, errorMessage } from "../api";
export default function BlockControl({ target }) {
  const [blocked, setBlocked] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setBlocked(null);
    setError("");
    api
      .get("/user/blocks/" + target)
      .then((r) => {
        if (active) setBlocked(r.data.blocked);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [target, retry]);
  async function toggle() {
    setBusy(true);
    setError("");
    try {
      if (blocked) await api.delete("/user/blocks/" + target);
      else await api.put("/user/blocks/" + target);
      setBlocked(!blocked);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <p>
        Blocking stops new messages in both directions. Existing conversation
        history remains available.
      </p>
      <button disabled={busy || blocked === null} onClick={toggle}>
        {blocked ? "Unblock user" : "Block user"}
      </button>
      {error && (
        <div role="alert">
          {error}
          <button onClick={() => setRetry(retry + 1)}>
            Retry block status
          </button>
        </div>
      )}
    </section>
  );
}

import { t, errorText, useI18n, localeTag } from "../i18n";
import { useEffect, useState } from "react";
import { Navigate, Link, useParams, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import Pagination from "../components/Pagination";
import BlockControl from "../components/BlockControl";
import ReportControl from "../components/ReportControl";
export default function Enquiry({ user }) {
  useI18n();
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const page = params.get("page") || "1";
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setData(null);
    setError("");
    api
      .get("/enquiry/" + id + "/messages", {
        params: {
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
  }, [user, id, page, retry]);
  async function send(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/enquiry/" + id + "/messages", {
        message,
      });
      setMessage("");
      setParams({
        page: String(Math.ceil((data.count + 1) / data.limit)),
      });
      setRetry((value) => value + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <Link to="/enquiries">{t("All enquiries")}</Link>
      <h1>{data?.enquiry.title || t("Enquiry")}</h1>
      <p>
        {" "}
        {t(
          "Keep sensitive personal and payment information out of messages. Messages update when you refresh.",
        )}{" "}
      </p>
      <button disabled={busy} onClick={() => setRetry(retry + 1)}>
        {" "}
        {t("Refresh messages")}{" "}
      </button>
      {error && <p role="alert">{errorText(error)}</p>}
      {!data && !error && <p role="status">{t("Loading messages\u2026")}</p>}
      {data && (
        <>
          {data.enquiry.buyer && data.enquiry.seller && (
            <BlockControl
              target={
                data.enquiry.buyer._id === user._id
                  ? data.enquiry.seller._id
                  : data.enquiry.buyer._id
              }
            />
          )}
          <ol aria-label={t("Messages")}>
            {data.messages.map((item) => (
              <li key={item._id}>
                <strong>
                  {item.sender === user._id
                    ? t("You")
                    : data.enquiry.buyer?._id === item.sender
                      ? data.enquiry.buyer.account.username
                      : data.enquiry.seller?.account.username ||
                        t("Participant")}
                </strong>
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.text}
                </p>
                {item.sender !== user._id && (
                  <ReportControl
                    targetType="message"
                    target={item._id}
                    label="Report message"
                  />
                )}
                <time dateTime={item.createdAt}>
                  {new Date(item.createdAt).toLocaleString(localeTag())}
                </time>
              </li>
            ))}
          </ol>
          <Pagination
            {...data}
            disabled={busy}
            onChange={(value) =>
              setParams({
                page: String(value),
              })
            }
          />
          <form onSubmit={send}>
            <label>
              {" "}
              {t("Reply")}{" "}
              <textarea
                required
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <button disabled={busy || !message.trim()}>
              {t("Send reply")}
            </button>
          </form>
        </>
      )}
    </main>
  );
}

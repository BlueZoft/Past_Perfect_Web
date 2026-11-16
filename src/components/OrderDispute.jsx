import { useState } from "react";
import { t, localeTag } from "../i18n";

export default function OrderDispute({
  order,
  user,
  settings,
  busy,
  onAction,
  admin = false,
}) {
  const [reason, setReason] = useState(""),
    [response, setResponse] = useState(""),
    [resolution, setResolution] = useState("");
  const dispute = order.dispute,
    buyer = order.buyer === user._id,
    seller = order.seller === user._id,
    test = settings?.paymentMode === "test" && order.paymentMode === "test";
  const resolve = admin ? !buyer && !seller : seller;
  return (
    <section aria-label={t("Order dispute")}>
      {dispute && (
        <>
          <h2>{t("Order dispute")}</h2>
          <p>
            {t("Dispute status:")} {t(dispute.status)}
          </p>
          <h3>{t("Buyer reason")}</h3>
          <p>{dispute.reason}</p>
          {dispute.response && (
            <>
              <h3>{t("Seller response")}</h3>
              <p>{dispute.response}</p>
            </>
          )}
          {dispute.resolution && (
            <>
              <h3>{t("Resolution shared with both participants")}</h3>
              <p>{dispute.resolution}</p>
            </>
          )}
          {dispute.refundReference && (
            <>
              <p>
                {t("Simulated refund:")}{" "}
                {(dispute.refundMinor / 100).toLocaleString(localeTag(), {
                  style: "currency",
                  currency: "LKR",
                })}
              </p>
              <p>
                {t("Test refund reference:")} {dispute.refundReference}
              </p>
            </>
          )}
          <p>{t("Refunds are simulated. No real money is returned.")}</p>
          {dispute.status === "refunded" && (
            <p>
              {t(
                "A refund does not confirm item return. Arrange any return with the other participant.",
              )}
            </p>
          )}
        </>
      )}
      {!admin &&
        buyer &&
        test &&
        !dispute &&
        ["confirmed", "ready", "completed"].includes(order.status) && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onAction("dispute", { reason });
            }}
          >
            <h2>{t("Request a refund or report an order problem")}</h2>
            <p>
              {t(
                "One dispute per order. Explain the issue for the seller and administrator.",
              )}
            </p>
            <label>
              {t("Buyer reason")}
              <textarea
                required
                maxLength={2000}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <button disabled={busy || !reason.trim()}>
              {t("Open order dispute")}
            </button>
          </form>
        )}
      {dispute?.status === "open" && (
        <>
          <p>{t("Collection actions are paused during dispute review.")}</p>
          {!admin && seller && !dispute.respondedAt && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onAction("dispute-response", { response });
              }}
            >
              <label>
                {t("Seller response")}
                <textarea
                  required
                  maxLength={2000}
                  value={response}
                  onChange={(event) => setResponse(event.target.value)}
                />
              </label>
              <button disabled={busy || !response.trim()}>
                {t("Submit seller response")}
              </button>
            </form>
          )}
          {resolve && (test || admin) && (
            <div>
              <label>
                {t("Resolution shared with both participants")}
                <textarea
                  maxLength={2000}
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value)}
                />
              </label>
              {test && (
                <button
                  disabled={busy || !resolution.trim()}
                  onClick={() =>
                    onAction(admin ? "refund" : "test-refund", { resolution })
                  }
                >
                  {t("Simulate full refund")}
                </button>
              )}
              {admin && (
                <button
                  disabled={busy || !resolution.trim()}
                  onClick={() => onAction("decline", { resolution })}
                >
                  {t("Decline refund and resume order")}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

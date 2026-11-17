import { useState } from "react";
import { t } from "../i18n";
export default function OrderReview({ order, user, busy, onAction }) {
  const [rating, setRating] = useState("5"),
    [text, setText] = useState("");
  if (order.review)
    return (
      <section aria-label={t("Order review")}>
        <h2>{t("Order review")}</h2>
        <p>
          {t("Rating:")} {order.review.rating}/5
        </p>
        <p>{order.review.text}</p>
        {order.review.hidden && <p>{t("Review hidden by moderation")}</p>}
        {order.paymentMode === "test" && (
          <p>{t("Test order review. This is not a real customer rating.")}</p>
        )}
      </section>
    );
  if (
    order.status !== "completed" ||
    user.suspended ||
    order.buyer !== user._id
  )
    return null;
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onAction("review", { rating: Number(rating), text });
      }}
    >
      <h2>{t("Review this order")}</h2>
      <p>{t("One review per completed order. Reviews cannot be edited.")}</p>
      {order.paymentMode === "test" && (
        <p>{t("Test order review. This is not a real customer rating.")}</p>
      )}
      <label>
        {t("Rating")}
        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}/5
            </option>
          ))}
        </select>
      </label>
      <label>
        {t("Review text")}
        <textarea
          required
          maxLength={2000}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </label>
      <button disabled={busy || !text.trim()}>{t("Submit review")}</button>
    </form>
  );
}

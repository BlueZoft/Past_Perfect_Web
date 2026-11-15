import { t, errorText, useI18n } from "../i18n";
export default function Pagination({
  page,
  count,
  limit,
  onChange,
  disabled = false,
}) {
  useI18n();
  return (
    <nav aria-label={t("Pagination")}>
      <button
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {" "}
        {t("Previous")}{" "}
      </button>
      <span>
        {" "}
        {t("Page")} {page} {t("of")}{" "}
        {Math.max(1, Math.ceil(count / limit))}{" "}
      </span>
      <button
        disabled={disabled || page * limit >= count}
        onClick={() => onChange(page + 1)}
      >
        {" "}
        {t("Next")}{" "}
      </button>
    </nav>
  );
}

import { t, errorText, useI18n } from "../i18n";
export default function Payment() {
  useI18n();
  return (
    <main className="container">
      <h1>{t("Online payments unavailable")}</h1>
      <p>
        {" "}
        {t(
          "Payment and delivery services have not been configured. No charge has been made.",
        )}{" "}
      </p>
    </main>
  );
}

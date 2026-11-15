import { t, useI18n } from "../i18n";
export default function NotFound() {
  useI18n();
  return (
    <main>
      <h1>{t("404 Not Found")}</h1>
    </main>
  );
}

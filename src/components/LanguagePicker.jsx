import { useI18n, t } from "../i18n";
export default function LanguagePicker() {
  const { language, setLanguage } = useI18n();
  return (
    <label>
      {t("Language")}
      <select
        aria-label={t("Language")}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        <option value="en">English</option>
        <option value="si">සිංහල</option>
        <option value="ta">தமிழ்</option>
      </select>
    </label>
  );
}

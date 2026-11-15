import { useState, useEffect } from "react";
import { api, errorMessage } from "../api";
import { t, errorText, useI18n } from "../i18n";
export default function Policy() {
  const { language } = useI18n();
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api
      .get("/policy")
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <main className="container">
      <h1>{t("Marketplace rules")}</h1>
      {error && <p role="alert">{errorText(error)}</p>}
      {data && (
        <>
          <p>{data.notice[language] || data.notice.en}</p>
          <p>
            {t("Policy version:")} {data.version}
          </p>
          <ul>
            {data.rules.map((rule) => (
              <li key={rule.id}>
                {rule.label[language] || rule.label.en} —{" "}
                {t(
                  rule.action === "reject" ? "Not allowed" : "Requires review",
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

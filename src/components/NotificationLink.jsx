import { t, errorText, useI18n } from "../i18n";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
export default function NotificationLink() {
  useI18n();
  const [count, setCount] = useState(null);
  useEffect(() => {
    let active = true;
    const load = () =>
      api
        .get("/user/notifications", {
          params: {
            limit: 1,
          },
        })
        .then((r) => {
          if (active) setCount(r.data.unreadCount);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 30000);
    window.addEventListener("focus", load);
    window.addEventListener("notifications-changed", load);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", load);
      window.removeEventListener("notifications-changed", load);
    };
  }, []);
  return (
    <Link to="/notifications">
      {t("Notifications")}
      {count > 0 ? ` (${count})` : ""}
    </Link>
  );
}

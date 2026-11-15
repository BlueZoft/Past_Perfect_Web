import { t, errorText, useI18n } from "../i18n";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import NotificationLink from "./NotificationLink";
import LanguagePicker from "./LanguagePicker";
export default function Header({ logo, token, setUser }) {
  useI18n();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  async function logout() {
    try {
      await api.post("/user/logout");
      setUser(null);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 401) {
        setUser(null);
        navigate("/");
      } else setError(errorMessage(err));
    }
  }
  return (
    <header className="header container">
      <Link to="/">
        <img className="logo" src={logo} alt={t("PastPerfect home")} />
      </Link>
      <LanguagePicker />
      <nav>
        <Link to="/">{t("Browse items")}</Link> {" · "}
        <Link to="/publish">{t("Sell an item")}</Link> {" · "}
        {token ? (
          <>
            {token.isAdmin && (
              <>
                <Link to="/admin/moderation">{t("Moderation")}</Link> {" · "}
              </>
            )}
            <NotificationLink /> {" · "}
            <Link to="/profile">{t("My profile")}</Link> {" · "}
            <Link to="/favourites">{t("Favourites")}</Link> {" · "}
            <Link to="/enquiries">{t("Enquiries")}</Link> {" · "}
            <Link to="/my-listings">{t("My listings")}</Link> {" · "}
            <button onClick={logout}>{t("Sign out")}</button>
          </>
        ) : (
          <>
            <Link to="/login">{t("Log in")}</Link> {" · "}
            <Link to="/signup">{t("Sign up")}</Link>
          </>
        )}
      </nav>
      {error && <p role="alert">{errorText(error)}</p>}
    </header>
  );
}

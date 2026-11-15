import { createContext, useContext, useState, useEffect } from "react";
import en from "./locales/en.json";
import si from "./locales/si.json";
import ta from "./locales/ta.json";
export const messages = { en, si, ta };
let language = "en";
export const localeTag = () =>
  ({ en: "en-LK", si: "si-LK", ta: "ta-LK" })[language];
export const currentLanguage = () => language;
export const setCurrentLanguage = (value) => {
  language = ["en", "si", "ta"].includes(value) ? value : "en";
};
export function t(key, values = {}) {
  if (typeof key !== "string") return key;
  let text = Object.hasOwn(messages[language], key)
    ? messages[language][key]
    : Object.hasOwn(en, key)
      ? en[key]
      : key;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    values[name] === undefined ? match : String(values[name]),
  );
}
export const errorText = (key) =>
  Object.hasOwn(messages.en, key) || language === "en"
    ? t(key)
    : t("Something went wrong. Please try again.");
const Context = createContext({ language: "en", setLanguage: () => {} });
export const useI18n = () => useContext(Context);
export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try {
      return ["en", "si", "ta"].includes(localStorage.getItem("language"))
        ? localStorage.getItem("language")
        : "en";
    } catch {
      return "en";
    }
  });
  setCurrentLanguage(locale);
  const setLanguage = (value) => {
    if (!["en", "si", "ta"].includes(value)) return;
    setCurrentLanguage(value);
    setLocale(value);
    try {
      localStorage.setItem("language", value);
    } catch {}
  };
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <Context.Provider value={{ language: locale, setLanguage }}>
      {children}
    </Context.Provider>
  );
}

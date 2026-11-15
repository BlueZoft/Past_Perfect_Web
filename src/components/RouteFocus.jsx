import { useEffect } from "react";
import { useLocation } from "react-router-dom";
export default function RouteFocus() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.getElementById("main-content")?.focus({ preventScroll: true });
    window.scrollTo?.({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

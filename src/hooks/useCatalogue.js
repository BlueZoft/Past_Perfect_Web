import { useEffect, useState } from "react";
import { loadCatalogue } from "../api";
export default function useCatalogue() {
  const [data, setData] = useState({ categories: ["other"], locations: [] });
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    loadCatalogue()
      .then((value) => {
        if (active) setData(value);
      })
      .catch(() => {
        if (active)
          setError(
            "Category and location options are temporarily unavailable.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  return { ...data, error };
}

import { useEffect, useState } from "react";
import { Navigate, Link, useParams, useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api";
import ListingFields from "../components/ListingFields";
import { listingError } from "../lib/listing";
export default function EditListing({ user }) {
  const { id } = useParams(),
    navigate = useNavigate();
  const [listing, setListing] = useState(null),
    [value, setValue] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!user) return;
    let active = true;
    setListing(null);
    setValue(null);
    setError("");
    api
      .get("/offer/" + id)
      .then(({ data }) => {
        if (!active) return;
        if (data.owner?._id !== user._id) {
          setError("You cannot edit this listing");
          return;
        }
        if (!["active", "reserved"].includes(data.status)) {
          setError("Sold listings cannot be edited");
          return;
        }
        setListing(data);
        setValue({
          category: data.category || "other",
          district: data.district || "",
          town: data.town || "",
          title: data.title,
          description: data.description,
          price: data.price,
          condition: data.condition,
          size: data.size || "",
        });
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [id, user, retry]);
  async function submit(event) {
    event.preventDefault();
    const invalid = listingError(value);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.patch("/offer/" + id, {
        ...value,
        price: Number(value.price),
        version: listing.__v,
      });
      navigate("/my-listings");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <main className="container">
      <h1>Edit listing</h1>
      {error && (
        <div role="alert">
          {error}{" "}
          <button disabled={busy} onClick={() => setRetry(retry + 1)}>
            Reload listing
          </button>
        </div>
      )}
      {!value && !error && <p role="status">Loading listing…</p>}
      {value && (
        <form onSubmit={submit}>
          <ListingFields value={value} onChange={setValue} disabled={busy} />
          <p>
            Existing photos are kept. Photo replacement is not available yet.
          </p>
          <button disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
        </form>
      )}
      <Link to="/my-listings">Back to my listings</Link>
    </main>
  );
}

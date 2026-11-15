export default function Pagination({
  page,
  count,
  limit,
  onChange,
  disabled = false,
}) {
  return (
    <nav aria-label="Pagination">
      <button
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span>
        {" "}
        Page {page} of {Math.max(1, Math.ceil(count / limit))}{" "}
      </span>
      <button
        disabled={disabled || page * limit >= count}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
